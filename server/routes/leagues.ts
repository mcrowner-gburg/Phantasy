import { Router } from "express";
import { storage } from "../storage-db";
import { requireAuth } from "../auth";
import { requireAdmin, requireLeagueOwnerOrAdmin } from "../middleware/admin";
import { db } from "../db";
import { sql, eq, and } from "drizzle-orm";
import { insertLeagueSchema, cachedShows, cachedSetlists, draftPicks, draftedSongs, songs } from "@shared/schema";
import { phishApi } from "../services/phish-api";
import { cacheService } from "../services/cache-service";
import { scoreLeague } from "../services/scoring";
import { nanoid } from "nanoid";

const router = Router();

// League routes
router.get("/api/leagues", requireAuth, async (req, res) => {
  try {
    const { tourId, public: isPublic } = req.query;
    
    if (isPublic === "true") {
      const leagueList = await storage.getPublicLeagues(tourId ? parseInt(tourId as string) : undefined);
      const withCounts = await Promise.all(leagueList.map(async (l: any) => {
        const members = await storage.getLeagueMembers(l.id);
        return { ...l, memberCount: members.length };
      }));
      res.json(withCounts);
    } else {
      // Use authenticated user from session
      const userId = (req as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const leagueList = await storage.getUserLeagues(userId);
      const withCounts = await Promise.all(leagueList.map(async (l: any) => {
        const members = await storage.getLeagueMembers(l.id);
        return { ...l, memberCount: members.length };
      }));
      res.json(withCounts);
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch leagues" });
  }
});

router.post("/api/leagues", requireAuth, async (req, res) => {
  try {
    const body = { ...req.body };
    // Coerce date strings to Date objects for Zod timestamp fields
    if (body.seasonStartDate) body.seasonStartDate = new Date(body.seasonStartDate);
    if (body.seasonEndDate)   body.seasonEndDate   = new Date(body.seasonEndDate);
    const leagueData = insertLeagueSchema.partial({ tourId: true, seasonStartDate: true, seasonEndDate: true }).parse(body);
    // Owner is always the logged-in user — never trust a client-supplied ownerId
    const ownerId = (req as any).userId;

    const league = await storage.createLeague({ ...leagueData, ownerId });
    res.json(league);
  } catch (error: any) {
    console.error("League creation error:", JSON.stringify(error?.errors ?? error?.message ?? error));
    res.status(400).json({ message: "Invalid league data", detail: error?.errors ?? error?.message });
  }
});

// Get league by ID
router.get("/api/leagues/:id", requireAuth, async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const league = await storage.getLeague(leagueId);
    
    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }
    
    res.json(league);
  } catch (error) {
    console.error("Error fetching league:", error);
    res.status(500).json({ message: "Failed to fetch league" });
  }
});

// Update league by ID
router.patch("/api/leagues/:id", requireAuth, async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const updates = { ...req.body };
    
    // Convert date strings to Date objects for database
    if (updates.seasonStartDate !== undefined) {
      updates.seasonStartDate = (!updates.seasonStartDate || updates.seasonStartDate === 'null') ? null : new Date(updates.seasonStartDate);
    }
    if (updates.seasonEndDate !== undefined) {
      updates.seasonEndDate = (!updates.seasonEndDate || updates.seasonEndDate === 'null') ? null : new Date(updates.seasonEndDate);
    }
    if (updates.draftDate !== undefined) {
      updates.draftDate = (!updates.draftDate || updates.draftDate === 'null') ? null : new Date(updates.draftDate);
    }
    
    // Check if user is league owner or admin
    const league = await storage.getLeague(leagueId);
    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }
    
    const userId = (req as any).userId;
    const user = await storage.getUser(userId);
    const userRole = user?.role;
    
    if (league.ownerId !== userId && userRole !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this league" });
    }
    
    const updatedLeague = await storage.updateLeague(leagueId, updates);
    res.json(updatedLeague);
  } catch (error) {
    console.error("Error updating league:", error);
    res.status(500).json({ message: "Failed to update league" });
  }
});

// Delete league by ID
router.delete("/api/leagues/:id", requireAuth, async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    
    // Check if user is league owner or admin
    const league = await storage.getLeague(leagueId);
    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }
    
    const userId = (req as any).userId;
    const user = await storage.getUser(userId);
    const userRole = user?.role;

    if (league.ownerId !== userId && userRole !== "admin" && userRole !== "superadmin") {
      return res.status(403).json({ message: "Not authorized to delete this league" });
    }
    
    await storage.deleteLeague(leagueId);
    res.json({ message: "League deleted successfully" });
  } catch (error) {
    console.error("Error deleting league:", error);
    res.status(500).json({ message: "Failed to delete league" });
  }
});

