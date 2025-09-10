import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number").unique(), // Optional phone number for SMS features
  password: text("password").notNull(),
  role: text("role").default("user"), // "superadmin", "admin", "user"
  totalPoints: integer("total_points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tours = pgTable("tours", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Summer Tour 2024", "Fall Tour 2023", etc.
  year: integer("year").notNull(),
  season: text("season").notNull(), // "summer", "fall", "winter", "spring", "nye"
  description: text("description"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leagues = pgTable("leagues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  tourId: integer("tour_id").references(() => tours.id),
  ownerId: integer("owner_id").references(() => users.id),
  isPublic: boolean("is_public").default(true),
  maxPlayers: integer("max_players").default(24),
  draftStatus: text("draft_status").default("scheduled"), // scheduled, active, completed, paused
  draftDate: timestamp("draft_date"), // When the draft is scheduled to start
  draftRounds: integer("draft_rounds").default(10), // Number of rounds (songs per player)
  currentPick: integer("current_pick").default(1), // Current overall pick number
  currentRound: integer("current_round").default(1), // Current round
  currentPlayer: integer("current_player"), // User ID of whose turn it is
  pickTimeLimit: integer("pick_time_limit").default(90), // Seconds per pick
  seasonStartDate: timestamp("season_start_date"), // Start of scoring period
  seasonEndDate: timestamp("season_end_date"), // End of scoring period
  createdAt: timestamp("created_at").defaultNow(),
});

export const leagueMembers = pgTable("league_members", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id").references(() => leagues.id),
  userId: integer("user_id").references(() => users.id),
  role: text("role").default("member"), // "admin", "member"
  draftPosition: integer("draft_position"), // 1, 2, 3, etc. - pick order in draft
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const leagueInvites = pgTable("league_invites", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id").references(() => leagues.id).notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  maxUses: integer("max_uses"), // null = unlimited
  currentUses: integer("current_uses").default(0),
  expiresAt: timestamp("expires_at"), // null = no expiration
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category"), // Gamehendge, Classic, Epic, etc.
  rarityScore: integer("rarity_score").default(0), // Simple scoring: 0 base points, earned during tour
  lastPlayed: timestamp("last_played"),
  totalPlays: integer("total_plays").default(0),
});

export const draftedSongs = pgTable("drafted_songs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  leagueId: integer("league_id").references(() => leagues.id),
  songId: integer("song_id").references(() => songs.id),
  points: integer("points").default(0),
  playedCount: integer("played_count").default(0), // Number of times played
  openerCount: integer("opener_count").default(0), // Number of times as opener
  encoreCount: integer("encore_count").default(0), // Number of times as encore
  status: text("status").default("active"), // active, benched
  draftRound: integer("draft_round"), // Which round this was drafted in
  draftPick: integer("draft_pick"), // Overall pick number
  draftedAt: timestamp("drafted_at").defaultNow(),
});

export const concerts = pgTable("concerts", {
  id: serial("id").primaryKey(),
  tourId: integer("tour_id").references(() => tours.id),
  date: timestamp("date").notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  country: text("country").default("USA"),
  setlist: jsonb("setlist"), // Structured setlist with positions
  isCompleted: boolean("is_completed").default(false),
});

// New table to track song performances with position details
export const songPerformances = pgTable("song_performances", {
  id: serial("id").primaryKey(),
  concertId: integer("concert_id").references(() => concerts.id),
  songId: integer("song_id").references(() => songs.id),
  setNumber: integer("set_number"), // 1, 2, or null for encore
  position: integer("position"), // Position in the set
  isOpener: boolean("is_opener").default(false), // First song of set 1 or 2
  isEncore: boolean("is_encore").default(false), // Encore song
  notes: text("notes"), // Additional notes (jam length, etc.)
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  leagueId: integer("league_id").references(() => leagues.id),
  type: text("type").notNull(), // draft, score, join_league
  description: text("description").notNull(),
  points: integer("points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pointAdjustments = pgTable("point_adjustments", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id").references(() => leagues.id).notNull(),
  concertId: integer("concert_id").references(() => concerts.id).notNull(),
  songId: integer("song_id").references(() => songs.id).notNull(),
  userId: integer("user_id").references(() => users.id), // User who drafted the song
  originalPoints: integer("original_points").default(0),
  adjustedPoints: integer("adjusted_points").default(0),
  reason: text("reason"), // Admin note for the adjustment
  adjustedBy: integer("adjusted_by").references(() => users.id).notNull(), // Admin who made the adjustment
  createdAt: timestamp("created_at").defaultNow(),
});

