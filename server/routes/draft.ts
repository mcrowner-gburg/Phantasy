import { Router } from "express";
import { storage } from "../storage-db";
import { requireAuth } from "../auth";
import { requireAdmin, requireLeagueOwnerOrAdmin } from "../middleware/admin";
import { db } from "../db";
import { sql, eq, and } from "drizzle-orm";
import { draftPicks, draftedSongs, songs, insertDraftedSongSchema } from "@shared/schema";

// In-memory server-side auto-draft registry (resets on server restart).
// Enables specific users to have their picks made automatically by the server.
// Key format: `${leagueId}:${userId}`
const serverAutoDraftEnabled = new Set<string>();
const serverAutoDraftRegistry = new Map<string, number>(); // key → last currentPick that was auto-fired

const router = Router();

// Draft management routes
router.post("/api/leagues/:id/schedule-draft", requireAuth, requireLeagueOwnerOrAdmin, async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const { draftDate, draftRounds, pickTimeLimit } = req.body;
    
    if (!draftDate) {
      return res.status(400).json({ message: "Draft date is required" });
    }
    
    await storage.scheduleDraft(
      leagueId, 
      new Date(draftDate), 
      draftRounds || 10, 
      pickTimeLimit || 90
    );
    
    res.json({ message: "Draft scheduled successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to schedule draft" });
  }
});

router.post("/api/leagues/:id/start-draft", requireAuth, requireLeagueOwnerOrAdmin, async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    await storage.startDraft(leagueId);
    res.json({ message: "Draft started successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to start draft" });
  }
});

router.post("/api/leagues/:id/auto-pick", requireAuth, async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const { userId, preferredSongIds } = req.body;
    if (userId !== (req as any).userId) {
      return res.status(403).json({ message: "You can only auto-pick for yourself" });
    }

    const league = await storage.getDraftStatus(leagueId);
    if (!league || league.draftStatus !== "active") {
      return res.status(400).json({ message: "Draft is not active" });
    }
    if (league.currentPlayer !== userId) {
      return res.status(400).json({ message: "Not this player's turn" });
    }

    // Try queue songs first (in priority order), then fall back to most-played
    if (Array.isArray(preferredSongIds) && preferredSongIds.length > 0) {
      for (const songId of preferredSongIds) {
        const isDrafted = await storage.isSongDraftedInLeague(songId, leagueId);
        if (!isDrafted) {
          const song = await storage.getSong(songId);
          const pick = await storage.makeDraftPick(leagueId, userId, songId, league.pickTimeLimit ?? 90);
          return res.json({ ...pick, autoPicked: true, fromQueue: true, songTitle: song?.title ?? `Song #${songId}` });
        }
      }
    }

    // Fallback: most-played undrafted song from the last year
    const available = await storage.getAvailableSongsPlayedLastYear(leagueId);
    if (available.length === 0) {
      return res.status(400).json({ message: "No available songs to auto-pick" });
    }

    const pick = await storage.makeDraftPick(leagueId, userId, available[0].id, league.pickTimeLimit ?? 90);
    res.json({ ...pick, autoPicked: true, fromQueue: false, songTitle: available[0].title });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to auto-pick" });
  }
});

router.get("/api/leagues/:id/draft-status", async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const league = await storage.getDraftStatus(leagueId);

    // Server-side auto-draft: fire a pick if the current player has it enabled.
    // Node.js is single-threaded so the Set/Map check+set is atomic — safe against double-fire.
    if (league?.draftStatus === "active" && league?.currentPlayer) {
      const key = `${leagueId}:${league.currentPlayer}`;
      if (serverAutoDraftEnabled.has(key)) {
        const lastFiredPick = serverAutoDraftRegistry.get(key) ?? -1;
        if (lastFiredPick !== league.currentPick) {
          serverAutoDraftRegistry.set(key, league.currentPick!);
          // Fire async — don't await so the response is not delayed
          setTimeout(() => {
            storage.getAvailableSongsPlayedLastYear(leagueId).then(async (available: any[]) => {
              if (!available.length) return;
              try {
                const pick = await storage.makeDraftPick(leagueId, league.currentPlayer!, available[0].id, league.pickTimeLimit ?? 90);
                console.log(`[server-auto-draft] Picked "${available[0].title}" for user ${league.currentPlayer} (pick #${league.currentPick}) in league ${leagueId}`);
              } catch (e: any) {
                console.warn(`[server-auto-draft] Pick failed for user ${league.currentPlayer}: ${e.message}`);
              }
            });
          }, 500);
        }
      }
    }

    res.json(league);
  } catch (error) {
    res.status(500).json({ message: "Failed to get draft status" });
  }
});

