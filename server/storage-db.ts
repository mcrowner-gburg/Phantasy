import { eq, and, desc, asc, sql, inArray, gte, isNotNull } from "drizzle-orm";
import { db } from "./db";
import {
  users, tours, leagues, leagueMembers, leagueInvites, songs, draftedSongs,
  concerts, activities, songPerformances, passwordResetTokens, phoneVerificationCodes,
  cachedShows, cachedSongs, cachedSetlists, draftPicks, pointAdjustments,
  type User, type InsertUser, type Tour, type InsertTour, type League, type InsertLeague,
  type Song, type DraftedSong, type InsertDraftedSong, type Concert, type InsertConcert,
  type Activity, type LeagueMember, type SongPerformance, type InsertSongPerformance,
  type PasswordResetToken, type InsertPasswordResetToken, type PhoneVerificationCode,
  type InsertPhoneVerificationCode, type CachedShow, type CachedSong, type CachedSetlist,
  type LeagueInvite, type DraftPick,
} from "@shared/schema";

export const storage = {

  // ==================== USERS ====================

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  },

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(sql`lower(${users.email}) = lower(${email})`).limit(1);
    return result[0];
  },

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
    return result[0];
  },

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  },

  async updateUserPoints(userId: number, points: number): Promise<void> {
    await db.update(users)
      .set({ totalPoints: sql`${users.totalPoints} + ${points}` })
      .where(eq(users.id, userId));
  },

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
  },

  async updateUserProfile(userId: number, updates: { email?: string; phoneNumber?: string | null }): Promise<User> {
    const result = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
    return result[0];
  },

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.username));
  },

  async updateUserRole(userId: number, role: string): Promise<User> {
    const result = await db.update(users).set({ role }).where(eq(users.id, userId)).returning();
    return result[0];
  },

  async isUserSuperAdmin(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    return user?.role === "superadmin";
  },

  async isUserAdmin(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    return user?.role === "admin" || user?.role === "superadmin";
  },

  async isUserLeagueAdmin(userId: number, leagueId: number): Promise<boolean> {
    // League owner counts as league admin
    const league = await this.getLeague(leagueId);
    if (league?.ownerId === userId) return true;
    // Also check leagueMembers role
    const [member] = await db.select().from(leagueMembers)
      .where(and(eq(leagueMembers.userId, userId), eq(leagueMembers.leagueId, leagueId)))
      .limit(1);
    return member?.role === "admin";
  },

  // ==================== POINT ADJUSTMENTS ====================

  async createPointAdjustment(data: {
    leagueId: number;
    concertId: number;
    songId: number;
    userId: number;
    originalPoints: number;
    adjustedPoints: number;
    reason: string;
    adjustedBy: number;
  }) {
    const [existing] = await db.select().from(pointAdjustments)
      .where(and(
        eq(pointAdjustments.leagueId, data.leagueId),
        eq(pointAdjustments.concertId, data.concertId),
        eq(pointAdjustments.songId, data.songId),
        eq(pointAdjustments.userId, data.userId),
      )).limit(1);

    const prevAdjusted = existing?.adjustedPoints ?? data.originalPoints;
    const delta = data.adjustedPoints - prevAdjusted;

    let record;
    if (existing) {
      const [updated] = await db.update(pointAdjustments)
        .set({ adjustedPoints: data.adjustedPoints, reason: data.reason, adjustedBy: data.adjustedBy })
        .where(eq(pointAdjustments.id, existing.id))
        .returning();
      record = updated;
    } else {
      const [created] = await db.insert(pointAdjustments).values(data).returning();
      record = created;
    }

    // Apply the delta immediately to the player's drafted song total
    if (delta !== 0) {
      await db.update(draftedSongs)
        .set({ points: sql`${draftedSongs.points} + ${delta}` })
        .where(and(
          eq(draftedSongs.userId, data.userId),
          eq(draftedSongs.leagueId, data.leagueId),
          eq(draftedSongs.songId, data.songId),
        ));
    }

    return record;
  },

  async getPointAdjustments(leagueId: number, concertId?: number) {
    if (concertId) {
      return db.select().from(pointAdjustments)
        .where(and(eq(pointAdjustments.leagueId, leagueId), eq(pointAdjustments.concertId, concertId)));
    }
    return db.select().from(pointAdjustments).where(eq(pointAdjustments.leagueId, leagueId));
  },

  async deleteUser(userId: number): Promise<void> {
    // Clean up all user-referencing rows before deleting the user
    await db.delete(activities).where(eq(activities.userId, userId));
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    await db.delete(leagueMembers).where(eq(leagueMembers.userId, userId));
    await db.delete(draftedSongs).where(eq(draftedSongs.userId, userId));
    await db.delete(draftPicks).where(eq(draftPicks.userId, userId));
    // leagueInvites.createdBy — set to null not possible without nullable, just delete them
    await db.delete(leagueInvites).where(eq(leagueInvites.createdBy, userId));
    await db.delete(users).where(eq(users.id, userId));
  },

  // ==================== PASSWORD RESET ====================

  async createPasswordResetToken(data: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const result = await db.insert(passwordResetTokens).values(data).returning();
    return result[0];
  },

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const result = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token)).limit(1);
    return result[0];
  },

  async markTokenAsUsed(tokenId: number): Promise<void> {
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, tokenId));
  },

  // ==================== PHONE VERIFICATION ====================

  async createPhoneVerificationCode(data: InsertPhoneVerificationCode): Promise<PhoneVerificationCode> {
    const result = await db.insert(phoneVerificationCodes).values(data).returning();
    return result[0];
  },

  async getValidPhoneVerificationCode(phoneNumber: string, code: string): Promise<PhoneVerificationCode | undefined> {
    const result = await db.select().from(phoneVerificationCodes).where(
      and(
        eq(phoneVerificationCodes.phoneNumber, phoneNumber),
        eq(phoneVerificationCodes.code, code),
        eq(phoneVerificationCodes.used, false),
      )
    ).limit(1);
    return result[0];
  },

  async markPhoneVerificationCodeUsed(codeId: number): Promise<void> {
    await db.update(phoneVerificationCodes).set({ used: true }).where(eq(phoneVerificationCodes.id, codeId));
  },

  // ==================== TOURS ====================

  async getTours(): Promise<Tour[]> {
    return await db.select().from(tours).orderBy(desc(tours.createdAt));
  },

  async getActiveTour(): Promise<Tour | undefined> {
    const result = await db.select().from(tours).where(eq(tours.isActive, true)).limit(1);
    return result[0];
  },

  async getTour(id: number): Promise<Tour | undefined> {
    const result = await db.select().from(tours).where(eq(tours.id, id)).limit(1);
    return result[0];
  },

  async createTour(tour: InsertTour): Promise<Tour> {
    const result = await db.insert(tours).values(tour).returning();
    return result[0];
  },

  async updateTour(id: number, updates: Partial<Tour>): Promise<Tour> {
    const result = await db.update(tours).set(updates).where(eq(tours.id, id)).returning();
    return result[0];
  },

  // ==================== LEAGUES ====================

  async getLeague(id: number): Promise<League | undefined> {
    const result = await db.select().from(leagues).where(eq(leagues.id, id)).limit(1);
    return result[0];
  },

  async getAllLeagues(): Promise<League[]> {
    return await db.select().from(leagues).orderBy(desc(leagues.createdAt));
  },

  async createLeague(league: InsertLeague & { ownerId: number }): Promise<League> {
    const result = await db.insert(leagues).values(league).returning();
    const newLeague = result[0];
    await this.joinLeague(league.ownerId, newLeague.id);
    return newLeague;
  },

  async updateLeague(id: number, updates: Partial<League>): Promise<League> {
    const result = await db.update(leagues).set(updates).where(eq(leagues.id, id)).returning();
    return result[0];
  },

  async deleteLeague(id: number): Promise<void> {
    await db.delete(leagueInvites).where(eq(leagueInvites.leagueId, id));
    await db.delete(draftPicks).where(eq(draftPicks.leagueId, id));
    await db.delete(draftedSongs).where(eq(draftedSongs.leagueId, id));
    await db.delete(leagueMembers).where(eq(leagueMembers.leagueId, id));
    await db.delete(pointAdjustments).where(eq(pointAdjustments.leagueId, id));
    await db.delete(leagues).where(eq(leagues.id, id));
  },

  async getUserLeagues(userId: number): Promise<League[]> {
    const memberRows = await db.select().from(leagueMembers).where(eq(leagueMembers.userId, userId));
    const leagueIds = memberRows.map(m => m.leagueId!);
    if (leagueIds.length === 0) return [];
    return await db.select().from(leagues).where(inArray(leagues.id, leagueIds));
  },

  async getPublicLeagues(tourId?: number): Promise<League[]> {
    if (tourId) {
      return await db.select().from(leagues).where(
        and(eq(leagues.isPublic, true), eq(leagues.tourId, tourId))
      );
    }
    return await db.select().from(leagues).where(eq(leagues.isPublic, true));
  },

  async getTourLeagues(tourId: number): Promise<League[]> {
    return await db.select().from(leagues).where(eq(leagues.tourId, tourId));
  },

  async joinLeague(userId: number, leagueId: number): Promise<void> {
    const existing = await db.select().from(leagueMembers).where(
      and(eq(leagueMembers.userId, userId), eq(leagueMembers.leagueId, leagueId))
    ).limit(1);
    if (existing.length === 0) {
      await db.insert(leagueMembers).values({ userId, leagueId });
    }
  },

  async getLeagueMembers(leagueId: number): Promise<(LeagueMember & { user: User })[]> {
    const members = await db.select().from(leagueMembers)
      .where(eq(leagueMembers.leagueId, leagueId));
    const result = [];
    for (const member of members) {
      const user = await this.getUser(member.userId!);
      if (user) result.push({ ...member, user });
    }
    return result;
  },

  async joinLeagueByInvite(inviteCode: string, userId: number): Promise<boolean> {
    const invite = await db.select().from(leagueInvites).where(
      and(eq(leagueInvites.inviteCode, inviteCode), eq(leagueInvites.isActive, true))
    ).limit(1);
    if (!invite[0]) return false;
    // Respect maxUses if set
    if (invite[0].maxUses !== null && (invite[0].currentUses ?? 0) >= invite[0].maxUses) {
      return false;
    }
    await this.joinLeague(userId, invite[0].leagueId);
    await db.update(leagueInvites)
      .set({ currentUses: sql`${leagueInvites.currentUses} + 1` })
      .where(eq(leagueInvites.id, invite[0].id));
    return true;
  },

  // ==================== DRAFT ====================

  async scheduleDraft(leagueId: number, draftDate: Date, draftRounds: number, pickTimeLimit: number): Promise<void> {
    await db.update(leagues).set({ draftDate, draftRounds, pickTimeLimit, draftStatus: "scheduled" }).where(eq(leagues.id, leagueId));
  },

  async startDraft(leagueId: number): Promise<void> {
    const league = await this.getLeague(leagueId);
    const members = await this.getDraftOrder(leagueId);
    const firstPlayer = members[0]?.userId ?? null;
    const pickDeadline = firstPlayer
      ? new Date(Date.now() + (league?.pickTimeLimit ?? 90) * 1000)
      : null;
    await db.update(leagues).set({
      draftStatus: "active",
      currentPick: 1,
      currentRound: 1,
      currentPlayer: firstPlayer,
      pickDeadline,
    }).where(eq(leagues.id, leagueId));
  },

  async getDraftStatus(leagueId: number): Promise<League | undefined> {
    return await this.getLeague(leagueId);
  },

  // Songs played in the last year that are not yet drafted in this league,
  // ordered by times played descending (most popular first for a fair auto-pick).
  async getAvailableSongsPlayedLastYear(leagueId: number): Promise<{ id: number; title: string }[]> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const cutoff = oneYearAgo.toISOString().split("T")[0]; // "YYYY-MM-DD"

    const draftedIds = await this.getDraftedSongIdsForLeague(leagueId);

    // Fetch cached songs played within the last year
    const candidates = await db
      .select()
      .from(cachedSongs)
      .where(and(isNotNull(cachedSongs.lastPlayed), gte(cachedSongs.lastPlayed, cutoff)))
      .orderBy(desc(cachedSongs.timesPlayed));

    // Filter out already-drafted songs (by title match against songs table)
    // We need the songs-table id for makeDraftPick, so upsert each candidate first.
    const available: { id: number; title: string }[] = [];
    for (const cs of candidates) {
      // Upsert into songs table so we have a stable id
      await db.insert(songs).values({
        title: cs.title,
        category: cs.category,
        rarityScore: cs.rarityScore ?? 0,
        totalPlays: cs.timesPlayed ?? 0,
        plays24Months: cs.plays24Months ?? 0,
      }).onConflictDoNothing();

      const [song] = await db.select().from(songs).where(eq(songs.title, cs.title)).limit(1);
      if (!song) continue;
      if (draftedIds.includes(cs.id)) continue; // draftedIds contains cachedSongs.id values
      available.push({ id: song.id, title: song.title });
    }
    return available;
  },

  async getDraftOrder(leagueId: number): Promise<(LeagueMember & { user: User })[]> {
    // Only include members who have been explicitly assigned a draft position.
    // This keeps league owners (who auto-join on creation) out of the draft
    // unless they are explicitly given a position via setDraftOrder.
    const allMembers = await db.select().from(leagueMembers)
      .where(eq(leagueMembers.leagueId, leagueId))
      .orderBy(asc(leagueMembers.draftPosition));

    // If nobody has a position yet, fall back to all members (first-come order)
    const hasPositions = allMembers.some(m => m.draftPosition !== null);
    const ordered = hasPositions
      ? allMembers.filter(m => m.draftPosition !== null)
      : allMembers;

    const result = [];
    for (const member of ordered) {
      const user = await this.getUser(member.userId!);
      if (user) result.push({ ...member, user });
    }
    return result;
  },

  async setDraftOrder(leagueId: number, userIds: number[]): Promise<void> {
    for (let i = 0; i < userIds.length; i++) {
      await db.update(leagueMembers)
        .set({ draftPosition: i + 1 })
        .where(and(eq(leagueMembers.leagueId, leagueId), eq(leagueMembers.userId, userIds[i])));
    }
  },

  async getDraftPicks(leagueId: number): Promise<any[]> {
    const picks = await db.select().from(draftPicks)
      .where(eq(draftPicks.leagueId, leagueId))
      .orderBy(asc(draftPicks.pickNumber));

    return Promise.all(picks.map(async (pick) => {
      const [song] = pick.songId
        ? await db.select().from(songs).where(eq(songs.id, pick.songId)).limit(1)
        : [];
      const user = pick.userId ? await this.getUser(pick.userId) : null;
      return { ...pick, song: song ?? null, user: user ?? null };
    }));
  },

  async makeDraftPick(leagueId: number, userId: number, songId: number, timeUsed: number): Promise<DraftPick> {
  const league = await this.getLeague(leagueId);
  if (!league) throw new Error("League not found");

  // First ensure the song exists in the songs table
  // (songs come from cached_songs but draft_picks references songs table)
  const cachedSong = await db.select().from(cachedSongs).where(eq(cachedSongs.id, songId)).limit(1);
  if (cachedSong[0]) {
    await db.insert(songs).values({
      title: cachedSong[0].title,
      category: cachedSong[0].category,
      rarityScore: cachedSong[0].rarityScore ?? 0,
      totalPlays: cachedSong[0].timesPlayed ?? 0,
      plays24Months: cachedSong[0].plays24Months ?? 0,
    }).onConflictDoNothing();
  }

  // Get the actual song id from songs table
  const songInDb = await db.select().from(songs)
    .where(eq(songs.title, cachedSong[0]?.title ?? ""))
    .limit(1);
  
  const realSongId = songInDb[0]?.id ?? songId;

  const pick = await db.insert(draftPicks).values({
    leagueId,
    userId,
    songId: realSongId,
    pickNumber: league.currentPick ?? 1,
    round: league.currentRound ?? 1,
    timeUsed,
  }).returning();

  await db.insert(draftedSongs).values({
    userId,
    leagueId,
    songId: realSongId,
    draftRound: league.currentRound ?? 1,
    draftPick: league.currentPick ?? 1,
  });

  const members = await this.getDraftOrder(leagueId);
  const N = members.length;
  const newPick = (league.currentPick ?? 1) + 1;
  const newRound = Math.ceil(newPick / N);
  const posWithinRound = (newPick - 1) % N;
  // Snake draft: odd rounds go forward (idx 0→N-1), even rounds go backward (idx N-1→0)
  const nextIdx = newRound % 2 === 1 ? posWithinRound : N - 1 - posWithinRound;
  const totalPicks = N * (league.draftRounds ?? 10);
  const nextPlayer = newPick > totalPicks ? null : (members[nextIdx]?.userId ?? null);
  const isDraftComplete = !nextPlayer;

  const newPickDeadline = nextPlayer
    ? new Date(Date.now() + (league.pickTimeLimit ?? 90) * 1000)
    : null;

  await db.update(leagues).set({
    currentPick: newPick,
    currentRound: newRound,
    currentPlayer: nextPlayer,
    pickDeadline: newPickDeadline,
    ...(isDraftComplete ? { draftStatus: "completed" } : {}),
  }).where(eq(leagues.id, leagueId));

  return pick[0];
},

  // songId here is cachedSongs.id (what the /api/songs endpoint returns).
  // draftedSongs stores the songs-table id (realSongId from makeDraftPick).
  // We resolve through title to bridge the two namespaces.
  async isSongDraftedInLeague(songId: number, leagueId: number): Promise<boolean> {
    const [cached] = await db.select({ title: cachedSongs.title })
      .from(cachedSongs).where(eq(cachedSongs.id, songId)).limit(1);
    if (!cached) return false;
    const [song] = await db.select({ id: songs.id })
      .from(songs).where(eq(songs.title, cached.title)).limit(1);
    if (!song) return false;
    const result = await db.select().from(draftedSongs).where(
      and(eq(draftedSongs.songId, song.id), eq(draftedSongs.leagueId, leagueId))
    ).limit(1);
    return result.length > 0;
  },

  // Returns cachedSongs IDs for all songs drafted in this league,
  // so that /api/songs can filter the list correctly.
  async getDraftedSongIdsForLeague(leagueId: number): Promise<number[]> {
    const drafted = await db.select({ songId: draftedSongs.songId })
      .from(draftedSongs).where(eq(draftedSongs.leagueId, leagueId));
    if (drafted.length === 0) return [];

    // Resolve songs-table ids → titles → cachedSongs ids
    const songIds = drafted.map(d => d.songId!).filter(Boolean);
    const songTitles = await db.select({ title: songs.title })
      .from(songs).where(inArray(songs.id, songIds));
    const titleSet = new Set(songTitles.map(s => s.title.toLowerCase()));

    const allCached = await db.select({ id: cachedSongs.id, title: cachedSongs.title })
      .from(cachedSongs);
    return allCached
      .filter(cs => titleSet.has(cs.title.toLowerCase()))
      .map(cs => cs.id);
  },

  // ==================== SONGS ====================

  async getAllSongs(): Promise<Song[]> {
    return await db.select().from(songs).orderBy(asc(songs.title));
  },

  async getSong(id: number): Promise<Song | undefined> {
    const result = await db.select().from(songs).where(eq(songs.id, id)).limit(1);
    return result[0];
  },

  async getSongByTitle(title: string): Promise<Song | undefined> {
    const result = await db.select().from(songs).where(eq(songs.title, title)).limit(1);
    return result[0];
  },

  async createSong(title: string, category?: string): Promise<Song> {
    const result = await db.insert(songs).values({ title, category }).returning();
    return result[0];
  },

  async updateSongStats(songId: number, rarityScore: number, lastPlayed: Date): Promise<void> {
    await db.update(songs).set({
      rarityScore,
      lastPlayed,
      totalPlays: sql`${songs.totalPlays} + 1`,
    }).where(eq(songs.id, songId));
  },

  // ==================== DRAFTED SONGS ====================

  async getDraftedSongs(userId: number, leagueId: number): Promise<(DraftedSong & { song: Song })[]> {
    const drafts = await db.select().from(draftedSongs).where(
      and(eq(draftedSongs.userId, userId), eq(draftedSongs.leagueId, leagueId))
    );
    const result = [];
    for (const draft of drafts) {
      const song = await this.getSong(draft.songId!);
      if (song) result.push({ ...draft, song });
    }
    return result;
  },

  async draftSong(draft: InsertDraftedSong): Promise<DraftedSong> {
    const result = await db.insert(draftedSongs).values(draft).returning();
    return result[0];
  },

  async updateDraftedSongPoints(id: number, points: number): Promise<void> {
    await db.update(draftedSongs)
      .set({ points: sql`${draftedSongs.points} + ${points}` })
      .where(eq(draftedSongs.id, id));
  },

  async updateDraftedSongStats(id: number, playedCount: number, openerCount: number, encoreCount: number): Promise<void> {
    await db.update(draftedSongs).set({ playedCount, openerCount, encoreCount }).where(eq(draftedSongs.id, id));
  },

  // ==================== CONCERTS ====================

  async getConcerts(): Promise<Concert[]> {
    return await db.select().from(concerts).orderBy(desc(concerts.date));
  },

  async getUpcomingConcerts(): Promise<Concert[]> {
    return await db.select().from(concerts).where(eq(concerts.isCompleted, false)).orderBy(asc(concerts.date));
  },

  async createConcert(concert: InsertConcert): Promise<Concert> {
    const result = await db.insert(concerts).values(concert).returning();
    return result[0];
  },

  async updateConcertSetlist(concertId: number, setlist: string[]): Promise<void> {
    await db.update(concerts).set({ setlist }).where(eq(concerts.id, concertId));
  },

  // ==================== SONG PERFORMANCES ====================

  async createSongPerformance(performance: InsertSongPerformance): Promise<SongPerformance & { song: Song }> {
    const result = await db.insert(songPerformances).values(performance).returning();
    const song = await this.getSong(performance.songId!);
    return { ...result[0], song: song! };
  },

  async getConcertPerformances(concertId: number): Promise<(SongPerformance & { song: Song })[]> {
    const perfs = await db.select().from(songPerformances).where(eq(songPerformances.concertId, concertId));
    const result = [];
    for (const perf of perfs) {
      const song = await this.getSong(perf.songId!);
      if (song) result.push({ ...perf, song });
    }
    return result;
  },

  async calculateAndUpdatePoints(concertId: number): Promise<void> {
    const performances = await this.getConcertPerformances(concertId);
    for (const perf of performances) {
      let points = 1; // played
      if (perf.isOpener) points += 1;
      if (perf.isEncore) points += 1;
      const drafts = await db.select().from(draftedSongs).where(eq(draftedSongs.songId, perf.songId!));
      for (const draft of drafts) {
        await this.updateDraftedSongPoints(draft.id, points);
        await this.updateUserPoints(draft.userId!, points);
      }
    }
  },

  // Score every phish.in show in the league's season window against
  // drafted songs, and persist the totals to draftedSongs.points.
  // Safe to call multiple times — resets then recalculates each run.
  async scoreLeague(leagueId: number): Promise<{ shows: number; points: number }> {
    const league = await this.getLeague(leagueId);
    if (!league) throw new Error("League not found");

    const seasonStartStr = league.seasonStartDate
      ? new Date(league.seasonStartDate).toISOString().split('T')[0] : null;
    const seasonEndStr = league.seasonEndDate
      ? new Date(league.seasonEndDate).toISOString().split('T')[0] : null;

    // All shows in our cache — compare date strings to avoid time-of-day false exclusions
    const allShows = await this.getCachedShows();
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

    // Build title → draftedSong[] map (using songs table for title lookup)
    const titleMap: Record<string, typeof drafted> = {};
    for (const d of drafted) {
      if (!d.songId) continue;
      const [song] = await db.select({ title: songs.title }).from(songs).where(eq(songs.id, d.songId)).limit(1);
      if (!song) continue;
      const key = song.title.toLowerCase();
      if (!titleMap[key]) titleMap[key] = [];
      titleMap[key].push(d);
    }

    let totalPoints = 0;
    let showsScored = 0;

    for (const show of shows) {
      const showDate = new Date(show.showDate).toISOString().split("T")[0];
      try {
        const res = await fetch(`https://phish.in/api/v2/shows/${showDate}`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) continue;
        const data = await res.json();
        const rawTracks: any[] = data.tracks || [];
        if (rawTracks.length === 0) continue;

        // Detect first position per set
        const firstPosBySet: Record<string, number> = {};
        for (const t of rawTracks) {
          const s = t.set_name || "Set 1";
          if (!(s in firstPosBySet) || t.position < firstPosBySet[s]) firstPosBySet[s] = t.position;
        }

        for (const t of rawTracks) {
          const title = (t.title || "").toLowerCase();
          const entries = titleMap[title];
          if (!entries || entries.length === 0) continue;

          const setKey = t.set_name || "Set 1";
          const isEncore = setKey.toLowerCase().includes("encore");
          const isSetOpener = !isEncore && t.position === firstPosBySet[setKey];
          const durationSecs = t.duration ? Math.round(t.duration / 1000) : 0;
          const mins = durationSecs / 60;

          let pts = 1;
          if (isSetOpener) pts += 1;
          if (isEncore)    pts += 1;
          if (mins >= 20)  pts += 1;
          if (mins >= 30)  pts += 1;
          if (mins >= 40)  pts += 1;

          for (const entry of entries) {
            await db.update(draftedSongs)
              .set({ points: sql`${draftedSongs.points} + ${pts}` })
              .where(eq(draftedSongs.id, entry.id));
            totalPoints += pts;
          }
        }
        showsScored++;
      } catch { /* skip shows that fail */ }

      // Brief pause to avoid hammering phish.in
      await new Promise(r => setTimeout(r, 200));
    }

    // Re-apply any manual point adjustments (scoring reset wiped them)
    const adjustments = await db.select().from(pointAdjustments)
      .where(eq(pointAdjustments.leagueId, leagueId));
    for (const adj of adjustments) {
      const delta = adj.adjustedPoints - adj.originalPoints;
      if (delta === 0 || !adj.userId) continue;
      await db.update(draftedSongs)
        .set({ points: sql`${draftedSongs.points} + ${delta}` })
        .where(and(
          eq(draftedSongs.userId, adj.userId),
          eq(draftedSongs.leagueId, adj.leagueId),
          eq(draftedSongs.songId, adj.songId),
        ));
    }

    return { shows: showsScored, points: totalPoints };
  },

  // ==================== ACTIVITIES ====================

  async getUserActivities(userId: number, leagueId?: number): Promise<Activity[]> {
    if (leagueId) {
      return await db.select().from(activities).where(
        and(eq(activities.userId, userId), eq(activities.leagueId, leagueId))
      ).orderBy(desc(activities.createdAt)).limit(20);
    }
    return await db.select().from(activities).where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt)).limit(20);
  },

  async createActivity(userId: number, leagueId: number, type: string, description: string, points?: number): Promise<Activity> {
    const result = await db.insert(activities).values({ userId, leagueId, type, description, points: points ?? 0 }).returning();
    return result[0];
  },

  // ==================== LEADERBOARD ====================

  async getLeagueStandings(leagueId: number): Promise<(User & { rank: number; todayPoints: number; songCount: number })[]> {
    const members = await this.getLeagueMembers(leagueId);
    const standings = [];
    for (const member of members) {
      const drafts = await db.select().from(draftedSongs).where(
        and(eq(draftedSongs.userId, member.userId!), eq(draftedSongs.leagueId, leagueId))
      );
      // Exclude members who never made a draft pick (e.g. league owner who didn't play)
      if (drafts.length === 0) continue;
      const draftedPointsSum = drafts.reduce((sum, d) => sum + (d.points ?? 0), 0);
      // Fall back to the user-level totalPoints when per-song points haven't been
      // scored yet (e.g. scoreLeague reset them but recompute hasn't run).
      const totalPoints = draftedPointsSum > 0 ? draftedPointsSum : (member.user?.totalPoints ?? 0);
      standings.push({
        ...member.user,
        totalPoints,
        rank: 0,
        todayPoints: 0,
        songCount: drafts.length,
      });
    }
    standings.sort((a, b) => b.totalPoints - a.totalPoints);
    standings.forEach((s, i) => s.rank = i + 1);
    return standings;
  },

  // ==================== CACHED SONGS ====================

  async getCachedSongs(forceRefresh = false): Promise<CachedSong[]> {
    return await db.select().from(cachedSongs).orderBy(asc(cachedSongs.title));
  },

  async getCachedShows(forceRefresh = false): Promise<CachedShow[]> {
    return await db.select().from(cachedShows).orderBy(desc(cachedShows.showDate));
  },

  async getCachedSetlist(showDate: string): Promise<CachedSetlist | undefined> {
    const result = await db.select().from(cachedSetlists).where(eq(cachedSetlists.showDate, showDate)).limit(1);
    return result[0];
  },
};