// Phone verification codes for SMS authentication
export const phoneVerificationCodes = pgTable("phone_verification_codes", {
  id: serial("id").primaryKey(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cached Phish.net data tables for reducing external API calls
export const cachedShows = pgTable("cached_shows", {
  id: serial("id").primaryKey(),
  phishNetId: text("phish_net_id").notNull().unique(), // Phish.net show ID
  showDate: timestamp("show_date").notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  country: text("country").default("USA"),
  tourid: text("tourid"),
  setlistdata: jsonb("setlistdata"), // Raw setlist data from Phish.net
  isCompleted: boolean("is_completed").default(false),
  cachedAt: timestamp("cached_at").defaultNow(),
});

export const cachedSongs = pgTable("cached_songs", {
  id: serial("id").primaryKey(),
  phishNetId: text("phish_net_id").notNull().unique(), // Phish.net song ID
  title: text("title").notNull(),
  artist: text("artist").default("Phish"),
  timesPlayed: integer("times_played").default(0),
  debutDate: text("debut_date"),
  lastPlayed: text("last_played"),
  gap: integer("gap").default(0), // Days since last played
  originalArtist: text("original_artist"),
  category: text("category"), // Calculated category
  rarityScore: integer("rarity_score").default(0), // Calculated rarity
  cachedAt: timestamp("cached_at").defaultNow(),
});

export const cachedSetlists = pgTable("cached_setlists", {
  id: serial("id").primaryKey(),
  showDate: text("show_date").notNull().unique(),
  setlistData: jsonb("setlist_data"), // Complete setlist with positions
  songs: jsonb("songs"), // Array of song names for quick access
  cachedAt: timestamp("cached_at").defaultNow(),
});

export const cacheMetadata = pgTable("cache_metadata", {
  id: serial("id").primaryKey(),
  cacheType: text("cache_type").notNull().unique(), // 'shows', 'songs', 'setlists'
  lastRefreshed: timestamp("last_refreshed").defaultNow(),
  refreshInterval: integer("refresh_interval").default(3600), // Seconds
  isRefreshing: boolean("is_refreshing").default(false),
  lastError: text("last_error"),
  totalRecords: integer("total_records").default(0),
});

export type PhoneVerificationCode = typeof phoneVerificationCodes.$inferSelect;
export type InsertPhoneVerificationCode = typeof phoneVerificationCodes.$inferInsert;

// Draft picks table - tracks each individual pick in the draft
export const draftPicks = pgTable("draft_picks", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id").references(() => leagues.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  songId: integer("song_id").references(() => songs.id),
  pickNumber: integer("pick_number").notNull(), // Overall pick number (1, 2, 3...)
  round: integer("round").notNull(), // Round number
  timeUsed: integer("time_used"), // Seconds used for this pick
  isAutoPick: boolean("is_auto_pick").default(false), // True if auto-drafted due to timeout
  pickedAt: timestamp("picked_at").defaultNow(),
});

export type DraftPick = typeof draftPicks.$inferSelect;
export type InsertDraftPick = typeof draftPicks.$inferInsert;

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  phoneNumber: true,
  password: true,
  role: true,
  totalPoints: true,
});

export const insertTourSchema = createInsertSchema(tours).pick({
  name: true,
  year: true,
  season: true,
  description: true,
  startDate: true,
  endDate: true,
});

export const insertLeagueSchema = createInsertSchema(leagues).pick({
  name: true,
  description: true,
  tourId: true,
  maxPlayers: true,
});

