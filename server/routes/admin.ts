import { Router } from "express";
import { storage } from "../storage";

const router = Router();

/**
 * Admin endpoint to refresh all song rarity scores from Phish.net API
 * This can be called periodically to keep rarity data up to date
 */
router.post("/refresh-rarity-scores", async (req, res) => {
  try {
    console.log("Starting rarity score refresh...");
    
    const { refreshAllSongRarities } = await import("../services/phish-rarity");
    
    await refreshAllSongRarities(
      () => storage.getAllSongs(),
      (songId, rarityScore, lastPlayed) => storage.updateSongStats(songId, rarityScore, lastPlayed)
    );
    
    res.json({ 
      success: true, 
      message: "Successfully refreshed all song rarity scores from Phish.net API" 
    });
  } catch (error) {
    console.error("Error refreshing rarity scores:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to refresh rarity scores",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

/**
 * Get detailed rarity information for debugging
 */
router.get("/rarity-debug", async (req, res) => {
  try {
    const songs = await storage.getAllSongs();
    const rarityInfo = songs.map(song => ({
      title: song.title,
      rarityScore: song.rarityScore,
      totalPlays: song.totalPlays,
      lastPlayed: song.lastPlayed,
      category: song.category
    }));
    
    res.json({ success: true, songs: rarityInfo });
  } catch (error) {
    console.error("Error getting rarity debug info:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get rarity information" 
    });
  }
});

/**
 * Test Phish.net API songs endpoint
 */
router.get("/test-songs", async (req, res) => {
  try {
    const { PhishNetService } = await import("../services/phish-api");
    const phishApi = new PhishNetService();
    
    console.log("Testing Phish.net songs API...");
    const apiSongs = await phishApi.getAllSongs();
    
    res.json({ 
      success: true,
      songCount: apiSongs.length,
      sample: apiSongs.slice(0, 10), // First 10 songs
      message: `Found ${apiSongs.length} songs from Phish.net API`
    });
  } catch (error) {
    console.error("Error testing songs API:", error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: "Failed to fetch songs from Phish.net API"
    });
  }
});

/**
 * Clear cache to force refresh from API
 */
router.delete("/cache", async (req, res) => {
  try {
    // Clear the songs cache to force refresh from API
    (storage as any).songsCache = null;
    (storage as any).cacheExpiry = 0;
    res.json({ message: "Cache cleared successfully" });
  } catch (error) {
    console.error("Error clearing cache:", error);
    res.status(500).json({ message: "Failed to clear cache" });
  }
});

export default router;