router.get("/api/leagues/:id/draft-order", async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const draftOrder = await storage.getDraftOrder(leagueId);
    res.json(draftOrder);
  } catch (error) {
    res.status(500).json({ message: "Failed to get draft order" });
  }
});

router.post("/api/leagues/:id/draft-order", requireAuth, requireLeagueOwnerOrAdmin, async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const { userIds } = req.body;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ message: "userIds must be an array" });
    }

    await storage.setDraftOrder(leagueId, userIds);
    res.json({ message: "Draft order set successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to set draft order" });
  }
});

// Shuffle all league members into a random draft order, persist it, return the order.
// Owner / admin only. Safe to call multiple times before the draft starts.
router.post("/api/leagues/:id/randomize-draft-order", requireAuth, async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const userId   = (req as any).userId;

    const league = await storage.getLeague(leagueId);
    if (!league) return res.status(404).json({ message: "League not found" });

    const user = await storage.getUser(userId);
    if (league.ownerId !== userId && user?.role !== "admin" && user?.role !== "superadmin") {
      return res.status(403).json({ message: "Owner only" });
    }

    const members  = await storage.getLeagueMembers(leagueId);
    const ids      = members.map((m: any) => m.userId);
    // Fisher-Yates shuffle
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }

    await storage.setDraftOrder(leagueId, ids);
    res.json({ orderedUserIds: ids });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to randomize order" });
  }
});

router.get("/api/leagues/:id/draft-picks", async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const picks = await storage.getDraftPicks(leagueId);
    res.json(picks);
  } catch (error) {
    res.status(500).json({ message: "Failed to get draft picks" });
  }
});

// Admin-only: wipe all picks and reset draft state so a league can be re-drafted
router.post("/api/admin/leagues/:id/reset-draft", requireAuth, async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const userId = (req as any).userId;
    const user = await storage.getUser(userId);
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return res.status(403).json({ message: "Admin only" });
    }
    await db.delete(draftPicks).where(eq(draftPicks.leagueId, leagueId));
    await db.delete(draftedSongs).where(eq(draftedSongs.leagueId, leagueId));
    await storage.updateLeague(leagueId, {
      draftStatus: "scheduled",
      currentPick: 1,
      currentRound: 1,
      currentPlayer: null,
      pickDeadline: null,
    } as any);
    res.json({ message: `Draft reset for league ${leagueId}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to reset draft" });
  }
});

// Admin: reassign a draft pick to a different user and/or song
router.post("/api/admin/leagues/:id/reassign-pick", requireAuth, async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const userId = (req as any).userId;
    const user = await storage.getUser(userId);
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return res.status(403).json({ message: "Admin only" });
    }
    const { pickId, newUserId, newSongId } = req.body;
    // Get existing pick
    const [existing] = await db.select().from(draftPicks).where(eq(draftPicks.id, pickId)).limit(1);
    if (!existing) return res.status(404).json({ message: "Pick not found" });

    // Update draftPicks row
    await db.update(draftPicks)
      .set({ userId: newUserId, songId: newSongId })
      .where(eq(draftPicks.id, pickId));

    // Remove old draftedSongs entry
    await db.delete(draftedSongs).where(
      sql`${draftedSongs.leagueId} = ${leagueId} AND ${draftedSongs.userId} = ${existing.userId} AND ${draftedSongs.songId} = ${existing.songId}`
    );

    // Insert new draftedSongs entry
    await db.insert(draftedSongs).values({
      leagueId,
      userId: newUserId,
      songId: newSongId,
      draftRound: existing.draftRound ?? 1,
      draftPick: existing.pickNumber ?? 1,
    }).onConflictDoNothing();

    res.json({ message: `Pick #${existing.pickNumber} reassigned`, pickId, newUserId, newSongId });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to reassign pick" });
  }
});