// Join league by invite code
router.post("/api/leagues/join/:inviteCode", requireAuth, async (req, res) => {
  try {
    const inviteCode = req.params.inviteCode;
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const success = await storage.joinLeagueByInvite(inviteCode, userId);
    
    if (success) {
      res.json({ message: 'Successfully joined league' });
    } else {
      res.status(400).json({ message: 'Invalid invite code or unable to join league' });
    }
  } catch (error) {
    console.error('Error joining league by invite:', error);
    res.status(500).json({ message: 'Failed to join league' });
  }
});

router.post("/api/leagues/:id/join", requireAuth, async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    await storage.joinLeague(userId, leagueId);
    res.json({ message: "Successfully joined league" });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Failed to join league" });
  }
});

// Create an invite code for a league
router.post("/api/leagues/:id/invite", requireAuth, requireLeagueOwnerOrAdmin, async (req: any, res: any) => {
  try {
    const leagueId = parseInt(req.params.id);
    const createdBy = req.session?.user?.id || req.session?.userId || req.body?.createdBy;
    if (!createdBy) return res.status(401).json({ message: "Not authenticated" });

    const inviteCode = nanoid(10);
    const { leagueInvites } = await import("../../shared/schema");
    await db.insert(leagueInvites).values({
      leagueId,
      inviteCode,
      createdBy,
      maxUses: req.body?.maxUses ?? null,
      isActive: true,
    });
    res.json({ inviteCode, joinUrl: `/join/${inviteCode}` });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to create invite" });
  }
});

router.get("/api/leagues/:id/members", async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const members = await storage.getLeagueMembers(leagueId);
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch league members" });
  }
});

router.get("/api/leagues/:id/standings", async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const standings = await storage.getLeagueStandings(leagueId);
    res.json(standings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch standings" });
  }
});

// Export league picks as CSV
router.get("/api/leagues/:id/export-picks", requireAuth, async (req, res) => {
  try {
    const leagueId = parseInt(req.params.id);
    const userId = (req as any).userId;
    
    // Get league info
    const league = await storage.getLeague(leagueId);
    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }

    // Verify user is a member of the league
    const members = await storage.getLeagueMembers(leagueId);
    const isMember = members.some(m => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({ message: "Not authorized to access this league's data" });
    }

    // Get all members and their drafted songs
    const allPicks: any[] = [];

    for (const member of members) {
      // Skip if member doesn't have user data
      if (!member.user || !member.user.id) {
        console.warn('Member missing user data:', member);
        continue;
      }

      const draftedSongs = await storage.getDraftedSongs(member.user.id, leagueId);
      
      for (const pick of draftedSongs) {
        allPicks.push({
          username: member.user.username || 'Unknown User',
          songTitle: pick.song?.title || 'Unknown',
          category: pick.song?.category || 'Unknown',
          plays24Months: pick.song?.plays24Months || 0,
          totalPlays: pick.song?.totalPlays || 0,
          points: pick.points || 0,
          draftedAt: pick.draftedAt ? new Date(pick.draftedAt).toLocaleString() : 'N/A'
        });
      }
    }

    // Helper function to escape CSV values and prevent injection
    const escapeCSV = (value: string): string => {
      let sanitized = value;
      
      // Remove ALL control characters including carriage returns, tabs, etc.
      sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
      
      // Trim leading/trailing whitespace to normalize
      sanitized = sanitized.trim();
      
      // Check first character (now guaranteed non-whitespace) for dangerous prefixes
      const dangerousChars = /^[=+\-@]/;
      if (dangerousChars.test(sanitized)) {
        // Prefix with single quote to neutralize formula injection
        sanitized = "'" + sanitized;
      }
      
      // Escape quotes by doubling them
      sanitized = sanitized.replace(/"/g, '""');
      
      // Always wrap in quotes for consistency and safety
      return `"${sanitized}"`;
    };

    // Generate CSV - handle empty case
    const csvHeaders = 'Username,Song Title,Category,Plays (24 months),Total Plays,Points,Drafted At\n';
    const csvRows = allPicks.length > 0 
      ? allPicks.map(pick => 
          `${escapeCSV(pick.username)},${escapeCSV(pick.songTitle)},${escapeCSV(pick.category)},${pick.plays24Months},${pick.totalPlays},${pick.points},${escapeCSV(pick.draftedAt)}`
        ).join('\n')
      : '';
    
    const csv = csvHeaders + csvRows;

    // Sanitize filename and ensure it's not empty
    let safeFilename = league.name.replace(/[^a-z0-9_-]/gi, '_');
    // Remove leading/trailing underscores and ensure not empty
    safeFilename = safeFilename.replace(/^_+|_+$/g, '') || 'league';
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}_picks_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error exporting picks:', error);
    res.status(500).json({ message: "Failed to export picks" });
  }
});

