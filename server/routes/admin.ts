import { Router } from "express";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/adminController";
import { storage } from "../storage-db";
import { phishApi } from "../services/phish-api";
import { cacheService } from "../services/cache-service";
import { db } from "../db";
import { draftedSongs, songs, leagueMembers, users } from "../../shared/schema";
import { eq, and, inArray } from "drizzle-orm";
import { requireLeagueAdmin, requireSuperAdmin } from "../middleware/admin";

const router = Router();

router.post("/users", createUser);
router.get("/users", getUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/concerts", async (_req, res) => {
  try {
    const shows = await storage.getCachedShows();
    const todayStr = new Date().toISOString().split('T')[0];
    const sorted = shows
      .filter((s: any) => {
        const d = s.showDate instanceof Date ? s.showDate : new Date(s.showDate);
        return d.toISOString().split('T')[0] < todayStr;
      })
      .sort((a: any, b: any) => new Date(b.showDate).getTime() - new Date(a.showDate).getTime());

    // Deduplicate by date — the DB may have entries from multiple API sources
    const seenDates = new Set<string>();
    const deduped = sorted.filter((s: any) => {
      const dateKey = (s.showDate instanceof Date ? s.showDate : new Date(s.showDate))
        .toISOString().split('T')[0];
      if (seenDates.has(dateKey)) return false;
      seenDates.add(dateKey);
      return true;
    });

    res.json(deduped.map((s: any) => ({
      id: s.id,
      date: (s.showDate instanceof Date ? s.showDate : new Date(s.showDate))
        .toISOString().split('T')[0],
      venue: s.venue,
      city: s.city,
      state: s.state,
    })));
  } catch (e: any) {
    res.status(500).json({ message: e.message || "Failed to fetch concerts" });
  }
});

router.post("/refresh-shows", async (_req, res) => {
  try {
    await cacheService.getCachedShows(true);
    res.json({ message: "Shows cache refreshed successfully" });
  } catch (e: any) {
    res.status(500).json({ message: e.message || "Failed to refresh shows cache" });
  }
});

router.get("/leagues", async (_req, res) => {
  try {
    const leagues = await storage.getAllLeagues();
    res.json(leagues);
  } catch (e: any) {
    res.status(500).json({ message: e.message || "Failed to fetch leagues" });
  }
});

// GET /api/admin/shows/:concertId/league/:leagueId
// Returns the phish.in setlist for a show + which league members drafted each song
router.get("/shows/:concertId/league/:leagueId", async (req, res) => {
  try {
    const concertId = parseInt(req.params.concertId);
    const leagueId = parseInt(req.params.leagueId);

    // Look up the cached show to get its date
    const shows = await storage.getCachedShows();
    const show = shows.find((s: any) => s.id === concertId);
    if (!show) return res.status(404).json({ message: "Show not found" });

    const showDate = new Date(show.showDate).toISOString().split("T")[0];

    // Fetch setlist from phish.in
    const tracks = await phishApi.getSetlist(showDate);
    if (!tracks || tracks.length === 0) {
      return res.json({ concert: { venue: show.venue, city: show.city, date: show.showDate }, songPerformances: [] });
    }

    // Get all drafted songs for this league
    const drafted = await db
      .select({ songId: draftedSongs.songId, userId: draftedSongs.userId })
      .from(draftedSongs)
      .where(eq(draftedSongs.leagueId, leagueId));

    // Batch-fetch all songs and users in two queries instead of N+1
    const songIds = [...new Set(drafted.map(d => d.songId).filter(Boolean))] as number[];
    const userIds = [...new Set(drafted.map(d => d.userId).filter(Boolean))] as number[];
    const [songRows, userRows] = await Promise.all([
      songIds.length ? db.select({ id: songs.id, title: songs.title }).from(songs).where(inArray(songs.id, songIds)) : [],
      userIds.length ? db.select({ id: users.id, username: users.username }).from(users).where(inArray(users.id, userIds)) : [],
    ]);
    const songMap = new Map(songRows.map(s => [s.id, s.title]));
    const userMap = new Map(userRows.map(u => [u.id, u.username]));

    const draftersByTitle: Record<string, { userId: number; username: string }[]> = {};
    const titleToSongId: Record<string, number> = {};
    for (const d of drafted) {
      if (!d.songId || !d.userId) continue;
      const title = songMap.get(d.songId);
      const username = userMap.get(d.userId);
      if (!title || !username) continue;
      const key = title.toLowerCase();
      if (!draftersByTitle[key]) draftersByTitle[key] = [];
      draftersByTitle[key].push({ userId: d.userId, username });
      titleToSongId[key] = d.songId;
    }

    // Determine the first position in each set so we can flag set openers
    const firstPositionBySet: Record<string, number> = {};
    for (const track of tracks) {
      const setKey = track.set || "Set 1";
      const pos = track.position || 0;
      if (!(setKey in firstPositionBySet) || pos < firstPositionBySet[setKey]) {
        firstPositionBySet[setKey] = pos;
      }
    }

    // Build song performances from tracks
    const songPerformances = tracks.map((track: any, idx: number) => {
      const title = track.song || track.title || "";
      const draftedBy = draftersByTitle[title.toLowerCase()] || [];
      const setKey = track.set || "Set 1";
      const isEncore = track.isEncore || setKey.toLowerCase().includes("encore");
      const isSetOpener = !isEncore && track.position === firstPositionBySet[setKey];
      // duration from phish.in is in milliseconds
      const durationSeconds = track.duration ? Math.round(track.duration / 1000) : 0;
      return {
        id: idx,
        song: { title, id: titleToSongId[title.toLowerCase()] },
        setNumber: setKey,
        position: track.position || idx + 1,
        isSetOpener,
        isEncore,
        durationSeconds,
        draftedBy,
      };
    });

    res.json({
      concert: { venue: show.venue, city: show.city, state: show.state, date: show.showDate },
      songPerformances,
    });
  } catch (e: any) {
    console.error("Error fetching admin show data:", e);
    res.status(500).json({ message: e.message || "Failed to fetch show data" });
  }
});

