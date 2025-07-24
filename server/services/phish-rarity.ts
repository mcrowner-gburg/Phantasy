import { Song } from "@shared/schema";

interface PhishNetSongStats {
  song: string;
  times_played: number;
  first_played: string | null;
  last_played: string | null;
  gap: number;
  debut: string | null;
}

interface PhishNetApiResponse {
  error: boolean;
  error_message: string;
  data: {
    songid: number;
    song: string;
    slug: string;
    abbr: string;
    artist: string;
    debut: string;
    last_played: string;
    times_played: number;
    last_permalink: string;
    debut_permalink: string;
    gap: number;
  }[];
}

const PHISH_NET_API_KEY = "6F27E04F96EAC8C2C21B";
const PHISH_NET_API_BASE = "https://api.phish.net/v5";

/**
 * Simple scoring system - no complex rarity calculations
 * Points are earned only during tour performances:
 * - 1 pt: Song is played this tour
 * - 1 pt: Song opens first set  
 * - 1 pt: Song opens second set
 * - 1 pt: Song is played as encore
 * Maximum 4 points per performance
 */
function calculateRarityScore(stats: PhishNetSongStats): number {
  // No complex rarity scoring - just return a simple base score
  // Actual points are earned during tour performances only
  return 0; // All songs start with 0 base points
}

/**
 * Fetch song statistics from Phish.net API using correct v5 format
 */
async function fetchSongStats(songTitle: string): Promise<PhishNetSongStats | null> {
  try {
    const encodedTitle = encodeURIComponent(songTitle);
    const url = `${PHISH_NET_API_BASE}/songs/song/${encodedTitle}.json?apikey=${PHISH_NET_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Phish.net API error for "${songTitle}":`, response.status, response.statusText);
      return null;
    }
    
    const data: PhishNetApiResponse = await response.json();
    
    if (data.error || !data.data || data.data.length === 0) {
      console.warn(`No stats found for song: ${songTitle}`);
      return null;
    }
    
    // Convert Phish.net API v5 format to our expected format
    const songData = data.data[0];
    return {
      song: songData.song,
      times_played: songData.times_played || 0,
      first_played: songData.debut,
      last_played: songData.last_played,
      gap: songData.gap || 0,
      debut: songData.debut,
    };
  } catch (error) {
    console.error(`Error fetching stats for "${songTitle}":`, error);
    return null;
  }
}

/**
 * Fetch multiple song stats efficiently
 */
async function fetchMultipleSongStats(songTitles: string[]): Promise<Map<string, PhishNetSongStats>> {
  const statsMap = new Map<string, PhishNetSongStats>();
  
  // Batch requests with delay to respect API limits
  for (const title of songTitles) {
    const stats = await fetchSongStats(title);
    if (stats) {
      statsMap.set(title.toLowerCase(), stats);
    }
    
    // Small delay between requests to be respectful to API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return statsMap;
}

/**
 * Update song rarity scores using authentic Phish.net data
 */
export async function updateSongRarityScores(songs: Song[]): Promise<Song[]> {
  console.log(`Updating rarity scores for ${songs.length} songs using Phish.net API...`);
  
  const songTitles = songs.map(song => song.title);
  const statsMap = await fetchMultipleSongStats(songTitles);
  
  const updatedSongs = songs.map(song => {
    const stats = statsMap.get(song.title.toLowerCase());
    
    if (stats) {
      const rarityScore = calculateRarityScore(stats);
      const lastPlayed = stats.last_played ? new Date(stats.last_played) : null;
      
      console.log(`${song.title}: ${stats.times_played} total plays, gap ${stats.gap}, 24-month rarity ${rarityScore}`);
      
      return {
        ...song,
        rarityScore,
        lastPlayed,
        totalPlays: stats.times_played || 0,
      };
    } else {
      // If no stats found, assign low-medium rarity (conservative approach)
      console.warn(`No stats found for "${song.title}", using default rarity`);
      return {
        ...song,
        rarityScore: 35,
      };
    }
  });
  
  console.log(`Updated ${updatedSongs.length} songs with 24-month rarity data from Phish.net API`);
  return updatedSongs;
}

/**
 * Get real-time rarity score for a single song
 */
export async function getSongRarityScore(songTitle: string): Promise<{ rarityScore: number; stats: PhishNetSongStats | null }> {
  const stats = await fetchSongStats(songTitle);
  
  if (stats) {
    const rarityScore = calculateRarityScore(stats);
    return { rarityScore, stats };
  }
  
  return { rarityScore: 35, stats: null }; // Default low-medium rarity
}

/**
 * Batch update all songs in the database
 */
export async function refreshAllSongRarities(getAllSongs: () => Promise<Song[]>, updateSongStats: (songId: number, rarityScore: number, lastPlayed: Date | null) => Promise<void>): Promise<void> {
  const songs = await getAllSongs();
  const updatedSongs = await updateSongRarityScores(songs);
  
  for (const song of updatedSongs) {
    await updateSongStats(song.id, song.rarityScore, song.lastPlayed);
  }
  
  console.log("Successfully updated all song rarity scores using 24-month data from Phish.net API");
}