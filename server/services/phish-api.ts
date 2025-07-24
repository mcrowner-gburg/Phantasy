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
}

export const phishApi = new PhishNetService();