// Admin: enable or disable server-side auto-draft for a specific user in a league
// Body: { enable: boolean }
router.post("/api/admin/leagues/:id/auto-draft/:userId", requireAuth, async (req: any, res: any) => {
  try {
    const requestingUserId = (req as any).userId;
    const requester = await storage.getUser(requestingUserId);
    if (!requester || (requester.role !== "admin" && requester.role !== "superadmin")) {
      return res.status(403).json({ message: "Admin only" });
    }
    const leagueId = req.params.id;
    const targetUserId = req.params.userId;
    const key = `${leagueId}:${targetUserId}`;
    const enable: boolean = req.body.enable !== false; // default to true if not specified
    if (enable) {
      serverAutoDraftEnabled.add(key);
    } else {
      serverAutoDraftEnabled.delete(key);
      serverAutoDraftRegistry.delete(key);
    }
    console.log(`[server-auto-draft] ${enable ? "Enabled" : "Disabled"} for user ${targetUserId} in league ${leagueId}`);
    res.json({ autoDraft: serverAutoDraftEnabled.has(key), leagueId, userId: targetUserId });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to toggle auto-draft" });
  }
});

// Admin: delete a draft pick and remove the corresponding draftedSongs entry
router.delete("/api/admin/picks/:pickId", requireAuth, async (req: any, res: any) => {
  try {
    const userId = (req as any).userId;
    const user = await storage.getUser(userId);
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return res.status(403).json({ message: "Admin only" });
    }
    const pickId = parseInt(req.params.pickId);
    const [existing] = await db.select().from(draftPicks).where(eq(draftPicks.id, pickId)).limit(1);
    if (!existing) return res.status(404).json({ message: "Pick not found" });

    await db.delete(draftPicks).where(eq(draftPicks.id, pickId));
    await db.delete(draftedSongs).where(
      sql`${draftedSongs.leagueId} = ${existing.leagueId} AND ${draftedSongs.userId} = ${existing.userId} AND ${draftedSongs.songId} = ${existing.songId}`
    );
    res.json({ message: `Pick #${existing.pickNumber} deleted` });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to delete pick" });
  }
});

// Admin: manually add a draft pick for a user (bypasses turn order, doesn't advance draft state)
router.post("/api/admin/leagues/:id/add-pick", requireAuth, async (req: any, res: any) => {
  try {
    const adminUserId = (req as any).userId;
    const adminUser = await storage.getUser(adminUserId);
    if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "superadmin")) {
      return res.status(403).json({ message: "Admin only" });
    }
    const leagueId = parseInt(req.params.id);
    const { userId, songId } = req.body; // songId is cachedSongs.id

    // Resolve to songs table id
    const { cachedSongs: cachedSongsTable } = await import("../../shared/schema");
    const { songs: songsTable } = await import("../../shared/schema");
    const { inArray: inArr } = await import("drizzle-orm");

    const [cs] = await db.select().from(cachedSongsTable).where(eq(cachedSongsTable.id, songId)).limit(1);
    if (!cs) return res.status(404).json({ message: "Song not found" });

    await db.insert(songsTable).values({
      title: cs.title,
      category: cs.category,
      rarityScore: cs.rarityScore ?? 0,
      totalPlays: cs.timesPlayed ?? 0,
      plays24Months: cs.plays24Months ?? 0,
    }).onConflictDoNothing();
    const [song] = await db.select().from(songsTable).where(eq(songsTable.title, cs.title)).limit(1);
    if (!song) return res.status(500).json({ message: "Failed to resolve song" });

    const league = await storage.getLeague(leagueId);

    // Get next pick number (max existing + 1)
    const existingPicks = await db.select().from(draftPicks).where(eq(draftPicks.leagueId, leagueId));
    const nextPickNum = existingPicks.length > 0
      ? Math.max(...existingPicks.map(p => p.pickNumber ?? 0)) + 1
      : 1;

    const [pick] = await db.insert(draftPicks).values({
      leagueId,
      userId,
      songId: song.id,
      pickNumber: nextPickNum,
      round: league?.currentRound ?? 1,
      timeUsed: 0,
    }).returning();

    await db.insert(draftedSongs).values({
      leagueId,
      userId,
      songId: song.id,
      draftRound: league?.currentRound ?? 1,
      draftPick: nextPickNum,
    }).onConflictDoNothing();

    res.json({ ...pick, songTitle: song.title });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to add pick" });
  }
});