// POST /api/admin/adjustments — create or update a point adjustment
// Requires the caller to be superadmin, global admin, or owner/admin of the league
router.post("/adjustments", requireLeagueAdmin, async (req: any, res: any) => {
  try {
    const { leagueId, concertId, songId, userId, originalPoints, adjustedPoints, reason } = req.body;
    if (!leagueId || !concertId || !songId || !userId) {
      return res.status(400).json({ message: "leagueId, concertId, songId, userId are required" });
    }
    const adjustment = await storage.createPointAdjustment({
      leagueId, concertId, songId, userId,
      originalPoints: originalPoints ?? 0,
      adjustedPoints: adjustedPoints ?? 0,
      reason: reason || "",
      adjustedBy: (req.session as any).userId,
    });
    res.json(adjustment);
  } catch (e: any) {
    console.error("Error saving adjustment:", e);
    res.status(500).json({ message: e.message || "Failed to save adjustment" });
  }
});

// GET /api/admin/adjustments/league/:leagueId?concertId=X
router.get("/adjustments/league/:leagueId", async (req: any, res: any) => {
  try {
    const leagueId = parseInt(req.params.leagueId);
    const concertId = req.query.concertId ? parseInt(req.query.concertId) : undefined;

    // Must be superadmin, global admin, or league owner/admin
    const userId = req.session?.user?.id || req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const canAccess = await storage.isUserAdmin(userId) || await storage.isUserLeagueAdmin(userId, leagueId);
    if (!canAccess) return res.status(403).json({ message: "Not authorized" });

    const adjustments = await storage.getPointAdjustments(leagueId, concertId);
    res.json(adjustments);
  } catch (e: any) {
    res.status(500).json({ message: e.message || "Failed to fetch adjustments" });
  }
});

// GET /api/admin/my-leagues — leagues where the current user is owner or league admin
// Used to show the point management section to league owners (not just global admins)
router.get("/my-leagues", async (req: any, res: any) => {
  try {
    const userId = req.session?.user?.id || req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const allLeagues = await storage.getAllLeagues();
    const accessible = await Promise.all(
      allLeagues.map(async (l: any) => {
        const canManage = await storage.isUserAdmin(userId) || await storage.isUserLeagueAdmin(userId, l.id);
        return canManage ? l : null;
      })
    );
    res.json(accessible.filter(Boolean));
  } catch (e: any) {
    res.status(500).json({ message: e.message || "Failed to fetch leagues" });
  }
});