export const insertDraftedSongSchema = createInsertSchema(draftedSongs).pick({
  userId: true,
  leagueId: true,
  songId: true,
});

export const insertDraftPickSchema = createInsertSchema(draftPicks).pick({
  leagueId: true,
  userId: true,
  songId: true,
  pickNumber: true,
  round: true,
  timeUsed: true,
  isAutoPick: true,
});

export const insertConcertSchema = createInsertSchema(concerts).pick({
  tourId: true,
  date: true,
  venue: true,
  city: true,
  state: true,
  country: true,
  setlist: true,
});

export const insertSongPerformanceSchema = createInsertSchema(songPerformances).pick({
  concertId: true,
  songId: true,
  setNumber: true,
  position: true,
  isOpener: true,
  isEncore: true,
  notes: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).pick({
  userId: true,
  token: true,
  expiresAt: true,
});

export const insertPointAdjustmentSchema = createInsertSchema(pointAdjustments).pick({
  leagueId: true,
  concertId: true,
  songId: true,
  userId: true,
  originalPoints: true,
  adjustedPoints: true,
  reason: true,
  adjustedBy: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Tour = typeof tours.$inferSelect;
export type InsertTour = z.infer<typeof insertTourSchema>;
export type League = typeof leagues.$inferSelect;
export type InsertLeague = z.infer<typeof insertLeagueSchema>;
export type Song = typeof songs.$inferSelect;
export type DraftedSong = typeof draftedSongs.$inferSelect;
export type InsertDraftedSong = z.infer<typeof insertDraftedSongSchema>;
export type Concert = typeof concerts.$inferSelect;
export type InsertConcert = z.infer<typeof insertConcertSchema>;
export type SongPerformance = typeof songPerformances.$inferSelect;
export type InsertSongPerformance = z.infer<typeof insertSongPerformanceSchema>;
export type Activity = typeof activities.$inferSelect;
export type LeagueMember = typeof leagueMembers.$inferSelect;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PointAdjustment = typeof pointAdjustments.$inferSelect;
export type InsertPointAdjustment = z.infer<typeof insertPointAdjustmentSchema>;
export type LeagueInvite = typeof leagueInvites.$inferSelect;

export const insertLeagueInviteSchema = createInsertSchema(leagueInvites).pick({
  leagueId: true,
  inviteCode: true,
  createdBy: true,
  maxUses: true,
  expiresAt: true,
});

export const insertCachedShowSchema = createInsertSchema(cachedShows).pick({
  phishNetId: true,
  showDate: true,
  venue: true,
  city: true,
  state: true,
  country: true,
  tourid: true,
  setlistdata: true,
  isCompleted: true,
});

export const insertCachedSongSchema = createInsertSchema(cachedSongs).pick({
  phishNetId: true,
  title: true,
  artist: true,
  timesPlayed: true,
  debutDate: true,
  lastPlayed: true,
  gap: true,
  originalArtist: true,
  category: true,
  rarityScore: true,
});

export const insertCachedSetlistSchema = createInsertSchema(cachedSetlists).pick({
  showDate: true,
  setlistData: true,
  songs: true,
});

export const insertCacheMetadataSchema = createInsertSchema(cacheMetadata).pick({
  cacheType: true,
  refreshInterval: true,
  lastError: true,
  totalRecords: true,
});

export type InsertLeagueInvite = z.infer<typeof insertLeagueInviteSchema>;
export type CachedShow = typeof cachedShows.$inferSelect;
export type InsertCachedShow = z.infer<typeof insertCachedShowSchema>;
export type CachedSong = typeof cachedSongs.$inferSelect;
export type InsertCachedSong = z.infer<typeof insertCachedSongSchema>;
export type CachedSetlist = typeof cachedSetlists.$inferSelect;
export type InsertCachedSetlist = z.infer<typeof insertCachedSetlistSchema>;
export type CacheMetadata = typeof cacheMetadata.$inferSelect;
export type InsertCacheMetadata = z.infer<typeof insertCacheMetadataSchema>;