// GET /api/leagues/:id/player/:userId/songs
// Returns drafted songs for a specific player in a league, with points,
// ordered by points descending so top earners appear first.
router.get("/api/leagues/:id/player/:userId/songs", async (req: any, res: any) => {
  try {
    const leagueId = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);
    const drafts = await storage.getDraftedSongs(userId, leagueId);
    const sorted = drafts
      .map((d: any) => ({
        songTitle: d.song?.title || "Unknown",
        points: d.points ?? 0,
        draftRound: d.draftRound,
        draftPick: d.draftPick,
      }))
      .sort((a: any, b: any) => b.points - a.points);
    res.json(sorted);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch player songs" });
  }
});

// GET /api/leagues/:id/setlist?date=YYYY-MM-DD
// Returns the phish.in setlist for a show + which league members drafted each song.
router.get("/api/leagues/:id/setlist", async (req: any, res: any) => {
  try {
    const leagueId = parseInt(req.params.id);
    const date = req.query.date as string;
    if (!date) return res.status(400).json({ message: "date query param required" });

    const tracks = await phishApi.getSetlist(date);
    if (!tracks || tracks.length === 0) {
      return res.json({ date, songPerformances: [] });
    }

    // Resolve all drafted songs in this league to title → drafters
    const drafted = await db
      .select({ songId: draftedSongs.songId, userId: draftedSongs.userId })
      .from(draftedSongs)
      .where(eq(draftedSongs.leagueId, leagueId));

    const draftersByTitle: Record<string, { userId: number; username: string }[]> = {};
    for (const d of drafted) {
      if (!d.songId) continue;
      const [song] = await db.select().from(songs).where(eq(songs.id, d.songId)).limit(1);
      if (!song) continue;
      const user = await storage.getUser(d.userId!);
      if (!user) continue;
      const key = song.title.toLowerCase();
      if (!draftersByTitle[key]) draftersByTitle[key] = [];
      draftersByTitle[key].push({ userId: user.id, username: user.username });
    }

    // Find first position per set for set-opener detection
    const firstPosBySet: Record<string, number> = {};
    for (const t of tracks) {
      const setKey = t.set || "Set 1";
      const pos = t.position || 0;
      if (!(setKey in firstPosBySet) || pos < firstPosBySet[setKey]) firstPosBySet[setKey] = pos;
    }

    const songPerformances = tracks.map((track: any, idx: number) => {
      const title = track.song || track.title || "";
      const setKey = track.set || "Set 1";
      const isEncore = track.isEncore || setKey.toLowerCase().includes("encore");
      const isSetOpener = !isEncore && track.position === firstPosBySet[setKey];
      const durationSeconds = track.duration ? Math.round(track.duration / 1000) : 0;
      const mins = durationSeconds / 60;
      let points = 1;
      if (isSetOpener) points += 1;
      if (isEncore)    points += 1;
      if (mins >= 20)  points += 1;
      if (mins >= 30)  points += 1;
      if (mins >= 40)  points += 1;
      const draftedBy = draftersByTitle[title.toLowerCase()] || [];
      return {
        id: idx,
        song: { title },
        setNumber: setKey,
        position: track.position || idx + 1,
        isSetOpener,
        isEncore,
        durationSeconds,
        points,
        draftedBy,
      };
    });

    res.json({ date, songPerformances });
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to fetch setlist" });
  }
});

// POST /api/leagues/:id/score
// Fetches every phish.in show in the league's season window, calculates
// points for all drafted songs, and persists the totals to the database.
router.post("/api/leagues/:id/score", requireAuth, requireLeagueOwnerOrAdmin, async (req: any, res: any) => {
  try {
    const leagueId = parseInt(req.params.id);
    // Refresh shows cache first so recent shows are included in scoring
    await cacheService.getCachedShows(true);
    const result = await scoreLeague(leagueId);
    res.json({ message: "Scoring complete", shows: result.shows, points: result.points, perUser: result.perUser, unmappedSongIds: result.unmappedSongIds });
  } catch (error: any) {
    console.error("Score league error:", error);
    res.status(500).json({ message: error.message || "Failed to score league" });
  }
});

export default router;
