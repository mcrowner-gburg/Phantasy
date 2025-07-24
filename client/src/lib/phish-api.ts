// Phish.net API integration
const PHISH_NET_API_KEY = import.meta.env.VITE_PHISH_NET_API_KEY || process.env.PHISH_NET_API_KEY || "your_api_key_here";
const PHISH_NET_BASE_URL = "https://api.phish.net/v5";

export interface PhishNetShow {
  showid: string;
  showdate: string;
  venue: string;
  city: string;
  state: string;
  country: string;
  setlistdata?: string;
}

export interface PhishNetSong {
  song: string;
  artist_name: string;
  times_played: number;
  first_played: string;
  last_played: string;
}

class PhishNetAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${PHISH_NET_BASE_URL}/${endpoint}`);
    url.searchParams.append("apikey", this.apiKey);
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Phish.net API error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Phish.net API request failed:", error);
      throw error;
    }
  }

  async getRecentShows(limit: number = 10): Promise<PhishNetShow[]> {
    try {
      const response = await this.makeRequest("shows", { limit: limit.toString() });
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch recent shows:", error);
      return [];
    }
  }

  async getUpcomingShows(): Promise<PhishNetShow[]> {
    try {
      // Phish.net doesn't have upcoming shows endpoint, so we'll use a placeholder
      // In a real implementation, you'd need to scrape or use another source
      return [];
    } catch (error) {
      console.error("Failed to fetch upcoming shows:", error);
      return [];
    }
  }

  async getSetlist(showId: string): Promise<string[]> {
    try {
      const response = await this.makeRequest("setlists", { showid: showId });
      if (response.data && response.data.length > 0) {
        const setlistData = response.data[0].setlistdata;
        // Parse setlist data to extract song names
        // This would need proper parsing based on Phish.net format
        return setlistData ? setlistData.split(",").map((song: string) => song.trim()) : [];
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch setlist:", error);
      return [];
    }
  }

  async getSongStats(songName: string): Promise<PhishNetSong | null> {
    try {
      const response = await this.makeRequest("songs", { song: songName });
      return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error("Failed to fetch song stats:", error);
      return null;
    }
  }

  async searchSongs(query: string): Promise<PhishNetSong[]> {
    try {
      const response = await this.makeRequest("songs", { song: query });
      return response.data || [];
    } catch (error) {
      console.error("Failed to search songs:", error);
      return [];
    }
  }
}

export const phishNetAPI = new PhishNetAPI(PHISH_NET_API_KEY);
