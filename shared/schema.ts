import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  totalPoints: integer("total_points").default(0),
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
  rarityScore: integer("rarity_score").default(0), // 1-100 based on play frequency
  lastPlayed: timestamp("last_played"),
  totalPlays: integer("total_plays").default(0),
});

export const draftedSongs = pgTable("drafted_songs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  leagueId: integer("league_id").references(() => leagues.id),
  songId: integer("song_id").references(() => songs.id),
  points: integer("points").default(0),
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
  setlist: jsonb("setlist"), // Array of song titles
  isCompleted: boolean("is_completed").default(false),
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
export type Activity = typeof activities.$inferSelect;
export type LeagueMember = typeof leagueMembers.$inferSelect;
