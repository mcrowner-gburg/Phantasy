import { Router } from "express";
import { storage } from "../storage-db";
import { requireAuth } from "../auth";
import { requireAdmin, requireLeagueOwnerOrAdmin } from "../middleware/admin";
import { db } from "../db";
import { sql, eq, and } from "drizzle-orm";
import { cachedShows, cachedSetlists } from "@shared/schema";
import { cacheService } from "../services/cache-service";
import { phishApi } from "../services/phish-api";

const router = Router();

// Force refresh cache endpoint
router.post("/api/cache/refresh", requireAuth, requireAdmin, async (req, res) => {
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
router.post("/api/cache/fetch-historical", requireAuth, requireAdmin, async (req, res) => {
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
router.post("/api/cache/fetch-missing-setlists", requireAuth, requireAdmin, async (req, res) => {
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

// Cache management routes (admin only)
router.post("/api/admin/cache/refresh", requireAuth, requireAdmin, async (req, res) => {
  try {
    // TODO: Add admin authentication check here
    // if (!req.user || req.user.role !== 'admin') {
    //   return res.status(403).json({ message: "Admin access required" });
    // }

    const { cacheService } = await import('../services/cache-service');
    await cacheService.refreshAllCaches();
    
    res.json({ message: "All caches refreshed successfully" });
  } catch (error) {
    console.error("Error refreshing caches:", error);
    res.status(500).json({ message: "Failed to refresh caches" });
  }
});

router.post("/api/admin/cache/refresh-songs", requireAuth, requireAdmin, async (req, res) => {
  try {
    // TODO: Add admin authentication check here
    const { cacheService } = await import('../services/cache-service');
    await cacheService.getCachedSongs(true); // Force refresh
    
    res.json({ message: "Songs cache refreshed successfully" });
  } catch (error) {
    console.error("Error refreshing songs cache:", error);
    res.status(500).json({ message: "Failed to refresh songs cache" });
  }
});

router.post("/api/admin/cache/refresh-shows", requireAuth, requireAdmin, async (req, res) => {
  try {
    // TODO: Add admin authentication check here
    const { cacheService } = await import('../services/cache-service');
    await cacheService.getCachedShows(true); // Force refresh
    
    res.json({ message: "Shows cache refreshed successfully" });
  } catch (error) {
    console.error("Error refreshing shows cache:", error);
    res.status(500).json({ message: "Failed to refresh shows cache" });
  }
});

router.get("/api/admin/cache/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    // TODO: Add admin authentication check here
    const { cacheService } = await import('../services/cache-service');
    const stats = await cacheService.getCacheStats();
    
    res.json(stats);
  } catch (error) {
    console.error("Error getting cache stats:", error);
    res.status(500).json({ message: "Failed to get cache stats" });
  }
});

export default router;