// GET /api/admin/leagues/:id/members — members with user data
router.get("/leagues/:id/members", async (req: any, res: any) => {
  try {
    const userId = req.session?.user?.id || req.session?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const leagueId = parseInt(req.params.id);
    const canAccess = await storage.isUserAdmin(userId) || await storage.isUserLeagueAdmin(userId, leagueId);
    if (!canAccess) return res.status(403).json({ message: "Not authorized" });
    const members = await storage.getLeagueMembers(leagueId);
    res.json(members.map((m: any) => ({
      id: m.id,
      userId: m.userId,
      username: m.user?.username,
      role: m.role,
      joinedAt: m.joinedAt,
      totalPoints: m.user?.totalPoints ?? 0,
    })));
  } catch (e: any) {
    res.status(500).json({ message: e.message || "Failed to fetch members" });
  }
});

// DELETE /api/admin/leagues/:id/members/:userId — remove a member from a league
router.delete("/leagues/:id/members/:userId", async (req: any, res: any) => {
  try {
    const requestingUserId = req.session?.user?.id || req.session?.userId;
    if (!requestingUserId) return res.status(401).json({ message: "Not authenticated" });
    const leagueId = parseInt(req.params.id);
    const canAccess = await storage.isUserAdmin(requestingUserId) || await storage.isUserLeagueAdmin(requestingUserId, leagueId);
    if (!canAccess) return res.status(403).json({ message: "Not authorized" });

    const targetUserId = parseInt(req.params.userId);
    await db.delete(leagueMembers).where(
      and(eq(leagueMembers.leagueId, leagueId), eq(leagueMembers.userId, targetUserId))
    );
    res.json({ message: "Member removed from league" });
  } catch (e: any) {
    res.status(500).json({ message: e.message || "Failed to remove member" });
  }
});

// POST /api/admin/leagues/:id/members — add a user to a league by userId or username/email search
router.post("/leagues/:id/members", async (req: any, res: any) => {
  try {
    const requestingUserId = req.session?.user?.id || req.session?.userId;
    if (!requestingUserId) return res.status(401).json({ message: "Not authenticated" });
    const leagueId = parseInt(req.params.id);
    const canAccess = await storage.isUserAdmin(requestingUserId) || await storage.isUserLeagueAdmin(requestingUserId, leagueId);
    if (!canAccess) return res.status(403).json({ message: "Not authorized" });

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });

    const user = await storage.getUser(parseInt(userId));
    if (!user) return res.status(404).json({ message: "User not found" });

    await storage.joinLeague(parseInt(userId), leagueId);
    res.json({ message: `${user.username} added to league`, username: user.username, userId: user.id });
  } catch (e: any) {
    res.status(500).json({ message: e.message || "Failed to add member" });
  }
});

// PUT /api/admin/users/:id/role — superadmin only
router.put("/users/:id/role", requireSuperAdmin, async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    if (!["user", "admin", "superadmin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const updated = await storage.updateUserRole(userId, role);
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ message: e.message || "Failed to update role" });
  }
});

// GET /api/admin/debug/player?username=pjmgagill&leagueId=26
// Diagnoses why a player might have 0 points — no extra auth middleware so it
// works from a plain browser URL (the app already requires login to load).
router.get("/debug/player", async (req: any, res: any) => {
  try {
    const username = String(req.query.username || "");
    const leagueId = req.query.leagueId ? parseInt(req.query.leagueId) : null;

    if (!username) return res.status(400).json({ message: "username query param required" });

    // Look up the user
    const [u] = await db
      .select({ id: users.id, username: users.username, totalPoints: users.totalPoints })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!u) return res.status(404).json({ message: `User '${username}' not found` });

    if (!leagueId) {
      return res.json({ user: u, note: "add &leagueId=XX to see drafted songs" });
    }

    const rows = await db
      .select({
        draftedSongId: draftedSongs.id,
        songId: draftedSongs.songId,
        points: draftedSongs.points,
        songTitle: songs.title,
      })
      .from(draftedSongs)
      .leftJoin(songs, eq(draftedSongs.songId, songs.id))
      .where(and(eq(draftedSongs.leagueId, leagueId), eq(draftedSongs.userId, u.id)));

    res.json({
      user: u,
      leagueId,
      totalDraftedPoints: rows.reduce((s, r) => s + (r.points ?? 0), 0),
      songCount: rows.length,
      songs: rows.map(r => ({
        draftedSongId: r.draftedSongId,
        songId: r.songId,
        songTitle: r.songTitle ?? "(NOT FOUND IN songs TABLE — wrong ID namespace)",
        points: r.points ?? 0,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ message: e.message || "Debug query failed" });
  }
});

export default router;
