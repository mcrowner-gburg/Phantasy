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
 * Calculate rarity score based on Phish.net statistics
 * Factors considered:
 * - Times played (frequency)
 * - Gap since last played (recency)
 * - Historical performance patterns
 */
function calculateRarityScore(stats: PhishNetSongStats): number {
  const { times_played, gap } = stats;
  
  // Base rarity calculation
  let rarityScore = 0;
  
  // Frequency component (0-60 points)
  // Fewer plays = higher rarity
  if (times_played === 0) {
    rarityScore += 60; // Never played = maximum rarity
  } else if (times_played <= 5) {
    rarityScore += 55;
  } else if (times_played <= 20) {
    rarityScore += 45;
  } else if (times_played <= 50) {
    rarityScore += 35;
  } else if (times_played <= 100) {
    rarityScore += 25;
  } else if (times_played <= 200) {
    rarityScore += 15;
  } else {
    rarityScore += 5; // Very common songs
  }
  
  // Gap component (0-40 points)
  // Longer gap since last played = higher current rarity
  if (gap >= 100) {
    rarityScore += 40; // Not played in 100+ shows
  } else if (gap >= 50) {
    rarityScore += 30;
  } else if (gap >= 25) {
    rarityScore += 20;
  } else if (gap >= 10) {
    rarityScore += 10;
  } else {
    rarityScore += 0; // Recently played
  }
  
  return Math.min(rarityScore, 100); // Cap at 100
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
      
      console.log(`${song.title}: ${stats.times_played} plays, gap ${stats.gap}, rarity ${rarityScore}`);
      
      return {
        ...song,
        rarityScore,
        lastPlayed,
        totalPlays: stats.times_played || 0,
      };
    } else {
      // If no stats found, assign medium rarity
      console.warn(`No stats found for "${song.title}", using default rarity`);
      return {
        ...song,
        rarityScore: 50,
      };
    }
  });
  
  console.log(`Updated ${updatedSongs.length} songs with authentic rarity data`);
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
  
  return { rarityScore: 50, stats: null }; // Default medium rarity
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
  
  console.log("Successfully updated all song rarity scores from Phish.net API");
}