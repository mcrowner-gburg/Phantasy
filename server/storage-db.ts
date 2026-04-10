import { eq, and, desc, asc, sql, inArray } from "drizzle-orm";
import { db } from "./db";
import {
  users, tours, leagues, leagueMembers, leagueInvites, songs, draftedSongs,
  concerts, activities, songPerformances, passwordResetTokens, phoneVerificationCodes,
  cachedShows, cachedSongs, cachedSetlists, draftPicks, pointAdjustments,
  type User, type InsertUser, type Tour, type InsertTour, type League, type InsertLeague,
  type Song, type DraftedSong, type InsertDraftedSong, type Concert, type InsertConcert,
  type Activity, type LeagueMember, type SongPerformance, type InsertSongPerformance,
  type PasswordResetToken, type InsertPasswordResetToken, type PhoneVerificationCode,
  type InsertPhoneVerificationCode, type CachedShow, type CachedSong, type CachedSetlist,
  type LeagueInvite, type DraftPick,
} from "@shared/schema";

export const storage = {

  // ==================== USERS ====================

  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  },

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  },

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber)).limit(1);
    return result[0];
  },

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  },

  async updateUserPoints(userId: number, points: number): Promise<void> {
    await db.update(users)
      .set({ totalPoints: sql`${users.totalPoints} + ${points}` })
      .where(eq(users.id, userId));
  },

  async updateUserPassword(userId: number, hashedPassword: string): Promise<void> {
    await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
  },

  async updateUserProfile(userId: number, updates: { email?: string; phoneNumber?: string | null }): Promise<User> {
    const result = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
    return result[0];
  },

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.username));
  },

  async updateUserRole(userId: number, role: string): Promise<User> {
    const result = await db.update(users).set({ role }).where(eq(users.id, userId)).returning();
    return result[0];
  },

  async deleteUser(userId: number): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  },

  // ==================== PASSWORD RESET ====================

  async createPasswordResetToken(data: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const result = await db.insert(passwordResetTokens).values(data).returning();
    return result[0];
  },

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const result = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token)).limit(1);
    return result[0];
  },

  async markTokenAsUsed(tokenId: number): Promise<void> {
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, tokenId));
  },

  // ==================== PHONE VERIFICATION ====================

  async createPhoneVerificationCode(data: InsertPhoneVerificationCode): Promise<PhoneVerificationCode> {
    const result = await db.insert(phoneVerificationCodes).values(data).returning();
    return result[0];
  },

  async getValidPhoneVerificationCode(phoneNumber: string, code: string): Promise<PhoneVerificationCode | undefined> {
    const result = await db.select().from(phoneVerificationCodes).where(
      and(
        eq(phoneVerificationCodes.phoneNumber, phoneNumber),
        eq(phoneVerificationCodes.code, code),
        eq(phoneVerificationCodes.used, false),
      )
    ).limit(1);
    return result[0];
  },

  async markPhoneVerificationCodeUsed(codeId: number): Promise<void> {
    await db.update(phoneVerificationCodes).set({ used: true }).where(eq(phoneVerificationCodes.id, codeId));
  },

  // ==================== TOURS ====================

  async getTours(): Promise<Tour[]> {
    return await db.select().from(tours).orderBy(desc(tours.createdAt));
  },

  async getActiveTour(): Promise<Tour | undefined> {
    const result = await db.select().from(tours).where(eq(tours.isActive, true)).limit(1);
    return result[0];
  },

  async getTour(id: number): Promise<Tour | undefined> {
    const result = await db.select().from(tours).where(eq(tours.id, id)).limit(1);
    return result[0];
  },

  async createTour(tour: InsertTour): Promise<Tour> {
    const result = await db.insert(tours).values(tour).returning();
    return result[0];
  },

  async updateTour(id: number, updates: Partial<Tour>): Promise<Tour> {
    const result = await db.update(tours).set(updates).where(eq(tours.id, id)).returning();
    return result[0];
  },

  // ==================== LEAGUES ====================

  async getLeague(id: number): Promise<League | undefined> {
    const result = await db.select().from(leagues).where(eq(leagues.id, id)).limit(1);
    return result[0];
  },

  async createLeague(league: InsertLeague & { ownerId: number }): Promise<League> {
    const result = await db.insert(leagues).values(league).returning();
    const newLeague = result[0];
    await this.joinLeague(league.ownerId, newLeague.id);
    return newLeague;
  },

  async updateLeague(id: number, updates: Partial<League>): Promise<League> {
    const result = await db.update(leagues).set(updates).where(eq(leagues.id, id)).returning();
    return result[0];
  },

  async deleteLeague(id: number): Promise<void> {
    await db.delete(leagueMembers).where(eq(leagueMembers.leagueId, id));
    await db.delete(draftedSongs).where(eq(draftedSongs.leagueId, id));
    await db.delete(leagues).where(eq(leagues.id, id));
  },

  async getUserLeagues(userId: number): Promise<League[]> {
    const memberRows = await db.select().from(leagueMembers).where(eq(leagueMembers.userId, userId));
    const leagueIds = memberRows.map(m => m.leagueId!);
    if (leagueIds.length === 0) return [];
    return await db.select().from(leagues).where(inArray(leagues.id, leagueIds));
  },

  async getPublicLeagues(tourId?: number): Promise<League[]> {
    if (tourId) {
      return await db.select().from(leagues).where(
        and(eq(leagues.isPublic, true), eq(leagues.tourId, tourId))
      );
    }
    return await db.select().from(leagues).where(eq(leagues.isPublic, true));
  },

  async getTourLeagues(tourId: number): Promise<League[]> {
    return await db.select().from(leagues).where(eq(leagues.tourId, tourId));
  },

  async joinLeague(userId: number, leagueId: number): Promise<void> {
    const existing = await db.select().from(leagueMembers).where(
      and(eq(leagueMembers.userId, userId), eq(leagueMembers.leagueId, leagueId))
    ).limit(1);
    if (existing.length === 0) {
      await db.insert(leagueMembers).values({ userId, leagueId });
    }
  },

  async getLeagueMembers(leagueId: number): Promise<(LeagueMember & { user: User })[]> {
    const members = await db.select().from(leagueMembers)
      .where(eq(leagueMembers.leagueId, leagueId));
    const result = [];
    for (const member of members) {
      const user = await this.getUser(member.userId!);
      if (user) result.push({ ...member, user });
    }
    return result;
  },

  async joinLeagueByInvite(inviteCode: string, userId: number): Promise<boolean> {
    const invite = await db.select().from(leagueInvites).where(
      and(eq(leagueInvites.inviteCode, inviteCode), eq(leagueInvites.isActive, true))
    ).limit(1);
    if (!invite[0]) return false;
    await this.joinLeague(userId, invite[0].leagueId);
    await db.update(leagueInvites)
      .set({ currentUses: sql`${leagueInvites.currentUses} + 1` })
      .where(eq(leagueInvites.id, invite[0].id));
    return true;
  },

  // ==================== DRAFT ====================

  async scheduleDraft(leagueId: number, draftDate: Date, draftRounds: number, pickTimeLimit: number): Promise<void> {
    await db.update(leagues).set({ draftDate, draftRounds, pickTimeLimit, draftStatus: "scheduled" }).where(eq(leagues.id, leagueId));
  },

  async startDraft(leagueId: number): Promise<void> {
    const members = await this.getLeagueMembers(leagueId);
    const firstPlayer = members[0]?.userId ?? null;
    await db.update(leagues).set({
      draftStatus: "active",
      currentPick: 1,
      currentRound: 1,
      currentPlayer: firstPlayer,
    }).where(eq(leagues.id, leagueId));
  },

  async getDraftStatus(leagueId: number): Promise<League | undefined> {
    return await this.getLeague(leagueId);
  },

  async getDraftOrder(leagueId: number): Promise<(LeagueMember & { user: User })[]> {
    const members = await db.select().from(leagueMembers)
      .where(eq(leagueMembers.leagueId, leagueId))
      .orderBy(asc(leagueMembers.draftPosition));
    const result = [];
    for (const member of members) {
      const user = await this.getUser(member.userId!);
      if (user) result.push({ ...member, user });
    }
    return result;
  },

  async setDraftOrder(leagueId: number, userIds: number[]): Promise<void> {
    for (let i = 0; i < userIds.length; i++) {
      await db.update(leagueMembers)
        .set({ draftPosition: i + 1 })
        .where(and(eq(leagueMembers.leagueId, leagueId), eq(leagueMembers.userId, userIds[i])));
    }
  },

  async getDraftPicks(leagueId: number): Promise<DraftPick[]> {
    return await db.select().from(draftPicks)
      .where(eq(draftPicks.leagueId, leagueId))
      .orderBy(asc(draftPicks.pickNumber));
  },

  async makeDraftPick(leagueId: number, userId: number, songId: number, timeUsed: number): Promise<DraftPick> {
    const league = await this.getLeague(leagueId);
    if (!league) throw new Error("League not found");

    const pick = await db.insert(draftPicks).values({
      leagueId,
      userId,
      songId,
      pickNumber: league.currentPick ?? 1,
      round: league.currentRound ?? 1,
      timeUsed,
    }).returning();

    await db.insert(draftedSongs).values({
      userId,
      leagueId,
      songId,
      draftRound: league.currentRound ?? 1,
      draftPick: league.currentPick ?? 1,
    });

    const members = await this.getDraftOrder(leagueId);
    const currentIdx = members.findIndex(m => m.userId === userId);
    const nextIdx = (currentIdx + 1) % members.length;
    const nextPlayer = members[nextIdx]?.userId ?? null;
    const newPick = (league.currentPick ?? 1) + 1;
    const newRound = Math.ceil(newPick / members.length);

    await db.update(leagues).set({
      currentPick: newPick,
      currentRound: newRound,
      currentPlayer: nextPlayer,
    }).where(eq(leagues.id, leagueId));

    return pick[0];
  },

  async isSongDraftedInLeague(songId: number, leagueId: number): Promise<boolean> {
    const result = await db.select().from(draftedSongs).where(
      and(eq(draftedSongs.songId, songId), eq(draftedSongs.leagueId, leagueId))
    ).limit(1);
    return result.length > 0;
  },

  async getDraftedSongIdsForLeague(leagueId: number): Promise<number[]> {
    const result = await db.select({ songId: draftedSongs.songId })
      .from(draftedSongs).where(eq(draftedSongs.leagueId, leagueId));
    return result.map(r => r.songId!);
  },

  // ==================== SONGS ====================

  async getAllSongs(): Promise<Song[]> {
    return await db.select().from(songs).orderBy(asc(songs.title));
  },

  async getSong(id: number): Promise<Song | undefined> {
    const result = await db.select().from(songs).where(eq(songs.id, id)).limit(1);
    return result[0];
  },

  async getSongByTitle(title: string): Promise<Song | undefined> {
    const result = await db.select().from(songs).where(eq(songs.title, title)).limit(1);
    return result[0];
  },

  async createSong(title: string, category?: string): Promise<Song> {
    const result = await db.insert(songs).values({ title, category }).returning();
    return result[0];
  },

  async updateSongStats(songId: number, rarityScore: number, lastPlayed: Date): Promise<void> {
    await db.update(songs).set({
      rarityScore,
      lastPlayed,
      totalPlays: sql`${songs.totalPlays} + 1`,
    }).where(eq(songs.id, songId));
  },

  // ==================== DRAFTED SONGS ====================

  async getDraftedSongs(userId: number, leagueId: number): Promise<(DraftedSong & { song: Song })[]> {
    const drafts = await db.select().from(draftedSongs).where(
      and(eq(draftedSongs.userId, userId), eq(draftedSongs.leagueId, leagueId))
    );
    const result = [];
    for (const draft of drafts) {
      const song = await this.getSong(draft.songId!);
      if (song) result.push({ ...draft, song });
    }
    return result;
  },

  async draftSong(draft: InsertDraftedSong): Promise<DraftedSong> {
    const result = await db.insert(draftedSongs).values(draft).returning();
    return result[0];
  },

  async updateDraftedSongPoints(id: number, points: number): Promise<void> {
    await db.update(draftedSongs)
      .set({ points: sql`${draftedSongs.points} + ${points}` })
      .where(eq(draftedSongs.id, id));
  },

  async updateDraftedSongStats(id: number, playedCount: number, openerCount: number, encoreCount: number): Promise<void> {
    await db.update(draftedSongs).set({ playedCount, openerCount, encoreCount }).where(eq(draftedSongs.id, id));
  },

  // ==================== CONCERTS ====================

  async getConcerts(): Promise<Concert[]> {
    return await db.select().from(concerts).orderBy(desc(concerts.date));
  },

  async getUpcomingConcerts(): Promise<Concert[]> {
    return await db.select().from(concerts).where(eq(concerts.isCompleted, false)).orderBy(asc(concerts.date));
  },

  async createConcert(concert: InsertConcert): Promise<Concert> {
    const result = await db.insert(concerts).values(concert).returning();
    return result[0];
  },

  async updateConcertSetlist(concertId: number, setlist: string[]): Promise<void> {
    await db.update(concerts).set({ setlist }).where(eq(concerts.id, concertId));
  },

  // ==================== SONG PERFORMANCES ====================

  async createSongPerformance(performance: InsertSongPerformance): Promise<SongPerformance & { song: Song }> {
    const result = await db.insert(songPerformances).values(performance).returning();
    const song = await this.getSong(performance.songId!);
    return { ...result[0], song: song! };
  },

  async getConcertPerformances(concertId: number): Promise<(SongPerformance & { song: Song })[]> {
    const perfs = await db.select().from(songPerformances).where(eq(songPerformances.concertId, concertId));
    const result = [];
    for (const perf of perfs) {
      const song = await this.getSong(perf.songId!);
      if (song) result.push({ ...perf, song });
    }
    return result;
  },

  async calculateAndUpdatePoints(concertId: number): Promise<void> {
    const performances = await this.getConcertPerformances(concertId);
    for (const perf of performances) {
      let points = 1; // played
      if (perf.isOpener) points += 1;
      if (perf.isEncore) points += 1;
      const drafts = await db.select().from(draftedSongs).where(eq(draftedSongs.songId, perf.songId!));
      for (const draft of drafts) {
        await this.updateDraftedSongPoints(draft.id, points);
        await this.updateUserPoints(draft.userId!, points);
      }
    }
  },

  // ==================== ACTIVITIES ====================

  async getUserActivities(userId: number, leagueId?: number): Promise<Activity[]> {
    if (leagueId) {
      return await db.select().from(activities).where(
        and(eq(activities.userId, userId), eq(activities.leagueId, leagueId))
      ).orderBy(desc(activities.createdAt)).limit(20);
    }
    return await db.select().from(activities).where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt)).limit(20);
  },

  async createActivity(userId: number, leagueId: number, type: string, description: string, points?: number): Promise<Activity> {
    const result = await db.insert(activities).values({ userId, leagueId, type, description, points: points ?? 0 }).returning();
    return result[0];
  },

  // ==================== LEADERBOARD ====================

  async getLeagueStandings(leagueId: number): Promise<(User & { rank: number; todayPoints: number; songCount: number })[]> {
    const members = await this.getLeagueMembers(leagueId);
    const standings = [];
    for (const member of members) {
      const drafts = await db.select().from(draftedSongs).where(
        and(eq(draftedSongs.userId, member.userId!), eq(draftedSongs.leagueId, leagueId))
      );
      const totalPoints = drafts.reduce((sum, d) => sum + (d.points ?? 0), 0);
      standings.push({
        ...member.user,
        totalPoints,
        rank: 0,
        todayPoints: 0,
        songCount: drafts.length,
      });
    }
    standings.sort((a, b) => b.totalPoints - a.totalPoints);
    standings.forEach((s, i) => s.rank = i + 1);
    return standings;
  },

  // ==================== CACHED SONGS ====================

  async getCachedSongs(forceRefresh = false): Promise<CachedSong[]> {
    return await db.select().from(cachedSongs).orderBy(asc(cachedSongs.title));
  },

  async getCachedShows(forceRefresh = false): Promise<CachedShow[]> {
    return await db.select().from(cachedShows).orderBy(desc(cachedShows.showDate));
  },

  async getCachedSetlist(showDate: string): Promise<CachedSetlist | undefined> {
    const result = await db.select().from(cachedSetlists).where(eq(cachedSetlists.showDate, showDate)).limit(1);
    return result[0];
  },
};