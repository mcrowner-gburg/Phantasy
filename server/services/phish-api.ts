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
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `${this.baseUrl}/shows/upcoming.json?apikey=${this.apiKey}&date=${today}`,
      );

      if (!response.ok) {
        throw new Error(`Phish.net API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response?.data || [];
    } catch (error) {
      console.error("Error fetching upcoming shows:", error);
      return [];
    }
  }

  async getRecentShows(limit = 10): Promise<PhishNetShow[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/shows/recent.json?apikey=${this.apiKey}&limit=${limit}`,
      );

      if (!response.ok) {
        throw new Error(`Phish.net API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response?.data || [];
    } catch (error) {
      console.error("Error fetching recent shows:", error);
      return [];
    }
  }

  async getSetlist(showId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/setlists/get.json?apikey=${this.apiKey}&showid=${showId}`,
      );

      if (!response.ok) {
        throw new Error(`Phish.net API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response?.data || null;
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
