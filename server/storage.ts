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
  users
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
  createLeague(league: InsertLeague & { ownerId: number }): Promise<League>;
  getUserLeagues(userId: number): Promise<League[]>;
  getTourLeagues(tourId: number): Promise<League[]>;
  joinLeague(userId: number, leagueId: number): Promise<void>;
  getLeagueMembers(leagueId: number): Promise<(LeagueMember & { user: User })[]>;

  // Song operations
  getAllSongs(): Promise<Song[]>;
  getSong(id: number): Promise<Song | undefined>;
  getSongByTitle(title: string): Promise<Song | undefined>;
  createSong(title: string, category?: string): Promise<Song>;
  updateSongStats(songId: number, rarityScore: number, lastPlayed: Date): Promise<void>;

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

  async updateUserPoints(userId: number, points: number): Promise<void> {
    await db
      .update(users)
      .set({ totalPoints: points })
      .where(eq(users.id, userId));
  }

  // Tour operations - stub implementations
  async getTours(): Promise<Tour[]> {
    return [{
      id: 1,
      name: "Winter Tour 2024",
      year: 2024,
      season: "winter",
      description: "NYE run and winter shows",
      startDate: new Date("2024-12-28"),
      endDate: new Date("2024-01-15"),
      isActive: true,
      createdAt: new Date(),
    }];
  }

  async getActiveTour(): Promise<Tour | undefined> {
    const tours = await this.getTours();
    return tours.find(t => t.isActive);
  }

  async getTour(id: number): Promise<Tour | undefined> {
    const tours = await this.getTours();
    return tours.find(t => t.id === id);
  }

  async createTour(tour: InsertTour): Promise<Tour> {
    // Stub implementation
    return { id: 1, ...tour, createdAt: new Date() } as Tour;
  }

  // League operations - stub implementations
  async getLeague(id: number): Promise<League | undefined> {
    return {
      id: 1,
      name: "Winter Tour Fantasy League",
      description: "Draft songs for the NYE run and winter shows",
      tourId: 1,
      ownerId: 1,
      maxPlayers: 24,
      draftStatus: "active",
      createdAt: new Date(),
    };
  }

  async createLeague(league: InsertLeague & { ownerId: number }): Promise<League> {
    return { id: 1, ...league, createdAt: new Date() } as League;
  }

  async getUserLeagues(userId: number): Promise<League[]> {
    return [await this.getLeague(1)!];
  }

  async getTourLeagues(tourId: number): Promise<League[]> {
    return [await this.getLeague(1)!];
  }

  async joinLeague(userId: number, leagueId: number): Promise<void> {
    // Stub implementation
  }

  async getLeagueMembers(leagueId: number): Promise<(LeagueMember & { user: User })[]> {
    return [];
  }

  // Song operations - stub implementations
  async getAllSongs(): Promise<Song[]> {
    return [
      { id: 1, title: "Wilson", category: "Gamehendge", rarityScore: 85, lastPlayed: new Date(), totalPlays: 245 },
      { id: 2, title: "Harry Hood", category: "Classic", rarityScore: 65, lastPlayed: new Date(), totalPlays: 456 },
      { id: 3, title: "Fluffhead", category: "Epic", rarityScore: 120, lastPlayed: new Date(), totalPlays: 123 },
      { id: 4, title: "You Enjoy Myself", category: "Classic", rarityScore: 70, lastPlayed: new Date(), totalPlays: 389 },
      { id: 5, title: "Tweezer", category: "Jam", rarityScore: 60, lastPlayed: new Date(), totalPlays: 512 },
    ];
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
    return { id: Date.now(), title, category, rarityScore: 50, lastPlayed: new Date(), totalPlays: 0 };
  }

  async updateSongStats(songId: number, rarityScore: number, lastPlayed: Date): Promise<void> {
    // Stub implementation
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

  async updateDraftedSongPoints(id: number, points: number): Promise<void> {
    // Stub implementation
  }

  async updateDraftedSongStats(id: number, playedCount: number, openerCount: number, encoreCount: number): Promise<void> {
    // Stub implementation
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
    // Stub implementation
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
    const user = await this.getUser(1);
    if (!user) return [];
    
    return [{
      ...user,
      rank: 1,
      todayPoints: 3,
      songCount: 3,
    }];
  }
}

export const storage = new DatabaseStorage();