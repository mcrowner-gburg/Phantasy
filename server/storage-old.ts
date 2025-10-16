import { 
  users, tours, leagues, leagueMembers, songs, draftedSongs, concerts, activities, songPerformances,
  type User, type InsertUser, type Tour, type InsertTour, type League, type InsertLeague,
  type Song, type DraftedSong, type InsertDraftedSong,
  type Concert, type InsertConcert, type Activity, type LeagueMember,
  type SongPerformance, type InsertSongPerformance
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<void>;

  // Tours
  getTours(): Promise<Tour[]>;
  getActiveTour(): Promise<Tour | undefined>;
  getTour(id: number): Promise<Tour | undefined>;
  createTour(tour: InsertTour): Promise<Tour>;

  // Leagues
  getLeague(id: number): Promise<League | undefined>;
  createLeague(league: InsertLeague & { ownerId: number }): Promise<League>;
  getUserLeagues(userId: number): Promise<League[]>;
  getTourLeagues(tourId: number): Promise<League[]>;
  joinLeague(userId: number, leagueId: number): Promise<void>;
  getLeagueMembers(leagueId: number): Promise<(LeagueMember & { user: User })[]>;

  // Songs
  getAllSongs(): Promise<Song[]>;
  getSong(id: number): Promise<Song | undefined>;
  getSongByTitle(title: string): Promise<Song | undefined>;
  createSong(title: string, category?: string): Promise<Song>;
  updateSongStats(songId: number, rarityScore: number, lastPlayed: Date): Promise<void>;

  // Drafted Songs
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
  // --- In-memory storage ---
  private users = new Map<number, User>();
  private tours = new Map<number, Tour>();
  private leagues = new Map<number, League>();
  private leagueMembers = new Map<number, LeagueMember>();
  private songs = new Map<number, Song>();
  private draftedSongs = new Map<number, DraftedSong & { song: Song }>();
  private concerts = new Map<number, Concert>();
  private activities = new Map<number, Activity>();
  private songPerformances = new Map<number, SongPerformance & { song: Song }>();

  private currentUserId = 1;
  private currentTourId = 1;
  private currentLeagueId = 1;
  private currentLeagueMemberId = 1;
  private currentSongId = 1;
  private currentDraftedSongId = 1;
  private currentConcertId = 1;
  private currentSongPerformanceId = 1;
  private currentActivityId = 1;

  constructor() {
    this.seedData();
  }

  // --- Seed sample/demo data ---
  private seedData() {
    // Users
    const user: User = {
      id: this.currentUserId++,
      username: "phan123",
      password: "password123",
      totalPoints: 15,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);

    // Tours
    const tour: Tour = {
      id: this.currentTourId++,
      name: "Winter Tour 2024",
      year: 2024,
      season: "winter",
      description: "NYE run and winter shows",
      startDate: new Date("2024-12-28"),
      endDate: new Date("2025-01-15"),
      isActive: true,
      createdAt: new Date(),
    };
    this.tours.set(tour.id, tour);

    // League
    const league: League = {
      id: this.currentLeagueId++,
      name: "Winter Tour Fantasy League",
      description: "Draft songs for the NYE run and winter shows",
      tourId: tour.id,
      ownerId: user.id,
      maxPlayers: 24,
      draftStatus: "active",
      createdAt: new Date(),
    };
    this.leagues.set(league.id, league);

    // LeagueMember
    const member: LeagueMember = {
      id: this.currentLeagueMemberId++,
      leagueId: league.id,
      userId: user.id,
      joinedAt: new Date(),
    };
    this.leagueMembers.set(member.id, member);

    // Songs
    const songData = [
      { title: "Wilson", category: "Gamehendge", rarityScore: 85, totalPlays: 245 },
      { title: "Harry Hood", category: "Classic", rarityScore: 65, totalPlays: 456 },
      { title: "Fluffhead", category: "Epic", rarityScore: 120, totalPlays: 123 },
      { title: "You Enjoy Myself", category: "Classic", rarityScore: 70, totalPlays: 389 },
      { title: "Tweezer", category: "Jam", rarityScore: 60, totalPlays: 512 },
    ];
    songData.forEach(song => {
      const newSong: Song = {
        id: this.currentSongId++,
        title: song.title,
        category: song.category,
        rarityScore: song.rarityScore,
        lastPlayed: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        totalPlays: song.totalPlays,
      };
      this.songs.set(newSong.id, newSong);
    });

    // Drafted songs
    const sampleDrafts = [
      { songId: 1, points: 5, playedCount: 2, openerCount: 1, encoreCount: 0 },
      { songId: 3, points: 3, playedCount: 1, openerCount: 0, encoreCount: 1 },
      { songId: 5, points: 7, playedCount: 3, openerCount: 1, encoreCount: 1 },
    ];
    sampleDrafts.forEach(draft => {
      const song = this.songs.get(draft.songId)!;
      const draftedSong: DraftedSong & { song: Song } = {
        id: this.currentDraftedSongId++,
        userId: user.id,
        leagueId: league.id,
        songId: draft.songId,
        points: draft.points,
        playedCount: draft.playedCount,
        openerCount: draft.openerCount,
        encoreCount: draft.encoreCount,
        status: "active",
        draftedAt: new Date(),
        song,
      };
      this.draftedSongs.set(draftedSong.id, draftedSong);
    });

    // Concerts
    const concertDates = ["2024-12-28", "2024-12-29", "2024-12-31"];
    concertDates.forEach(dateStr => {
      const newConcert: Concert = {
        id: this.currentConcertId++,
        tourId: tour.id,
        date: new Date(`${dateStr}T20:00:00`),
        venue: "Madison Square Garden",
        city: "New York",
        state: "NY",
        country: "USA",
        setlist: null,
        isCompleted: false,
      };
      this.concerts.set(newConcert.id, newConcert);
    });

    // Sample activities
    const activities = [
      { type: "draft", description: 'You drafted "Wilson"', points: 0 },
      { type: "score", description: '"Wilson" was played as a set opener (+2 points)', points: 2 },
      { type: "score", description: '"Fluffhead" was played as an encore (+2 points)', points: 2 },
      { type: "score", description: '"Tweezer" was played (+1 point)', points: 1 },
    ];
    activities.forEach(act => {
      const activity: Activity = {
        id: this.currentActivityId++,
        userId: user.id,
        leagueId: league.id,
        type: act.type,
        description: act.description,
        points: act.points,
        createdAt: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000),
      };
      this.activities.set(activity.id, activity);
    });
  }

  // --- User operations ---
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.currentUserId++,
      totalPoints: 0,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserPoints(userId: number, points: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.totalPoints = (user.totalPoints || 0) + points;
      this.users.set(userId, user);
    }
  }

  // --- Tours ---
  async getTours(): Promise<Tour[]> {
    return Array.from(this.tours.values());
  }

  async getActiveTour(): Promise<Tour | undefined> {
    return Array.from(this.tours.values()).find(t => t.isActive);
  }

  async getTour(id: number): Promise<Tour | undefined> {
    return this.tours.get(id);
  }

  async createTour(insertTour: InsertTour): Promise<Tour> {
    const tour: Tour = {
      ...insertTour,
      id: this.currentTourId++,
      isActive: true,
      createdAt: new Date(),
    };
    this.tours.set(tour.id, tour);
    return tour;
  }

  // --- Leagues ---
  async getLeague(id: number): Promise<League | undefined> {
    return this.leagues.get(id);
  }

  async createLeague(league: InsertLeague & { ownerId: number }): Promise<League> {
    const newLeague: League = {
      ...league,
      id: this.currentLeagueId++,
      draftStatus: "active",
      createdAt: new Date(),
    };
    this.leagues.set(newLeague.id, newLeague);
    await this.joinLeague(league.ownerId, newLeague.id);
    return newLeague;
  }

  async getUserLeagues(userId: number): Promise<League[]> {
    const leagueIds = Array.from(this.leagueMembers.values())
      .filter(m => m.userId === userId)
      .map(m => m.leagueId);
    return Array.from(this.leagues.values()).filter(l => leagueIds.includes(l.id));
  }

  async getTourLeagues(tourId: number): Promise<League[]> {
    return Array.from(this.leagues.values()).filter(l => l.tourId === tourId);
  }

  async joinLeague(userId: number, leagueId: number): Promise<void> {
    const member: LeagueMember = {
      id: this.currentLeagueMemberId++,
      userId,
      leagueId,
      joinedAt: new Date(),
    };
    this.leagueMembers.set(member.id, member);
  }

  async getLeagueMembers(leagueId: number): Promise<(LeagueMember & { user: User })[]> {
    return Array.from(this.leagueMembers.values())
      .filter(m => m.leagueId === leagueId)
      .map(m => ({ ...m, user: this.users.get(m.userId)! }));
  }

  // --- Songs ---
  async getAllSongs(): Promise<Song[]> {
    return Array.from(this.songs.values());
  }

  async getSong(id: number): Promise<Song | undefined> {
    return this.songs.get(id);
  }

  async getSongByTitle(title: string): Promise<Song | undefined> {
    return Array.from(this.songs.values()).find(s => s.title === title);
  }

  async createSong(title: string, category?: string): Promise<Song> {
    const song: Song = {
      id: this.currentSongId++,
      title,
      category: category || null,
      rarityScore: 50,
      lastPlayed: null,
      totalPlays: 0,
    };
    this.songs.set(song.id, song);
    return song;
  }

  async updateSongStats(songId: number, rarityScore: number, lastPlayed: Date): Promise<void> {
    const song = this.songs.get(songId);
    if (song) {
      song.rarityScore = rarityScore;
      song.lastPlayed = lastPlayed;
      song.totalPlays = (song.totalPlays || 0) + 1;
      this.songs.set(songId, song);
    }
  }

  // --- Drafted Songs ---
  async getDraftedSongs(userId: number, leagueId: number): Promise
