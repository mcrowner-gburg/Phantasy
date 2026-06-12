import { Router } from "express";
import { storage } from "../storage-db";
import { requireAuth } from "../auth";
import { requireAdmin, requireLeagueOwnerOrAdmin } from "../middleware/admin";
import { db } from "../db";
import { sql, eq, and } from "drizzle-orm";
import { cachedShows, cachedSetlists } from "@shared/schema";
import { phishApi } from "../services/phish-api";
import { cacheService } from "../services/cache-service";

const router = Router();

// Concert routes (using cached data)
router.get("/api/concerts", async (req, res) => {
  try {
    // Get cached shows instead of direct API calls
    const { cacheService } = await import('../services/cache-service');
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
router.get("/api/shows/:date/setlist", async (req, res) => {
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

router.get("/api/concerts/upcoming", async (req, res) => {
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

router.get("/api/concerts/:id/setlist", async (req, res) => {
  try {
    const showId = req.params.id;
    
    // Find the show in cache to get its date
    const { cacheService } = await import('../services/cache-service');
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

router.get("/api/concerts/:id/performances", async (req, res) => {
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

export default router;
