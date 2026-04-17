import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-db";
import { insertUserSchema, insertTourSchema, insertLeagueSchema, insertDraftedSongSchema, insertSongPerformanceSchema, cachedShows, cachedSetlists, draftPicks, draftedSongs, songs } from "@shared/schema";
import { z } from "zod";
import { phishApi } from "./services/phish-api";
import { setupAuth, requireAuth } from "./auth";
import { sendPasswordResetEmail } from "./services/email";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import adminRoutes from "./routes/admin";
import { db } from "./db";
import { sql, eq, and } from "drizzle-orm";

// In-memory server-side auto-draft registry (resets on server restart).
// Enables specific users to have their picks made automatically by the server.
// Key format: `${leagueId}:${userId}`
const serverAutoDraftEnabled = new Set<string>();
const serverAutoDraftRegistry = new Map<string, number>(); // key → last currentPick that was auto-fired

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication middleware
  setupAuth(app);


  // Admin routes
  app.use("/api/admin", adminRoutes);

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ id: user.id, username: user.username, totalPoints: user.totalPoints });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Tour routes
  app.get("/api/tours", async (req, res) => {
    try {
      const tours = await storage.getTours();
      res.json(tours);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tours" });
    }
  });

  app.get("/api/tours/active", async (req, res) => {
    try {
      const activeTour = await storage.getActiveTour();
      if (!activeTour) {
        return res.status(404).json({ message: "No active tour found" });
      }
      res.json(activeTour);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active tour" });
    }
  });

  app.get("/api/tours/:id", async (req, res) => {
    try {
      const tourId = parseInt(req.params.id);
      const tour = await storage.getTour(tourId);
      
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      
      res.json(tour);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tour" });
    }
  });

  app.post("/api/tours", async (req, res) => {
    try {
      const tourData = insertTourSchema.parse(req.body);
      const tour = await storage.createTour(tourData);
      res.json(tour);
    } catch (error) {
      res.status(400).json({ message: "Invalid tour data" });
    }
  });

  // League routes
  app.get("/api/leagues", requireAuth, async (req, res) => {
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

  app.post("/api/leagues", async (req, res) => {
    try {
      const body = { ...req.body };
      // Coerce date strings to Date objects for Zod timestamp fields
      if (body.seasonStartDate) body.seasonStartDate = new Date(body.seasonStartDate);
      if (body.seasonEndDate)   body.seasonEndDate   = new Date(body.seasonEndDate);
      const leagueData = insertLeagueSchema.partial({ tourId: true, seasonStartDate: true, seasonEndDate: true }).parse(body);
      const { ownerId } = req.body;

      if (!ownerId) {
        return res.status(400).json({ message: "Owner ID required" });
      }

      const league = await storage.createLeague({ ...leagueData, ownerId });
      res.json(league);
    } catch (error: any) {
      console.error("League creation error:", JSON.stringify(error?.errors ?? error?.message ?? error));
      res.status(400).json({ message: "Invalid league data", detail: error?.errors ?? error?.message });
    }
  });

  // Get league by ID
  app.get("/api/leagues/:id", requireAuth, async (req, res) => {
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
  app.patch("/api/leagues/:id", requireAuth, async (req, res) => {
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
  app.delete("/api/leagues/:id", requireAuth, async (req, res) => {
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
  app.post("/api/leagues/join/:inviteCode", requireAuth, async (req, res) => {
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

  app.post("/api/leagues/:id/join", async (req, res) => {
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
  app.post("/api/leagues/:id/invite", async (req: any, res: any) => {
    try {
      const leagueId = parseInt(req.params.id);
      const createdBy = req.session?.user?.id || req.session?.userId || req.body?.createdBy;
      if (!createdBy) return res.status(401).json({ message: "Not authenticated" });

      const inviteCode = nanoid(10);
      const { leagueInvites } = await import("../shared/schema");
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

  app.get("/api/leagues/:id", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const league = await storage.getLeague(leagueId);
      
      if (!league) {
        return res.status(404).json({ message: "League not found" });
      }
      
      res.json(league);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch league" });
    }
  });

  app.get("/api/leagues/:id/members", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const members = await storage.getLeagueMembers(leagueId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch league members" });
    }
  });

  app.get("/api/leagues/:id/standings", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const standings = await storage.getLeagueStandings(leagueId);
      res.json(standings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch standings" });
    }
  });

  // Export league picks as CSV
  app.get("/api/leagues/:id/export-picks", requireAuth, async (req, res) => {
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

  // Debug API endpoint to test direct API call - MUST BE BEFORE general songs route
  app.get("/api/songs/debug", async (req, res) => {
    try {
      console.log('🔧 DEBUG: Testing direct Phish.net API call...');
      
      const apiKey = process.env.PHISH_NET_API_KEY;
      if (!apiKey) {
        return res.json({ error: 'API key not found' });
      }
      
      const response = await fetch(`https://api.phish.net/v5/songs.json?apikey=${apiKey}&limit=5`);
      const data = await response.json();
      
      res.json({
        status: response.status,
        ok: response.ok,
        data: data,
        dataLength: (data.data || []).length
      });
    } catch (error) {
      res.json({ error: error.message });
    }
  });

  // Force refresh cache endpoint
  app.post("/api/cache/refresh", async (req, res) => {
    try {
      console.log('🔄 Force refreshing all caches...');
      await storage.getCachedShows(true); // Force refresh shows
      await storage.getCachedSongs(true); // Force refresh songs
      res.json({ message: 'Cache refreshed successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Fetch historical shows and setlists
  app.post("/api/cache/fetch-historical", async (req, res) => {
    console.log('🎸 Historical fetch endpoint HIT!');
    try {
      console.log('📅 Fetching historical shows from 2023-2024...');
      
      const API_KEY = process.env.PHISH_NET_API_KEY || '6F27E04F96EAC8C2C21B';
      const years = [2023, 2024];
      let totalShows = 0;
      let totalSetlists = 0;
      
      for (const year of years) {
        console.log(`  Fetching ${year}...`);
        const response = await fetch(`https://api.phish.net/v5/shows/showyear/${year}.json?apikey=${API_KEY}`);
        const data = await response.json();
        const shows = data.data || [];
        
        console.log(`    Found ${shows.length} shows from ${year}`);
        
        // Insert shows
        for (const show of shows) {
          try {
            await db.insert(cachedShows).values({
              phishNetId: show.showid || show.showdate,
              showDate: new Date(show.showdate),
              venue: show.venue || 'Unknown Venue',
              city: show.city || 'Unknown City',
              state: show.state || null,
              country: show.country || 'USA',
              tourid: show.tour_id || null,
              setlistdata: show.setlistdata || null,
              isCompleted: new Date(show.showdate) < new Date(),
            }).onConflictDoNothing();
            totalShows++;
          } catch (e: any) {
            console.error(`Error inserting show ${show.showdate}:`, e.message);
          }
        }
        
        // Fetch setlists for completed shows (limit to 30 per year to avoid rate limits)
        const completedShows = shows
          .filter((s: any) => new Date(s.showdate) < new Date())
          .slice(-30); // Last 30 shows of each year
        
        for (const show of completedShows) {
          try {
            const setlistResponse = await fetch(`https://api.phish.net/v5/setlists/showdate/${show.showdate}.json?apikey=${API_KEY}`);
            const setlistData = await setlistResponse.json();
            const setlist = setlistData.data || [];
            
            if (setlist.length > 0) {
              const songs = setlist.map((s: any) => s.song || s.title || s.songname).filter(Boolean);
              
              await db.insert(cachedSetlists).values({
                showDate: show.showdate,
                setlistData: setlist,
                songs,
              }).onConflictDoNothing();
              totalSetlists++;
            }
            
            // Rate limit
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (e) {
            console.error(`Error fetching setlist for ${show.showdate}`);
          }
        }
      }
      
      console.log(`✅ Cached ${totalShows} shows and ${totalSetlists} setlists`);
      
      // Now refresh songs cache to recalculate 24-month plays
      console.log('🔄 Recalculating 24-month play counts...');
      await storage.getCachedSongs(true);
      
      res.json({ 
        message: 'Historical data cached successfully',
        shows: totalShows,
        setlists: totalSetlists
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Fetch missing setlists for shows that don't have them
  app.post("/api/cache/fetch-missing-setlists", async (req, res) => {
    try {
      console.log('🎵 Fetching missing setlists...');
      
      const API_KEY = process.env.PHISH_NET_API_KEY || '6F27E04F96EAC8C2C21B';
      const limit = parseInt(req.body.limit || '50'); // Limit how many to fetch at once
      
      // Get completed shows without setlists
      const showsWithoutSetlists = await db.execute(sql`
        SELECT TO_CHAR(cs.show_date, 'YYYY-MM-DD') as show_date
        FROM cached_shows cs
        LEFT JOIN cached_setlists csl ON TO_CHAR(cs.show_date, 'YYYY-MM-DD') = csl.show_date
        WHERE cs.is_completed = true 
        AND csl.show_date IS NULL
        ORDER BY cs.show_date DESC
        LIMIT ${limit}
      `);
      
      console.log(`  Found ${showsWithoutSetlists.rows.length} shows without setlists (fetching up to ${limit})`);
      
      let fetchedCount = 0;
      for (const row of showsWithoutSetlists.rows) {
        const showDate = row.show_date;
        try {
          const response = await fetch(`https://api.phish.net/v5/setlists/showdate/${showDate}.json?apikey=${API_KEY}`);
          const data = await response.json();
          const setlist = data.data || [];
          
          if (setlist.length > 0) {
            const songs = setlist.map((s: any) => s.song || s.title || s.songname).filter(Boolean);
            
            await db.insert(cachedSetlists).values({
              showDate: showDate,
              setlistData: setlist,
              songs,
            }).onConflictDoNothing();
            fetchedCount++;
          }
          
          // Rate limit
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (e) {
          console.error(`Error fetching setlist for ${showDate}`);
        }
      }
      
      console.log(`✅ Fetched ${fetchedCount} new setlists`);
      
      // Recalculate 24-month plays
      console.log('🔄 Recalculating 24-month play counts...');
      await storage.getCachedSongs(true);
      
      res.json({ 
        message: `Fetched ${fetchedCount} missing setlists`,
        fetched: fetchedCount,
        remaining: Math.max(0, showsWithoutSetlists.rows.length - fetchedCount)
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all songs (using cached data)
  app.get("/api/songs", async (req, res) => {
    try {
      const leagueId = req.query.leagueId ? parseInt(req.query.leagueId as string) : null;
      console.log(`🎵 Songs API endpoint called with leagueId: ${leagueId}`);
      
      // Use cached songs instead of direct API calls
      console.log('🔄 Getting cached songs...');
      const cachedSongs = await storage.getCachedSongs();
      
      // Transform cached songs to the expected format for the frontend.
      // Use the real cachedSongs.id so draft-pick and dedup checks use
      // a stable, unique identifier rather than a fragile array index.
      const allSongs = cachedSongs.map((cached) => ({
        id: cached.id,
        title: cached.title,
        category: cached.category,
        rarityScore: cached.rarityScore,
        totalPlays: cached.timesPlayed,
        lastPlayed: cached.lastPlayed,
        plays24Months: cached.plays24Months || 0
      }));
      
      console.log(`📊 Cache returned ${allSongs.length} songs`);
      
      if (leagueId) {
        // Filter out songs already drafted in this league
        console.log(`🔍 Filtering for league ${leagueId}`);
        const draftedSongIds = await storage.getDraftedSongIdsForLeague(leagueId);
        const availableSongs = allSongs.filter(song => !draftedSongIds.includes(song.id));
        console.log(`✅ Returning ${availableSongs.length} available songs for league`);
        res.json(availableSongs);
      } else {
        // Return all songs from cache
        console.log(`✅ Returning all ${allSongs.length} songs from cache`);
        res.json(allSongs);
      }
    } catch (error) {
      console.error("❌ Error fetching cached songs:", error);
      res.status(500).json({ message: "Failed to fetch songs" });
    }
  });

  app.get("/api/songs/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Search query required" });
      }
      
      // Use cached songs for search
      const cachedSongs = await storage.getCachedSongs();
      
      // Transform and filter cached songs
      const allSongs = cachedSongs.map((cached, index) => ({
        id: index + 1,
        title: cached.title,
        category: cached.category,
        rarityScore: cached.rarityScore,
        totalPlays: cached.timesPlayed,
        lastPlayed: cached.lastPlayed,
        plays24Months: cached.plays24Months || 0
      }));
      
      const filtered = allSongs.filter(song => 
        song.title.toLowerCase().includes((q as string).toLowerCase())
      );
      
      res.json(filtered);
    } catch (error) {
      res.status(500).json({ message: "Failed to search songs" });
    }
  });

  // Draft management routes
  app.post("/api/leagues/:id/schedule-draft", async (req, res) => {
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

  app.post("/api/leagues/:id/start-draft", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      await storage.startDraft(leagueId);
      res.json({ message: "Draft started successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to start draft" });
    }
  });

  app.post("/api/leagues/:id/auto-pick", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const { userId, preferredSongIds } = req.body;

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

  // GET /api/leagues/:id/player/:userId/songs
  // Returns drafted songs for a specific player in a league, with points,
  // ordered by points descending so top earners appear first.
  app.get("/api/leagues/:id/player/:userId/songs", async (req: any, res: any) => {
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
  app.get("/api/leagues/:id/setlist", async (req: any, res: any) => {
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
  app.post("/api/leagues/:id/score", async (req: any, res: any) => {
    try {
      const leagueId = parseInt(req.params.id);
      const result = await storage.scoreLeague(leagueId);
      res.json({ message: "Scoring complete", ...result });
    } catch (error: any) {
      console.error("Score league error:", error);
      res.status(500).json({ message: error.message || "Failed to score league" });
    }
  });

  app.get("/api/leagues/:id/draft-status", async (req, res) => {
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

  app.get("/api/leagues/:id/draft-order", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const draftOrder = await storage.getDraftOrder(leagueId);
      res.json(draftOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to get draft order" });
    }
  });

  app.post("/api/leagues/:id/draft-order", async (req, res) => {
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
  app.post("/api/leagues/:id/randomize-draft-order", requireAuth, async (req, res) => {
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

  app.get("/api/leagues/:id/draft-picks", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const picks = await storage.getDraftPicks(leagueId);
      res.json(picks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get draft picks" });
    }
  });

  // Admin-only: wipe all picks and reset draft state so a league can be re-drafted
  app.post("/api/admin/leagues/:id/reset-draft", requireAuth, async (req, res) => {
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
  app.post("/api/admin/leagues/:id/reassign-pick", requireAuth, async (req, res) => {
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
  app.post("/api/admin/leagues/:id/auto-draft/:userId", requireAuth, async (req: any, res: any) => {
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
  app.delete("/api/admin/picks/:pickId", requireAuth, async (req: any, res: any) => {
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
  app.post("/api/admin/leagues/:id/add-pick", requireAuth, async (req: any, res: any) => {
    try {
      const adminUserId = (req as any).userId;
      const adminUser = await storage.getUser(adminUserId);
      if (!adminUser || (adminUser.role !== "admin" && adminUser.role !== "superadmin")) {
        return res.status(403).json({ message: "Admin only" });
      }
      const leagueId = parseInt(req.params.id);
      const { userId, songId } = req.body; // songId is cachedSongs.id

      // Resolve to songs table id
      const { cachedSongs: cachedSongsTable } = await import("../shared/schema");
      const { songs: songsTable } = await import("../shared/schema");
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

  app.post("/api/leagues/:id/draft-pick", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const { userId, songId, timeUsed } = req.body;
      
      if (!userId || !songId) {
        return res.status(400).json({ message: "userId and songId are required" });
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
  app.get("/api/drafted-songs", async (req, res) => {
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

  app.post("/api/draft", async (req, res) => {
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

  // Concert routes (using cached data)
  app.get("/api/concerts", async (req, res) => {
    try {
      // Get cached shows instead of direct API calls
      const { cacheService } = await import('./services/cache-service');
      const cachedShows = await cacheService.getCachedShows();
      
      console.log(`Fetched ${cachedShows.length} shows from cache`);
      
      // Transform cached data to our format and fetch setlists for completed shows
      const concerts = await Promise.all(cachedShows.map(async (show: any) => {
        const isCompleted = new Date(show.showDate) < new Date();
        let setlist: string[] = [];
        
        // Fetch setlist for completed shows from cache
        let setlistData: any[] = [];
        if (isCompleted) {
          try {
            const cachedSetlist = await cacheService.getCachedSetlist(show.showDate.toISOString().split('T')[0]);
            if (cachedSetlist) {
              setlist = Array.isArray(cachedSetlist.songs) ? cachedSetlist.songs : [];
              setlistData = Array.isArray(cachedSetlist.setlistData) ? cachedSetlist.setlistData : [];
            }
          } catch (error) {
            console.error(`Error fetching setlist for ${show.showDate}:`, error);
          }
        }

        return {
          id: show.id,
          tourId: 1,
          date: new Date(show.showDate),
          venue: show.venue,
          city: show.city,
          state: show.state,
          country: show.country,
          setlist,
          setlistData,
          isCompleted,
        };
      }));
      
      res.json(concerts);
    } catch (error) {
      console.error("Error fetching concerts:", error);
      res.status(500).json({ message: "Failed to fetch concerts" });
    }
  });

  // Proxy a single show's setlist from phish.in (has duration data for scoring)
  app.get("/api/shows/:date/setlist", async (req, res) => {
    const { date } = req.params; // YYYY-MM-DD
    try {
      const r = await fetch(`https://phish.in/api/v2/shows/${date}`, {
        headers: { Accept: "application/json" },
      });
      if (!r.ok) return res.status(r.status).json({ message: "Show not found on phish.in" });
      const data = await r.json();
      const rawTracks: any[] = data.tracks ?? [];

      // Group by set_name, compute opener/encore flags
      const setMap: Record<string, any[]> = {};
      for (const t of rawTracks) {
        const key = t.set_name ?? "Set 1";
        if (!setMap[key]) setMap[key] = [];
        setMap[key].push(t);
      }

      const sets = Object.entries(setMap).map(([setName, tracks]) => {
        const isEncore = setName.toLowerCase().includes("encore");
        const firstPos = Math.min(...tracks.map((t: any) => t.position ?? 99));
        return {
          setName,
          isEncore,
          songs: tracks.map((t: any) => ({
            title: t.title,
            position: t.position,
            durationSecs: t.duration ? Math.round(t.duration / 1000) : 0,
            isOpener: !isEncore && t.position === firstPos,
            isEncore,
          })),
        };
      });

      // Sort sets: Set 1, Set 2, ..., Encore, Encore 2
      sets.sort((a, b) => {
        if (a.isEncore && !b.isEncore) return 1;
        if (!a.isEncore && b.isEncore) return -1;
        return a.setName.localeCompare(b.setName);
      });

      res.json({ date, sets });
    } catch (err) {
      console.error("phish.in setlist error:", err);
      res.status(500).json({ message: "Failed to fetch setlist" });
    }
  });

  app.get("/api/concerts/upcoming", async (req, res) => {
    try {
      // Use same logic as dashboard to get upcoming shows from Phish.net API
      const upcomingShows = await phishApi.getUpcomingShows();
      const upcomingConcerts = upcomingShows
        .map((show: any) => ({
          id: parseInt(show.showid),
          tourId: 1,
          date: new Date(show.showdate),
          venue: show.venue,
          city: show.city,
          state: show.state,
          country: show.country,
          setlist: [],
          isCompleted: false,
        }))
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
      
      res.json(upcomingConcerts);
    } catch (error) {
      console.error("Error fetching upcoming concerts:", error);
      res.status(500).json({ message: "Failed to fetch upcoming concerts" });
    }
  });

  app.get("/api/concerts/:id/setlist", async (req, res) => {
    try {
      const showId = req.params.id;
      
      // Find the show in cache to get its date
      const { cacheService } = await import('./services/cache-service');
      const cachedShows = await cacheService.getCachedShows();
      const show = cachedShows.find((s: any) => s.id.toString() === showId);
      
      if (!show) {
        return res.status(404).json({ message: "Show not found" });
      }
      
      // Get cached setlist for this show date
      const showDate = new Date(show.showDate).toISOString().split('T')[0];
      const cachedSetlist = await cacheService.getCachedSetlist(showDate);
      
      if (!cachedSetlist) {
        return res.status(404).json({ message: "Setlist not found" });
      }
      
      res.json(cachedSetlist.setlistData);
    } catch (error) {
      console.error("Error fetching setlist:", error);
      res.status(500).json({ message: "Failed to fetch setlist" });
    }
  });

  // Cache management routes (admin only)
  app.post("/api/admin/cache/refresh", async (req, res) => {
    try {
      // TODO: Add admin authentication check here
      // if (!req.user || req.user.role !== 'admin') {
      //   return res.status(403).json({ message: "Admin access required" });
      // }

      const { cacheService } = await import('./services/cache-service');
      await cacheService.refreshAllCaches();
      
      res.json({ message: "All caches refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing caches:", error);
      res.status(500).json({ message: "Failed to refresh caches" });
    }
  });

  app.post("/api/admin/cache/refresh-songs", async (req, res) => {
    try {
      // TODO: Add admin authentication check here
      const { cacheService } = await import('./services/cache-service');
      await cacheService.getCachedSongs(true); // Force refresh
      
      res.json({ message: "Songs cache refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing songs cache:", error);
      res.status(500).json({ message: "Failed to refresh songs cache" });
    }
  });

  app.post("/api/admin/cache/refresh-shows", async (req, res) => {
    try {
      // TODO: Add admin authentication check here
      const { cacheService } = await import('./services/cache-service');
      await cacheService.getCachedShows(true); // Force refresh
      
      res.json({ message: "Shows cache refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing shows cache:", error);
      res.status(500).json({ message: "Failed to refresh shows cache" });
    }
  });

  app.get("/api/admin/cache/stats", async (req, res) => {
    try {
      // TODO: Add admin authentication check here
      const { cacheService } = await import('./services/cache-service');
      const stats = await cacheService.getCacheStats();
      
      res.json(stats);
    } catch (error) {
      console.error("Error getting cache stats:", error);
      res.status(500).json({ message: "Failed to get cache stats" });
    }
  });

  // Activity routes
  app.get("/api/activities", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const leagueId = req.query.leagueId ? parseInt(req.query.leagueId as string) : undefined;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      
      const activities = await storage.getUserActivities(userId, leagueId);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Song Performance routes
  app.post("/api/performances", async (req, res) => {
    try {
      const performanceData = insertSongPerformanceSchema.parse(req.body);
      const performance = await storage.createSongPerformance(performanceData);
      
      // Calculate and update points for this performance
      await storage.calculateAndUpdatePoints(performanceData.concertId);
      
      res.json(performance);
    } catch (error) {
      res.status(400).json({ message: "Failed to create song performance" });
    }
  });

  app.get("/api/concerts/:id/performances", async (req, res) => {
    try {
      const concertIdStr = req.params.id;
      const concertId = parseInt(concertIdStr);
      
      if (isNaN(concertId)) {
        return res.status(400).json({ message: "Invalid concert ID" });
      }
      
      const performances = await storage.getConcertPerformances(concertId);
      res.json(performances);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch concert performances" });
    }
  });

  // Dashboard data endpoint
  app.get("/api/dashboard", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      // Get user data
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get active tour
      const activeTour = await storage.getActiveTour();
      
      // Get user's leagues (assume first one for demo)
      const leagues = await storage.getUserLeagues(userId);
      const currentLeague = leagues[0];

      if (!currentLeague) {
        return res.json({
          user: { id: user.id, username: user.username, totalPoints: user.totalPoints },
          tour: activeTour,
          league: null,
          draftedSongs: [],
          recentActivities: [],
          upcomingConcerts: [],
          leagueStandings: []
        });
      }

      // Get drafted songs
      const draftedSongs = await storage.getDraftedSongs(userId, currentLeague.id);
      
      // Get recent activities
      const recentActivities = await storage.getUserActivities(userId, currentLeague.id);
      
      // Get recent shows (last 3 completed shows) from Phish.net API
      const recentShows = await phishApi.getRecentShows(20);
      const recentConcerts = recentShows.slice(0, 3).map((show: any) => ({
        id: parseInt(show.showid),
        tourId: 1,
        date: show.showdate,
        venue: show.venue,
        city: show.city,
        state: show.state,
        country: show.country,
        setlist: [],
        isCompleted: true,
      }));

      // Get upcoming concerts from Phish.net API
      const upcomingShows = await phishApi.getUpcomingShows();
      const upcomingConcerts = upcomingShows
        .map((show: any) => ({
          id: parseInt(show.showid),
          tourId: 1,
          date: show.showdate,
          venue: show.venue,
          city: show.city,
          state: show.state,
          country: show.country,
          setlist: [],
          isCompleted: false,
        }))
        .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);
      
      // Get league standings
      const leagueStandings = await storage.getLeagueStandings(currentLeague.id);

      res.json({
        user: { id: user.id, username: user.username, totalPoints: user.totalPoints },
        tour: activeTour,
        league: currentLeague,
        draftedSongs: draftedSongs.slice(0, 10), // Limit for display
        recentActivities: recentActivities.slice(0, 5),
        recentConcerts: recentConcerts, // Last 3 completed shows
        upcomingConcerts: upcomingConcerts, // Next 3 upcoming shows
        leagueStandings: leagueStandings.slice(0, 10)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Password Recovery Routes
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      console.log(`forgot-password: user lookup for ${email}: ${user ? `found id=${user.id}` : 'not found'}`);
      if (!user) {
        return res.json({ message: "If this email is registered, you will receive a password reset link." });
      }

      // Generate reset token
      const resetToken = nanoid(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      // Save token to database
      console.log(`forgot-password: saving reset token for user ${user.id}`);
      await storage.createPasswordResetToken({ userId: user.id, token: resetToken, expiresAt });
      console.log(`forgot-password: token saved, calling sendPasswordResetEmail`);

      const baseUrl = "https://phishphantasy.live";
      const sent = await sendPasswordResetEmail(email, resetToken, baseUrl);
      console.log(`forgot-password: sendPasswordResetEmail returned ${sent}`);

      if (!sent) {
        return res.status(500).json({ message: "Failed to send reset email — please contact support" });
      }

      res.json({ message: "If this email is registered, you will receive a password reset link." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      // Find and validate token
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken || resetToken.used || new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Hash new password and update user
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(resetToken.userId, hashedPassword);
      
      // Mark token as used
      await storage.markTokenAsUsed(resetToken.id);
      
      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Admin routes for managing rarity scores
  app.use("/api/admin", adminRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
