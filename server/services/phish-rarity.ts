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
 * Calculate rarity score based on Phish.net statistics from last 24 months
 * Factors considered:
 * - Times played in last 24 months (frequency)
 * - Gap since last played (recency)
 * - Recent performance patterns only
 */
function calculateRarityScore(stats: PhishNetSongStats): number {
  const { times_played, gap, last_played } = stats;
  
  // Filter to only consider plays from last 24 months
  const twentyFourMonthsAgo = new Date();
  twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);
  
  // If last played is more than 24 months ago, treat as never played recently
  const lastPlayedDate = last_played ? new Date(last_played) : null;
  const isRecentlyActive = lastPlayedDate && lastPlayedDate > twentyFourMonthsAgo;
  
  // Estimate recent plays based on gap and total plays
  // This is an approximation since Phish.net doesn't provide date-filtered play counts
  let recentPlays = 0;
  if (isRecentlyActive && gap < 50) {
    // For recently active songs, estimate based on gap
    // Phish plays ~40-60 shows per year, so ~80-120 shows in 24 months
    const estimatedRecentShows = 100; // Conservative estimate
    recentPlays = Math.max(1, Math.floor(estimatedRecentShows / (gap + 1)));
    recentPlays = Math.min(recentPlays, times_played); // Can't exceed total plays
  }
  
  let rarityScore = 0;
  
  // Frequency component (0-60 points) - based on 24-month activity
  // Adjusted thresholds for 24-month window (~100 shows max)
  if (!isRecentlyActive || recentPlays === 0) {
    rarityScore += 60; // Not played in last 24 months = maximum rarity
  } else if (recentPlays <= 2) {
    rarityScore += 55; // 1-2 times in 24 months
  } else if (recentPlays <= 5) {
    rarityScore += 45; // 3-5 times in 24 months
  } else if (recentPlays <= 10) {
    rarityScore += 35; // 6-10 times in 24 months
  } else if (recentPlays <= 20) {
    rarityScore += 25; // 11-20 times in 24 months
  } else if (recentPlays <= 30) {
    rarityScore += 15; // 21-30 times in 24 months
  } else {
    rarityScore += 5; // Very common in recent period
  }
  
  // Gap component (0-40 points) - unchanged as it's already recent-focused
  if (gap >= 50) {
    rarityScore += 40; // Not played in 50+ shows
  } else if (gap >= 25) {
    rarityScore += 30; // 25-49 shows ago
  } else if (gap >= 15) {
    rarityScore += 20; // 15-24 shows ago
  } else if (gap >= 5) {
    rarityScore += 10; // 5-14 shows ago
  } else {
    rarityScore += 0; // Very recently played
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
      
      console.log(`${song.title}: ${stats.times_played} total plays, gap ${stats.gap}, 24-month rarity ${rarityScore}`);
      
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
  
  console.log("Successfully updated all song rarity scores using 24-month data from Phish.net API");
}