import { eq, inArray } from "drizzle-orm";
import { db } from "../db";
import { draftedSongs, songs, cachedSongs, cachedSetlists, pointAdjustments, users } from "../../shared/schema";
import { storage } from "../storage-db";

// Score every show in the league's season window against drafted songs,
// and persist the totals to draftedSongs.points.
// Safe to call multiple times — resets then recalculates each run.
export async function scoreLeague(leagueId: number): Promise<{
  shows: number;
  points: number;
  perUser: Record<string, number>;
  unmappedSongIds: number[];
  adjustmentsApplied: { username: string; song: string; base: number; override: number }[];
  adjDiag: string[];
}> {
  const league = await storage.getLeague(leagueId);
  if (!league) throw new Error("League not found");

  const seasonStartStr = league.seasonStartDate
    ? new Date(league.seasonStartDate).toISOString().split('T')[0] : null;
  const seasonEndStr = league.seasonEndDate
    ? new Date(league.seasonEndDate).toISOString().split('T')[0] : null;

  // All shows in our cache — compare date strings to avoid time-of-day false exclusions
  const allShows = await storage.getCachedShows();
  const shows = allShows.filter((s: any) => {
    const d = new Date(s.showDate).toISOString().split('T')[0];
    if (seasonStartStr && d < seasonStartStr) return false;
    if (seasonEndStr   && d > seasonEndStr)   return false;
    return true;
  });

  // All drafted songs for this league
  const drafted = await db.select().from(draftedSongs).where(eq(draftedSongs.leagueId, leagueId));

  // Reset points for this league to zero before recomputing
  await db.update(draftedSongs).set({ points: 0 }).where(eq(draftedSongs.leagueId, leagueId));

  // Batch-fetch song titles instead of N+1
  const draftSongIds = [...new Set(drafted.map(d => d.songId).filter(Boolean))] as number[];
  const draftSongRows = draftSongIds.length
    ? await db.select({ id: songs.id, title: songs.title }).from(songs).where(inArray(songs.id, draftSongIds))
    : [];
  const songIdToTitle = new Map(draftSongRows.map(s => [s.id, s.title]));

  // Fallback: IDs not found in songs table may be cachedSongs IDs (wrong namespace)
  const missingSongIds = draftSongIds.filter(id => !songIdToTitle.has(id));
  if (missingSongIds.length > 0) {
    const cachedRows = await db.select({ id: cachedSongs.id, title: cachedSongs.title })
      .from(cachedSongs).where(inArray(cachedSongs.id, missingSongIds));
    for (const r of cachedRows) songIdToTitle.set(r.id, r.title);
  }

  // Build title → draftedSong[] map
  const titleMap: Record<string, typeof drafted> = {};
  for (const d of drafted) {
    if (!d.songId) continue;
    const title = songIdToTitle.get(d.songId);
    if (!title) continue;
    const key = title.toLowerCase();
    if (!titleMap[key]) titleMap[key] = [];
    titleMap[key].push(d);
  }

  // Map cachedShows.id → showDate string for resolving adjustment concertIds.
  // Use allShows (not just season-filtered) so any stored concertId can be resolved.
  const showIdToDate = new Map(allShows.map((s: any) => [s.id, new Date(s.showDate).toISOString().split("T")[0]]));

  // Build total-override lookup: "showDate:titleLower:userId" → adjustedPoints
  // Each record represents the TOTAL points for all playings of that song at the show.
  const allAdjustments = await db.select().from(pointAdjustments)
    .where(eq(pointAdjustments.leagueId, leagueId));
  const adjustmentLookup = new Map<string, number>();
  const adjustmentIdLookup = new Map<string, number>();
  const adjDiag: string[] = [];
  for (const adj of allAdjustments) {
    if (!adj.userId) { adjDiag.push(`id=${adj.id} SKIP:noUserId`); continue; }
    const adjTitle = songIdToTitle.get(adj.songId)?.toLowerCase();
    if (!adjTitle) { adjDiag.push(`id=${adj.id} SKIP:songId=${adj.songId} notInTitleMap`); continue; }
    const adjShowDate = showIdToDate.get(adj.concertId);
    if (!adjShowDate) { adjDiag.push(`id=${adj.id} SKIP:concertId=${adj.concertId} notInShowIdToDate(size=${showIdToDate.size})`); continue; }
    const key = `${adjShowDate}:${adjTitle}:${adj.userId}`;
    if (!adjustmentIdLookup.has(key) || adj.id > adjustmentIdLookup.get(key)!) {
      adjustmentLookup.set(key, adj.adjustedPoints);
      adjustmentIdLookup.set(key, adj.id);
      adjDiag.push(`id=${adj.id} OK:key=${key} pts=${adj.adjustedPoints}`);
    }
  }
  console.log(`[scoreLeague] adjustments(${allAdjustments.length}):`, adjDiag.join(" | "));

  // Fetch setlists in parallel batches of 8.
  const BATCH = 8;
  // Deduplicate by date — getCachedShows returns all rows and the DB can have multiple
  // rows for the same date. Without dedup, a duplicate row causes phish.in to be fetched
  // twice for the same show and every song's points to be double-counted.
  const showDates = [...new Set(shows.map(s => new Date(s.showDate).toISOString().split("T")[0]))];
  const fetchedSetlists: Array<{ showDate: string; tracks: any[] } | null> = [];

  // phishApi.getSetlist() fetches from phish.net (phish.in path preserved in comments there).
  const { phishApi } = await import("./phish-api");
  for (let i = 0; i < showDates.length; i += BATCH) {
    const chunk = showDates.slice(i, i + BATCH);
    const results = await Promise.all(chunk.map(async (showDate) => {
      try {
        const tracks = await phishApi.getSetlist(showDate);
        return tracks && tracks.length > 0 ? { showDate, tracks } : null;
      } catch { return null; }
    }));
    fetchedSetlists.push(...results);
  }

  // Score every show. Accumulate base pts per (song, drafter) across all occurrences,
  // then apply total override if one exists — one override covers all playings of a song.
  const pointDeltas = new Map<number, number>(); // draftedSong.id → final points
  const adjsApplied: { username: string; song: string; base: number; override: number }[] = [];
  let totalPoints = 0;
  let showsScored = 0;
  const setlistsToCache: Array<{ showDate: string; tracks: any[] }> = [];

  for (const result of fetchedSetlists) {
    if (!result) continue;
    const { showDate, tracks: rawTracks } = result;

    const firstPosBySet: Record<string, number> = {};
    for (const t of rawTracks) {
      const s = t.set_name || "Set 1";
      if (!(s in firstPosBySet) || t.position < firstPosBySet[s]) firstPosBySet[s] = t.position;
    }

    // Accumulate base pts per (title, drafter) across every occurrence in this show
    // key: `${title}\0${userId}` → { entryId, basePts }
    const songUserBase = new Map<string, { entryId: number; basePts: number }>();

    for (const t of rawTracks) {
      const title = (t.title || "").toLowerCase();
      const setKey = t.set_name || "Set 1";
      const isEncore = setKey.toLowerCase().includes("encore");
      const isSetOpener = !isEncore && t.position === firstPosBySet[setKey];
      /* PHISH.IN DURATION BONUSES — preserved for future use
      const durationSecs = t.duration ? Math.round(t.duration / 1000) : 0;
      const mins = durationSecs / 60;
      if (mins >= 20)  basePts += 1;
      if (mins >= 30)  basePts += 1;
      if (mins >= 40)  basePts += 1;
      */

      let basePts = 1;
      if (isSetOpener) basePts += 1;
      if (isEncore)    basePts += 1;

      const entries = titleMap[title];
      if (entries && entries.length > 0) {
        for (const entry of entries) {
          const accumKey = `${title}\0${entry.userId}`;
          const existing = songUserBase.get(accumKey);
          if (existing) {
            existing.basePts += basePts;
          } else {
            songUserBase.set(accumKey, { entryId: entry.id, basePts });
          }
        }
      }
    }

    // Apply total overrides: if admin set a total for (show, song, user), use it; else use accumulated base
    for (const [accumKey, { entryId, basePts }] of songUserBase) {
      const nullIdx = accumKey.indexOf("\0");
      const title = accumKey.slice(0, nullIdx);
      const userId = parseInt(accumKey.slice(nullIdx + 1));
      const overrideKey = `${showDate}:${title}:${userId}`;
      const pts = adjustmentLookup.has(overrideKey) ? adjustmentLookup.get(overrideKey)! : basePts;
      if (adjustmentLookup.has(overrideKey)) {
        console.log(`[scoreLeague] override: show=${showDate} song="${title}" user=${userId} base=${basePts} → ${pts}pts`);
        adjsApplied.push({ username: String(userId), song: title, base: basePts, override: pts });
      }
      pointDeltas.set(entryId, (pointDeltas.get(entryId) ?? 0) + pts);
      totalPoints += pts;
    }

    showsScored++;
    setlistsToCache.push({ showDate, tracks: rawTracks });
  }

  // Write final points — one UPDATE per drafted-song entry
  const unmappedSongIds: number[] = [];
  for (const d of drafted) {
    if (d.songId && !songIdToTitle.has(d.songId)) unmappedSongIds.push(d.songId);
  }
  for (const [entryId, pts] of pointDeltas) {
    await db.update(draftedSongs)
      .set({ points: pts })
      .where(eq(draftedSongs.id, entryId));
  }

  // Cache all setlists for lastShowPoints computation in standings
  for (const { showDate, tracks } of setlistsToCache) {
    try {
      const trackTitles = tracks.map((t: any) => t.title || "");
      await db.insert(cachedSetlists)
        .values({ showDate, setlistData: tracks, songs: trackTitles })
        .onConflictDoUpdate({
          target: cachedSetlists.showDate,
          set: { setlistData: tracks, songs: trackTitles, cachedAt: new Date() },
        });
    } catch { /* non-critical */ }
  }

  // Build per-user breakdown for the toast summary
  const userPtsLog: Record<number, number> = {};
  for (const d of drafted) {
    if (!d.userId) continue;
    userPtsLog[d.userId] = (userPtsLog[d.userId] ?? 0) + (pointDeltas.get(d.id) ?? 0);
  }
  console.log(`[scoreLeague] league=${leagueId} shows=${showsScored} totalPts=${totalPoints} entries=${pointDeltas.size}`);
  console.log(`[scoreLeague] per-user points:`, JSON.stringify(userPtsLog));
  if (unmappedSongIds.length) console.log(`[scoreLeague] unmapped songIds:`, unmappedSongIds);

  const scoredUserIds = Object.keys(userPtsLog).map(Number);
  const usernameRows = scoredUserIds.length
    ? await db.select({ id: users.id, username: users.username }).from(users).where(inArray(users.id, scoredUserIds))
    : [];
  const usernameMap = new Map(usernameRows.map(u => [u.id, u.username]));
  const perUser = Object.fromEntries(
    scoredUserIds.map(uid => [usernameMap.get(uid) ?? `user#${uid}`, userPtsLog[uid]])
  );
  // Replace userId placeholders with real usernames in adjsApplied
  for (const a of adjsApplied) {
    const uid = parseInt(a.username);
    if (!isNaN(uid)) a.username = usernameMap.get(uid) ?? `user#${uid}`;
  }

  return { shows: showsScored, points: totalPoints, perUser, unmappedSongIds, adjustmentsApplied: adjsApplied, adjDiag };
}
