import { 
  User, 
  Tour, 
  League, 
  LeagueMember, 
  Song, 
  DraftedSong, 
  Concert, 
  SongPerformance, 
  Activity,
  InsertUser,
  InsertTour,
  InsertLeague,
  InsertDraftedSong,
  InsertConcert,
  InsertSongPerformance,
  users,
  tours,
  leagues,
  songs,
  draftedSongs,
  concerts,
  songPerformances,
  activities,
  leagueMembers
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<void>;

  // Tour operations
  getTours(): Promise<Tour[]>;
  getActiveTour(): Promise<Tour | undefined>;
  getTour(id: number): Promise<Tour | undefined>;
  createTour(tour: InsertTour): Promise<Tour>;

  // League operations
  getLeague(id: number): Promise<League | undefined>;
  getAllLeagues(): Promise<League[]>;
  getPublicLeagues(tourId?: number): Promise<(League & { memberCount: number })[]>;
  createLeague(league: InsertLeague & { ownerId: number }): Promise<League>;
  getUserLeagues(userId: number): Promise<League[]>;
  getTourLeagues(tourId: number): Promise<League[]>;
  joinLeague(userId: number, leagueId: number): Promise<void>;
  getLeagueMembers(leagueId: number): Promise<(LeagueMember & { user: User })[]>;
  getLeagueMemberCount(leagueId: number): Promise<number>;

  // Song operations
  getAllSongs(): Promise<Song[]>;
  getSong(id: number): Promise<Song | undefined>;
  getSongByTitle(title: string): Promise<Song | undefined>;
  createSong(title: string, category?: string): Promise<Song>;
  updateSongStats(songId: number, rarityScore: number, lastPlayed: Date | null): Promise<void>;

  // Drafted Songs operations
  getDraftedSongs(userId: number, leagueId: number): Promise<(DraftedSong & { song: Song })[]>;
  draftSong(draft: InsertDraftedSong): Promise<DraftedSong>;
  updateDraftedSongPoints(id: number, points: number): Promise<void>;
  updateDraftedSongStats(id: number, playedCount: number, openerCount: number, encoreCount: number): Promise<void>;

  // Concerts
  getConcerts(): Promise<Concert[]>;
  getUpcomingConcerts(): Promise<Concert[]>;
  createConcert(concert: InsertConcert): Promise<Concert>;
  updateConcertSetlist(concertId: number, setlist: string[]): Promise<void>;

  // Song Performances
  createSongPerformance(performance: InsertSongPerformance): Promise<SongPerformance>;
  getConcertPerformances(concertId: number): Promise<(SongPerformance & { song: Song })[]>;
  calculateAndUpdatePoints(concertId: number): Promise<void>;

  // Activities
  getUserActivities(userId: number, leagueId?: number): Promise<Activity[]>;
  createActivity(userId: number, leagueId: number, type: string, description: string, points?: number): Promise<Activity>;

  // Leaderboard
  getLeagueStandings(leagueId: number): Promise<(User & { rank: number; todayPoints: number; songCount: number })[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }



  // Tour operations - database implementations
  async getTours(): Promise<Tour[]> {
    return await db.select().from(tours).orderBy(tours.id);
  }

  async getActiveTour(): Promise<Tour | undefined> {
    const [tour] = await db.select().from(tours).where(eq(tours.isActive, true));
    return tour || undefined;
  }

  async getTour(id: number): Promise<Tour | undefined> {
    const [tour] = await db.select().from(tours).where(eq(tours.id, id));
    return tour || undefined;
  }

  async createTour(tour: InsertTour): Promise<Tour> {
    const [newTour] = await db.insert(tours).values(tour).returning();
    return newTour;
  }

  // League operations - database implementations
  async getLeague(id: number): Promise<League | undefined> {
    const [league] = await db
      .select()
      .from(leagues)
      .where(eq(leagues.id, id));
    
    return league || undefined;
  }

  async getAllLeagues(): Promise<League[]> {
    return await db.select().from(leagues);
  }

  async getPublicLeagues(tourId?: number): Promise<(League & { memberCount: number })[]> {
    const query = db
      .select({
        id: leagues.id,
        name: leagues.name,
        description: leagues.description,
        tourId: leagues.tourId,
        ownerId: leagues.ownerId,
        maxPlayers: leagues.maxPlayers,
        draftStatus: leagues.draftStatus,
        createdAt: leagues.createdAt,
        memberCount: sql<number>`count(${leagueMembers.id})`,
      })
      .from(leagues)
      .leftJoin(leagueMembers, eq(leagues.id, leagueMembers.leagueId))
      .groupBy(leagues.id);
    
    if (tourId) {
      query.where(eq(leagues.tourId, tourId));
    }
    
    return await query;
  }

  async createLeague(league: InsertLeague & { ownerId: number }): Promise<League> {
    const [newLeague] = await db
      .insert(leagues)
      .values(league)
      .returning();
    
    // Automatically add the creator as a league member
    await db
      .insert(leagueMembers)
      .values({
        leagueId: newLeague.id,
        userId: league.ownerId,
      });
    
    return newLeague;
  }

  async getUserLeagues(userId: number): Promise<League[]> {
    const userLeagues = await db
      .select({
        id: leagues.id,
        name: leagues.name,
        description: leagues.description,
        tourId: leagues.tourId,
        ownerId: leagues.ownerId,
        maxPlayers: leagues.maxPlayers,
        draftStatus: leagues.draftStatus,
        createdAt: leagues.createdAt,
      })
      .from(leagues)
      .innerJoin(leagueMembers, eq(leagues.id, leagueMembers.leagueId))
      .where(eq(leagueMembers.userId, userId));
    
    return userLeagues;
  }

  async getTourLeagues(tourId: number): Promise<League[]> {
    const league = await this.getLeague(1);
    return league ? [league] : [];
  }

  async joinLeague(userId: number, leagueId: number): Promise<void> {
    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(leagueMembers)
      .where(and(eq(leagueMembers.userId, userId), eq(leagueMembers.leagueId, leagueId)))
      .limit(1);
    
    if (existingMember.length > 0) {
      throw new Error("User is already a member of this league");
    }
    
    // Check if league is at capacity
    const league = await this.getLeague(leagueId);
    if (!league) {
      throw new Error("League not found");
    }
    
    const memberCount = await this.getLeagueMemberCount(leagueId);
    if (memberCount >= league.maxPlayers) {
      throw new Error("League is at maximum capacity");
    }
    
    // Add user to league
    await db
      .insert(leagueMembers)
      .values({
        leagueId,
        userId,
      });
  }

  async getLeagueMembers(leagueId: number): Promise<(LeagueMember & { user: User })[]> {
    const members = await db
      .select({
        id: leagueMembers.id,
        leagueId: leagueMembers.leagueId,
        userId: leagueMembers.userId,
        joinedAt: leagueMembers.joinedAt,
        user: {
          id: users.id,
          username: users.username,
          password: users.password,
          totalPoints: users.totalPoints,
          createdAt: users.createdAt,
        },
      })
      .from(leagueMembers)
      .innerJoin(users, eq(leagueMembers.userId, users.id))
      .where(eq(leagueMembers.leagueId, leagueId));
    
    return members;
  }

  async getLeagueMemberCount(leagueId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(leagueMembers)
      .where(eq(leagueMembers.leagueId, leagueId));
    
    return result[0]?.count || 0;
  }

  private songsCache: Song[] | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  // Song operations with authentic Phish.net data
  async getAllSongs(): Promise<Song[]> {
    // Return cached data if still valid
    if (this.songsCache && Date.now() < this.cacheExpiry) {
      return this.songsCache;
    }

    // Base song list - using exact Phish.net database names for authentic rarity scores
    const baseSongs: Song[] = [
      { id: 1, title: "Wilson", category: "Gamehendge", rarityScore: 35, lastPlayed: null, totalPlays: 0 },
      { id: 2, title: "Harry Hood", category: "Classic", rarityScore: 35, lastPlayed: null, totalPlays: 0 },
      { id: 3, title: "Fluffhead", category: "Epic", rarityScore: 35, lastPlayed: null, totalPlays: 0 },
      { id: 4, title: "You Enjoy Myself", category: "Classic", rarityScore: 35, lastPlayed: null, totalPlays: 0 },
      { id: 5, title: "Tweezer", category: "Jam", rarityScore: 35, lastPlayed: null, totalPlays: 0 },
      { id: 6, title: "Free", category: "Rock", rarityScore: 35, lastPlayed: null, totalPlays: 0 },
      { id: 7, title: "Bowie", category: "Epic", rarityScore: 35, lastPlayed: null, totalPlays: 0 },
      { id: 8, title: "Possum", category: "Country", rarityScore: 35, lastPlayed: null, totalPlays: 0 },
      { id: 9, title: "Maze", category: "Rock", rarityScore: 35, lastPlayed: null, totalPlays: 0 },
      { id: 10, title: "Divided Sky", category: "Composed", rarityScore: 35, lastPlayed: null, totalPlays: 0 },
      { id: 11, title: "Julius", category: "Rock", rarityScore: 35, lastPlayed: null, totalPlays: 0 },
      { id: 12, title: "Chalk Dust Torture", category: "Rock", rarityScore: 35, lastPlayed: null, totalPlays: 0 },
      { id: 13, title: "Antelope", category: "Classic", rarityScore: 35, lastPlayed: null, totalPlays: 0 },
      { id: 14, title: "Ghost", category: "Jam", rarityScore: 35, lastPlayed: null, totalPlays: 0 },
      { id: 15, title: "Bathtub Gin", category: "Jam", rarityScore: 35, lastPlayed: null, totalPlays: 0 },
    ];

    try {
      // Import the rarity service dynamically to avoid circular dependencies
      const { updateSongRarityScores } = await import("./services/phish-rarity");
      const updatedSongs = await updateSongRarityScores(baseSongs);
      
      // Cache the results
      this.songsCache = updatedSongs;
      this.cacheExpiry = Date.now() + this.CACHE_DURATION;
      
      return updatedSongs;
    } catch (error) {
      console.error("Error updating song rarity scores:", error);
      // Fallback to base songs if API fails
      return baseSongs;
    }
  }

  async getSong(id: number): Promise<Song | undefined> {
    const songs = await this.getAllSongs();
    return songs.find(s => s.id === id);
  }

  async getSongByTitle(title: string): Promise<Song | undefined> {
    const songs = await this.getAllSongs();
    return songs.find(s => s.title === title);
  }

  async createSong(title: string, category?: string): Promise<Song> {
    return { id: Date.now(), title, category: category ?? null, rarityScore: 50, lastPlayed: new Date(), totalPlays: 0 };
  }

  async updateSongStats(songId: number, rarityScore: number, lastPlayed: Date | null): Promise<void> {
    // Update cache if it exists
    if (this.songsCache) {
      const songIndex = this.songsCache.findIndex(s => s.id === songId);
      if (songIndex !== -1) {
        this.songsCache[songIndex] = {
          ...this.songsCache[songIndex],
          rarityScore,
          lastPlayed,
        };
      }
    }
  }

  // Drafted Songs operations - stub implementations
  async getDraftedSongs(userId: number, leagueId: number): Promise<(DraftedSong & { song: Song })[]> {
    const songs = await this.getAllSongs();
    return [
      {
        id: 1,
        userId,
        leagueId,
        songId: 1,
        points: 5,
        playedCount: 2,
        openerCount: 1,
        encoreCount: 0,
        status: "active",
        draftedAt: new Date(),
        song: songs[0],
      },
      {
        id: 2,
        userId,
        leagueId,
        songId: 3,
        points: 3,
        playedCount: 1,
        openerCount: 0,
        encoreCount: 1,
        status: "active",
        draftedAt: new Date(),
        song: songs[2],
      },
      {
        id: 3,
        userId,
        leagueId,
        songId: 5,
        points: 7,
        playedCount: 3,
        openerCount: 1,
        encoreCount: 1,
        status: "active",
        draftedAt: new Date(),
        song: songs[4],
      },
    ];
  }

  async draftSong(draft: InsertDraftedSong): Promise<DraftedSong> {
    return { id: Date.now(), ...draft, draftedAt: new Date() } as DraftedSong;
  }

  async updateDraftedSongPoints(id: number, additionalPoints: number): Promise<void> {
    // In a real database, this would update the points for the drafted song
    // For now, this is a stub but the logic would be:
    // UPDATE drafted_songs SET points = points + additionalPoints WHERE id = id
    console.log(`Updating drafted song ${id} with +${additionalPoints} points`);
  }

  async updateDraftedSongStats(id: number, playedCount: number, openerCount: number, encoreCount: number): Promise<void> {
    // In a real database, this would update the performance stats for the drafted song
    // UPDATE drafted_songs SET played_count = playedCount, opener_count = openerCount, encore_count = encoreCount WHERE id = id
    console.log(`Updating drafted song ${id} stats: ${playedCount} played, ${openerCount} openers, ${encoreCount} encores`);
  }

  async updateUserPoints(userId: number, additionalPoints: number): Promise<void> {
    // In a real database, this would update the user's total points by adding additionalPoints
    // UPDATE users SET total_points = total_points + additionalPoints WHERE id = userId
    console.log(`Updating user ${userId} with +${additionalPoints} points`);
  }

  // Concert operations - stub implementations
  async getConcerts(): Promise<Concert[]> {
    return [];
  }

  async getUpcomingConcerts(): Promise<Concert[]> {
    return [];
  }

  async createConcert(concert: InsertConcert): Promise<Concert> {
    return { id: Date.now(), ...concert } as Concert;
  }

  async updateConcertSetlist(concertId: number, setlist: string[]): Promise<void> {
    // Stub implementation
  }

  // Song Performance operations - stub implementations
  async createSongPerformance(performance: InsertSongPerformance): Promise<SongPerformance> {
    return { id: Date.now(), ...performance } as SongPerformance;
  }

  async getConcertPerformances(concertId: number): Promise<(SongPerformance & { song: Song })[]> {
    return [];
  }

  async calculateAndUpdatePoints(concertId: number): Promise<void> {
    const performances = await this.getConcertPerformances(concertId);
    
    for (const performance of performances) {
      // Calculate points: 1 for played + 1 for opener + 1 for encore (max 3 points)
      let points = 1; // Base point for being played
      
      if (performance.isOpener) {
        points += 1; // Additional point for set opener
      }
      
      if (performance.isEncore) {
        points += 1; // Additional point for encore
      }

      // Find all drafted songs for this song and update their stats
      const draftedSongs = await this.getDraftedSongs(1, 1); // Mock for now
      const relevantDrafts = draftedSongs.filter((draft: any) => draft.songId === performance.songId);

      for (const draftedSong of relevantDrafts) {
        // Update points
        await this.updateDraftedSongPoints(draftedSong.id, points);
        
        // Update stats
        const newPlayedCount = (draftedSong.playedCount || 0) + 1;
        const newOpenerCount = (draftedSong.openerCount || 0) + (performance.isOpener ? 1 : 0);
        const newEncoreCount = (draftedSong.encoreCount || 0) + (performance.isEncore ? 1 : 0);
        
        await this.updateDraftedSongStats(draftedSong.id, newPlayedCount, newOpenerCount, newEncoreCount);
        
        // Update user total points
        await this.updateUserPoints(draftedSong.userId, points);
        
        // Create activity for the points scored
        const song = await this.getSong(performance.songId!);
        let description = `"${song?.title}" was played`;
        if (performance.isOpener && performance.isEncore) {
          description += " as a set opener and encore";
        } else if (performance.isOpener) {
          description += " as a set opener";
        } else if (performance.isEncore) {
          description += " as an encore";
        }
        description += ` (+${points} points)`;
        
        await this.createActivity(
          draftedSong.userId,
          draftedSong.leagueId,
          "score",
          description,
          points
        );
      }
    }
  }

  // Activities operations - stub implementations
  async getUserActivities(userId: number, leagueId?: number): Promise<Activity[]> {
    return [
      {
        id: 1,
        userId,
        leagueId: leagueId || 1,
        type: "draft",
        description: "You drafted \"Wilson\"",
        points: 0,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 2,
        userId,
        leagueId: leagueId || 1,
        type: "score",
        description: "\"Wilson\" was played as a set opener (+2 points)",
        points: 2,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 3,
        userId,
        leagueId: leagueId || 1,
        type: "score",
        description: "\"Fluffhead\" was played as an encore (+2 points)",
        points: 2,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        id: 4,
        userId,
        leagueId: leagueId || 1,
        type: "score",
        description: "\"Tweezer\" was played (+1 point)",
        points: 1,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    ];
  }

  async createActivity(userId: number, leagueId: number, type: string, description: string, points?: number): Promise<Activity> {
    return {
      id: Date.now(),
      userId,
      leagueId,
      type,
      description,
      points: points || 0,
      createdAt: new Date(),
    };
  }

  // Leaderboard operations - stub implementations
  async getLeagueStandings(leagueId: number): Promise<(User & { rank: number; todayPoints: number; songCount: number })[]> {
    // Get all league members with their user data and drafted song stats
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        password: users.password,
        totalPoints: users.totalPoints,
        createdAt: users.createdAt,
        songCount: sql<number>`count(${draftedSongs.id})::int`,
        todayPoints: sql<number>`coalesce(sum(${draftedSongs.points}), 0)::int`
      })
      .from(leagueMembers)
      .innerJoin(users, eq(leagueMembers.userId, users.id))
      .leftJoin(draftedSongs, and(
        eq(draftedSongs.userId, users.id),
        eq(draftedSongs.leagueId, leagueId)
      ))
      .where(eq(leagueMembers.leagueId, leagueId))
      .groupBy(users.id, leagueMembers.userId)
      .orderBy(sql`coalesce(sum(${draftedSongs.points}), 0) desc`);

    // Add rank based on points
    return result.map((user, index) => ({
      ...user,
      rank: index + 1,
    }));
  }
}

export const storage = new DatabaseStorage();