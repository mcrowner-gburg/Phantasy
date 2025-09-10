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
    console.log('Refreshing songs cache from Phish.net API...');
    
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
      const apiSongs = await this.phishApi.getAllSongs();
      console.log(`Fetched ${apiSongs.length} songs from Phish.net API`);

      if (apiSongs.length > 0) {
        // Clear existing cache
        await db.delete(cachedSongs);

        // Insert new data in batches
        const batchSize = 100;
        for (let i = 0; i < apiSongs.length; i += batchSize) {
          const batch = apiSongs.slice(i, i + batchSize);
          const insertData: InsertCachedSong[] = batch.map((song: any, batchIndex: number) => ({
            phishNetId: song.songid || String(i + batchIndex),
            title: song.song,
            artist: 'Phish',
            timesPlayed: song.times_played || 0,
            debutDate: song.debut_date || null,
            lastPlayed: song.last_played || null,
            gap: song.gap || 0,
            originalArtist: song.original_artist || null,
            category: this.categoryzeSong(song.song),
            rarityScore: this.calculateRarityScore(song.times_played || 0, song.gap || 0),
          }));

          await db.insert(cachedSongs).values(insertData);
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

      // Fetch recent and upcoming shows
      const [recentShows, upcomingShows] = await Promise.all([
        this.phishApi.getRecentShows(50),
        this.phishApi.getUpcomingShows()
      ]);

      const allShows = [...recentShows, ...upcomingShows];
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