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

// In-memory cache for songs - force complete refresh
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
    console.log(`Phish.net API initialized with key: ${this.apiKey ? 'PRESENT' : 'MISSING'}`);
    console.log(`Using API key: ${this.apiKey.substring(0, 8)}...`);
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
      console.log('Full API Response:', JSON.stringify(data, null, 2).substring(0, 1000));
      
      // Phish.net v5 API returns data in .data array
      const songs = data.data || [];
      console.log(`API returned ${songs.length} songs from response`);
      
      if (songs.length === 0) {
        console.log('No songs returned, checking error:', data.error_message || 'No error message');
        throw new Error(`No songs returned: ${data.error_message || 'Unknown error'}`);
      }

      // Transform ALL songs to match our expected format - no limits!
      songsCache = songs.map((song: any, index: number) => ({
        id: song.songid || (index + 1000), // Use songid from API, fallback to index
        title: song.song,
        category: this.categoryzeSong(song.song),
        rarity_score: this.calculateRarityScore(song.times_played || 0, song.gap || 0),
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
    // Comprehensive fallback catalog with authentic Phish songs - covers all eras and styles
    return [
      // Jam Vehicles
      { id: 1001, title: "Tweezer", category: "jam", rarity_score: 5, total_plays: 411, plays_24_months: 22 },
      { id: 1002, title: "You Enjoy Myself", category: "jam", rarity_score: 15, total_plays: 350, plays_24_months: 20 },
      { id: 1003, title: "Simple", category: "jam", rarity_score: 10, total_plays: 320, plays_24_months: 19 },
      { id: 1004, title: "Ghost", category: "jam", rarity_score: 15, total_plays: 290, plays_24_months: 17 },
      { id: 1005, title: "Mike's Song", category: "jam", rarity_score: 12, total_plays: 320, plays_24_months: 20 },
      { id: 1006, title: "Weekapaug Groove", category: "jam", rarity_score: 12, total_plays: 315, plays_24_months: 19 },
      { id: 1007, title: "David Bowie", category: "jam", rarity_score: 22, total_plays: 260, plays_24_months: 14 },
      { id: 1008, title: "Piper", category: "jam", rarity_score: 20, total_plays: 240, plays_24_months: 13 },
      { id: 1009, title: "Wolfman's Brother", category: "jam", rarity_score: 18, total_plays: 285, plays_24_months: 16 },
      { id: 1010, title: "Sand", category: "jam", rarity_score: 25, total_plays: 180, plays_24_months: 8 },
      
      // Epic Composed Songs
      { id: 1011, title: "Fluffhead", category: "epic", rarity_score: 30, total_plays: 286, plays_24_months: 10 },
      { id: 1012, title: "Harry Hood", category: "epic", rarity_score: 20, total_plays: 275, plays_24_months: 15 },
      { id: 1013, title: "Slave to the Traffic Light", category: "epic", rarity_score: 28, total_plays: 245, plays_24_months: 9 },
      { id: 1014, title: "Run Like an Antelope", category: "epic", rarity_score: 18, total_plays: 280, plays_24_months: 16 },
      { id: 1015, title: "Lizards", category: "epic", rarity_score: 45, total_plays: 200, plays_24_months: 5 },
      
      // Composed/Technical Songs
      { id: 1016, title: "Divided Sky", category: "composed", rarity_score: 35, total_plays: 250, plays_24_months: 8 },
      { id: 1017, title: "Reba", category: "composed", rarity_score: 25, total_plays: 270, plays_24_months: 12 },
      { id: 1018, title: "Foam", category: "composed", rarity_score: 40, total_plays: 180, plays_24_months: 4 },
      { id: 1019, title: "The Squirming Coil", category: "composed", rarity_score: 35, total_plays: 220, plays_24_months: 7 },
      { id: 1020, title: "Stash", category: "composed", rarity_score: 22, total_plays: 265, plays_24_months: 13 },
      
      // Rock/High Energy
      { id: 1021, title: "Possum", category: "rock", rarity_score: 15, total_plays: 310, plays_24_months: 18 },
      { id: 1022, title: "Suzy Greenberg", category: "rock", rarity_score: 20, total_plays: 275, plays_24_months: 14 },
      { id: 1023, title: "Julius", category: "rock", rarity_score: 18, total_plays: 280, plays_24_months: 15 },
      { id: 1024, title: "Maze", category: "rock", rarity_score: 25, total_plays: 250, plays_24_months: 11 },
      { id: 1025, title: "Chalk Dust Torture", category: "rock", rarity_score: 12, total_plays: 325, plays_24_months: 19 },
      
      // Classic Phish
      { id: 1026, title: "Wilson", category: "classic", rarity_score: 25, total_plays: 300, plays_24_months: 11 },
      { id: 1027, title: "Fee", category: "classic", rarity_score: 30, total_plays: 240, plays_24_months: 9 },
      { id: 1028, title: "Golgi Apparatus", category: "classic", rarity_score: 28, total_plays: 255, plays_24_months: 10 },
      { id: 1029, title: "AC/DC Bag", category: "classic", rarity_score: 22, total_plays: 270, plays_24_months: 13 },
      { id: 1030, title: "The Curtain", category: "classic", rarity_score: 40, total_plays: 190, plays_24_months: 4 },
      
      // Modern Era (3.0/4.0)
      { id: 1031, title: "Mercury", category: "modern", rarity_score: 35, total_plays: 180, plays_24_months: 8 },
      { id: 1032, title: "Thread", category: "modern", rarity_score: 40, total_plays: 120, plays_24_months: 6 },
      { id: 1033, title: "Sigma Oasis", category: "modern", rarity_score: 50, total_plays: 80, plays_24_months: 4 },
      { id: 1034, title: "Ruby Waves", category: "modern", rarity_score: 45, total_plays: 95, plays_24_months: 5 },
      { id: 1035, title: "Everything's Right", category: "modern", rarity_score: 30, total_plays: 160, plays_24_months: 7 },
      { id: 1036, title: "Blaze On", category: "modern", rarity_score: 25, total_plays: 200, plays_24_months: 9 },
      { id: 1037, title: "Fuego", category: "modern", rarity_score: 20, total_plays: 220, plays_24_months: 11 },
      { id: 1038, title: "Waves", category: "modern", rarity_score: 35, total_plays: 140, plays_24_months: 6 },
      
      // Rare/Special Songs
      { id: 1039, title: "The Sloth", category: "rare", rarity_score: 85, total_plays: 25, plays_24_months: 0 },
      { id: 1040, title: "Contact", category: "rare", rarity_score: 70, total_plays: 45, plays_24_months: 1 },
      { id: 1041, title: "The Oh Kee Pa Ceremony", category: "rare", rarity_score: 80, total_plays: 30, plays_24_months: 0 },
      { id: 1042, title: "Harpua", category: "rare", rarity_score: 75, total_plays: 40, plays_24_months: 1 },
      { id: 1043, title: "Icculus", category: "rare", rarity_score: 90, total_plays: 15, plays_24_months: 0 },
      { id: 1044, title: "Colonel Forbin's Ascent", category: "rare", rarity_score: 65, total_plays: 55, plays_24_months: 1 },
      { id: 1045, title: "The Famous Mockingbird", category: "rare", rarity_score: 65, total_plays: 55, plays_24_months: 1 },
      
      // Ballads/Mellow
      { id: 1046, title: "Waste", category: "ballad", rarity_score: 30, total_plays: 185, plays_24_months: 8 },
      { id: 1047, title: "Bug", category: "ballad", rarity_score: 35, total_plays: 165, plays_24_months: 6 },
      { id: 1048, title: "If I Could", category: "ballad", rarity_score: 40, total_plays: 140, plays_24_months: 5 },
      { id: 1049, title: "Joy", category: "ballad", rarity_score: 25, total_plays: 210, plays_24_months: 9 },
      { id: 1050, title: "Brian and Robert", category: "ballad", rarity_score: 45, total_plays: 125, plays_24_months: 4 },
      
      // Covers
      { id: 1051, title: "Good Times Bad Times", category: "cover", rarity_score: 30, total_plays: 190, plays_24_months: 8 },
      { id: 1052, title: "Fire", category: "cover", rarity_score: 20, total_plays: 240, plays_24_months: 11 },
      { id: 1053, title: "Rock and Roll", category: "cover", rarity_score: 25, total_plays: 210, plays_24_months: 9 },
      { id: 1054, title: "Loving Cup", category: "cover", rarity_score: 15, total_plays: 280, plays_24_months: 14 },
      { id: 1055, title: "Crosseyed and Painless", category: "cover", rarity_score: 35, total_plays: 160, plays_24_months: 6 },
      
      // Set Closers/Openers
      { id: 1056, title: "Character Zero", category: "rock", rarity_score: 18, total_plays: 275, plays_24_months: 13 },
      { id: 1057, title: "First Tube", category: "rock", rarity_score: 22, total_plays: 250, plays_24_months: 11 },
      { id: 1058, title: "The Moma Dance", category: "funk", rarity_score: 28, total_plays: 200, plays_24_months: 8 },
      { id: 1059, title: "Sample in a Jar", category: "rock", rarity_score: 20, total_plays: 260, plays_24_months: 12 },
      { id: 1060, title: "Heavy Things", category: "rock", rarity_score: 25, total_plays: 230, plays_24_months: 10 },
      
      // Funk/Groove
      { id: 1061, title: "46 Days", category: "funk", rarity_score: 22, total_plays: 245, plays_24_months: 11 },
      { id: 1062, title: "Birds of a Feather", category: "funk", rarity_score: 20, total_plays: 255, plays_24_months: 12 },
      { id: 1063, title: "Bouncing Around the Room", category: "funk", rarity_score: 15, total_plays: 290, plays_24_months: 15 },
      { id: 1064, title: "Down with Disease", category: "funk", rarity_score: 12, total_plays: 310, plays_24_months: 17 },
      { id: 1065, title: "Prince Caspian", category: "funk", rarity_score: 25, total_plays: 225, plays_24_months: 9 },
      
      // Additional Classics
      { id: 1066, title: "Rift", category: "classic", rarity_score: 30, total_plays: 200, plays_24_months: 8 },
      { id: 1067, title: "Split Open and Melt", category: "classic", rarity_score: 32, total_plays: 195, plays_24_months: 7 },
      { id: 1068, title: "Esther", category: "classic", rarity_score: 70, total_plays: 50, plays_24_months: 1 },
      { id: 1069, title: "Llama", category: "classic", rarity_score: 35, total_plays: 175, plays_24_months: 6 },
      { id: 1070, title: "Tela", category: "classic", rarity_score: 50, total_plays: 110, plays_24_months: 3 }
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
