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
  password: text("password").notNull(),
  role: text("role").default("user"), // "admin", "user"
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
  maxPlayers: integer("max_players").default(24),
  draftStatus: text("draft_status").default("active"), // active, completed, paused
  createdAt: timestamp("created_at").defaultNow(),
});

export const leagueMembers = pgTable("league_members", {
  id: serial("id").primaryKey(),
  leagueId: integer("league_id").references(() => leagues.id),
  userId: integer("user_id").references(() => users.id),
  joinedAt: timestamp("joined_at").defaultNow(),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
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
