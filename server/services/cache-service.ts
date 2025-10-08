import { db } from "../db";
import { 
  cachedShows, 
  cachedSongs, 
  cachedSetlists, 
  cacheMetadata,
  type CachedShow,
  type CachedSong,
  type CachedSetlist,
  type InsertCachedShow,
  type InsertCachedSong,
  type InsertCachedSetlist,
  type InsertCacheMetadata
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { PhishNetService } from "./phish-api";

export class CacheService {
  private phishApi: PhishNetService;

  constructor() {
    this.phishApi = new PhishNetService();
  }

  // Check if cache is fresh based on refresh interval
  private async isCacheFresh(cacheType: string): Promise<boolean> {
    try {
      const [metadata] = await db
        .select()
        .from(cacheMetadata)
        .where(eq(cacheMetadata.cacheType, cacheType));

      if (!metadata || !metadata.lastRefreshed || !metadata.refreshInterval) {
        return false; // No cache exists or incomplete metadata
      }

      const now = new Date();
      const lastRefreshed = new Date(metadata.lastRefreshed);
      const refreshIntervalMs = metadata.refreshInterval * 1000;
      
      return (now.getTime() - lastRefreshed.getTime()) < refreshIntervalMs;
    } catch (error) {
      console.error(`Error checking cache freshness for ${cacheType}:`, error);
      return false;
    }
  }

  // Update cache metadata
  private async updateCacheMetadata(
    cacheType: string, 
    totalRecords: number, 
    error?: string
  ): Promise<void> {
    try {
      await db
        .insert(cacheMetadata)
        .values({
          cacheType,
          lastRefreshed: new Date(),
          totalRecords,
          isRefreshing: false,
          lastError: error || null,
        })
        .onConflictDoUpdate({
          target: cacheMetadata.cacheType,
          set: {
            lastRefreshed: new Date(),
            totalRecords,
            isRefreshing: false,
            lastError: error || null,
          },
        });
    } catch (error) {
      console.error(`Error updating cache metadata for ${cacheType}:`, error);
    }
  }

  // Get cached songs with optional refresh
  async getCachedSongs(forceRefresh = false): Promise<CachedSong[]> {
    const cacheType = 'songs';
    
    // Check if we need to refresh
    const needsRefresh = forceRefresh || !(await this.isCacheFresh(cacheType));
    
    if (needsRefresh) {
      await this.refreshSongsCache();
    }

    // Return cached data
    return await db
      .select()
      .from(cachedSongs)
      .orderBy(desc(cachedSongs.timesPlayed));
  }

  // Get cached shows with optional refresh
  async getCachedShows(forceRefresh = false): Promise<CachedShow[]> {
    const cacheType = 'shows';
    
    // Check if we need to refresh
    const needsRefresh = forceRefresh || !(await this.isCacheFresh(cacheType));
    
    if (needsRefresh) {
      await this.refreshShowsCache();
    }

    // Return cached data
    return await db
      .select()
      .from(cachedShows)
      .orderBy(desc(cachedShows.showDate));
  }

  // Get cached setlist for a specific date
  async getCachedSetlist(showDate: string, forceRefresh = false): Promise<CachedSetlist | null> {
    // Check if we have this specific setlist cached
    const [cached] = await db
      .select()
      .from(cachedSetlists)
      .where(eq(cachedSetlists.showDate, showDate));

    if (cached && !forceRefresh) {
      return cached;
    }

    // Fetch from API and cache
    return await this.refreshSetlistCache(showDate);
  }

  // Refresh songs cache from Phish.net API
  private async refreshSongsCache(): Promise<void> {
    console.log('🔄 [CacheService] refreshSongsCache v2 (dedup+upsert) - STARTING...');
    
    try {
      // Set refreshing flag
      await db
        .insert(cacheMetadata)
        .values({
          cacheType: 'songs',
          isRefreshing: true,
        })
        .onConflictDoUpdate({
          target: cacheMetadata.cacheType,
          set: { isRefreshing: true },
        });

      // Fetch from API
      const apiSongs = await this.phishApi.getAllSongsForDraft();
      console.log(`Fetched ${apiSongs.length} songs from Phish.net API`);

      if (apiSongs.length > 0) {
        // Calculate 24-month play counts
        const plays24MonthsMap = await this.calculate24MonthPlays();
        
        // Clear existing cache
        await db.delete(cachedSongs);

        // Normalize IDs and deduplicate using Set (fixes mixed-type issue)
        const normalizeId = (s: any, idx: number) => String(s.songid ?? s.id ?? s.slug ?? idx + 10000);
        const seen = new Set<string>();
        const deduped = apiSongs.filter((s, i) => {
          const id = normalizeId(s, i);
          if (seen.has(id)) return false;
          seen.add(id);
          s.__normId = id; // Store normalized ID
          return true;
        });
        
        console.log(`✅ Deduplicated ${apiSongs.length} songs to ${deduped.length} unique songs (string-based)`);

        // Insert deduplicated data with upsert to handle any remaining conflicts
        const batchSize = 100;
        for (let i = 0; i < deduped.length; i += batchSize) {
          const batch = deduped.slice(i, i + batchSize);
          const insertData: InsertCachedSong[] = batch.map((song: any) => ({
            phishNetId: song.__normId, // Use normalized string ID
            title: song.song,
            artist: 'Phish',
            timesPlayed: song.times_played || 0,
            plays24Months: plays24MonthsMap.get(song.song) || 0,
            debutDate: song.debut_date || null,
            lastPlayed: song.last_played || null,
            gap: song.gap || 0,
            originalArtist: song.original_artist || null,
            category: this.categoryzeSong(song.song),
            rarityScore: this.calculateRarityScore(song.times_played || 0, song.gap || 0),
          }));

          // Use onConflictDoNothing for safety against any remaining duplicates
          await db.insert(cachedSongs).values(insertData).onConflictDoNothing();
        }

        await this.updateCacheMetadata('songs', apiSongs.length);
        console.log(`Successfully cached ${apiSongs.length} songs`);
      }
    } catch (error) {
      console.error('Error refreshing songs cache:', error);
      await this.updateCacheMetadata('songs', 0, error instanceof Error ? error.message : String(error));
    }
  }

  // Refresh shows cache from Phish.net API
  private async refreshShowsCache(): Promise<void> {
    console.log('Refreshing shows cache from Phish.net API...');
    
    try {
      // Set refreshing flag
      await db
        .insert(cacheMetadata)
        .values({
          cacheType: 'shows',
          isRefreshing: true,
        })
        .onConflictDoUpdate({
          target: cacheMetadata.cacheType,
          set: { isRefreshing: true },
        });

      // Fetch shows from last 24 months and upcoming shows
      const [last24MonthsShows, upcomingShows] = await Promise.all([
        this.phishApi.getShowsLast24Months(),
        this.phishApi.getUpcomingShows()
      ]);

      const allShows = [...last24MonthsShows, ...upcomingShows];
      console.log(`Fetched ${allShows.length} shows from Phish.net API`);

      if (allShows.length > 0) {
        // Clear existing cache for current year
        const currentYear = new Date().getFullYear();
        // Only clear current year to preserve historical data
        
        // Insert new data
        const insertData: InsertCachedShow[] = allShows.map((show: any) => ({
          phishNetId: show.showid || show.showdate,
          showDate: new Date(show.showdate),
          venue: show.venue || 'Unknown Venue',
          city: show.city || 'Unknown City',
          state: show.state || null,
          country: show.country || 'USA',
          tourid: show.tour_id || null,
          setlistdata: show.setlistdata || null,
          isCompleted: new Date(show.showdate) < new Date(),
        }));

        // Use upsert to avoid duplicates
        for (const showData of insertData) {
          await db
            .insert(cachedShows)
            .values(showData)
            .onConflictDoUpdate({
              target: cachedShows.phishNetId,
              set: {
                venue: showData.venue,
                city: showData.city,
                state: showData.state,
                country: showData.country,
                tourid: showData.tourid,
                setlistdata: showData.setlistdata,
                isCompleted: showData.isCompleted,
                cachedAt: new Date(),
              },
            });
        }

        await this.updateCacheMetadata('shows', allShows.length);
        console.log(`Successfully cached ${allShows.length} shows`);
      }
    } catch (error) {
      console.error('Error refreshing shows cache:', error);
      await this.updateCacheMetadata('shows', 0, error instanceof Error ? error.message : String(error));
    }
  }

  // Refresh specific setlist cache
  private async refreshSetlistCache(showDate: string): Promise<CachedSetlist | null> {
    console.log(`Refreshing setlist cache for ${showDate}...`);
    
    try {
      const setlistData = await this.phishApi.getSetlist(showDate);
      
      if (setlistData) {
        const songs = Array.isArray(setlistData) 
          ? setlistData.map((song: any) => song.song || song.title || song.songname).filter(Boolean)
          : [];

        const insertData: InsertCachedSetlist = {
          showDate,
          setlistData,
          songs,
        };

        const [cached] = await db
          .insert(cachedSetlists)
          .values(insertData)
          .onConflictDoUpdate({
            target: cachedSetlists.showDate,
            set: {
              setlistData: insertData.setlistData,
              songs: insertData.songs,
              cachedAt: new Date(),
            },
          })
          .returning();

        console.log(`Successfully cached setlist for ${showDate}`);
        return cached;
      }
    } catch (error) {
      console.error(`Error refreshing setlist cache for ${showDate}:`, error);
    }

    return null;
  }

  // Calculate 24-month play counts from cached shows and setlists
  private async calculate24MonthPlays(): Promise<Map<string, number>> {
    console.log('📊 Calculating 24-month play counts from cached shows...');
    const songPlayCounts = new Map<string, number>();
    
    try {
      // Get shows from last 24 months
      const twentyFourMonthsAgo = new Date();
      twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);
      
      const recentShows = await db
        .select()
        .from(cachedShows)
        .where(eq(cachedShows.isCompleted, true))
        .orderBy(desc(cachedShows.showDate));
      
      const showsLast24Months = recentShows.filter(show => 
        new Date(show.showDate) >= twentyFourMonthsAgo
      );
      
      console.log(`Found ${showsLast24Months.length} shows in last 24 months`);
      
      // For each show, get setlist and count songs
      for (const show of showsLast24Months) {
        // Try to get cached setlist first
        const showDateStr = show.showDate.toISOString().split('T')[0];
        const [cachedSetlist] = await db
          .select()
          .from(cachedSetlists)
          .where(eq(cachedSetlists.showDate, showDateStr));
        
        let songs: string[] = [];
        
        if (cachedSetlist && cachedSetlist.songs) {
          songs = Array.isArray(cachedSetlist.songs) ? cachedSetlist.songs : [];
        } else if (show.setlistdata) {
          // Try to extract songs from setlistdata
          const setlistData = show.setlistdata;
          if (Array.isArray(setlistData)) {
            songs = setlistData.map((s: any) => s.song || s.title || s.songname).filter(Boolean);
          }
        }
        
        // Count each song
        for (const songTitle of songs) {
          const count = songPlayCounts.get(songTitle) || 0;
          songPlayCounts.set(songTitle, count + 1);
        }
      }
      
      console.log(`✅ Calculated plays for ${songPlayCounts.size} unique songs`);
    } catch (error) {
      console.error('Error calculating 24-month plays:', error);
    }
    
    return songPlayCounts;
  }

  // Helper method to categorize songs (copied from phish-api.ts)
  private categoryzeSong(title: string): string {
    const lowerTitle = title.toLowerCase();
    
    // Gamehendge songs
    const gamehengePattern = /\b(wilson|tela|colonel forbin|famous mockingbird|lizards|the sloth|unit monster|n2o|the man who stepped into yesterday|avenu malkenu|icculus|ac\/dc bag|possum)\b/;
    if (gamehengePattern.test(lowerTitle)) {
      return "Gamehendge";
    }
    
    // Epic jams
    const epicPattern = /\b(you enjoy myself|tweezer|ghost|harry hood|stash|fluffhead|divided sky|reba|run like an antelope|david bowie)\b/;
    if (epicPattern.test(lowerTitle)) {
      return "Epic";
    }
    
    // Classic Phish
    const classicPattern = /\b(wilson|sample in a jar|character zero|bouncing around the room|lawn boy|suzy greenberg|golgi apparatus|fee|maze|cavern|punch you in the eye|the squirming coil|foam|esther|dinner and a movie|bold as love|loving cup)\b/;
    if (classicPattern.test(lowerTitle)) {
      return "Classic";
    }
    
    // Covers
    const coverPattern = /\b(good times bad times|bold as love|loving cup|cities|sneakin' sally|rocky top|i am the walrus|while my guitar gently weeps|fire on the mountain|weekapaug groove)\b/;
    if (coverPattern.test(lowerTitle)) {
      return "Cover";
    }
    
    // Modern era
    const modernPattern = /\b(ghost|sigma oasis|everything's right|blaze on|more|mercury|ruby waves|soul planet|about to run|threads|we are come to outlive our brains|carini|joy|backwards down the number line|kill devil falls|ocelot|twenty years later)\b/;
    if (modernPattern.test(lowerTitle)) {
      return "Modern";
    }
    
    return "Standard";
  }

  // Helper method to calculate rarity score (copied from phish-api.ts)
  private calculateRarityScore(timesPlayed: number, gap: number): number {
    // Base scoring on frequency
    let score = 1; // Everyone gets at least 1 point
    
    if (timesPlayed < 5) score += 4; // Super rare: 5 pts
    else if (timesPlayed < 20) score += 3; // Rare: 4 pts
    else if (timesPlayed < 50) score += 2; // Uncommon: 3 pts
    else if (timesPlayed < 100) score += 1; // Semi-common: 2 pts
    // Common songs: 1 pt (base)
    
    // Bonus for recent gap
    if (gap > 500) score += 2; // Haven't heard in 500+ shows
    else if (gap > 100) score += 1; // Haven't heard in 100+ shows
    
    return Math.min(score, 7); // Cap at 7 points
  }

  // Get cache statistics
  async getCacheStats(): Promise<Record<string, any>> {
    try {
      const metadata = await db.select().from(cacheMetadata);
      const stats: Record<string, any> = {};

      for (const meta of metadata) {
        stats[meta.cacheType] = {
          lastRefreshed: meta.lastRefreshed,
          totalRecords: meta.totalRecords,
          isRefreshing: meta.isRefreshing,
          lastError: meta.lastError,
          refreshInterval: meta.refreshInterval,
        };
      }

      return stats;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {};
    }
  }

  // Force refresh all caches
  async refreshAllCaches(): Promise<void> {
    console.log('Force refreshing all caches...');
    await Promise.all([
      this.refreshSongsCache(),
      this.refreshShowsCache(),
    ]);
  }
}

// Export singleton instance
export const cacheService = new CacheService();