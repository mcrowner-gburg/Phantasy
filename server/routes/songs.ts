import { Router } from "express";
import { storage } from "../storage-db";
import { requireAuth } from "../auth";
import { requireAdmin, requireLeagueOwnerOrAdmin } from "../middleware/admin";
import { db } from "../db";
import { sql, eq, and } from "drizzle-orm";
import { cacheService } from "../services/cache-service";

const router = Router();

// Debug API endpoint to test direct API call - MUST BE BEFORE general songs route
router.get("/api/songs/debug", requireAuth, requireAdmin, async (req, res) => {
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

// Get all songs (using cached data)
router.get("/api/songs", async (req, res) => {
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

router.get("/api/songs/search", async (req, res) => {
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

export default router;
