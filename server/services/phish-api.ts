interface PhishNetShow {
  showid: string;
  showdate: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  setlistdata?: any;
}

interface PhishNetSong {
  song: string;
  times_played: number;
  last_played: string;
  avg_gap: number;
}

// In-memory cache for songs
let songsCache: any[] = [];
let songsCacheTimestamp = 0;
const SONGS_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export class PhishNetService {
  private baseUrl = "https://api.phish.net/v5";
  private apiKey: string;

  constructor() {
    this.apiKey =
      process.env.PHISH_NET_API_KEY ||
      process.env.PHISH_API_KEY ||
      "6F27E04F96EAC8C2C21B";
  }

  async getUpcomingShows(): Promise<PhishNetShow[]> {
    try {
      // Get shows from current and future years
      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `${this.baseUrl}/shows/showyear/${currentYear}.json?apikey=${this.apiKey}&order_by=showdate&direction=asc`,
      );

      if (!response.ok) {
        throw new Error(`Phish.net API error: ${response.statusText}`);
      }

      const data = await response.json();
      const shows = data.data || [];
      
      // Filter for future shows
      const today = new Date();
      return shows.filter((show: PhishNetShow) => new Date(show.showdate) > today);
    } catch (error) {
      console.error("Error fetching upcoming shows:", error);
      return [];
    }
  }

  async getRecentShows(limit = 20): Promise<PhishNetShow[]> {
    try {
      // Get shows from 2025 using the correct v5 API structure
      const response = await fetch(
        `${this.baseUrl}/shows/showyear/2025.json?apikey=${this.apiKey}&order_by=showdate&direction=desc&limit=${limit}`,
      );

      if (!response.ok) {
        throw new Error(`Phish.net API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching recent shows:", error);
      return [];
    }
  }

  async getAllSongs(): Promise<PhishNetSong[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/songs.json?apikey=${this.apiKey}`,
      );

      if (!response.ok) {
        throw new Error(`Phish.net API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error("Error fetching all songs:", error);
      return [];
    }
  }

  async getSongStats(songName: string): Promise<any> {
    try {
      // Use the setlists/song endpoint to get performance statistics
      const response = await fetch(
        `${this.baseUrl}/setlists/song/${encodeURIComponent(songName)}.json?apikey=${this.apiKey}`,
      );

      if (!response.ok) {
        throw new Error(`Phish.net API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching stats for song "${songName}":`, error);
      return [];
    }
  }

  async getSetlist(showDate: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/setlists/showdate/${showDate}.json?apikey=${this.apiKey}`,
      );

      if (!response.ok) {
        throw new Error(`Phish.net API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error("Error fetching setlist:", error);
      return null;
    }
  }

  async getSongStats(songName: string): Promise<PhishNetSong | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/songs/stats.json?apikey=${this.apiKey}&song=${encodeURIComponent(songName)}`,
      );

      if (!response.ok) {
        throw new Error(`Phish.net API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response?.data || null;
    } catch (error) {
      console.error("Error fetching song stats:", error);
      return null;
    }
  }

  async getAllSongs(): Promise<PhishNetSong[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/songs/all.json?apikey=${this.apiKey}`,
      );

      if (!response.ok) {
        throw new Error(`Phish.net API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response?.data || [];
    } catch (error) {
      console.error("Error fetching all songs:", error);
      return [];
    }
  }

  calculateRarityScore(timesPlayed: number, avgGap: number): number {
    // Calculate rarity score based on times played and average gap
    // Lower times played = higher rarity
    // Higher average gap = higher rarity
    const playScore = Math.max(0, 100 - timesPlayed / 10);
    const gapScore = Math.min(100, avgGap * 2);
    return Math.round((playScore + gapScore) / 2);
  }
  async getAllSongsForDraft(): Promise<any[]> {
    try {
      // Check cache first
      const now = Date.now();
      if (songsCache.length > 0 && (now - songsCacheTimestamp) < SONGS_CACHE_DURATION) {
        return songsCache;
      }

      console.log('Fetching complete song catalog from Phish.net API...');
      const response = await fetch(
        `${this.baseUrl}/songs.json?apikey=${this.apiKey}&limit=10000`
      );

      if (!response.ok) {
        throw new Error(`Phish.net API error: ${response.statusText}`);
      }

      const data = await response.json();
      const songs = data.data || [];

      // Transform ALL songs to match our expected format - no limits!
      songsCache = songs.map((song: any, index: number) => ({
        id: index + 1000, // Use high IDs to avoid conflicts with DB songs
        title: song.song || song.title,
        category: this.categoryzeSong(song.song || song.title),
        rarity_score: this.calculateRarityScore(song.times_played || 0),
        total_plays: song.times_played || 0,
        last_played: song.last_played,
        plays_24_months: this.estimate24MonthPlays(song.times_played || 0)
      }));

      songsCacheTimestamp = now;
      console.log(`Cached ${songsCache.length} complete songs from Phish.net API - no limits!`);
      
      return songsCache;
    } catch (error) {
      console.error("Error fetching complete song catalog:", error);
      console.log("Using expanded fallback song catalog...");
      // Return fallback if API fails
      return this.getFallbackSongs();
    }
  }

  private categoryzeSong(title: string): string {
    const titleLower = title.toLowerCase();
    
    // Jam songs
    if (['tweezer', 'ghost', 'simple', 'you enjoy myself', 'david bowie', 'wolfmans brother', 'mike song', 'piper', 'weekapaug groove'].some(jam => titleLower.includes(jam))) {
      return 'jam';
    }
    
    // Epic songs
    if (['fluffhead', 'harry hood', 'slave to the traffic light', 'run like an antelope'].some(epic => titleLower.includes(epic))) {
      return 'epic';
    }
    
    // Composed songs
    if (['divided sky', 'reba', 'foam', 'theme from the bottom'].some(composed => titleLower.includes(composed))) {
      return 'composed';
    }
    
    // Rock songs
    if (['possum', 'stash', 'maze', 'chalk dust torture', 'julius', 'suzy greenberg'].some(rock => titleLower.includes(rock))) {
      return 'rock';
    }
    
    // Modern songs (3.0/4.0 era)
    if (['mercury', 'thread', 'sigma oasis', 'ruby waves', 'everything\'s right', 'blaze on', 'fuego', 'waves'].some(modern => titleLower.includes(modern))) {
      return 'modern';
    }
    
    // Rare songs
    if (['the sloth', 'contact', 'oh kee pa', 'harpua', 'icculus', 'gamehendge'].some(rare => titleLower.includes(rare))) {
      return 'rare';
    }
    
    return 'classic';
  }

  private calculateRarityScore(totalPlays: number): number {
    if (totalPlays > 300) return 5;
    if (totalPlays > 200) return 15;
    if (totalPlays > 100) return 30;
    if (totalPlays > 50) return 50;
    if (totalPlays > 10) return 70;
    return 90;
  }

  private estimate24MonthPlays(totalPlays: number): number {
    // Rough estimate: assume 20-30 shows per year, so 40-60 shows in 24 months
    // Popular songs might be played in 50-70% of shows
    if (totalPlays > 300) return Math.floor(Math.random() * 10) + 15; // 15-25 plays
    if (totalPlays > 200) return Math.floor(Math.random() * 8) + 10; // 10-18 plays
    if (totalPlays > 100) return Math.floor(Math.random() * 6) + 5; // 5-11 plays
    if (totalPlays > 50) return Math.floor(Math.random() * 4) + 2; // 2-6 plays
    if (totalPlays > 10) return Math.floor(Math.random() * 2) + 1; // 1-3 plays
    return Math.floor(Math.random() * 2); // 0-1 plays
  }

  private getFallbackSongs(): any[] {
    // Expanded fallback with more authentic Phish songs if API fails
    return [
      { id: 1001, title: "Wilson", category: "classic", rarity_score: 25, total_plays: 300, plays_24_months: 11 },
      { id: 1002, title: "Fluffhead", category: "epic", rarity_score: 30, total_plays: 286, plays_24_months: 10 },
      { id: 1003, title: "Tweezer", category: "jam", rarity_score: 5, total_plays: 411, plays_24_months: 22 },
      { id: 1004, title: "You Enjoy Myself", category: "jam", rarity_score: 15, total_plays: 350, plays_24_months: 20 },
      { id: 1005, title: "Simple", category: "jam", rarity_score: 10, total_plays: 320, plays_24_months: 19 },
      { id: 1006, title: "Ghost", category: "jam", rarity_score: 15, total_plays: 290, plays_24_months: 17 },
      { id: 1007, title: "Harry Hood", category: "epic", rarity_score: 20, total_plays: 275, plays_24_months: 15 },
      { id: 1008, title: "Run Like an Antelope", category: "rock", rarity_score: 18, total_plays: 280, plays_24_months: 16 },
      { id: 1009, title: "Divided Sky", category: "composed", rarity_score: 35, total_plays: 250, plays_24_months: 8 },
      { id: 1010, title: "Reba", category: "composed", rarity_score: 25, total_plays: 270, plays_24_months: 12 },
      { id: 1011, title: "David Bowie", category: "jam", rarity_score: 22, total_plays: 260, plays_24_months: 14 },
      { id: 1012, title: "Possum", category: "rock", rarity_score: 15, total_plays: 310, plays_24_months: 18 },
      { id: 1013, title: "Mike's Song", category: "jam", rarity_score: 12, total_plays: 320, plays_24_months: 20 },
      { id: 1014, title: "Weekapaug Groove", category: "jam", rarity_score: 12, total_plays: 315, plays_24_months: 19 },
      { id: 1015, title: "Slave to the Traffic Light", category: "epic", rarity_score: 28, total_plays: 245, plays_24_months: 9 }
    ];
  }

  async getSongById(songId: number): Promise<any | null> {
    const songs = await this.getAllSongsForDraft();
    return songs.find(song => song.id === songId) || null;
  }

  async saveSongToDatabase(songData: any): Promise<any> {
    // This method will be called when a song is drafted
    // It saves the song to the database for persistence
    const { db } = await import('../db');
    const { songs } = await import('../../shared/schema');
    
    try {
      const [savedSong] = await db
        .insert(songs)
        .values({
          title: songData.title,
          category: songData.category,
          rarity_score: songData.rarity_score || 50,
          total_plays: songData.total_plays || 0,
          last_played: songData.last_played || null
        })
        .onConflictDoUpdate({
          target: [songs.title],
          set: {
            total_plays: songData.total_plays || 0,
            last_played: songData.last_played || null
          }
        })
        .returning();
      
      return savedSong;
    } catch (error) {
      console.error('Error saving song to database:', error);
      throw error;
    }
  }
}

export const phishApi = new PhishNetService();
