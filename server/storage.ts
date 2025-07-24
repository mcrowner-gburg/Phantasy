import { 
  users, tours, leagues, leagueMembers, songs, draftedSongs, concerts, activities,
  type User, type InsertUser, type Tour, type InsertTour, type League, type InsertLeague,
  type Song, type DraftedSong, type InsertDraftedSong,
  type Concert, type InsertConcert, type Activity, type LeagueMember
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

  // Concerts
  getConcerts(): Promise<Concert[]>;
  getUpcomingConcerts(): Promise<Concert[]>;
  createConcert(concert: InsertConcert): Promise<Concert>;
  updateConcertSetlist(concertId: number, setlist: string[]): Promise<void>;

  // Activities
  getUserActivities(userId: number, leagueId?: number): Promise<Activity[]>;
  createActivity(userId: number, leagueId: number, type: string, description: string, points?: number): Promise<Activity>;

  // Leaderboard
  getLeagueStandings(leagueId: number): Promise<(User & { rank: number; todayPoints: number; songCount: number })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private tours: Map<number, Tour> = new Map();
  private leagues: Map<number, League> = new Map();
  private leagueMembers: Map<number, LeagueMember> = new Map();
  private songs: Map<number, Song> = new Map();
  private draftedSongs: Map<number, DraftedSong & { song: Song }> = new Map();
  private concerts: Map<number, Concert> = new Map();
  private activities: Map<number, Activity> = new Map();
  
  private currentUserId = 1;
  private currentTourId = 1;
  private currentLeagueId = 1;
  private currentSongId = 1;
  private currentDraftedSongId = 1;
  private currentConcertId = 1;
  private currentActivityId = 1;
  private currentLeagueMemberId = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed tours
    const tourData = [
      { 
        name: "Winter Tour 2024", 
        year: 2024, 
        season: "winter", 
        description: "NYE run and winter shows",
        startDate: new Date("2024-12-28"),
        endDate: new Date("2024-01-15"),
        isActive: true
      },
      { 
        name: "Summer Tour 2024", 
        year: 2024, 
        season: "summer", 
        description: "Summer festival season",
        startDate: new Date("2024-06-15"),
        endDate: new Date("2024-08-30"),
        isActive: false
      },
      { 
        name: "Fall Tour 2023", 
        year: 2023, 
        season: "fall", 
        description: "Fall shows and Halloween",
        startDate: new Date("2023-10-15"),
        endDate: new Date("2023-11-15"),
        isActive: false
      }
    ];

    tourData.forEach(tour => {
      const newTour: Tour = {
        id: this.currentTourId++,
        name: tour.name,
        year: tour.year,
        season: tour.season,
        description: tour.description,
        startDate: tour.startDate,
        endDate: tour.endDate,
        isActive: tour.isActive,
        createdAt: new Date(),
      };
      this.tours.set(newTour.id, newTour);
    });

    // Seed songs
    const songData = [
      { title: "Wilson", category: "Gamehendge", rarityScore: 85, totalPlays: 245 },
      { title: "Harry Hood", category: "Classic", rarityScore: 65, totalPlays: 456 },
      { title: "Fluffhead", category: "Epic", rarityScore: 120, totalPlays: 123 },
      { title: "You Enjoy Myself", category: "Classic", rarityScore: 70, totalPlays: 389 },
      { title: "Tweezer", category: "Jam", rarityScore: 60, totalPlays: 512 },
      { title: "Ghost", category: "Jam", rarityScore: 75, totalPlays: 298 },
      { title: "Divided Sky", category: "Composed", rarityScore: 80, totalPlays: 267 },
      { title: "Julius", category: "Cover", rarityScore: 45, totalPlays: 678 },
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

    // Seed concerts
    const concertData = [
      { date: new Date("2024-12-28T20:00:00"), venue: "Madison Square Garden", city: "New York", state: "NY" },
      { date: new Date("2024-12-29T20:00:00"), venue: "Madison Square Garden", city: "New York", state: "NY" },
      { date: new Date("2024-12-31T20:00:00"), venue: "Madison Square Garden", city: "New York", state: "NY" },
    ];

    concertData.forEach(concert => {
      const newConcert: Concert = {
        id: this.currentConcertId++,
        tourId: 1, // Winter Tour 2024
        date: concert.date,
        venue: concert.venue,
        city: concert.city,
        state: concert.state,
        country: "USA",
        setlist: null,
        isCompleted: false,
      };
      this.concerts.set(newConcert.id, newConcert);
    });

    // Seed a league for the active tour
    const league: League = {
      id: this.currentLeagueId++,
      name: "Winter Tour Fantasy League",
      description: "Draft songs for the NYE run and winter shows",
      tourId: 1, // Winter Tour 2024
      ownerId: 1,
      maxPlayers: 24,
      draftStatus: "active",
      createdAt: new Date(),
    };
    this.leagues.set(league.id, league);
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
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

  // Tours
  async getTours(): Promise<Tour[]> {
    return Array.from(this.tours.values());
  }

  async getActiveTour(): Promise<Tour | undefined> {
    return Array.from(this.tours.values()).find(tour => tour.isActive);
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

  // Leagues
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
    
    // Auto-join creator to league
    await this.joinLeague(league.ownerId, newLeague.id);
    
    return newLeague;
  }

  async getUserLeagues(userId: number): Promise<League[]> {
    const userLeagueIds = Array.from(this.leagueMembers.values())
      .filter(member => member.userId === userId)
      .map(member => member.leagueId);
    
    return Array.from(this.leagues.values())
      .filter(league => userLeagueIds.includes(league.id));
  }

  async getTourLeagues(tourId: number): Promise<League[]> {
    return Array.from(this.leagues.values())
      .filter(league => league.tourId === tourId);
  }

  async joinLeague(userId: number, leagueId: number): Promise<void> {
    const member: LeagueMember = {
      id: this.currentLeagueMemberId++,
      leagueId,
      userId,
      joinedAt: new Date(),
    };
    this.leagueMembers.set(member.id, member);
  }

  async getLeagueMembers(leagueId: number): Promise<(LeagueMember & { user: User })[]> {
    return Array.from(this.leagueMembers.values())
      .filter(member => member.leagueId === leagueId)
      .map(member => ({
        ...member,
        user: this.users.get(member.userId)!,
      }));
  }

  // Songs
  async getAllSongs(): Promise<Song[]> {
    return Array.from(this.songs.values());
  }

  async getSong(id: number): Promise<Song | undefined> {
    return this.songs.get(id);
  }

  async getSongByTitle(title: string): Promise<Song | undefined> {
    return Array.from(this.songs.values()).find(song => song.title === title);
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

  // Drafted Songs
  async getDraftedSongs(userId: number, leagueId: number): Promise<(DraftedSong & { song: Song })[]> {
    return Array.from(this.draftedSongs.values())
      .filter(draft => draft.userId === userId && draft.leagueId === leagueId);
  }

  async draftSong(draft: InsertDraftedSong): Promise<DraftedSong> {
    const song = this.songs.get(draft.songId);
    if (!song) throw new Error("Song not found");

    const draftedSong: DraftedSong = {
      ...draft,
      id: this.currentDraftedSongId++,
      points: 0,
      status: "active",
      draftedAt: new Date(),
    };

    const draftWithSong = { ...draftedSong, song };
    this.draftedSongs.set(draftedSong.id, draftWithSong);
    
    return draftedSong;
  }

  async updateDraftedSongPoints(id: number, points: number): Promise<void> {
    const draft = this.draftedSongs.get(id);
    if (draft) {
      draft.points += points;
      this.draftedSongs.set(id, draft);
    }
  }

  // Concerts
  async getConcerts(): Promise<Concert[]> {
    return Array.from(this.concerts.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async getUpcomingConcerts(): Promise<Concert[]> {
    const now = new Date();
    return Array.from(this.concerts.values())
      .filter(concert => concert.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async createConcert(concert: InsertConcert): Promise<Concert> {
    const newConcert: Concert = {
      ...concert,
      id: this.currentConcertId++,
      isCompleted: false,
    };
    this.concerts.set(newConcert.id, newConcert);
    return newConcert;
  }

  async updateConcertSetlist(concertId: number, setlist: string[]): Promise<void> {
    const concert = this.concerts.get(concertId);
    if (concert) {
      concert.setlist = setlist;
      concert.isCompleted = true;
      this.concerts.set(concertId, concert);
    }
  }

  // Activities
  async getUserActivities(userId: number, leagueId?: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.userId === userId && (!leagueId || activity.leagueId === leagueId))
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createActivity(userId: number, leagueId: number, type: string, description: string, points: number = 0): Promise<Activity> {
    const activity: Activity = {
      id: this.currentActivityId++,
      userId,
      leagueId,
      type,
      description,
      points,
      createdAt: new Date(),
    };
    this.activities.set(activity.id, activity);
    return activity;
  }

  // Leaderboard
  async getLeagueStandings(leagueId: number): Promise<(User & { rank: number; todayPoints: number; songCount: number })[]> {
    const members = await this.getLeagueMembers(leagueId);
    
    const standings = members.map(member => {
      const draftedSongs = Array.from(this.draftedSongs.values())
        .filter(draft => draft.userId === member.userId && draft.leagueId === leagueId);
      
      const todayActivities = Array.from(this.activities.values())
        .filter(activity => 
          activity.userId === member.userId && 
          activity.leagueId === leagueId &&
          activity.createdAt! > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );
      
      const todayPoints = todayActivities.reduce((sum, activity) => sum + (activity.points || 0), 0);
      
      return {
        ...member.user,
        rank: 0, // Will be set after sorting
        todayPoints,
        songCount: draftedSongs.length,
      };
    });

    // Sort by total points and assign ranks
    standings.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
    standings.forEach((standing, index) => {
      standing.rank = index + 1;
    });

    return standings;
  }
}

export const storage = new MemStorage();