router.post("/api/leagues/:id/draft-pick", requireAuth, async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const { userId, songId, timeUsed } = req.body;

    if (!userId || !songId) {
      return res.status(400).json({ message: "userId and songId are required" });
    }
    if (userId !== (req as any).userId) {
      return res.status(403).json({ message: "You can only pick for yourself" });
    }
    
    // Verify it's the user's turn
    const league = await storage.getDraftStatus(leagueId);
    if (league?.currentPlayer !== userId) {
      return res.status(400).json({ message: "It's not your turn to pick" });
    }
    
    // Verify song is available
    const isTaken = await storage.isSongDraftedInLeague(songId, leagueId);
    if (isTaken) {
      return res.status(400).json({ message: "Song already drafted" });
    }
    
    const pick = await storage.makeDraftPick(leagueId, userId, songId, timeUsed || 0);
    res.json(pick);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to make draft pick" });
  }
});

// Draft routes
router.get("/api/drafted-songs", async (req, res) => {
  try {
    const userIdStr = req.query.userId as string;
    const leagueIdStr = req.query.leagueId as string;
    
    if (!userIdStr || !leagueIdStr) {
      return res.status(400).json({ message: "User ID and League ID required" });
    }
    
    const userId = parseInt(userIdStr);
    const leagueId = parseInt(leagueIdStr);
    
    if (isNaN(userId) || isNaN(leagueId)) {
      return res.status(400).json({ message: "Invalid User ID or League ID" });
    }
    
    const draftedSongs = await storage.getDraftedSongs(userId, leagueId);
    res.json(draftedSongs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch drafted songs" });
  }
});

router.post("/api/draft", requireAuth, async (req, res) => {
  try {
    const draftData = insertDraftedSongSchema.parse(req.body);
    
    // CRITICAL: Check if song is already drafted by ANYONE in this league
    const isSongTaken = await storage.isSongDraftedInLeague(draftData.songId, draftData.leagueId);
    if (isSongTaken) {
      return res.status(400).json({ message: "Song already drafted by another player in this league" });
    }
    
    // Check if song is already drafted by this user in this league (redundant safety check)
    const existingDrafts = await storage.getDraftedSongs(draftData.userId, draftData.leagueId);
    const alreadyDraftedByUser = existingDrafts.some(draft => draft.songId === draftData.songId);
    
    if (alreadyDraftedByUser) {
      return res.status(400).json({ message: "You have already drafted this song" });
    }
    
    // Check if user has reached the 10-song draft limit
    if (existingDrafts.length >= 10) {
      return res.status(400).json({ message: "Maximum of 10 songs can be drafted" });
    }
    
    const draftedSong = await storage.draftSong(draftData);
    
    // Create activity
    const song = await storage.getSong(draftData.songId);
    if (song) {
      await storage.createActivity(
        draftData.userId,
        draftData.leagueId,
        "draft",
        `You drafted "${song.title}"`
      );
    }
    
    res.json(draftedSong);
  } catch (error) {
    console.error("Draft error:", error);
    res.status(400).json({ message: "Failed to draft song" });
  }
});

export default router;
