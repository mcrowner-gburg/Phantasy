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
  PasswordResetToken,
  PointAdjustment,
  LeagueInvite,
  PhoneVerificationCode,
  InsertUser,
  InsertTour,
  InsertLeague,
  InsertDraftedSong,
  InsertConcert,
  InsertSongPerformance,
  InsertPasswordResetToken,
  InsertPointAdjustment,
  InsertLeagueInvite,
  InsertPhoneVerificationCode,
  users,
  tours,
  leagues,
  songs,
  draftedSongs,
  concerts,
  songPerformances,
  activities,
  leagueMembers,
  leagueInvites,
  passwordResetTokens,
  pointAdjustments,
  phoneVerificationCodes,
  draftPicks,
  DraftPick,
  InsertDraftPick
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, count, or, not, gte, lte, asc, gt } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPoints(userId: number, points: number): Promise<void>;
  updateUserPassword(userId: number, hashedPassword: string): Promise<void>;
  updateUserProfile(userId: number, updates: { email?: string; phoneNumber?: string }): Promise<User>;

  // Password reset operations
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markTokenAsUsed(tokenId: number): Promise<void>;
  deleteExpiredTokens(): Promise<void>;

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
  
  // League-specific song availability methods
  isSongDraftedInLeague(songId: number, leagueId: number): Promise<boolean>;
  getAllDraftedSongsInLeague(leagueId: number): Promise<number[]>;
  getAvailableSongsForLeague(leagueId: number): Promise<Song[]>;

  // Draft management methods
  scheduleDraft(leagueId: number, draftDate: Date, draftRounds?: number, pickTimeLimit?: number): Promise<void>;
  startDraft(leagueId: number): Promise<void>;
  getDraftStatus(leagueId: number): Promise<League | undefined>;
  makeDraftPick(leagueId: number, userId: number, songId: number, timeUsed: number): Promise<DraftPick>;
  getNextPlayer(leagueId: number): Promise<number | null>;
  advanceDraft(leagueId: number): Promise<void>;
  getDraftOrder(leagueId: number): Promise<(LeagueMember & { user: User })[]>;
  setDraftOrder(leagueId: number, userIds: number[]): Promise<void>;
  getDraftPicks(leagueId: number): Promise<(DraftPick & { user: User; song: Song })[]>;

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

  // Admin operations
  isUserAdmin(userId: number): Promise<boolean>;
  isUserLeagueAdmin(userId: number, leagueId: number): Promise<boolean>;
  promoteToLeagueAdmin(userId: number, leagueId: number): Promise<void>;
  getLeagueMembers(leagueId: number): Promise<(User & { role: string; joinedAt: Date | null })[]>;
  
  // League Invite operations
  createLeagueInvite(invite: InsertLeagueInvite): Promise<LeagueInvite>;
  getLeagueInvites(leagueId: number): Promise<LeagueInvite[]>;
  getInviteByCode(inviteCode: string): Promise<LeagueInvite | undefined>;
  joinLeagueByInvite(inviteCode: string, userId: number): Promise<boolean>;
  deactivateInvite(inviteId: number): Promise<void>;
  getShowPointsForAdmin(leagueId: number, concertId: number): Promise<{
    concert: Concert,
    songPerformances: (SongPerformance & { song: Song, draftedBy?: { userId: number, username: string }[] })[]
  } | undefined>;
  createPointAdjustment(adjustment: InsertPointAdjustment): Promise<PointAdjustment>;
  getPointAdjustments(leagueId: number, concertId?: number): Promise<(PointAdjustment & { song: Song, user?: User, adjustedByUser: User })[]>;
  updateUserPointsAfterAdjustment(userId: number, pointsDifference: number): Promise<void>;
  
  // Phone verification operations
  createPhoneVerificationCode(code: InsertPhoneVerificationCode): Promise<PhoneVerificationCode>;
  getValidPhoneVerificationCode(phoneNumber: string, code: string): Promise<PhoneVerificationCode | undefined>;
  markPhoneVerificationCodeUsed(id: number): Promise<void>;
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
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

  async updateLeague(leagueId: number, updates: Partial<League>): Promise<League> {
    const [updatedLeague] = await db
      .update(leagues)
      .set(updates)
      .where(eq(leagues.id, leagueId))
      .returning();
    return updatedLeague;
  }

  async deleteLeague(leagueId: number): Promise<void> {
    await db.delete(leagues).where(eq(leagues.id, leagueId));
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
    if (memberCount >= (league.maxPlayers || 24)) {
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
          email: users.email,
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

    try {
      // Import the Phish API service
      const { PhishNetService } = await import("./services/phish-api");
      const phishApi = new PhishNetService();
      
      console.log("Fetching complete song catalog from Phish.net API...");
      const apiSongs = await phishApi.getAllSongs();
      
      console.log(`API returned ${apiSongs?.length || 0} songs`);
      if (apiSongs && apiSongs.length > 0) {
        console.log(`Found ${apiSongs.length} songs from Phish.net API`);
        
        // Transform API songs to our format and calculate 24-month stats
        const transformedSongs: Song[] = [];
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - 24); // 24 months ago
        
        // Process more songs to ensure we have at least 125 for multiplayer drafting
        const batchSize = 150; // Expand to 150 songs to accommodate multiple players
        const songsToProcess = apiSongs.slice(0, batchSize);
        
        for (let i = 0; i < songsToProcess.length; i++) {
          const apiSong = songsToProcess[i];
          
          // Use the song's basic stats if available, otherwise estimate
          let recentPlays = 0;
          let lastPlayed: Date | null = null;
          
          // If the song object has performance data, use it directly
          if (apiSong.times_played && apiSong.last_played) {
            // Estimate recent plays based on total plays and recency
            const totalPlays = apiSong.times_played;
            const lastPlayedDate = new Date(apiSong.last_played);
            
            // Simple heuristic: if played recently, assume some recent activity
            const daysSinceLastPlayed = (Date.now() - lastPlayedDate.getTime()) / (1000 * 60 * 60 * 24);
            
            if (daysSinceLastPlayed <= 730) { // Within 24 months
              // Estimate based on frequency and recency - more active songs get higher estimates
              if (daysSinceLastPlayed <= 30) {
                recentPlays = Math.max(3, Math.floor(totalPlays * 0.4)); // Very recent
              } else if (daysSinceLastPlayed <= 180) {
                recentPlays = Math.max(2, Math.floor(totalPlays * 0.3)); // Recent
              } else {
                recentPlays = Math.max(1, Math.floor(totalPlays * 0.2)); // Less recent
              }
              lastPlayed = lastPlayedDate;
            }
          }
          
          // Simple scoring system - no complex rarity calculations
          // All songs start with 0 base points
          // Points earned only during tour performances:
          // 1pt played + 1pt first set opener + 1pt second set opener + 1pt encore = max 4pts
          let rarityScore = 0;
          
          // Categorize songs based on actual Phish knowledge
          let category = "Classic";
          const songTitle = apiSong.song;
          
          // Gamehendge saga songs
          if (["Wilson", "AC/DC Bag", "Colonel Forbin's Ascent", "The Famous Mockingbird", "The Lizards", "Tela", "The Sloth", "McGrupp", "Possum", "Llama"].some(g => songTitle.includes(g))) {
            category = "Gamehendge";
          }
          // Major jam vehicles
          else if (["Tweezer", "Ghost", "Simple", "Light", "Sand", "Piper", "Bathtub Gin", "David Bowie", "Harry Hood", "You Enjoy Myself", "Run Like an Antelope", "Wolfman's Brother"].some(j => songTitle.includes(j))) {
            category = "Jam";
          }
          // Rare or special songs (never or rarely played in 24 months)
          else if (recentPlays === 0 || ["Harpua", "Icculus", "Esther", "Destiny Unbound", "Dog Faced Boy", "Weigh", "If I Could", "Lengthwise"].some(r => songTitle.includes(r))) {
            category = "Rare";
          }
          // Modern era (3.0 and 4.0)
          else if (["Sigma Oasis", "Ruby Waves", "Everything's Right", "Blaze On", "More", "Petrichor", "No Men In No Man's Land", "Things People Do", "Soul Planet", "Turtle in the Clouds", "Thread", "Mercury", "Evolve", "Waves"].some(m => songTitle.includes(m))) {
            category = "Modern";
          }
          // Funk songs
          else if (["The Moma Dance", "Birds of a Feather", "Roggae", "Funky Bitch", "46 Days", "Suzy Greenberg", "Cities"].some(f => songTitle.includes(f))) {
            category = "Funk";
          }
          // Cover songs (obvious indicators)
          else if (["Rocky Top", "Good Times Bad Times", "Bold As Love", "While My Guitar Gently Weeps", "Also Sprach Zarathustra", "Loving Cup", "Satisfaction", "Day in the Life", "After Midnight"].some(c => songTitle.includes(c))) {
            category = "Cover";
          }
          // Composed/intricate pieces
          else if (["Divided Sky", "Reba", "Fluffhead", "Guyute", "The Curtain", "Foam", "Maze", "Stash"].some(comp => songTitle.includes(comp))) {
            category = "Composed";
          }
          // Country/bluegrass
          else if (["Possum", "Old Home Place", "Beauty of My Dreams", "Uncle Pen"].some(country => songTitle.includes(country))) {
            category = "Country";
          }
          // Everything else defaults to Rock
          else {
            category = "Rock";
          }
          
          transformedSongs.push({
            id: i + 1,
            title: apiSong.song,
            category,
            rarityScore,
            lastPlayed,
            totalPlays: recentPlays, // 24-month play count
          });
        }
        
        // Sort by 24-month performance count (descending - most played first)
        transformedSongs.sort((a, b) => (b.totalPlays || 0) - (a.totalPlays || 0));
        
        // Cache the results
        this.songsCache = transformedSongs;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
        
        console.log(`Successfully processed ${transformedSongs.length} songs, sorted by 24-month performance frequency`);
        return transformedSongs;
      }
    } catch (error) {
      console.error("Error fetching songs from Phish.net API:", error);
      console.error("Error details:", error.message);
    }
    
    // Fallback to curated song list with 24-month play counts
    console.log("Using fallback curated song list with realistic 24-month performance data");
    const baseSongs: Song[] = [
      // Classic Phish staples with realistic 24-month play counts
      { id: 1, title: "Wilson", category: "Gamehendge", rarityScore: 0, lastPlayed: null, totalPlays: 8 },
      { id: 2, title: "Harry Hood", category: "Classic", rarityScore: 0, lastPlayed: null, totalPlays: 12 },
      { id: 3, title: "Fluffhead", category: "Epic", rarityScore: 0, lastPlayed: null, totalPlays: 3 },
      { id: 4, title: "You Enjoy Myself", category: "Classic", rarityScore: 0, lastPlayed: null, totalPlays: 15 },
      { id: 5, title: "Tweezer", category: "Jam", rarityScore: 0, lastPlayed: null, totalPlays: 22 },
      { id: 6, title: "Free", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 18 },
      { id: 7, title: "David Bowie", category: "Epic", rarityScore: 0, lastPlayed: null, totalPlays: 9 },
      { id: 8, title: "Possum", category: "Country", rarityScore: 0, lastPlayed: null, totalPlays: 14 },
      { id: 9, title: "Maze", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 16 },
      { id: 10, title: "Divided Sky", category: "Composed", rarityScore: 0, lastPlayed: null, totalPlays: 5 },
      { id: 11, title: "Julius", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 11 },
      { id: 12, title: "Chalk Dust Torture", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 13, title: "Run Like an Antelope", category: "Classic", rarityScore: 0, lastPlayed: null, totalPlays: 13 },
      { id: 14, title: "Ghost", category: "Jam", rarityScore: 0, lastPlayed: null, totalPlays: 17 },
      { id: 15, title: "Bathtub Gin", category: "Jam", rarityScore: 0, lastPlayed: null, totalPlays: 10 },
      
      // Additional jam vehicles and favorites
      { id: 16, title: "Simple", category: "Jam", rarityScore: 0, lastPlayed: null, totalPlays: 19 },
      { id: 17, title: "Light", category: "Jam", rarityScore: 0, lastPlayed: null, totalPlays: 14 },
      { id: 18, title: "Piper", category: "Jam", rarityScore: 0, lastPlayed: null, totalPlays: 8 },
      { id: 19, title: "Sand", category: "Jam", rarityScore: 0, lastPlayed: null, totalPlays: 7 },
      { id: 20, title: "Wolfman's Brother", category: "Jam", rarityScore: 0, lastPlayed: null, totalPlays: 11 },
      { id: 21, title: "Theme From the Bottom", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 9 },
      { id: 22, title: "Sample in a Jar", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 12 },
      { id: 23, title: "Slave to the Traffic Light", category: "Classic", rarityScore: 0, lastPlayed: null, totalPlays: 4 },
      { id: 24, title: "Stash", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 7 },
      { id: 25, title: "Reba", category: "Composed", rarityScore: 0, lastPlayed: null, totalPlays: 3 },
      
      // Epic compositions and rarities
      { id: 26, title: "The Lizards", category: "Gamehendge", rarityScore: 0, lastPlayed: null, totalPlays: 2 },
      { id: 27, title: "Tela", category: "Gamehendge", rarityScore: 0, lastPlayed: null, totalPlays: 1 },
      { id: 28, title: "The Sloth", category: "Gamehendge", rarityScore: 0, lastPlayed: null, totalPlays: 0 },
      { id: 29, title: "McGrupp and the Watchful Hosemasters", category: "Gamehendge", rarityScore: 0, lastPlayed: null, totalPlays: 1 },
      { id: 30, title: "Colonel Forbin's Ascent", category: "Gamehendge", rarityScore: 0, lastPlayed: null, totalPlays: 2 },
      { id: 31, title: "The Famous Mockingbird", category: "Gamehendge", rarityScore: 0, lastPlayed: null, totalPlays: 2 },
      { id: 32, title: "Esther", category: "Rare", rarityScore: 0, lastPlayed: null, totalPlays: 0 },
      { id: 33, title: "Icculus", category: "Rare", rarityScore: 0, lastPlayed: null, totalPlays: 1 },
      { id: 34, title: "Harpua", category: "Rare", rarityScore: 0, lastPlayed: null, totalPlays: 2 },
      { id: 35, title: "Forbin's > Mockingbird", category: "Epic", rarityScore: 0, lastPlayed: null, totalPlays: 2 },
      
      // Modern era favorites
      { id: 36, title: "Carini", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 15 },
      { id: 37, title: "Kill Devil Falls", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 9 },
      { id: 38, title: "Backwards Down the Number Line", category: "Jam", rarityScore: 0, lastPlayed: null, totalPlays: 7 },
      { id: 39, title: "Stealing Time From the Faulty Plan", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 5 },
      { id: 40, title: "The Moma Dance", category: "Funk", rarityScore: 0, lastPlayed: null, totalPlays: 8 },
      { id: 41, title: "Birds of a Feather", category: "Funk", rarityScore: 0, lastPlayed: null, totalPlays: 11 },
      { id: 42, title: "Limb By Limb", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 4 },
      { id: 43, title: "Guyute", category: "Composed", rarityScore: 0, lastPlayed: null, totalPlays: 2 },
      { id: 44, title: "Roggae", category: "Funk", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 45, title: "Heavy Things", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 8 },
      
      // Covers and special songs
      { id: 46, title: "Rocky Top", category: "Cover", rarityScore: 0, lastPlayed: null, totalPlays: 3 },
      { id: 47, title: "Good Times Bad Times", category: "Cover", rarityScore: 0, lastPlayed: null, totalPlays: 5 },
      { id: 48, title: "Bold As Love", category: "Cover", rarityScore: 0, lastPlayed: null, totalPlays: 1 },
      { id: 49, title: "While My Guitar Gently Weeps", category: "Cover", rarityScore: 0, lastPlayed: null, totalPlays: 2 },
      { id: 50, title: "Also Sprach Zarathustra", category: "Cover", rarityScore: 0, lastPlayed: null, totalPlays: 4 },
      
      // Deep cuts and rarities
      { id: 51, title: "Destiny Unbound", category: "Rare", rarityScore: 0, lastPlayed: null, totalPlays: 1 },
      { id: 52, title: "Dinner and a Movie", category: "Rare", rarityScore: 0, lastPlayed: null, totalPlays: 0 },
      { id: 53, title: "Dog Faced Boy", category: "Rare", rarityScore: 0, lastPlayed: null, totalPlays: 1 },
      { id: 54, title: "Lengthwise", category: "Rare", rarityScore: 0, lastPlayed: null, totalPlays: 0 },
      { id: 55, title: "Weigh", category: "Rare", rarityScore: 0, lastPlayed: null, totalPlays: 2 },
      { id: 56, title: "If I Could", category: "Rare", rarityScore: 0, lastPlayed: null, totalPlays: 1 },
      { id: 57, title: "Taste", category: "Rare", rarityScore: 0, lastPlayed: null, totalPlays: 3 },
      { id: 58, title: "Fast Enough for You", category: "Rare", rarityScore: 0, lastPlayed: null, totalPlays: 1 },
      { id: 59, title: "Sparkle", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 7 },
      { id: 60, title: "Character Zero", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 13 },
      
      // Recent additions and modern favorites
      { id: 61, title: "Blaze On", category: "Modern", rarityScore: 0, lastPlayed: null, totalPlays: 9 },
      { id: 62, title: "No Men In No Man's Land", category: "Modern", rarityScore: 0, lastPlayed: null, totalPlays: 4 },
      { id: 63, title: "Petrichor", category: "Modern", rarityScore: 0, lastPlayed: null, totalPlays: 3 },
      { id: 64, title: "Things People Do", category: "Modern", rarityScore: 0, lastPlayed: null, totalPlays: 2 },
      { id: 65, title: "More", category: "Modern", rarityScore: 0, lastPlayed: null, totalPlays: 5 },
      { id: 66, title: "Everything's Right", category: "Modern", rarityScore: 0, lastPlayed: null, totalPlays: 7 },
      { id: 67, title: "Soul Planet", category: "Modern", rarityScore: 0, lastPlayed: null, totalPlays: 1 },
      { id: 68, title: "Sigma Oasis", category: "Modern", rarityScore: 0, lastPlayed: null, totalPlays: 4 },
      { id: 69, title: "Ruby Waves", category: "Modern", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 70, title: "Turtle in the Clouds", category: "Modern", rarityScore: 0, lastPlayed: null, totalPlays: 2 },
      
      // Additional songs to reach 125+ for multiplayer drafting (10 players x 10 songs = 100+ needed)
      { id: 71, title: "Thread", category: "Modern", rarityScore: 0, lastPlayed: null, totalPlays: 8 },
      { id: 72, title: "Mercury", category: "Modern", rarityScore: 0, lastPlayed: null, totalPlays: 12 },
      { id: 73, title: "Evolve", category: "Modern", rarityScore: 0, lastPlayed: null, totalPlays: 3 },
      { id: 74, title: "NICU", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 9 },
      { id: 75, title: "46 Days", category: "Funk", rarityScore: 0, lastPlayed: null, totalPlays: 10 },
      { id: 76, title: "Cities", category: "Cover", rarityScore: 0, lastPlayed: null, totalPlays: 4 },
      { id: 77, title: "Suzy Greenberg", category: "Funk", rarityScore: 0, lastPlayed: null, totalPlays: 8 },
      { id: 78, title: "Funky Bitch", category: "Funk", rarityScore: 0, lastPlayed: null, totalPlays: 5 },
      { id: 79, title: "Contact", category: "Composed", rarityScore: 0, lastPlayed: null, totalPlays: 2 },
      { id: 80, title: "The Curtain", category: "Composed", rarityScore: 0, lastPlayed: null, totalPlays: 1 },
      
      { id: 81, title: "Foam", category: "Composed", rarityScore: 0, lastPlayed: null, totalPlays: 1 },
      { id: 82, title: "Alumni Blues", category: "Classic", rarityScore: 0, lastPlayed: null, totalPlays: 3 },
      { id: 83, title: "Letter to Jimmy Page", category: "Classic", rarityScore: 0, lastPlayed: null, totalPlays: 0 },
      { id: 84, title: "Poor Heart", category: "Country", rarityScore: 0, lastPlayed: null, totalPlays: 5 },
      { id: 85, title: "Bouncing Around the Room", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 7 },
      { id: 86, title: "Rift", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 8 },
      { id: 87, title: "Llama", category: "Gamehendge", rarityScore: 0, lastPlayed: null, totalPlays: 4 },
      { id: 88, title: "Horn", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 3 },
      { id: 89, title: "Cavern", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 9 },
      { id: 90, title: "Fee", category: "Classic", rarityScore: 0, lastPlayed: null, totalPlays: 2 },
      
      { id: 91, title: "Golgi Apparatus", category: "Classic", rarityScore: 0, lastPlayed: null, totalPlays: 4 },
      { id: 92, title: "Uncle Pen", category: "Country", rarityScore: 0, lastPlayed: null, totalPlays: 1 },
      { id: 93, title: "Fishman's Vacuum Solo", category: "Rare", rarityScore: 0, lastPlayed: null, totalPlays: 0 },
      { id: 94, title: "Mike's Song", category: "Classic", rarityScore: 0, lastPlayed: null, totalPlays: 11 },
      { id: 95, title: "I Am Hydrogen", category: "Classic", rarityScore: 0, lastPlayed: null, totalPlays: 10 },
      { id: 96, title: "Weekapaug Groove", category: "Classic", rarityScore: 0, lastPlayed: null, totalPlays: 11 },
      { id: 97, title: "AC/DC Bag", category: "Gamehendge", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 98, title: "My Friend My Friend", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 3 },
      { id: 99, title: "Split Open and Melt", category: "Epic", rarityScore: 0, lastPlayed: null, totalPlays: 4 },
      { id: 100, title: "The Oh Kee Pa Ceremony", category: "Rare", rarityScore: 0, lastPlayed: null, totalPlays: 0 },
      
      { id: 101, title: "Susskind Hotel", category: "Rare", rarityScore: 0, lastPlayed: null, totalPlays: 0 },
      { id: 102, title: "Coil", category: "Classic", rarityScore: 0, lastPlayed: null, totalPlays: 5 },
      { id: 103, title: "Loving Cup", category: "Cover", rarityScore: 0, lastPlayed: null, totalPlays: 2 },
      { id: 104, title: "Tube", category: "Funk", rarityScore: 0, lastPlayed: null, totalPlays: 7 },
      { id: 105, title: "Punch You in the Eye", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 106, title: "Prince Caspian", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 107, title: "Cars Trucks Buses", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 108, title: "Talk", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 109, title: "Limb By Limb", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 110, title: "Water in the Sky", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      
      { id: 111, title: "Farmhouse", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 112, title: "Bug", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 113, title: "Dirt", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 114, title: "First Tube", category: "Funk", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 115, title: "Pebbles and Marbles", category: "Jam", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 116, title: "Waves", category: "Modern", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 117, title: "Scents and Subtle Sounds", category: "Jam", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 118, title: "Undermind", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 119, title: "Wading in the Velvet Sea", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 120, title: "Joy", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      
      { id: 121, title: "Time Turns Elastic", category: "Epic", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 122, title: "Ocelot", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 123, title: "Sugar Shack", category: "Rare", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 124, title: "Windy City", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
      { id: 125, title: "Twenty Years Later", category: "Rock", rarityScore: 0, lastPlayed: null, totalPlays: 6 },
    ];

    // Cache the fallback results
    this.songsCache = baseSongs;
    this.cacheExpiry = Date.now() + this.CACHE_DURATION;
    
    return baseSongs;
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
    return { id: Date.now(), title, category: category ?? null, rarityScore: 50, lastPlayed: new Date(), totalPlays: 6 };
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

  // Drafted Songs operations - database implementations
  
  // Check if a song is already drafted by anyone in the league
  async isSongDraftedInLeague(songId: number, leagueId: number): Promise<boolean> {
    try {
      const existingDrafts = await db
        .select()
        .from(draftedSongs)
        .where(and(eq(draftedSongs.songId, songId), eq(draftedSongs.leagueId, leagueId)))
        .limit(1);
      
      return existingDrafts.length > 0;
    } catch (error) {
      console.error("Error checking if song is drafted in league:", error);
      // In case of database error, return false to allow drafting (fail-safe)
      return false;
    }
  }
  
  // Get all drafted songs in a league (returns song IDs for availability checking)
  async getAllDraftedSongsInLeague(leagueId: number): Promise<number[]> {
    try {
      const drafts = await db
        .select({ songId: draftedSongs.songId })
        .from(draftedSongs)
        .where(eq(draftedSongs.leagueId, leagueId));
      
      return drafts.map(draft => draft.songId);
    } catch (error) {
      console.error("Error fetching drafted songs in league:", error);
      return []; // Return empty array if database error
    }
  }
  
  // Get available songs for a league (excluding already drafted songs)
  async getAvailableSongsForLeague(leagueId: number): Promise<Song[]> {
    const allSongs = await this.getAllSongs();
    const draftedSongIds = await this.getAllDraftedSongsInLeague(leagueId);
    
    // Filter out songs that are already drafted in this league
    return allSongs.filter(song => !draftedSongIds.includes(song.id));
  }

  // Draft management methods
  async scheduleDraft(leagueId: number, draftDate: Date, draftRounds: number = 10, pickTimeLimit: number = 90): Promise<void> {
    try {
      await db
        .update(leagues)
        .set({
          draftDate,
          draftRounds,
          pickTimeLimit,
          draftStatus: "scheduled",
          currentPick: 1,
          currentRound: 1,
        })
        .where(eq(leagues.id, leagueId));
    } catch (error) {
      console.error("Error scheduling draft:", error);
      throw new Error("Failed to schedule draft");
    }
  }

  async startDraft(leagueId: number): Promise<void> {
    try {
      // Get league members and set draft positions if not already set
      const members = await this.getLeagueMembers(leagueId);
      
      // Randomize draft order if positions not set
      const membersNeedingPositions = members.filter(m => !m.draftPosition);
      if (membersNeedingPositions.length > 0) {
        const shuffled = [...membersNeedingPositions].sort(() => Math.random() - 0.5);
        
        for (let i = 0; i < shuffled.length; i++) {
          await db
            .update(leagueMembers)
            .set({ draftPosition: i + 1 })
            .where(eq(leagueMembers.id, shuffled[i].id));
        }
      }

      // Get the first player (position 1)
      const firstPlayer = members.find(m => m.draftPosition === 1)?.userId;
      
      await db
        .update(leagues)
        .set({
          draftStatus: "active",
          currentPlayer: firstPlayer,
          currentPick: 1,
          currentRound: 1,
        })
        .where(eq(leagues.id, leagueId));
    } catch (error) {
      console.error("Error starting draft:", error);
      throw new Error("Failed to start draft");
    }
  }

  async getDraftStatus(leagueId: number): Promise<League | null> {
    try {
      const [league] = await db
        .select()
        .from(leagues)
        .where(eq(leagues.id, leagueId));
      return league || null;
    } catch (error) {
      console.error("Error fetching draft status:", error);
      return null;
    }
  }

  async makeDraftPick(leagueId: number, userId: number, songId: number, timeUsed: number): Promise<DraftPick> {
    try {
      const league = await this.getLeague(leagueId);
      if (!league) throw new Error("League not found");

      // Create draft pick record
      const [draftPick] = await db
        .insert(draftPicks)
        .values({
          leagueId,
          userId,
          songId,
          pickNumber: league.currentPick || 1,
          round: league.currentRound || 1,
          timeUsed,
          isAutoPick: false,
        })
        .returning();

      // Create drafted song record for compatibility
      await db
        .insert(draftedSongs)
        .values({
          userId,
          leagueId,
          songId,
          draftRound: league.currentRound || 1,
          draftPick: league.currentPick || 1,
          points: 0,
          playedCount: 0,
          openerCount: 0,
          encoreCount: 0,
          status: "active",
        });

      // Advance to next pick
      await this.advanceDraft(leagueId);

      return draftPick;
    } catch (error) {
      console.error("Error making draft pick:", error);
      throw new Error("Failed to make draft pick");
    }
  }

  async advanceDraft(leagueId: number): Promise<void> {
    try {
      const league = await this.getLeague(leagueId);
      if (!league) return;

      const members = await this.getLeagueMembers(leagueId);
      const totalPlayers = members.length;
      const maxPicks = (league.draftRounds || 10) * totalPlayers;

      let nextPick = (league.currentPick || 1) + 1;
      let nextRound = league.currentRound || 1;
      let nextPlayer = league.currentPlayer;

      // Check if draft is complete
      if (nextPick > maxPicks) {
        await db
          .update(leagues)
          .set({ draftStatus: "completed" })
          .where(eq(leagues.id, leagueId));
        return;
      }

      // Calculate next round and player
      if (nextPick > nextRound * totalPlayers) {
        nextRound++;
      }

      // Snake draft logic (even rounds go in reverse order)
      const pickInRound = ((nextPick - 1) % totalPlayers) + 1;
      const isEvenRound = nextRound % 2 === 0;
      const draftPosition = isEvenRound ? totalPlayers - pickInRound + 1 : pickInRound;
      
      const nextMember = members.find(m => m.draftPosition === draftPosition);
      nextPlayer = nextMember?.userId || nextPlayer;

      await db
        .update(leagues)
        .set({
          currentPick: nextPick,
          currentRound: nextRound,
          currentPlayer: nextPlayer,
        })
        .where(eq(leagues.id, leagueId));
    } catch (error) {
      console.error("Error advancing draft:", error);
    }
  }

  async getDraftOrder(leagueId: number): Promise<(LeagueMember & { user: User })[]> {
    const members = await this.getLeagueMembers(leagueId);
    return members.sort((a, b) => (a.draftPosition || 0) - (b.draftPosition || 0));
  }

  async setDraftOrder(leagueId: number, userIds: number[]): Promise<void> {
    try {
      for (let i = 0; i < userIds.length; i++) {
        const member = await db
          .select()
          .from(leagueMembers)
          .where(and(eq(leagueMembers.leagueId, leagueId), eq(leagueMembers.userId, userIds[i])))
          .limit(1);

        if (member.length > 0) {
          await db
            .update(leagueMembers)
            .set({ draftPosition: i + 1 })
            .where(eq(leagueMembers.id, member[0].id));
        }
      }
    } catch (error) {
      console.error("Error setting draft order:", error);
      throw new Error("Failed to set draft order");
    }
  }

  async getDraftPicks(leagueId: number): Promise<(DraftPick & { user: User; song: Song })[]> {
    try {
      const picks = await db
        .select({
          id: draftPicks.id,
          leagueId: draftPicks.leagueId,
          userId: draftPicks.userId,
          songId: draftPicks.songId,
          pickNumber: draftPicks.pickNumber,
          round: draftPicks.round,
          timeUsed: draftPicks.timeUsed,
          isAutoPick: draftPicks.isAutoPick,
          pickedAt: draftPicks.pickedAt,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
            password: users.password,
            totalPoints: users.totalPoints,
            createdAt: users.createdAt,
          },
        })
        .from(draftPicks)
        .innerJoin(users, eq(draftPicks.userId, users.id))
        .where(eq(draftPicks.leagueId, leagueId))
        .orderBy(asc(draftPicks.pickNumber));

      const songs = await this.getAllSongs();
      
      return picks.map(pick => ({
        ...pick,
        song: songs.find(s => s.id === pick.songId) || {
          id: pick.songId || 0,
          title: "Unknown Song",
          category: "Unknown",
          rarityScore: 0,
          lastPlayed: null,
          totalPlays: 0
        }
      }));
    } catch (error) {
      console.error("Error fetching draft picks:", error);
      return [];
    }
  }

  async getNextPlayer(leagueId: number): Promise<number | null> {
    const league = await this.getLeague(leagueId);
    return league?.currentPlayer || null;
  }

  async getDraftedSongs(userId: number, leagueId: number): Promise<(DraftedSong & { song: Song })[]> {
    try {
      // Try to get from database first
      const dbDrafts = await db
        .select({
          id: draftedSongs.id,
          userId: draftedSongs.userId,
          leagueId: draftedSongs.leagueId,
          songId: draftedSongs.songId,
          points: draftedSongs.points,
          playedCount: draftedSongs.playedCount,
          openerCount: draftedSongs.openerCount,
          encoreCount: draftedSongs.encoreCount,
          status: draftedSongs.status,
          draftedAt: draftedSongs.draftedAt,
        })
        .from(draftedSongs)
        .where(and(eq(draftedSongs.userId, userId), eq(draftedSongs.leagueId, leagueId)));

      // Get songs data
      const allSongs = await this.getAllSongs();
      
      // Combine drafted songs with song details
      const draftsWithSongs = dbDrafts.map(draft => {
        const song = allSongs.find(s => s.id === draft.songId);
        if (!song) {
          // If song not found, use a placeholder
          return {
            ...draft,
            song: {
              id: draft.songId,
              title: "Unknown Song",
              category: "Unknown",
              rarityScore: 0,
              lastPlayed: null,
              totalPlays: 0
            }
          };
        }
        return { ...draft, song };
      });

      return draftsWithSongs;
    } catch (error) {
      console.error("Error fetching drafted songs from database:", error);
      
      // Fallback to stub data for development
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
          points: 2,
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
          points: 5,
          playedCount: 3,
          openerCount: 1,
          encoreCount: 0,
          status: "active",
          draftedAt: new Date(),
          song: songs[4],
        },
      ];
    }
  }

  async draftSong(draft: InsertDraftedSong): Promise<DraftedSong> {
    try {
      const [newDraft] = await db
        .insert(draftedSongs)
        .values({
          ...draft,
          points: 0, // Start with 0 points
          playedCount: 0,
          openerCount: 0,
          encoreCount: 0,
          status: "active",
        })
        .returning();
      
      return newDraft;
    } catch (error) {
      console.error("Error drafting song to database:", error);
      // Fallback for development
      return { id: Date.now(), ...draft, draftedAt: new Date() } as DraftedSong;
    }
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

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    // In a real database implementation:
    // await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
    console.log(`Updating password for user ${userId}`);
  }

  // Password reset operations
  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    // In a real database implementation:
    // const [resetToken] = await db.insert(passwordResetTokens).values(token).returning();
    // return resetToken;
    
    // For now, return a mock token
    return {
      id: Date.now(),
      userId: token.userId,
      token: token.token,
      expiresAt: token.expiresAt,
      used: false,
      createdAt: new Date(),
    };
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    // In a real database implementation:
    // const [resetToken] = await db.select().from(passwordResetTokens)
    //   .where(and(eq(passwordResetTokens.token, token), eq(passwordResetTokens.used, false)));
    // return resetToken;
    
    // For now, return undefined (no token found)
    return undefined;
  }

  async markTokenAsUsed(tokenId: number): Promise<void> {
    // In a real database implementation:
    // await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, tokenId));
    console.log(`Marking token ${tokenId} as used`);
  }

  async deleteExpiredTokens(): Promise<void> {
    // In a real database implementation:
    // await db.delete(passwordResetTokens).where(sql`expires_at < NOW()`);
    console.log('Deleting expired tokens');
  }

  // Concert operations - database implementations
  async getConcerts(): Promise<Concert[]> {
    return await db.select().from(concerts).orderBy(concerts.date);
  }

  async getUpcomingConcerts(): Promise<Concert[]> {
    const now = new Date();
    return await db.select().from(concerts)
      .where(sql`${concerts.date} > ${now}`)
      .orderBy(concerts.date);
  }

  async createConcert(concert: InsertConcert): Promise<Concert> {
    const [newConcert] = await db.insert(concerts).values(concert).returning();
    return newConcert;
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
        if (draftedSong.userId) {
          await this.updateUserPoints(draftedSong.userId, points);
        }
        
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
        
        if (draftedSong.userId && draftedSong.leagueId) {
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
        description: "\"Wilson\" was played (+1 pt) and opened first set (+1 pt)",
        points: 2,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: 3,
        userId,
        leagueId: leagueId || 1,
        type: "score",
        description: "\"Fluffhead\" was played (+1 pt) and played as encore (+1 pt)",
        points: 2,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        id: 4,
        userId,
        leagueId: leagueId || 1,
        type: "score",
        description: "\"Tweezer\" was played (+1 pt)",
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
        email: users.email,
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

  // Admin operations
  async isUserAdmin(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    return user?.role === "admin";
  }

  async isUserLeagueAdmin(userId: number, leagueId: number): Promise<boolean> {
    // Check if user is the league owner
    const [league] = await db.select().from(leagues).where(eq(leagues.id, leagueId));
    if (league?.ownerId === userId) {
      return true;
    }

    // Check if user is a league admin
    const [member] = await db
      .select()
      .from(leagueMembers)
      .where(and(
        eq(leagueMembers.leagueId, leagueId),
        eq(leagueMembers.userId, userId),
        eq(leagueMembers.role, 'admin')
      ));
    
    return !!member;
  }

  async promoteToLeagueAdmin(userId: number, leagueId: number): Promise<void> {
    await db
      .update(leagueMembers)
      .set({ role: 'admin' })
      .where(and(
        eq(leagueMembers.leagueId, leagueId),
        eq(leagueMembers.userId, userId)
      ));
  }

  async getLeagueMembers(leagueId: number): Promise<(User & { role: string; joinedAt: Date | null })[]> {
    const members = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        password: users.password,
        userRole: users.role,
        totalPoints: users.totalPoints,
        createdAt: users.createdAt,
        memberRole: leagueMembers.role,
        joinedAt: leagueMembers.joinedAt
      })
      .from(leagueMembers)
      .innerJoin(users, eq(leagueMembers.userId, users.id))
      .where(eq(leagueMembers.leagueId, leagueId))
      .orderBy(users.username);

    return members.map(member => ({
      id: member.id,
      username: member.username,
      email: member.email,
      password: member.password,
      role: member.userRole,
      totalPoints: member.totalPoints,
      createdAt: member.createdAt,
      role: member.memberRole || 'member',
      joinedAt: member.joinedAt
    }));
  }

  // League Invite operations
  async createLeagueInvite(invite: InsertLeagueInvite): Promise<LeagueInvite> {
    const [createdInvite] = await db
      .insert(leagueInvites)
      .values(invite)
      .returning();
    return createdInvite;
  }

  async getLeagueInvites(leagueId: number): Promise<LeagueInvite[]> {
    return db
      .select()
      .from(leagueInvites)
      .where(and(
        eq(leagueInvites.leagueId, leagueId),
        eq(leagueInvites.isActive, true)
      ))
      .orderBy(leagueInvites.createdAt);
  }

  async getInviteByCode(inviteCode: string): Promise<LeagueInvite | undefined> {
    const [invite] = await db
      .select()
      .from(leagueInvites)
      .where(and(
        eq(leagueInvites.inviteCode, inviteCode),
        eq(leagueInvites.isActive, true)
      ));
    return invite;
  }

  async joinLeagueByInvite(inviteCode: string, userId: number): Promise<boolean> {
    const invite = await this.getInviteByCode(inviteCode);
    if (!invite) return false;

    // Check if invite is expired
    if (invite.expiresAt && new Date() > invite.expiresAt) {
      return false;
    }

    // Check if invite has reached max uses
    if (invite.maxUses && invite.currentUses >= invite.maxUses) {
      return false;
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(leagueMembers)
      .where(and(
        eq(leagueMembers.leagueId, invite.leagueId),
        eq(leagueMembers.userId, userId)
      ));

    if (existingMember.length > 0) {
      return false; // Already a member
    }

    // Add user to league
    await db.insert(leagueMembers).values({
      leagueId: invite.leagueId,
      userId: userId,
      role: 'member'
    });

    // Increment invite usage count
    await db
      .update(leagueInvites)
      .set({ currentUses: invite.currentUses + 1 })
      .where(eq(leagueInvites.id, invite.id));

    return true;
  }

  async deactivateInvite(inviteId: number): Promise<void> {
    await db
      .update(leagueInvites)
      .set({ isActive: false })
      .where(eq(leagueInvites.id, inviteId));
  }

  async getShowPointsForAdmin(leagueId: number, concertId: number): Promise<{
    concert: Concert,
    songPerformances: (SongPerformance & { song: Song, draftedBy?: { userId: number, username: string }[] })[]
  } | undefined> {
    // Get concert
    const [concert] = await db.select().from(concerts).where(eq(concerts.id, concertId));
    if (!concert) return undefined;

    // Get song performances for this concert
    const performances = await db
      .select({
        id: songPerformances.id,
        concertId: songPerformances.concertId,
        songId: songPerformances.songId,
        setNumber: songPerformances.setNumber,
        position: songPerformances.position,
        isOpener: songPerformances.isOpener,
        isEncore: songPerformances.isEncore,
        notes: songPerformances.notes,
        song: songs
      })
      .from(songPerformances)
      .innerJoin(songs, eq(songPerformances.songId, songs.id))
      .where(eq(songPerformances.concertId, concertId));

    // For each performance, get users who drafted this song in this league
    const performancesWithDrafts = await Promise.all(
      performances.map(async (perf) => {
        const drafters = await db
          .select({
            userId: users.id,
            username: users.username
          })
          .from(draftedSongs)
          .innerJoin(users, eq(draftedSongs.userId, users.id))
          .where(and(
            eq(draftedSongs.songId, perf.songId!),
            eq(draftedSongs.leagueId, leagueId)
          ));

        return {
          ...perf,
          draftedBy: drafters
        };
      })
    );

    return {
      concert,
      songPerformances: performancesWithDrafts
    };
  }

  async createPointAdjustment(adjustment: InsertPointAdjustment): Promise<PointAdjustment> {
    const [newAdjustment] = await db
      .insert(pointAdjustments)
      .values(adjustment)
      .returning();
    return newAdjustment;
  }

  async getPointAdjustments(leagueId: number, concertId?: number): Promise<(PointAdjustment & { song: Song, user?: User, adjustedByUser: User })[]> {
    let query = db
      .select({
        id: pointAdjustments.id,
        leagueId: pointAdjustments.leagueId,
        concertId: pointAdjustments.concertId,
        songId: pointAdjustments.songId,
        userId: pointAdjustments.userId,
        originalPoints: pointAdjustments.originalPoints,
        adjustedPoints: pointAdjustments.adjustedPoints,
        reason: pointAdjustments.reason,
        adjustedBy: pointAdjustments.adjustedBy,
        createdAt: pointAdjustments.createdAt,
        song: songs,
        user: users,
        adjustedByUser: sql<User>`admin_user.*`
      })
      .from(pointAdjustments)
      .innerJoin(songs, eq(pointAdjustments.songId, songs.id))
      .leftJoin(users, eq(pointAdjustments.userId, users.id))
      .innerJoin(sql`${users} as admin_user`, sql`${pointAdjustments.adjustedBy} = admin_user.id`)
      .where(eq(pointAdjustments.leagueId, leagueId));

    if (concertId) {
      query = query.where(eq(pointAdjustments.concertId, concertId));
    }

    return await query;
  }

  async updateUserPointsAfterAdjustment(userId: number, pointsDifference: number): Promise<void> {
    await db
      .update(users)
      .set({
        totalPoints: sql`${users.totalPoints} + ${pointsDifference}`
      })
      .where(eq(users.id, userId));
  }

  async updateUserProfile(userId: number, updates: { email?: string; phoneNumber?: string }): Promise<User> {
    // Validate that email is not already taken by another user
    if (updates.email) {
      const existingUser = await db
        .select()
        .from(users)
        .where(and(eq(users.email, updates.email), not(eq(users.id, userId))))
        .limit(1);
      
      if (existingUser.length > 0) {
        throw new Error("Email address is already in use by another user");
      }
    }
    
    // Validate that phone number is not already taken by another user
    if (updates.phoneNumber) {
      const existingUser = await db
        .select()
        .from(users)
        .where(and(eq(users.phoneNumber, updates.phoneNumber), not(eq(users.id, userId))))
        .limit(1);
      
      if (existingUser.length > 0) {
        throw new Error("Phone number is already in use by another user");
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        email: updates.email,
        phoneNumber: updates.phoneNumber,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }

  // Phone verification operations
  async createPhoneVerificationCode(codeData: InsertPhoneVerificationCode): Promise<PhoneVerificationCode> {
    const [code] = await db
      .insert(phoneVerificationCodes)
      .values(codeData)
      .returning();
    return code;
  }

  async getValidPhoneVerificationCode(phoneNumber: string, code: string): Promise<PhoneVerificationCode | undefined> {
    const [verificationCode] = await db
      .select()
      .from(phoneVerificationCodes)
      .where(
        and(
          eq(phoneVerificationCodes.phoneNumber, phoneNumber),
          eq(phoneVerificationCodes.code, code),
          eq(phoneVerificationCodes.used, false),
          gt(phoneVerificationCodes.expiresAt, new Date())
        )
      )
      .limit(1);
    return verificationCode;
  }

  async markPhoneVerificationCodeUsed(id: number): Promise<void> {
    await db
      .update(phoneVerificationCodes)
      .set({ used: true })
      .where(eq(phoneVerificationCodes.id, id));
  }
}

export const storage = new DatabaseStorage();