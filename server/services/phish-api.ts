interface PhishInSong {
  id: number;
  title: string;
  times_played: number;
  last_played_at: string;
  debut_at: string;
  gap: number;
  slug: string;
}

interface PhishInShow {
  id: number;
  date: string;
  venue: {
    name: string;
    city: string;
    state: string;
    country: string;
  };
  duration: number;
}

let songsCache: any[] = [];
let songsCacheTimestamp = 0;
const SONGS_CACHE_DURATION = 60 * 60 * 1000;

export class PhishNetService {
  private phishInUrl = "https://phish.in/api/v2";
  private phishNetUrl = "https://api.phish.net/v5";
  private apiKey: string;

  constructor() {
    this.apiKey =
      process.env.PHISH_NET_API_KEY ||
      process.env.PHISH_API_KEY ||
      "6F27E04F96EAC8C2C21B";
    console.log(`Phish.net API initialized with key: ${this.apiKey ? 'PRESENT' : 'MISSING'}`);
    console.log(`Using API key: ${this.apiKey.substring(0, 8)}...`);
  }

  async getUpcomingShows(): Promise<any[]> {
    return this.getUpcomingShowsPhishNet();
  }

  private async getUpcomingShowsPhishNet(): Promise<any[]> {
    try {
      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `${this.phishNetUrl}/shows/showyear/${currentYear}.json?apikey=${this.apiKey}&order_by=showdate&direction=asc`
      );
      if (!response.ok) throw new Error(`Phish.net API error: ${response.statusText}`);
      const data = await response.json();
      const shows = data.data || [];
      // Use date-string comparison to avoid midnight-UTC edge cases where
      // new Date("2026-04-18") (midnight UTC) < new Date() (e.g. 02:00 UTC).
      const todayStr = new Date().toISOString().split("T")[0];
      return shows.filter((show: any) => show.showdate >= todayStr);
    } catch (error) {
      console.error("Error fetching upcoming shows from Phish.net:", error);
      return [];
    }
  }

  async getRecentShows(limit = 20): Promise<any[]> {
    try {
      // Use phish.net — it indexes shows much faster than phish.in (which waits
      // for audio uploads), so recent shows appear within a day of playing.
      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `${this.phishNetUrl}/shows/showyear/${currentYear}.json?apikey=${this.apiKey}&order_by=showdate&direction=desc`
      );
      if (!response.ok) throw new Error(`Phish.net API error: ${response.statusText}`);
      const data = await response.json();
      const shows: any[] = data.data || [];
      const todayStr = new Date().toISOString().split("T")[0];
      return shows
        .filter((show: any) => show.showdate < todayStr)
        .slice(0, limit)
        .map((show: any) => ({
          showid: show.showid,
          showdate: show.showdate,
          venue: show.venue || "Unknown Venue",
          city: show.city || "Unknown City",
          state: show.state || null,
          country: show.country || "USA",
        }));
    } catch (error) {
      console.error("Error fetching recent shows from Phish.net:", error);
      return [];
    }
  }

  async getShowsLast24Months(): Promise<any[]> {
    try {
      const currentYear = new Date().getFullYear();
      const years = [currentYear, currentYear - 1, currentYear - 2];
      const allShows: any[] = [];

      for (const year of years) {
        try {
          const response = await fetch(
            `${this.phishInUrl}/shows?year=${year}&per_page=100`,
            { headers: { "Accept": "application/json" } }
          );
          if (response.ok) {
            const data = await response.json();
            const shows = (data.shows || data.data || []).map((show: any) => ({
              showid: show.id,
              showdate: show.date,
              venue: show.venue?.name || "Unknown Venue",
              city: show.venue?.city || "Unknown City",
              state: show.venue?.state || null,
              country: show.venue?.country || "USA",
            }));
            allShows.push(...shows);
          }
        } catch (err) {
          console.error(`Error fetching shows from ${year}:`, err);
        }
      }

      const twentyFourMonthsAgo = new Date();
      twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);

      return allShows.filter(show =>
        new Date(show.showdate) >= twentyFourMonthsAgo &&
        new Date(show.showdate) <= new Date()
      );
    } catch (error) {
      console.error("Error fetching last 24 months of shows:", error);
      return [];
    }
  }

  async getSetlist(showDate: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.phishInUrl}/shows/${showDate}`,
        { headers: { "Accept": "application/json" } }
      );
      if (!response.ok) throw new Error(`Phish.in API error: ${response.statusText}`);
      const data = await response.json();
      
      // Flatten tracks — phish.in v2 returns tracks directly on the show with set_name per track
      const tracks: any[] = [];
      for (const track of data.tracks || []) {
        tracks.push({
          song: track.title,
          duration: track.duration, // duration in seconds
          position: track.position,
          set: track.set_name,
          isEncore: track.set_name?.toLowerCase().includes('encore'),
        });
      }
      return tracks;
    } catch (error) {
      console.error("Error fetching setlist from Phish.in, trying Phish.net:", error);
      return this.getSetlistPhishNet(showDate);
    }
  }

  private async getSetlistPhishNet(showDate: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.phishNetUrl}/setlists/showdate/${showDate}.json?apikey=${this.apiKey}`
      );
      if (!response.ok) throw new Error(`Phish.net API error: ${response.statusText}`);
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error("Error fetching setlist from Phish.net:", error);
      return null;
    }
  }

  async getAllSongsForDraft(): Promise<any[]> {
    try {
      console.log('🎵 Fetching complete song catalog from Phish.in API...');
      
      let allSongs: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `${this.phishInUrl}/songs?per_page=100&page=${page}`,
          { headers: { "Accept": "application/json" } }
        );

        if (!response.ok) throw new Error(`Phish.in API error: ${response.statusText}`);

        const data = await response.json();
        const songs = data.data || [];
        allSongs = [...allSongs, ...songs];

        // Check if there are more pages
        hasMore = data.meta?.next_page !== null && songs.length === 100;
        page++;

        if (page > 20) break; // Safety limit
      }

      console.log(`✅ Fetched ${allSongs.length} songs from Phish.in`);

      // Transform to our format
      return allSongs.map((song: any) => ({
        songid: String(song.id || song.slug),
        song: song.title,
        times_played: song.times_played || 0,
        last_played: song.last_played_at || null,
        gap: song.gap || 0,
        debut_date: song.debut_at || null,
        original_artist: song.original_artist || null,
        slug: song.slug,
      }));

    } catch (error) {
      console.error("💥 Error fetching from Phish.in, falling back to Phish.net:", error);
      return this.getAllSongsPhishNet();
    }
  }

  private async getAllSongsPhishNet(): Promise<any[]> {
    try {
      console.log('🔄 Falling back to Phish.net for songs...');
      const response = await fetch(
        `${this.phishNetUrl}/songs.json?apikey=${this.apiKey}&limit=10000`
      );
      if (!response.ok) throw new Error(`Phish.net API error: ${response.statusText}`);
      const data = await response.json();
      const songs = data?.data || [];
      console.log(`✅ Got ${songs.length} songs from Phish.net fallback`);
      return songs.map((song: any) => ({
        songid: String(song.songid || song.id),
        song: song.song || song.title,
        times_played: song.times_played || 0,
        last_played: song.last_played || null,
        gap: song.gap || 0,
        debut_date: song.debut_date || null,
        original_artist: song.original_artist || null,
      }));
    } catch (error) {
      console.error("Error fetching from Phish.net fallback:", error);
      return this.getFallbackSongs().map(song => ({
        songid: String(song.id),
        song: song.title,
        times_played: song.total_plays,
        last_played: null,
        gap: 50,
        debut_date: null,
        original_artist: null,
      }));
    }
  }

  async getSongStats(songName: string): Promise<any | null> {
    try {
      const response = await fetch(
        `${this.phishNetUrl}/songs/stats.json?apikey=${this.apiKey}&song=${encodeURIComponent(songName)}`
      );
      if (!response.ok) throw new Error(`Phish.net API error: ${response.statusText}`);
      const data = await response.json();
      return data.response?.data || null;
    } catch (error) {
      console.error("Error fetching song stats:", error);
      return null;
    }
  }

  async getShowWithDurations(showDate: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.phishInUrl}/shows/${showDate}`,
        { headers: { "Accept": "application/json" } }
      );
      if (!response.ok) throw new Error(`Phish.in API error: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching show with durations for ${showDate}:`, error);
      return null;
    }
  }

  private categoryzeSong(title: string): string {
    const titleLower = title.toLowerCase();
    if (['tweezer', 'ghost', 'simple', 'you enjoy myself', 'david bowie', 'wolfmans brother', 'mike song', 'piper', 'weekapaug groove'].some(j => titleLower.includes(j))) return 'jam';
    if (['fluffhead', 'harry hood', 'slave to the traffic light', 'run like an antelope'].some(e => titleLower.includes(e))) return 'epic';
    if (['divided sky', 'reba', 'foam', 'theme from the bottom'].some(c => titleLower.includes(c))) return 'composed';
    if (['possum', 'stash', 'maze', 'chalk dust torture', 'julius', 'suzy greenberg'].some(r => titleLower.includes(r))) return 'rock';
    if (['mercury', 'thread', 'sigma oasis', 'ruby waves', "everything's right", 'blaze on', 'fuego', 'waves'].some(m => titleLower.includes(m))) return 'modern';
    if (['the sloth', 'contact', 'oh kee pa', 'harpua', 'icculus', 'gamehendge'].some(r => titleLower.includes(r))) return 'rare';
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

  private getFallbackSongs(): any[] {
    return [
      { id: 1001, title: "Tweezer", category: "jam", rarity_score: 5, total_plays: 411, plays_24_months: 22 },
      { id: 1002, title: "You Enjoy Myself", category: "jam", rarity_score: 15, total_plays: 350, plays_24_months: 20 },
      { id: 1003, title: "Ghost", category: "jam", rarity_score: 15, total_plays: 290, plays_24_months: 17 },
      { id: 1004, title: "Harry Hood", category: "epic", rarity_score: 20, total_plays: 275, plays_24_months: 15 },
      { id: 1005, title: "Fluffhead", category: "epic", rarity_score: 30, total_plays: 286, plays_24_months: 10 },
      { id: 1006, title: "Divided Sky", category: "composed", rarity_score: 35, total_plays: 250, plays_24_months: 8 },
      { id: 1007, title: "Possum", category: "rock", rarity_score: 15, total_plays: 310, plays_24_months: 18 },
      { id: 1008, title: "Wilson", category: "classic", rarity_score: 25, total_plays: 300, plays_24_months: 11 },
      { id: 1009, title: "Character Zero", category: "rock", rarity_score: 18, total_plays: 275, plays_24_months: 13 },
      { id: 1010, title: "Down with Disease", category: "funk", rarity_score: 12, total_plays: 310, plays_24_months: 17 },
    ];
  }

  async getSongById(songId: number): Promise<any | null> {
    const songs = await this.getAllSongsForDraft();
    return songs.find(song => song.id === songId) || null;
  }

  async saveSongToDatabase(songData: any): Promise<any> {
    const { db } = await import('../db');
    const { songs } = await import('../../shared/schema');
    try {
      const [savedSong] = await db
        .insert(songs)
        .values({
          title: songData.title,
          category: songData.category,
          rarityScore: songData.rarity_score || 50,
          totalPlays: songData.total_plays || 0,
          lastPlayed: songData.last_played || null,
        })
        .onConflictDoUpdate({
          target: [songs.title],
          set: {
            totalPlays: songData.total_plays || 0,
            lastPlayed: songData.last_played || null,
          },
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