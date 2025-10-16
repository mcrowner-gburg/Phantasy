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
  createSongPerformance(performance: InsertSongPerformance): Promise<SongPerformance & { song: Song }>;
  getConcertPerformances(concertId: number): Promise<(SongPerformance & { song: Song })[]>;
  calculateAndUpdatePoints(concertId: number): Promise<void>;

  // Activities
  getUserActivities(userId: number, leagueId?: number): Promise<Activity[]>;
  createActivity(userId: number, leagueId: number, type: string, description: string, points?: number): Promise<Activity>;

  // Leaderboard
  getLeagueStandings(leagueId: number): Promise<(User & { rank: number; todayPoints: number; songCount: number })[]>;
}

export class DatabaseStorage implements IStorage {
  private users = new Map<number, User>();
  private tours = new Map<number, Tour>();
  private leagues = new Map<number, League>();
  private leagueMembers = new Map<number, LeagueMember>();
  private songs = new Map<number, Song>();
  private draftedSongs = new Map<number, DraftedSong & { song: Song }>();
  private concerts = new Map<number, Concert>();
  private songPerformances = new Map<number, SongPerformance & { song: Song }>();
  private activities = new Map<number, Activity>();

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

  private seedData() {
    // Example user
    const user: User = {
      id: this.currentUserId++,
      username: "phan123",
      password: "password123",
      totalPoints: 15,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);

    // Example songs
    const songList: Omit<Song, "id" | "lastPlayed">[] = [
      { title: "Wilson", category: "Gamehendge", rarityScore: 85, totalPlays: 245 },
      { title: "Harry Hood", category: "Classic", rarityScore: 65, totalPlays: 456 },
      { title: "Fluffhead", category: "Epic", rarityScore: 120, totalPlays: 123 },
      { title: "You Enjoy Myself", category: "Classic", rarityScore: 70, totalPlays: 389 },
      { title: "Tweezer", category: "Jam", rarityScore: 60, totalPlays: 512 },
    ];
    songList.forEach(s => {
      const song: Song = {
        id: this.currentSongId++,
        ...s,
        lastPlayed: new Date(),
      };
      this.songs.set(song.id, song);
    });

    // Example league
    const league: League = {
      id: this.currentLeagueId++,
      name: "Winter Tour Fantasy League",
      description: "Draft songs for NYE shows",
      tourId: 1,
      ownerId: user.id,
      maxPlayers: 24,
      draftStatus: "active",
      createdAt: new Date(),
    };
    this.leagues.set(league.id, league);

    // Join user to league
    const member: LeagueMember = {
      id: this.currentLeagueMemberId++,
      leagueId: league.id,
      userId: user.id,
      joinedAt: new Date(),
    };
    this.leagueMembers.set(member.id, member);
  }

  // ------------------ USERS ------------------
  async getUser(id: number) { return this.users.get(id); }

  async getUserByUsername(username: string) {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser) {
    const user: User = { ...insertUser, id: this.currentUserId++, totalPoints: 0, createdAt: new Date() };
    this.users.set(user.id, user);
    return user;
  }

  async updateUserPoints(userId: number, points: number) {
    const user = this.users.get(userId);
    if (user) user.totalPoints += points;
  }

  // ------------------ TOURS ------------------
  async getTours() { return Array.from(this.tours.values()); }
  async getActiveTour() { return Array.from(this.tours.values()).find(t => t.isActive); }
  async getTour(id: number) { return this.tours.get(id); }
  async createTour(insertTour: InsertTour) {
    const tour: Tour = { ...insertTour, id: this.currentTourId++, isActive: true, createdAt: new Date() };
    this.tours.set(tour.id, tour);
    return tour;
  }

  // ------------------ LEAGUES ------------------
  async getLeague(id: number) { return this.leagues.get(id); }

  async createLeague(league: InsertLeague & { ownerId: number }) {
    const newLeague: League = { ...league, id: this.currentLeagueId++, draftStatus: "active", createdAt: new Date() };
    this.leagues.set(newLeague.id, newLeague);
    await this.joinLeague(league.ownerId, newLeague.id);
    return newLeague;
  }

  async getUserLeagues(userId: number) {
    const ids = Array.from(this.leagueMembers.values())
      .filter(m => m.userId === userId)
      .map(m => m.leagueId);
    return Array.from(this.leagues.values()).filter(l => ids.includes(l.id));
  }

  async getTourLeagues(tourId: number) {
    return Array.from(this.leagues.values()).filter(l => l.tourId === tourId);
  }

  async joinLeague(userId: number, leagueId: number) {
    const member: LeagueMember = { id: this.currentLeagueMemberId++, leagueId, userId, joinedAt: new Date() };
    this.leagueMembers.set(member.id, member);
  }

  async getLeagueMembers(leagueId: number) {
    return Array.from(this.leagueMembers.values())
      .filter(m => m.leagueId === leagueId)
      .map(m => ({ ...m, user: this.users.get(m.userId)! }));
  }

  // ------------------ SONGS ------------------
  async getAllSongs() { return Array.from(this.songs.values()); }
  async getSong(id: number) { return this.songs.get(id); }
  async getSongByTitle(title: string) {
    return Array.from(this.songs.values()).find(s => s.title === title);
  }

  async createSong(title: string, category?: string) {
    const song: Song = { id: this.currentSongId++, title, category: category || null, rarityScore: 50, lastPlayed: new Date(), totalPlays: 0 };
    this.songs.set(song.id, song);
    return song;
  }

  async updateSongStats(songId: number, rarityScore: number, lastPlayed: Date) {
    const song = this.songs.get(songId);
    if (song) { song.rarityScore = rarityScore; song.lastPlayed = lastPlayed; song.totalPlays++; }
  }

  // ------------------ DRAFTED SONGS ------------------
  async getDraftedSongs(userId: number, leagueId: number) {
    return Array.from(this.draftedSongs.values())
      .filter(d => d.userId === userId && d.leagueId === leagueId);
  }

  async draftSong(draft: InsertDraftedSong) {
    const song = this.songs.get(draft.songId);
    if (!song) throw new Error("Song not found");
    const drafted: DraftedSong & { song: Song } = { ...draft, id: this.currentDraftedSongId++, points: 0, status: "active", draftedAt: new Date(), song };
    this.draftedSongs.set(drafted.id, drafted);
    return drafted;
  }

  async updateDraftedSongPoints(id: number, points: number) {
    const draft = this.draftedSongs.get(id);
    if (draft) draft.points += points;
  }

  async
