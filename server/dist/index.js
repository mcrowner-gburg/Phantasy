"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc3) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc3 = __getOwnPropDesc(from, key)) || desc3.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activities: () => activities,
  cacheMetadata: () => cacheMetadata,
  cachedSetlists: () => cachedSetlists,
  cachedShows: () => cachedShows,
  cachedSongs: () => cachedSongs,
  concerts: () => concerts,
  draftPicks: () => draftPicks,
  draftedSongs: () => draftedSongs,
  insertCacheMetadataSchema: () => insertCacheMetadataSchema,
  insertCachedSetlistSchema: () => insertCachedSetlistSchema,
  insertCachedShowSchema: () => insertCachedShowSchema,
  insertCachedSongSchema: () => insertCachedSongSchema,
  insertConcertSchema: () => insertConcertSchema,
  insertDraftPickSchema: () => insertDraftPickSchema,
  insertDraftedSongSchema: () => insertDraftedSongSchema,
  insertLeagueInviteSchema: () => insertLeagueInviteSchema,
  insertLeagueSchema: () => insertLeagueSchema,
  insertPasswordResetTokenSchema: () => insertPasswordResetTokenSchema,
  insertPointAdjustmentSchema: () => insertPointAdjustmentSchema,
  insertSongPerformanceSchema: () => insertSongPerformanceSchema,
  insertTourSchema: () => insertTourSchema,
  insertUserSchema: () => insertUserSchema,
  leagueInvites: () => leagueInvites,
  leagueMembers: () => leagueMembers,
  leagues: () => leagues,
  passwordResetTokens: () => passwordResetTokens,
  phoneVerificationCodes: () => phoneVerificationCodes,
  pointAdjustments: () => pointAdjustments,
  sessions: () => sessions,
  songPerformances: () => songPerformances,
  songs: () => songs,
  tours: () => tours,
  users: () => users
});
var import_pg_core, import_drizzle_zod, sessions, users, passwordResetTokens, tours, leagues, leagueMembers, leagueInvites, songs, draftedSongs, concerts, songPerformances, activities, pointAdjustments, phoneVerificationCodes, cachedShows, cachedSongs, cachedSetlists, cacheMetadata, draftPicks, insertUserSchema, insertTourSchema, insertLeagueSchema, insertDraftedSongSchema, insertDraftPickSchema, insertConcertSchema, insertSongPerformanceSchema, insertPasswordResetTokenSchema, insertPointAdjustmentSchema, insertLeagueInviteSchema, insertCachedShowSchema, insertCachedSongSchema, insertCachedSetlistSchema, insertCacheMetadataSchema;
var init_schema = __esm({
  "../shared/schema.ts"() {
    "use strict";
    import_pg_core = require("drizzle-orm/pg-core");
    import_drizzle_zod = require("drizzle-zod");
    sessions = (0, import_pg_core.pgTable)(
      "sessions",
      {
        sid: (0, import_pg_core.varchar)("sid").primaryKey(),
        sess: (0, import_pg_core.jsonb)("sess").notNull(),
        expire: (0, import_pg_core.timestamp)("expire").notNull()
      },
      (table) => [(0, import_pg_core.index)("IDX_session_expire").on(table.expire)]
    );
    users = (0, import_pg_core.pgTable)("users", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      username: (0, import_pg_core.text)("username").notNull().unique(),
      email: (0, import_pg_core.text)("email").notNull().unique(),
      phoneNumber: (0, import_pg_core.text)("phone_number").unique(),
      // Optional phone number for SMS features
      password: (0, import_pg_core.text)("password").notNull(),
      role: (0, import_pg_core.text)("role").default("user"),
      // "superadmin", "admin", "user"
      totalPoints: (0, import_pg_core.integer)("total_points").default(0),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    passwordResetTokens = (0, import_pg_core.pgTable)("password_reset_tokens", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      userId: (0, import_pg_core.integer)("user_id").references(() => users.id).notNull(),
      token: (0, import_pg_core.text)("token").notNull().unique(),
      expiresAt: (0, import_pg_core.timestamp)("expires_at").notNull(),
      used: (0, import_pg_core.boolean)("used").default(false),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    tours = (0, import_pg_core.pgTable)("tours", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      name: (0, import_pg_core.text)("name").notNull(),
      // "Summer Tour 2024", "Fall Tour 2023", etc.
      year: (0, import_pg_core.integer)("year").notNull(),
      season: (0, import_pg_core.text)("season").notNull(),
      // "summer", "fall", "winter", "spring", "nye"
      description: (0, import_pg_core.text)("description"),
      startDate: (0, import_pg_core.timestamp)("start_date"),
      endDate: (0, import_pg_core.timestamp)("end_date"),
      isActive: (0, import_pg_core.boolean)("is_active").default(true),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    leagues = (0, import_pg_core.pgTable)("leagues", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      name: (0, import_pg_core.text)("name").notNull(),
      description: (0, import_pg_core.text)("description"),
      tourId: (0, import_pg_core.integer)("tour_id").references(() => tours.id),
      ownerId: (0, import_pg_core.integer)("owner_id").references(() => users.id),
      isPublic: (0, import_pg_core.boolean)("is_public").default(true),
      maxPlayers: (0, import_pg_core.integer)("max_players").default(24),
      draftStatus: (0, import_pg_core.text)("draft_status").default("scheduled"),
      // scheduled, active, completed, paused
      draftDate: (0, import_pg_core.timestamp)("draft_date"),
      // When the draft is scheduled to start
      draftRounds: (0, import_pg_core.integer)("draft_rounds").default(10),
      // Number of rounds (songs per player)
      currentPick: (0, import_pg_core.integer)("current_pick").default(1),
      // Current overall pick number
      currentRound: (0, import_pg_core.integer)("current_round").default(1),
      // Current round
      currentPlayer: (0, import_pg_core.integer)("current_player"),
      // User ID of whose turn it is
      pickTimeLimit: (0, import_pg_core.integer)("pick_time_limit").default(90),
      // Seconds per pick
      pickDeadline: (0, import_pg_core.timestamp)("pick_deadline"),
      // When the current player's turn expires
      seasonStartDate: (0, import_pg_core.timestamp)("season_start_date"),
      // Start of scoring period
      seasonEndDate: (0, import_pg_core.timestamp)("season_end_date"),
      // End of scoring period
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    leagueMembers = (0, import_pg_core.pgTable)("league_members", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      leagueId: (0, import_pg_core.integer)("league_id").references(() => leagues.id),
      userId: (0, import_pg_core.integer)("user_id").references(() => users.id),
      role: (0, import_pg_core.text)("role").default("member"),
      // "admin", "member"
      draftPosition: (0, import_pg_core.integer)("draft_position"),
      // 1, 2, 3, etc. - pick order in draft
      joinedAt: (0, import_pg_core.timestamp)("joined_at").defaultNow()
    });
    leagueInvites = (0, import_pg_core.pgTable)("league_invites", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      leagueId: (0, import_pg_core.integer)("league_id").references(() => leagues.id).notNull(),
      inviteCode: (0, import_pg_core.text)("invite_code").notNull().unique(),
      createdBy: (0, import_pg_core.integer)("created_by").references(() => users.id).notNull(),
      maxUses: (0, import_pg_core.integer)("max_uses"),
      // null = unlimited
      currentUses: (0, import_pg_core.integer)("current_uses").default(0),
      expiresAt: (0, import_pg_core.timestamp)("expires_at"),
      // null = no expiration
      isActive: (0, import_pg_core.boolean)("is_active").default(true),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    songs = (0, import_pg_core.pgTable)("songs", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      title: (0, import_pg_core.text)("title").notNull(),
      category: (0, import_pg_core.text)("category"),
      // Gamehendge, Classic, Epic, etc.
      rarityScore: (0, import_pg_core.integer)("rarity_score").default(0),
      // Simple scoring: 0 base points, earned during tour
      lastPlayed: (0, import_pg_core.timestamp)("last_played"),
      totalPlays: (0, import_pg_core.integer)("total_plays").default(0),
      plays24Months: (0, import_pg_core.integer)("plays_24_months").default(0)
      // Plays in last 24 months
    });
    draftedSongs = (0, import_pg_core.pgTable)("drafted_songs", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      userId: (0, import_pg_core.integer)("user_id").references(() => users.id),
      leagueId: (0, import_pg_core.integer)("league_id").references(() => leagues.id),
      songId: (0, import_pg_core.integer)("song_id").references(() => songs.id),
      points: (0, import_pg_core.integer)("points").default(0),
      playedCount: (0, import_pg_core.integer)("played_count").default(0),
      // Number of times played
      openerCount: (0, import_pg_core.integer)("opener_count").default(0),
      // Number of times as opener
      encoreCount: (0, import_pg_core.integer)("encore_count").default(0),
      // Number of times as encore
      status: (0, import_pg_core.text)("status").default("active"),
      // active, benched
      draftRound: (0, import_pg_core.integer)("draft_round"),
      // Which round this was drafted in
      draftPick: (0, import_pg_core.integer)("draft_pick"),
      // Overall pick number
      draftedAt: (0, import_pg_core.timestamp)("drafted_at").defaultNow()
    });
    concerts = (0, import_pg_core.pgTable)("concerts", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      tourId: (0, import_pg_core.integer)("tour_id").references(() => tours.id),
      date: (0, import_pg_core.timestamp)("date").notNull(),
      venue: (0, import_pg_core.text)("venue").notNull(),
      city: (0, import_pg_core.text)("city").notNull(),
      state: (0, import_pg_core.text)("state"),
      country: (0, import_pg_core.text)("country").default("USA"),
      setlist: (0, import_pg_core.jsonb)("setlist"),
      // Structured setlist with positions
      isCompleted: (0, import_pg_core.boolean)("is_completed").default(false)
    });
    songPerformances = (0, import_pg_core.pgTable)("song_performances", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      concertId: (0, import_pg_core.integer)("concert_id").references(() => concerts.id),
      songId: (0, import_pg_core.integer)("song_id").references(() => songs.id),
      setNumber: (0, import_pg_core.integer)("set_number"),
      // 1, 2, or null for encore
      position: (0, import_pg_core.integer)("position"),
      // Position in the set
      isOpener: (0, import_pg_core.boolean)("is_opener").default(false),
      // First song of set 1 or 2
      isEncore: (0, import_pg_core.boolean)("is_encore").default(false),
      // Encore song
      notes: (0, import_pg_core.text)("notes")
      // Additional notes (jam length, etc.)
    });
    activities = (0, import_pg_core.pgTable)("activities", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      userId: (0, import_pg_core.integer)("user_id").references(() => users.id),
      leagueId: (0, import_pg_core.integer)("league_id").references(() => leagues.id),
      type: (0, import_pg_core.text)("type").notNull(),
      // draft, score, join_league
      description: (0, import_pg_core.text)("description").notNull(),
      points: (0, import_pg_core.integer)("points").default(0),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    pointAdjustments = (0, import_pg_core.pgTable)("point_adjustments", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      leagueId: (0, import_pg_core.integer)("league_id").references(() => leagues.id).notNull(),
      concertId: (0, import_pg_core.integer)("concert_id").notNull(),
      // cachedShows.id — no FK, different table from concerts
      songId: (0, import_pg_core.integer)("song_id").references(() => songs.id).notNull(),
      userId: (0, import_pg_core.integer)("user_id").references(() => users.id),
      // User who drafted the song
      originalPoints: (0, import_pg_core.integer)("original_points").default(0),
      adjustedPoints: (0, import_pg_core.integer)("adjusted_points").default(0),
      reason: (0, import_pg_core.text)("reason"),
      // Admin note for the adjustment
      adjustedBy: (0, import_pg_core.integer)("adjusted_by").references(() => users.id).notNull(),
      // Admin who made the adjustment
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    phoneVerificationCodes = (0, import_pg_core.pgTable)("phone_verification_codes", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      phoneNumber: (0, import_pg_core.varchar)("phone_number", { length: 20 }).notNull(),
      code: (0, import_pg_core.varchar)("code", { length: 6 }).notNull(),
      expiresAt: (0, import_pg_core.timestamp)("expires_at").notNull(),
      used: (0, import_pg_core.boolean)("used").default(false),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    cachedShows = (0, import_pg_core.pgTable)("cached_shows", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      phishNetId: (0, import_pg_core.text)("phish_net_id").notNull().unique(),
      // Phish.net show ID
      showDate: (0, import_pg_core.timestamp)("show_date").notNull(),
      venue: (0, import_pg_core.text)("venue").notNull(),
      city: (0, import_pg_core.text)("city").notNull(),
      state: (0, import_pg_core.text)("state"),
      country: (0, import_pg_core.text)("country").default("USA"),
      tourid: (0, import_pg_core.text)("tourid"),
      setlistdata: (0, import_pg_core.jsonb)("setlistdata"),
      // Raw setlist data from Phish.net
      isCompleted: (0, import_pg_core.boolean)("is_completed").default(false),
      cachedAt: (0, import_pg_core.timestamp)("cached_at").defaultNow()
    });
    cachedSongs = (0, import_pg_core.pgTable)("cached_songs", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      phishNetId: (0, import_pg_core.text)("phish_net_id").notNull().unique(),
      // Phish.net song ID
      title: (0, import_pg_core.text)("title").notNull(),
      artist: (0, import_pg_core.text)("artist").default("Phish"),
      timesPlayed: (0, import_pg_core.integer)("times_played").default(0),
      plays24Months: (0, import_pg_core.integer)("plays_24_months").default(0),
      // Plays in last 24 months
      debutDate: (0, import_pg_core.text)("debut_date"),
      lastPlayed: (0, import_pg_core.text)("last_played"),
      gap: (0, import_pg_core.integer)("gap").default(0),
      // Days since last played
      originalArtist: (0, import_pg_core.text)("original_artist"),
      category: (0, import_pg_core.text)("category"),
      // Calculated category
      rarityScore: (0, import_pg_core.integer)("rarity_score").default(0),
      // Calculated rarity
      cachedAt: (0, import_pg_core.timestamp)("cached_at").defaultNow()
    });
    cachedSetlists = (0, import_pg_core.pgTable)("cached_setlists", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      showDate: (0, import_pg_core.text)("show_date").notNull().unique(),
      setlistData: (0, import_pg_core.jsonb)("setlist_data"),
      // Complete setlist with positions
      songs: (0, import_pg_core.jsonb)("songs"),
      // Array of song names for quick access
      cachedAt: (0, import_pg_core.timestamp)("cached_at").defaultNow()
    });
    cacheMetadata = (0, import_pg_core.pgTable)("cache_metadata", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      cacheType: (0, import_pg_core.text)("cache_type").notNull().unique(),
      // 'shows', 'songs', 'setlists'
      lastRefreshed: (0, import_pg_core.timestamp)("last_refreshed").defaultNow(),
      refreshInterval: (0, import_pg_core.integer)("refresh_interval").default(3600),
      // Seconds
      isRefreshing: (0, import_pg_core.boolean)("is_refreshing").default(false),
      lastError: (0, import_pg_core.text)("last_error"),
      totalRecords: (0, import_pg_core.integer)("total_records").default(0)
    });
    draftPicks = (0, import_pg_core.pgTable)("draft_picks", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      leagueId: (0, import_pg_core.integer)("league_id").references(() => leagues.id).notNull(),
      userId: (0, import_pg_core.integer)("user_id").references(() => users.id).notNull(),
      songId: (0, import_pg_core.integer)("song_id").references(() => songs.id),
      pickNumber: (0, import_pg_core.integer)("pick_number").notNull(),
      // Overall pick number (1, 2, 3...)
      round: (0, import_pg_core.integer)("round").notNull(),
      // Round number
      timeUsed: (0, import_pg_core.integer)("time_used"),
      // Seconds used for this pick
      isAutoPick: (0, import_pg_core.boolean)("is_auto_pick").default(false),
      // True if auto-drafted due to timeout
      pickedAt: (0, import_pg_core.timestamp)("picked_at").defaultNow()
    });
    insertUserSchema = (0, import_drizzle_zod.createInsertSchema)(users).pick({
      username: true,
      email: true,
      phoneNumber: true,
      password: true,
      role: true,
      totalPoints: true
    });
    insertTourSchema = (0, import_drizzle_zod.createInsertSchema)(tours).pick({
      name: true,
      year: true,
      season: true,
      description: true,
      startDate: true,
      endDate: true
    });
    insertLeagueSchema = (0, import_drizzle_zod.createInsertSchema)(leagues).pick({
      name: true,
      description: true,
      tourId: true,
      maxPlayers: true,
      isPublic: true,
      draftRounds: true,
      pickTimeLimit: true,
      seasonStartDate: true,
      seasonEndDate: true
    });
    insertDraftedSongSchema = (0, import_drizzle_zod.createInsertSchema)(draftedSongs).pick({
      userId: true,
      leagueId: true,
      songId: true
    });
    insertDraftPickSchema = (0, import_drizzle_zod.createInsertSchema)(draftPicks).pick({
      leagueId: true,
      userId: true,
      songId: true,
      pickNumber: true,
      round: true,
      timeUsed: true,
      isAutoPick: true
    });
    insertConcertSchema = (0, import_drizzle_zod.createInsertSchema)(concerts).pick({
      tourId: true,
      date: true,
      venue: true,
      city: true,
      state: true,
      country: true,
      setlist: true
    });
    insertSongPerformanceSchema = (0, import_drizzle_zod.createInsertSchema)(songPerformances).pick({
      concertId: true,
      songId: true,
      setNumber: true,
      position: true,
      isOpener: true,
      isEncore: true,
      notes: true
    });
    insertPasswordResetTokenSchema = (0, import_drizzle_zod.createInsertSchema)(passwordResetTokens).pick({
      userId: true,
      token: true,
      expiresAt: true
    });
    insertPointAdjustmentSchema = (0, import_drizzle_zod.createInsertSchema)(pointAdjustments).pick({
      leagueId: true,
      concertId: true,
      songId: true,
      userId: true,
      originalPoints: true,
      adjustedPoints: true,
      reason: true,
      adjustedBy: true
    });
    insertLeagueInviteSchema = (0, import_drizzle_zod.createInsertSchema)(leagueInvites).pick({
      leagueId: true,
      inviteCode: true,
      createdBy: true,
      maxUses: true,
      expiresAt: true
    });
    insertCachedShowSchema = (0, import_drizzle_zod.createInsertSchema)(cachedShows).pick({
      phishNetId: true,
      showDate: true,
      venue: true,
      city: true,
      state: true,
      country: true,
      tourid: true,
      setlistdata: true,
      isCompleted: true
    });
    insertCachedSongSchema = (0, import_drizzle_zod.createInsertSchema)(cachedSongs).pick({
      phishNetId: true,
      title: true,
      artist: true,
      timesPlayed: true,
      plays24Months: true,
      debutDate: true,
      lastPlayed: true,
      gap: true,
      originalArtist: true,
      category: true,
      rarityScore: true
    });
    insertCachedSetlistSchema = (0, import_drizzle_zod.createInsertSchema)(cachedSetlists).pick({
      showDate: true,
      setlistData: true,
      songs: true
    });
    insertCacheMetadataSchema = (0, import_drizzle_zod.createInsertSchema)(cacheMetadata).pick({
      cacheType: true,
      refreshInterval: true,
      lastError: true,
      totalRecords: true
    });
  }
});

// db.ts
var db_exports = {};
__export(db_exports, {
  db: () => db,
  pool: () => pool
});
var import_serverless, import_neon_serverless, import_ws, pool, db;
var init_db = __esm({
  "db.ts"() {
    "use strict";
    import_serverless = require("@neondatabase/serverless");
    import_neon_serverless = require("drizzle-orm/neon-serverless");
    import_ws = __toESM(require("ws"));
    init_schema();
    import_serverless.neonConfig.webSocketConstructor = import_ws.default;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new import_serverless.Pool({ connectionString: process.env.DATABASE_URL });
    db = (0, import_neon_serverless.drizzle)({ client: pool, schema: schema_exports });
  }
});

// storage-db.ts
var storage_db_exports = {};
__export(storage_db_exports, {
  storage: () => storage
});
var import_drizzle_orm, storage;
var init_storage_db = __esm({
  "storage-db.ts"() {
    "use strict";
    import_drizzle_orm = require("drizzle-orm");
    init_db();
    init_schema();
    storage = {
      // ==================== USERS ====================
      async getUser(id) {
        const result = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.id, id)).limit(1);
        return result[0];
      },
      async getUserByUsername(username) {
        const result = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.username, username)).limit(1);
        return result[0];
      },
      async getUserByEmail(email) {
        const result = await db.select().from(users).where(import_drizzle_orm.sql`lower(${users.email}) = lower(${email})`).limit(1);
        return result[0];
      },
      async getUserByPhone(phoneNumber) {
        const result = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.phoneNumber, phoneNumber)).limit(1);
        return result[0];
      },
      async createUser(user) {
        const result = await db.insert(users).values(user).returning();
        return result[0];
      },
      async updateUserPoints(userId, points) {
        await db.update(users).set({ totalPoints: import_drizzle_orm.sql`${users.totalPoints} + ${points}` }).where((0, import_drizzle_orm.eq)(users.id, userId));
      },
      async updateUserPassword(userId, hashedPassword) {
        await db.update(users).set({ password: hashedPassword }).where((0, import_drizzle_orm.eq)(users.id, userId));
      },
      async updateUserProfile(userId, updates) {
        const result = await db.update(users).set(updates).where((0, import_drizzle_orm.eq)(users.id, userId)).returning();
        return result[0];
      },
      async getAllUsers() {
        return await db.select().from(users).orderBy((0, import_drizzle_orm.asc)(users.username));
      },
      async updateUserRole(userId, role) {
        const result = await db.update(users).set({ role }).where((0, import_drizzle_orm.eq)(users.id, userId)).returning();
        return result[0];
      },
      async isUserSuperAdmin(userId) {
        const user = await this.getUser(userId);
        return user?.role === "superadmin";
      },
      async isUserAdmin(userId) {
        const user = await this.getUser(userId);
        return user?.role === "admin" || user?.role === "superadmin";
      },
      async isUserLeagueAdmin(userId, leagueId) {
        const league = await this.getLeague(leagueId);
        if (league?.ownerId === userId)
          return true;
        const [member] = await db.select().from(leagueMembers).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(leagueMembers.userId, userId), (0, import_drizzle_orm.eq)(leagueMembers.leagueId, leagueId))).limit(1);
        return member?.role === "admin";
      },
      // ==================== POINT ADJUSTMENTS ====================
      async createPointAdjustment(data) {
        const [existing] = await db.select().from(pointAdjustments).where((0, import_drizzle_orm.and)(
          (0, import_drizzle_orm.eq)(pointAdjustments.leagueId, data.leagueId),
          (0, import_drizzle_orm.eq)(pointAdjustments.concertId, data.concertId),
          (0, import_drizzle_orm.eq)(pointAdjustments.songId, data.songId),
          (0, import_drizzle_orm.eq)(pointAdjustments.userId, data.userId)
        )).limit(1);
        const prevAdjusted = existing?.adjustedPoints ?? data.originalPoints;
        const delta = data.adjustedPoints - prevAdjusted;
        let record;
        if (existing) {
          const [updated] = await db.update(pointAdjustments).set({ adjustedPoints: data.adjustedPoints, reason: data.reason, adjustedBy: data.adjustedBy }).where((0, import_drizzle_orm.eq)(pointAdjustments.id, existing.id)).returning();
          record = updated;
        } else {
          const [created] = await db.insert(pointAdjustments).values(data).returning();
          record = created;
        }
        if (delta !== 0) {
          await db.update(draftedSongs).set({ points: import_drizzle_orm.sql`${draftedSongs.points} + ${delta}` }).where((0, import_drizzle_orm.and)(
            (0, import_drizzle_orm.eq)(draftedSongs.userId, data.userId),
            (0, import_drizzle_orm.eq)(draftedSongs.leagueId, data.leagueId),
            (0, import_drizzle_orm.eq)(draftedSongs.songId, data.songId)
          ));
        }
        return record;
      },
      async getPointAdjustments(leagueId, concertId) {
        const rows = concertId ? await db.select().from(pointAdjustments).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(pointAdjustments.leagueId, leagueId), (0, import_drizzle_orm.eq)(pointAdjustments.concertId, concertId))) : await db.select().from(pointAdjustments).where((0, import_drizzle_orm.eq)(pointAdjustments.leagueId, leagueId));
        if (rows.length === 0)
          return rows;
        const songIds = [...new Set(rows.map((r) => r.songId).filter(Boolean))];
        const userIds = [.../* @__PURE__ */ new Set([
          ...rows.map((r) => r.userId).filter(Boolean),
          ...rows.map((r) => r.adjustedBy).filter(Boolean)
        ])];
        const [songRows, userRows] = await Promise.all([
          songIds.length ? db.select({ id: songs.id, title: songs.title }).from(songs).where((0, import_drizzle_orm.inArray)(songs.id, songIds)) : [],
          userIds.length ? db.select({ id: users.id, username: users.username }).from(users).where((0, import_drizzle_orm.inArray)(users.id, userIds)) : []
        ]);
        const songMap = new Map(songRows.map((s) => [s.id, s]));
        const userMap = new Map(userRows.map((u) => [u.id, u]));
        return rows.map((r) => ({
          ...r,
          song: r.songId ? songMap.get(r.songId) ?? null : null,
          user: r.userId ? userMap.get(r.userId) ?? null : null,
          adjustedByUser: r.adjustedBy ? userMap.get(r.adjustedBy) ?? null : null
        }));
      },
      async deleteUser(userId) {
        await db.delete(activities).where((0, import_drizzle_orm.eq)(activities.userId, userId));
        await db.delete(passwordResetTokens).where((0, import_drizzle_orm.eq)(passwordResetTokens.userId, userId));
        await db.delete(leagueMembers).where((0, import_drizzle_orm.eq)(leagueMembers.userId, userId));
        await db.delete(draftedSongs).where((0, import_drizzle_orm.eq)(draftedSongs.userId, userId));
        await db.delete(draftPicks).where((0, import_drizzle_orm.eq)(draftPicks.userId, userId));
        await db.delete(leagueInvites).where((0, import_drizzle_orm.eq)(leagueInvites.createdBy, userId));
        await db.delete(users).where((0, import_drizzle_orm.eq)(users.id, userId));
      },
      // ==================== PASSWORD RESET ====================
      async createPasswordResetToken(data) {
        const result = await db.insert(passwordResetTokens).values(data).returning();
        return result[0];
      },
      async getPasswordResetToken(token) {
        const result = await db.select().from(passwordResetTokens).where((0, import_drizzle_orm.eq)(passwordResetTokens.token, token)).limit(1);
        return result[0];
      },
      async markTokenAsUsed(tokenId) {
        await db.update(passwordResetTokens).set({ used: true }).where((0, import_drizzle_orm.eq)(passwordResetTokens.id, tokenId));
      },
      // ==================== PHONE VERIFICATION ====================
      async createPhoneVerificationCode(data) {
        const result = await db.insert(phoneVerificationCodes).values(data).returning();
        return result[0];
      },
      async getValidPhoneVerificationCode(phoneNumber, code) {
        const result = await db.select().from(phoneVerificationCodes).where(
          (0, import_drizzle_orm.and)(
            (0, import_drizzle_orm.eq)(phoneVerificationCodes.phoneNumber, phoneNumber),
            (0, import_drizzle_orm.eq)(phoneVerificationCodes.code, code),
            (0, import_drizzle_orm.eq)(phoneVerificationCodes.used, false)
          )
        ).limit(1);
        return result[0];
      },
      async markPhoneVerificationCodeUsed(codeId) {
        await db.update(phoneVerificationCodes).set({ used: true }).where((0, import_drizzle_orm.eq)(phoneVerificationCodes.id, codeId));
      },
      // ==================== TOURS ====================
      async getTours() {
        return await db.select().from(tours).orderBy((0, import_drizzle_orm.desc)(tours.createdAt));
      },
      async getActiveTour() {
        const result = await db.select().from(tours).where((0, import_drizzle_orm.eq)(tours.isActive, true)).limit(1);
        return result[0];
      },
      async getTour(id) {
        const result = await db.select().from(tours).where((0, import_drizzle_orm.eq)(tours.id, id)).limit(1);
        return result[0];
      },
      async createTour(tour) {
        const result = await db.insert(tours).values(tour).returning();
        return result[0];
      },
      async updateTour(id, updates) {
        const result = await db.update(tours).set(updates).where((0, import_drizzle_orm.eq)(tours.id, id)).returning();
        return result[0];
      },
      // ==================== LEAGUES ====================
      async getLeague(id) {
        const result = await db.select().from(leagues).where((0, import_drizzle_orm.eq)(leagues.id, id)).limit(1);
        return result[0];
      },
      async getAllLeagues() {
        return await db.select().from(leagues).orderBy((0, import_drizzle_orm.desc)(leagues.createdAt));
      },
      async createLeague(league) {
        const result = await db.insert(leagues).values(league).returning();
        const newLeague = result[0];
        await this.joinLeague(league.ownerId, newLeague.id);
        return newLeague;
      },
      async updateLeague(id, updates) {
        const result = await db.update(leagues).set(updates).where((0, import_drizzle_orm.eq)(leagues.id, id)).returning();
        return result[0];
      },
      async deleteLeague(id) {
        await db.delete(leagueInvites).where((0, import_drizzle_orm.eq)(leagueInvites.leagueId, id));
        await db.delete(draftPicks).where((0, import_drizzle_orm.eq)(draftPicks.leagueId, id));
        await db.delete(draftedSongs).where((0, import_drizzle_orm.eq)(draftedSongs.leagueId, id));
        await db.delete(leagueMembers).where((0, import_drizzle_orm.eq)(leagueMembers.leagueId, id));
        await db.delete(pointAdjustments).where((0, import_drizzle_orm.eq)(pointAdjustments.leagueId, id));
        await db.delete(leagues).where((0, import_drizzle_orm.eq)(leagues.id, id));
      },
      async getUserLeagues(userId) {
        const memberRows = await db.select().from(leagueMembers).where((0, import_drizzle_orm.eq)(leagueMembers.userId, userId));
        const leagueIds = memberRows.map((m) => m.leagueId);
        if (leagueIds.length === 0)
          return [];
        return await db.select().from(leagues).where((0, import_drizzle_orm.inArray)(leagues.id, leagueIds));
      },
      async getPublicLeagues(tourId) {
        if (tourId) {
          return await db.select().from(leagues).where(
            (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(leagues.isPublic, true), (0, import_drizzle_orm.eq)(leagues.tourId, tourId))
          );
        }
        return await db.select().from(leagues).where((0, import_drizzle_orm.eq)(leagues.isPublic, true));
      },
      async getTourLeagues(tourId) {
        return await db.select().from(leagues).where((0, import_drizzle_orm.eq)(leagues.tourId, tourId));
      },
      async joinLeague(userId, leagueId) {
        const existing = await db.select().from(leagueMembers).where(
          (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(leagueMembers.userId, userId), (0, import_drizzle_orm.eq)(leagueMembers.leagueId, leagueId))
        ).limit(1);
        if (existing.length === 0) {
          await db.insert(leagueMembers).values({ userId, leagueId });
        }
      },
      async getLeagueMembers(leagueId) {
        const members = await db.select().from(leagueMembers).where((0, import_drizzle_orm.eq)(leagueMembers.leagueId, leagueId));
        const result = [];
        for (const member of members) {
          const user = await this.getUser(member.userId);
          if (user)
            result.push({ ...member, user });
        }
        return result;
      },
      async joinLeagueByInvite(inviteCode, userId) {
        const invite = await db.select().from(leagueInvites).where(
          (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(leagueInvites.inviteCode, inviteCode), (0, import_drizzle_orm.eq)(leagueInvites.isActive, true))
        ).limit(1);
        if (!invite[0])
          return false;
        if (invite[0].maxUses !== null && (invite[0].currentUses ?? 0) >= invite[0].maxUses) {
          return false;
        }
        await this.joinLeague(userId, invite[0].leagueId);
        await db.update(leagueInvites).set({ currentUses: import_drizzle_orm.sql`${leagueInvites.currentUses} + 1` }).where((0, import_drizzle_orm.eq)(leagueInvites.id, invite[0].id));
        return true;
      },
      // ==================== DRAFT ====================
      async scheduleDraft(leagueId, draftDate, draftRounds, pickTimeLimit) {
        await db.update(leagues).set({ draftDate, draftRounds, pickTimeLimit, draftStatus: "scheduled" }).where((0, import_drizzle_orm.eq)(leagues.id, leagueId));
      },
      async startDraft(leagueId) {
        const league = await this.getLeague(leagueId);
        const members = await this.getDraftOrder(leagueId);
        const firstPlayer = members[0]?.userId ?? null;
        const pickDeadline = firstPlayer ? new Date(Date.now() + (league?.pickTimeLimit ?? 90) * 1e3) : null;
        await db.update(leagues).set({
          draftStatus: "active",
          currentPick: 1,
          currentRound: 1,
          currentPlayer: firstPlayer,
          pickDeadline
        }).where((0, import_drizzle_orm.eq)(leagues.id, leagueId));
      },
      async getDraftStatus(leagueId) {
        return await this.getLeague(leagueId);
      },
      // Songs played in the last year that are not yet drafted in this league,
      // ordered by times played descending (most popular first for a fair auto-pick).
      async getAvailableSongsPlayedLastYear(leagueId) {
        const oneYearAgo = /* @__PURE__ */ new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const cutoff = oneYearAgo.toISOString().split("T")[0];
        const draftedIds = await this.getDraftedSongIdsForLeague(leagueId);
        const candidates = await db.select().from(cachedSongs).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.isNotNull)(cachedSongs.lastPlayed), (0, import_drizzle_orm.gte)(cachedSongs.lastPlayed, cutoff))).orderBy((0, import_drizzle_orm.desc)(cachedSongs.timesPlayed));
        const available = [];
        for (const cs of candidates) {
          await db.insert(songs).values({
            title: cs.title,
            category: cs.category,
            rarityScore: cs.rarityScore ?? 0,
            totalPlays: cs.timesPlayed ?? 0,
            plays24Months: cs.plays24Months ?? 0
          }).onConflictDoNothing();
          const [song] = await db.select().from(songs).where((0, import_drizzle_orm.eq)(songs.title, cs.title)).limit(1);
          if (!song)
            continue;
          if (draftedIds.includes(cs.id))
            continue;
          available.push({ id: song.id, title: song.title });
        }
        return available;
      },
      async getDraftOrder(leagueId) {
        const allMembers = await db.select().from(leagueMembers).where((0, import_drizzle_orm.eq)(leagueMembers.leagueId, leagueId)).orderBy((0, import_drizzle_orm.asc)(leagueMembers.draftPosition));
        const hasPositions = allMembers.some((m) => m.draftPosition !== null);
        const ordered = hasPositions ? allMembers.filter((m) => m.draftPosition !== null) : allMembers;
        const result = [];
        for (const member of ordered) {
          const user = await this.getUser(member.userId);
          if (user)
            result.push({ ...member, user });
        }
        return result;
      },
      async setDraftOrder(leagueId, userIds) {
        for (let i = 0; i < userIds.length; i++) {
          await db.update(leagueMembers).set({ draftPosition: i + 1 }).where((0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(leagueMembers.leagueId, leagueId), (0, import_drizzle_orm.eq)(leagueMembers.userId, userIds[i])));
        }
      },
      async getDraftPicks(leagueId) {
        const picks = await db.select().from(draftPicks).where((0, import_drizzle_orm.eq)(draftPicks.leagueId, leagueId)).orderBy((0, import_drizzle_orm.asc)(draftPicks.pickNumber));
        return Promise.all(picks.map(async (pick) => {
          const [song] = pick.songId ? await db.select().from(songs).where((0, import_drizzle_orm.eq)(songs.id, pick.songId)).limit(1) : [];
          const user = pick.userId ? await this.getUser(pick.userId) : null;
          return { ...pick, song: song ?? null, user: user ?? null };
        }));
      },
      async makeDraftPick(leagueId, userId, songId, timeUsed) {
        const league = await this.getLeague(leagueId);
        if (!league)
          throw new Error("League not found");
        const cachedSong = await db.select().from(cachedSongs).where((0, import_drizzle_orm.eq)(cachedSongs.id, songId)).limit(1);
        if (cachedSong[0]) {
          await db.insert(songs).values({
            title: cachedSong[0].title,
            category: cachedSong[0].category,
            rarityScore: cachedSong[0].rarityScore ?? 0,
            totalPlays: cachedSong[0].timesPlayed ?? 0,
            plays24Months: cachedSong[0].plays24Months ?? 0
          }).onConflictDoNothing();
        }
        const songInDb = await db.select().from(songs).where((0, import_drizzle_orm.eq)(songs.title, cachedSong[0]?.title ?? "")).limit(1);
        const realSongId = songInDb[0]?.id ?? songId;
        const pick = await db.insert(draftPicks).values({
          leagueId,
          userId,
          songId: realSongId,
          pickNumber: league.currentPick ?? 1,
          round: league.currentRound ?? 1,
          timeUsed
        }).returning();
        await db.insert(draftedSongs).values({
          userId,
          leagueId,
          songId: realSongId,
          draftRound: league.currentRound ?? 1,
          draftPick: league.currentPick ?? 1
        });
        const members = await this.getDraftOrder(leagueId);
        const N = members.length;
        const newPick = (league.currentPick ?? 1) + 1;
        const newRound = Math.ceil(newPick / N);
        const posWithinRound = (newPick - 1) % N;
        const nextIdx = newRound % 2 === 1 ? posWithinRound : N - 1 - posWithinRound;
        const totalPicks = N * (league.draftRounds ?? 10);
        const nextPlayer = newPick > totalPicks ? null : members[nextIdx]?.userId ?? null;
        const isDraftComplete = !nextPlayer;
        const newPickDeadline = nextPlayer ? new Date(Date.now() + (league.pickTimeLimit ?? 90) * 1e3) : null;
        await db.update(leagues).set({
          currentPick: newPick,
          currentRound: newRound,
          currentPlayer: nextPlayer,
          pickDeadline: newPickDeadline,
          ...isDraftComplete ? { draftStatus: "completed" } : {}
        }).where((0, import_drizzle_orm.eq)(leagues.id, leagueId));
        return pick[0];
      },
      // songId here is cachedSongs.id (what the /api/songs endpoint returns).
      // draftedSongs stores the songs-table id (realSongId from makeDraftPick).
      // We resolve through title to bridge the two namespaces.
      async isSongDraftedInLeague(songId, leagueId) {
        const [cached] = await db.select({ title: cachedSongs.title }).from(cachedSongs).where((0, import_drizzle_orm.eq)(cachedSongs.id, songId)).limit(1);
        if (!cached)
          return false;
        const [song] = await db.select({ id: songs.id }).from(songs).where((0, import_drizzle_orm.eq)(songs.title, cached.title)).limit(1);
        if (!song)
          return false;
        const result = await db.select().from(draftedSongs).where(
          (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(draftedSongs.songId, song.id), (0, import_drizzle_orm.eq)(draftedSongs.leagueId, leagueId))
        ).limit(1);
        return result.length > 0;
      },
      // Returns cachedSongs IDs for all songs drafted in this league,
      // so that /api/songs can filter the list correctly.
      async getDraftedSongIdsForLeague(leagueId) {
        const drafted = await db.select({ songId: draftedSongs.songId }).from(draftedSongs).where((0, import_drizzle_orm.eq)(draftedSongs.leagueId, leagueId));
        if (drafted.length === 0)
          return [];
        const songIds = drafted.map((d) => d.songId).filter(Boolean);
        const songTitles = await db.select({ title: songs.title }).from(songs).where((0, import_drizzle_orm.inArray)(songs.id, songIds));
        const titleSet = new Set(songTitles.map((s) => s.title.toLowerCase()));
        const allCached = await db.select({ id: cachedSongs.id, title: cachedSongs.title }).from(cachedSongs);
        return allCached.filter((cs) => titleSet.has(cs.title.toLowerCase())).map((cs) => cs.id);
      },
      // ==================== SONGS ====================
      async getAllSongs() {
        return await db.select().from(songs).orderBy((0, import_drizzle_orm.asc)(songs.title));
      },
      async getSong(id) {
        const result = await db.select().from(songs).where((0, import_drizzle_orm.eq)(songs.id, id)).limit(1);
        return result[0];
      },
      async getSongByTitle(title) {
        const result = await db.select().from(songs).where((0, import_drizzle_orm.eq)(songs.title, title)).limit(1);
        return result[0];
      },
      async createSong(title, category) {
        const result = await db.insert(songs).values({ title, category }).returning();
        return result[0];
      },
      async updateSongStats(songId, rarityScore, lastPlayed) {
        await db.update(songs).set({
          rarityScore,
          lastPlayed,
          totalPlays: import_drizzle_orm.sql`${songs.totalPlays} + 1`
        }).where((0, import_drizzle_orm.eq)(songs.id, songId));
      },
      // ==================== DRAFTED SONGS ====================
      async getDraftedSongs(userId, leagueId) {
        const drafts = await db.select().from(draftedSongs).where(
          (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(draftedSongs.userId, userId), (0, import_drizzle_orm.eq)(draftedSongs.leagueId, leagueId))
        );
        const result = [];
        for (const draft of drafts) {
          const song = await this.getSong(draft.songId);
          if (song)
            result.push({ ...draft, song });
        }
        return result;
      },
      async draftSong(draft) {
        const result = await db.insert(draftedSongs).values(draft).returning();
        return result[0];
      },
      async updateDraftedSongPoints(id, points) {
        await db.update(draftedSongs).set({ points: import_drizzle_orm.sql`${draftedSongs.points} + ${points}` }).where((0, import_drizzle_orm.eq)(draftedSongs.id, id));
      },
      async updateDraftedSongStats(id, playedCount, openerCount, encoreCount) {
        await db.update(draftedSongs).set({ playedCount, openerCount, encoreCount }).where((0, import_drizzle_orm.eq)(draftedSongs.id, id));
      },
      // ==================== CONCERTS ====================
      async getConcerts() {
        return await db.select().from(concerts).orderBy((0, import_drizzle_orm.desc)(concerts.date));
      },
      async getUpcomingConcerts() {
        return await db.select().from(concerts).where((0, import_drizzle_orm.eq)(concerts.isCompleted, false)).orderBy((0, import_drizzle_orm.asc)(concerts.date));
      },
      async createConcert(concert) {
        const result = await db.insert(concerts).values(concert).returning();
        return result[0];
      },
      async updateConcertSetlist(concertId, setlist) {
        await db.update(concerts).set({ setlist }).where((0, import_drizzle_orm.eq)(concerts.id, concertId));
      },
      // ==================== SONG PERFORMANCES ====================
      async createSongPerformance(performance) {
        const result = await db.insert(songPerformances).values(performance).returning();
        const song = await this.getSong(performance.songId);
        return { ...result[0], song };
      },
      async getConcertPerformances(concertId) {
        const perfs = await db.select().from(songPerformances).where((0, import_drizzle_orm.eq)(songPerformances.concertId, concertId));
        const result = [];
        for (const perf of perfs) {
          const song = await this.getSong(perf.songId);
          if (song)
            result.push({ ...perf, song });
        }
        return result;
      },
      async calculateAndUpdatePoints(concertId) {
        const performances = await this.getConcertPerformances(concertId);
        for (const perf of performances) {
          let points = 1;
          if (perf.isOpener)
            points += 1;
          if (perf.isEncore)
            points += 1;
          const drafts = await db.select().from(draftedSongs).where((0, import_drizzle_orm.eq)(draftedSongs.songId, perf.songId));
          for (const draft of drafts) {
            await this.updateDraftedSongPoints(draft.id, points);
            await this.updateUserPoints(draft.userId, points);
          }
        }
      },
      // Score every phish.in show in the league's season window against
      // drafted songs, and persist the totals to draftedSongs.points.
      // Safe to call multiple times — resets then recalculates each run.
      async scoreLeague(leagueId) {
        const league = await this.getLeague(leagueId);
        if (!league)
          throw new Error("League not found");
        const seasonStartStr = league.seasonStartDate ? new Date(league.seasonStartDate).toISOString().split("T")[0] : null;
        const seasonEndStr = league.seasonEndDate ? new Date(league.seasonEndDate).toISOString().split("T")[0] : null;
        const allShows = await this.getCachedShows();
        const shows = allShows.filter((s) => {
          const d = new Date(s.showDate).toISOString().split("T")[0];
          if (seasonStartStr && d < seasonStartStr)
            return false;
          if (seasonEndStr && d > seasonEndStr)
            return false;
          return true;
        });
        const drafted = await db.select().from(draftedSongs).where((0, import_drizzle_orm.eq)(draftedSongs.leagueId, leagueId));
        await db.update(draftedSongs).set({ points: 0 }).where((0, import_drizzle_orm.eq)(draftedSongs.leagueId, leagueId));
        const draftSongIds = [...new Set(drafted.map((d) => d.songId).filter(Boolean))];
        const draftSongRows = draftSongIds.length ? await db.select({ id: songs.id, title: songs.title }).from(songs).where((0, import_drizzle_orm.inArray)(songs.id, draftSongIds)) : [];
        const songIdToTitle = new Map(draftSongRows.map((s) => [s.id, s.title]));
        const missingSongIds = draftSongIds.filter((id) => !songIdToTitle.has(id));
        if (missingSongIds.length > 0) {
          const cachedRows = await db.select({ id: cachedSongs.id, title: cachedSongs.title }).from(cachedSongs).where((0, import_drizzle_orm.inArray)(cachedSongs.id, missingSongIds));
          for (const r of cachedRows)
            songIdToTitle.set(r.id, r.title);
        }
        const titleMap = {};
        for (const d of drafted) {
          if (!d.songId)
            continue;
          const title = songIdToTitle.get(d.songId);
          if (!title)
            continue;
          const key = title.toLowerCase();
          if (!titleMap[key])
            titleMap[key] = [];
          titleMap[key].push(d);
        }
        const BATCH = 8;
        const showDates = shows.map((s) => new Date(s.showDate).toISOString().split("T")[0]);
        const fetchedSetlists = [];
        for (let i = 0; i < showDates.length; i += BATCH) {
          const chunk = showDates.slice(i, i + BATCH);
          const results = await Promise.all(chunk.map(async (showDate) => {
            try {
              const res = await fetch(`https://phish.in/api/v2/shows/${showDate}`, {
                headers: { Accept: "application/json" }
              });
              if (!res.ok)
                return null;
              const data = await res.json();
              const tracks = data.tracks || [];
              return tracks.length > 0 ? { showDate, tracks } : null;
            } catch {
              return null;
            }
          }));
          fetchedSetlists.push(...results);
        }
        const pointDeltas = /* @__PURE__ */ new Map();
        let totalPoints = 0;
        let showsScored = 0;
        const setlistsToCache = [];
        for (const result of fetchedSetlists) {
          if (!result)
            continue;
          const { showDate, tracks: rawTracks } = result;
          const firstPosBySet = {};
          for (const t of rawTracks) {
            const s = t.set_name || "Set 1";
            if (!(s in firstPosBySet) || t.position < firstPosBySet[s])
              firstPosBySet[s] = t.position;
          }
          for (const t of rawTracks) {
            const title = (t.title || "").toLowerCase();
            const entries = titleMap[title];
            if (!entries || entries.length === 0)
              continue;
            const setKey = t.set_name || "Set 1";
            const isEncore = setKey.toLowerCase().includes("encore");
            const isSetOpener = !isEncore && t.position === firstPosBySet[setKey];
            const durationSecs = t.duration ? Math.round(t.duration / 1e3) : 0;
            const mins = durationSecs / 60;
            let pts = 1;
            if (isSetOpener)
              pts += 1;
            if (isEncore)
              pts += 1;
            if (mins >= 20)
              pts += 1;
            if (mins >= 30)
              pts += 1;
            if (mins >= 40)
              pts += 1;
            for (const entry of entries) {
              pointDeltas.set(entry.id, (pointDeltas.get(entry.id) ?? 0) + pts);
              totalPoints += pts;
            }
          }
          showsScored++;
          setlistsToCache.push({ showDate, tracks: rawTracks });
        }
        console.log(`[scoreLeague] league=${leagueId} shows=${showsScored} totalPts=${totalPoints} entries=${pointDeltas.size}`);
        const userPtsLog = {};
        const unmappedSongIds = [];
        for (const d of drafted) {
          if (!d.userId)
            continue;
          userPtsLog[d.userId] = (userPtsLog[d.userId] ?? 0) + (pointDeltas.get(d.id) ?? 0);
          if (d.songId && !songIdToTitle.has(d.songId))
            unmappedSongIds.push(d.songId);
        }
        console.log(`[scoreLeague] per-user points:`, JSON.stringify(userPtsLog));
        if (unmappedSongIds.length)
          console.log(`[scoreLeague] unmapped songIds:`, unmappedSongIds);
        for (const [entryId, delta] of pointDeltas) {
          await db.update(draftedSongs).set({ points: delta }).where((0, import_drizzle_orm.eq)(draftedSongs.id, entryId));
        }
        for (const { showDate, tracks } of setlistsToCache) {
          try {
            const trackTitles = tracks.map((t) => t.title || "");
            await db.insert(cachedSetlists).values({ showDate, setlistData: tracks, songs: trackTitles }).onConflictDoUpdate({
              target: cachedSetlists.showDate,
              set: { setlistData: tracks, songs: trackTitles, cachedAt: /* @__PURE__ */ new Date() }
            });
          } catch {
          }
        }
        const adjustments = await db.select().from(pointAdjustments).where((0, import_drizzle_orm.eq)(pointAdjustments.leagueId, leagueId));
        const adjsApplied = [];
        const adjUserIds = [...new Set(adjustments.map((a) => a.userId).filter(Boolean))];
        const adjUserRows = adjUserIds.length ? await db.select({ id: users.id, username: users.username }).from(users).where((0, import_drizzle_orm.inArray)(users.id, adjUserIds)) : [];
        const adjUsernameMap = new Map(adjUserRows.map((u) => [u.id, u.username]));
        for (const adj of adjustments) {
          if (!adj.userId)
            continue;
          const adjTitle = songIdToTitle.get(adj.songId);
          if (!adjTitle) {
            console.log(`[scoreLeague] adjustment id=${adj.id} skipped \u2014 songId=${adj.songId} not in title map`);
            continue;
          }
          const userEntries = (titleMap[adjTitle.toLowerCase()] || []).filter((e) => e.userId === adj.userId);
          for (const entry of userEntries) {
            const basePoints = pointDeltas.get(entry.id) ?? 0;
            await db.update(draftedSongs).set({ points: adj.adjustedPoints }).where((0, import_drizzle_orm.eq)(draftedSongs.id, entry.id));
            adjsApplied.push({
              username: adjUsernameMap.get(adj.userId) ?? `user#${adj.userId}`,
              song: adjTitle,
              base: basePoints,
              override: adj.adjustedPoints
            });
            console.log(`[scoreLeague] adj id=${adj.id} user=${adj.userId} song="${adjTitle}" base=${basePoints} \u2192 override=${adj.adjustedPoints}`);
          }
        }
        const scoredUserIds = Object.keys(userPtsLog).map(Number);
        const usernameRows = scoredUserIds.length ? await db.select({ id: users.id, username: users.username }).from(users).where((0, import_drizzle_orm.inArray)(users.id, scoredUserIds)) : [];
        const usernameMap = new Map(usernameRows.map((u) => [u.id, u.username]));
        const perUser = Object.fromEntries(
          scoredUserIds.map((uid) => [usernameMap.get(uid) ?? `user#${uid}`, userPtsLog[uid]])
        );
        return { shows: showsScored, points: totalPoints, perUser, unmappedSongIds, adjustmentsApplied: adjsApplied };
      },
      // ==================== ACTIVITIES ====================
      async getUserActivities(userId, leagueId) {
        if (leagueId) {
          return await db.select().from(activities).where(
            (0, import_drizzle_orm.and)((0, import_drizzle_orm.eq)(activities.userId, userId), (0, import_drizzle_orm.eq)(activities.leagueId, leagueId))
          ).orderBy((0, import_drizzle_orm.desc)(activities.createdAt)).limit(20);
        }
        return await db.select().from(activities).where((0, import_drizzle_orm.eq)(activities.userId, userId)).orderBy((0, import_drizzle_orm.desc)(activities.createdAt)).limit(20);
      },
      async createActivity(userId, leagueId, type, description, points) {
        const result = await db.insert(activities).values({ userId, leagueId, type, description, points: points ?? 0 }).returning();
        return result[0];
      },
      // ==================== LEADERBOARD ====================
      async getLeagueStandings(leagueId) {
        const [members, allDrafts, league] = await Promise.all([
          this.getLeagueMembers(leagueId),
          db.select().from(draftedSongs).where((0, import_drizzle_orm.eq)(draftedSongs.leagueId, leagueId)),
          this.getLeague(leagueId)
        ]);
        const draftsByUser = /* @__PURE__ */ new Map();
        for (const d of allDrafts) {
          if (!d.userId)
            continue;
          if (!draftsByUser.has(d.userId))
            draftsByUser.set(d.userId, []);
          draftsByUser.get(d.userId).push(d);
        }
        const standingSongIds = [...new Set(allDrafts.map((d) => d.songId).filter(Boolean))];
        const standingSongRows = standingSongIds.length ? await db.select({ id: songs.id, title: songs.title }).from(songs).where((0, import_drizzle_orm.inArray)(songs.id, standingSongIds)) : [];
        const standingSongTitleById = new Map(standingSongRows.map((s) => [s.id, s.title]));
        const standingMissingIds = standingSongIds.filter((id) => !standingSongTitleById.has(id));
        if (standingMissingIds.length > 0) {
          const cachedRows = await db.select({ id: cachedSongs.id, title: cachedSongs.title }).from(cachedSongs).where((0, import_drizzle_orm.inArray)(cachedSongs.id, standingMissingIds));
          for (const r of cachedRows)
            standingSongTitleById.set(r.id, r.title);
        }
        const seasonStartStr = league?.seasonStartDate ? new Date(league.seasonStartDate).toISOString().split("T")[0] : null;
        const seasonEndStr = league?.seasonEndDate ? new Date(league.seasonEndDate).toISOString().split("T")[0] : null;
        const allCachedShows = await this.getCachedShows();
        console.log(`[standings] league=${leagueId} season=${seasonStartStr}..${seasonEndStr} allShows=${allCachedShows.length}`);
        const recentShow = allCachedShows.filter((s) => {
          const d = new Date(s.showDate).toISOString().split("T")[0];
          if (seasonStartStr && d < seasonStartStr)
            return false;
          if (seasonEndStr && d > seasonEndStr)
            return false;
          return true;
        }).sort((a, b) => new Date(b.showDate).getTime() - new Date(a.showDate).getTime())[0];
        console.log(`[standings] recentShow=${recentShow ? new Date(recentShow.showDate).toISOString().split("T")[0] : "none"}`);
        const todayPointsByUser = /* @__PURE__ */ new Map();
        let lastShowDate = null;
        if (recentShow) {
          lastShowDate = new Date(recentShow.showDate).toISOString().split("T")[0];
          let tracks = null;
          const cachedSetlist = await this.getCachedSetlist(lastShowDate);
          console.log(`[standings] cachedSetlist for ${lastShowDate}: ${cachedSetlist ? `found, tracks=${cachedSetlist.setlistData?.length ?? 0}` : "not found"}`);
          if (cachedSetlist?.setlistData) {
            tracks = cachedSetlist.setlistData;
          } else {
            try {
              const res = await fetch(`https://phish.in/api/v2/shows/${lastShowDate}`, {
                headers: { Accept: "application/json" }
              });
              console.log(`[standings] live fetch ${lastShowDate}: status=${res.status}`);
              if (res.ok) {
                const data = await res.json();
                tracks = data.tracks?.length > 0 ? data.tracks : null;
                console.log(`[standings] live fetch tracks=${tracks?.length ?? 0}`);
                if (tracks) {
                  const trackTitles = tracks.map((t) => t.title || "");
                  await db.insert(cachedSetlists).values({ showDate: lastShowDate, setlistData: tracks, songs: trackTitles }).onConflictDoUpdate({
                    target: cachedSetlists.showDate,
                    set: { setlistData: tracks, songs: trackTitles, cachedAt: /* @__PURE__ */ new Date() }
                  });
                }
              }
            } catch (e) {
              console.log(`[standings] live fetch error:`, e);
            }
          }
          if (tracks) {
            console.log(`[standings] computing lastShowPts from ${tracks.length} tracks, draftsByUser size=${draftsByUser.size}`);
            const firstPosBySet = {};
            for (const t of tracks) {
              const s = t.set_name || "Set 1";
              if (!(s in firstPosBySet) || t.position < firstPosBySet[s])
                firstPosBySet[s] = t.position;
            }
            const trackPtsMap = {};
            for (const t of tracks) {
              const title = (t.title || "").toLowerCase();
              const setKey = t.set_name || "Set 1";
              const isEncore = setKey.toLowerCase().includes("encore");
              const isSetOpener = !isEncore && t.position === firstPosBySet[setKey];
              const mins = t.duration ? Math.round(t.duration / 1e3) / 60 : 0;
              let pts = 1;
              if (isSetOpener)
                pts += 1;
              if (isEncore)
                pts += 1;
              if (mins >= 20)
                pts += 1;
              if (mins >= 30)
                pts += 1;
              if (mins >= 40)
                pts += 1;
              trackPtsMap[title] = (trackPtsMap[title] ?? 0) + pts;
            }
            console.log(`[standings] trackPtsMap keys (played):`, Object.keys(trackPtsMap).join(", "));
            for (const [userId, drafts] of draftsByUser) {
              let userLastShowPts = 0;
              for (const d of drafts) {
                if (!d.songId)
                  continue;
                const title = (standingSongTitleById.get(d.songId) || "").toLowerCase();
                const pts = trackPtsMap[title] ?? 0;
                if (pts > 0)
                  console.log(`[standings] user=${userId} song="${title}" lastShowPts=${pts}`);
                userLastShowPts += pts;
              }
              todayPointsByUser.set(userId, userLastShowPts);
            }
            console.log(`[standings] todayPointsByUser:`, Object.fromEntries(todayPointsByUser));
          }
        }
        const standings = [];
        for (const member of members) {
          if (!member.userId)
            continue;
          const drafts = draftsByUser.get(member.userId) || [];
          if (drafts.length === 0)
            continue;
          const draftedPointsSum = drafts.reduce((sum, d) => sum + (d.points ?? 0), 0);
          const totalPoints = draftedPointsSum > 0 ? draftedPointsSum : member.user?.totalPoints ?? 0;
          standings.push({
            ...member.user,
            totalPoints,
            rank: 0,
            todayPoints: todayPointsByUser.get(member.userId) ?? 0,
            lastShowDate,
            songCount: drafts.length
          });
        }
        standings.sort((a, b) => b.totalPoints - a.totalPoints);
        standings.forEach((s, i) => s.rank = i + 1);
        return standings;
      },
      // ==================== CACHED SONGS ====================
      async getCachedSongs(forceRefresh = false) {
        return await db.select().from(cachedSongs).orderBy((0, import_drizzle_orm.asc)(cachedSongs.title));
      },
      async getCachedShows(forceRefresh = false) {
        return await db.select().from(cachedShows).orderBy((0, import_drizzle_orm.desc)(cachedShows.showDate));
      },
      async getCachedSetlist(showDate) {
        const result = await db.select().from(cachedSetlists).where((0, import_drizzle_orm.eq)(cachedSetlists.showDate, showDate)).limit(1);
        return result[0];
      }
    };
  }
});

// services/phish-api.ts
var SONGS_CACHE_DURATION, PhishNetService, phishApi;
var init_phish_api = __esm({
  "services/phish-api.ts"() {
    "use strict";
    SONGS_CACHE_DURATION = 60 * 60 * 1e3;
    PhishNetService = class {
      constructor() {
        this.phishInUrl = "https://phish.in/api/v2";
        this.phishNetUrl = "https://api.phish.net/v5";
        this.apiKey = process.env.PHISH_NET_API_KEY || process.env.PHISH_API_KEY || "6F27E04F96EAC8C2C21B";
        console.log(`Phish.net API initialized with key: ${this.apiKey ? "PRESENT" : "MISSING"}`);
        console.log(`Using API key: ${this.apiKey.substring(0, 8)}...`);
      }
      async getUpcomingShows() {
        return this.getUpcomingShowsPhishNet();
      }
      async getUpcomingShowsPhishNet() {
        try {
          const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
          const response = await fetch(
            `${this.phishNetUrl}/shows/showyear/${currentYear}.json?apikey=${this.apiKey}&order_by=showdate&direction=asc`
          );
          if (!response.ok)
            throw new Error(`Phish.net API error: ${response.statusText}`);
          const data = await response.json();
          const shows = data.data || [];
          const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          return shows.filter((show) => show.showdate >= todayStr);
        } catch (error) {
          console.error("Error fetching upcoming shows from Phish.net:", error);
          return [];
        }
      }
      async getRecentShows(limit = 20) {
        try {
          const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
          const response = await fetch(
            `${this.phishNetUrl}/shows/showyear/${currentYear}.json?apikey=${this.apiKey}&order_by=showdate&direction=desc`
          );
          if (!response.ok)
            throw new Error(`Phish.net API error: ${response.statusText}`);
          const data = await response.json();
          const shows = data.data || [];
          const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          return shows.filter((show) => show.showdate < todayStr).slice(0, limit).map((show) => ({
            showid: show.showid,
            showdate: show.showdate,
            venue: show.venue || "Unknown Venue",
            city: show.city || "Unknown City",
            state: show.state || null,
            country: show.country || "USA"
          }));
        } catch (error) {
          console.error("Error fetching recent shows from Phish.net:", error);
          return [];
        }
      }
      async getShowsByYear(year) {
        try {
          const response = await fetch(
            `${this.phishNetUrl}/shows/showyear/${year}.json?apikey=${this.apiKey}&order_by=showdate&direction=asc`
          );
          if (!response.ok)
            throw new Error(`Phish.net API error: ${response.statusText}`);
          const data = await response.json();
          return (data.data || []).map((show) => ({
            showid: show.showid,
            showdate: show.showdate,
            venue: show.venue || "Unknown Venue",
            city: show.city || "Unknown City",
            state: show.state || null,
            country: show.country || "USA",
            tourid: show.tourid || null
          }));
        } catch (error) {
          console.error(`Error fetching shows for year ${year} from Phish.net:`, error);
          return [];
        }
      }
      async getShowsLast24Months() {
        try {
          const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
          const years = [currentYear, currentYear - 1, currentYear - 2];
          const allShows = [];
          for (const year of years) {
            const shows = await this.getShowsByYear(year);
            allShows.push(...shows);
          }
          const twentyFourMonthsAgo = /* @__PURE__ */ new Date();
          twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);
          return allShows.filter(
            (show) => new Date(show.showdate) >= twentyFourMonthsAgo && new Date(show.showdate) <= /* @__PURE__ */ new Date()
          );
        } catch (error) {
          console.error("Error fetching last 24 months of shows:", error);
          return [];
        }
      }
      async getSetlist(showDate) {
        try {
          const response = await fetch(
            `${this.phishInUrl}/shows/${showDate}`,
            { headers: { "Accept": "application/json" } }
          );
          if (!response.ok)
            throw new Error(`Phish.in API error: ${response.statusText}`);
          const data = await response.json();
          const tracks = [];
          for (const track of data.tracks || []) {
            tracks.push({
              song: track.title,
              duration: track.duration,
              // duration in seconds
              position: track.position,
              set: track.set_name,
              isEncore: track.set_name?.toLowerCase().includes("encore")
            });
          }
          return tracks;
        } catch (error) {
          console.error("Error fetching setlist from Phish.in, trying Phish.net:", error);
          return this.getSetlistPhishNet(showDate);
        }
      }
      async getSetlistPhishNet(showDate) {
        try {
          const response = await fetch(
            `${this.phishNetUrl}/setlists/showdate/${showDate}.json?apikey=${this.apiKey}`
          );
          if (!response.ok)
            throw new Error(`Phish.net API error: ${response.statusText}`);
          const data = await response.json();
          return data.data || null;
        } catch (error) {
          console.error("Error fetching setlist from Phish.net:", error);
          return null;
        }
      }
      async getAllSongsForDraft() {
        try {
          console.log("\u{1F3B5} Fetching complete song catalog from Phish.in API...");
          let allSongs = [];
          let page = 1;
          let hasMore = true;
          while (hasMore) {
            const response = await fetch(
              `${this.phishInUrl}/songs?per_page=100&page=${page}`,
              { headers: { "Accept": "application/json" } }
            );
            if (!response.ok)
              throw new Error(`Phish.in API error: ${response.statusText}`);
            const data = await response.json();
            const songs2 = data.data || [];
            allSongs = [...allSongs, ...songs2];
            hasMore = data.meta?.next_page !== null && songs2.length === 100;
            page++;
            if (page > 20)
              break;
          }
          console.log(`\u2705 Fetched ${allSongs.length} songs from Phish.in`);
          return allSongs.map((song) => ({
            songid: String(song.id || song.slug),
            song: song.title,
            times_played: song.times_played || 0,
            last_played: song.last_played_at || null,
            gap: song.gap || 0,
            debut_date: song.debut_at || null,
            original_artist: song.original_artist || null,
            slug: song.slug
          }));
        } catch (error) {
          console.error("\u{1F4A5} Error fetching from Phish.in, falling back to Phish.net:", error);
          return this.getAllSongsPhishNet();
        }
      }
      async getAllSongsPhishNet() {
        try {
          console.log("\u{1F504} Falling back to Phish.net for songs...");
          const response = await fetch(
            `${this.phishNetUrl}/songs.json?apikey=${this.apiKey}&limit=10000`
          );
          if (!response.ok)
            throw new Error(`Phish.net API error: ${response.statusText}`);
          const data = await response.json();
          const songs2 = data?.data || [];
          console.log(`\u2705 Got ${songs2.length} songs from Phish.net fallback`);
          return songs2.map((song) => ({
            songid: String(song.songid || song.id),
            song: song.song || song.title,
            times_played: song.times_played || 0,
            last_played: song.last_played || null,
            gap: song.gap || 0,
            debut_date: song.debut_date || null,
            original_artist: song.original_artist || null
          }));
        } catch (error) {
          console.error("Error fetching from Phish.net fallback:", error);
          return this.getFallbackSongs().map((song) => ({
            songid: String(song.id),
            song: song.title,
            times_played: song.total_plays,
            last_played: null,
            gap: 50,
            debut_date: null,
            original_artist: null
          }));
        }
      }
      async getSongStats(songName) {
        try {
          const response = await fetch(
            `${this.phishNetUrl}/songs/stats.json?apikey=${this.apiKey}&song=${encodeURIComponent(songName)}`
          );
          if (!response.ok)
            throw new Error(`Phish.net API error: ${response.statusText}`);
          const data = await response.json();
          return data.response?.data || null;
        } catch (error) {
          console.error("Error fetching song stats:", error);
          return null;
        }
      }
      async getShowWithDurations(showDate) {
        try {
          const response = await fetch(
            `${this.phishInUrl}/shows/${showDate}`,
            { headers: { "Accept": "application/json" } }
          );
          if (!response.ok)
            throw new Error(`Phish.in API error: ${response.statusText}`);
          return await response.json();
        } catch (error) {
          console.error(`Error fetching show with durations for ${showDate}:`, error);
          return null;
        }
      }
      categoryzeSong(title) {
        const titleLower = title.toLowerCase();
        if (["tweezer", "ghost", "simple", "you enjoy myself", "david bowie", "wolfmans brother", "mike song", "piper", "weekapaug groove"].some((j) => titleLower.includes(j)))
          return "jam";
        if (["fluffhead", "harry hood", "slave to the traffic light", "run like an antelope"].some((e) => titleLower.includes(e)))
          return "epic";
        if (["divided sky", "reba", "foam", "theme from the bottom"].some((c) => titleLower.includes(c)))
          return "composed";
        if (["possum", "stash", "maze", "chalk dust torture", "julius", "suzy greenberg"].some((r) => titleLower.includes(r)))
          return "rock";
        if (["mercury", "thread", "sigma oasis", "ruby waves", "everything's right", "blaze on", "fuego", "waves"].some((m) => titleLower.includes(m)))
          return "modern";
        if (["the sloth", "contact", "oh kee pa", "harpua", "icculus", "gamehendge"].some((r) => titleLower.includes(r)))
          return "rare";
        return "classic";
      }
      calculateRarityScore(totalPlays) {
        if (totalPlays > 300)
          return 5;
        if (totalPlays > 200)
          return 15;
        if (totalPlays > 100)
          return 30;
        if (totalPlays > 50)
          return 50;
        if (totalPlays > 10)
          return 70;
        return 90;
      }
      getFallbackSongs() {
        return [
          { id: 1001, title: "Tweezer", category: "jam", rarity_score: 5, total_plays: 411, plays_24_months: 22 },
          { id: 1002, title: "You Enjoy Myself", category: "jam", rarity_score: 15, total_plays: 350, plays_24_months: 20 },
          { id: 1003, title: "Ghost", category: "jam", rarity_score: 15, total_plays: 290, plays_24_months: 17 },
          { id: 1004, title: "Harry Hood", category: "epic", rarity_score: 20, total_plays: 275, plays_24_months: 15 },
          { id: 1005, title: "Fluffhead", category: "epic", rarity_score: 30, total_plays: 286, plays_24_months: 10 },
          { id: 1006, title: "Divided Sky", category: "composed", rarity_score: 35, total_plays: 250, plays_24_months: 8 },
          { id: 1007, title: "Possum", category: "rock", rarity_score: 15, total_plays: 310, plays_24_months: 18 },
          { id: 1008, title: "Wilson", category: "classic", rarity_score: 25, total_plays: 300, plays_24_months: 11 },
          { id: 1009, title: "Character Zero", category: "rock", rarity_score: 18, total_plays: 275, plays_24_months: 13 },
          { id: 1010, title: "Down with Disease", category: "funk", rarity_score: 12, total_plays: 310, plays_24_months: 17 }
        ];
      }
      async getSongById(songId) {
        const songs2 = await this.getAllSongsForDraft();
        return songs2.find((song) => song.id === songId) || null;
      }
      async saveSongToDatabase(songData) {
        const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
        const { songs: songs2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        try {
          const [savedSong] = await db2.insert(songs2).values({
            title: songData.title,
            category: songData.category,
            rarityScore: songData.rarity_score || 50,
            totalPlays: songData.total_plays || 0,
            lastPlayed: songData.last_played || null
          }).onConflictDoUpdate({
            target: [songs2.title],
            set: {
              totalPlays: songData.total_plays || 0,
              lastPlayed: songData.last_played || null
            }
          }).returning();
          return savedSong;
        } catch (error) {
          console.error("Error saving song to database:", error);
          throw error;
        }
      }
    };
    phishApi = new PhishNetService();
  }
});

// node_modules/svix/dist/models/applicationIn.js
var require_applicationIn = __commonJS({
  "node_modules/svix/dist/models/applicationIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ApplicationInSerializer = void 0;
    exports2.ApplicationInSerializer = {
      _fromJsonObject(object) {
        return {
          metadata: object["metadata"],
          name: object["name"],
          rateLimit: object["rateLimit"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          metadata: self.metadata,
          name: self.name,
          rateLimit: self.rateLimit,
          uid: self.uid
        };
      }
    };
  }
});

// node_modules/svix/dist/models/applicationOut.js
var require_applicationOut = __commonJS({
  "node_modules/svix/dist/models/applicationOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ApplicationOutSerializer = void 0;
    exports2.ApplicationOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          id: object["id"],
          metadata: object["metadata"],
          name: object["name"],
          rateLimit: object["rateLimit"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          id: self.id,
          metadata: self.metadata,
          name: self.name,
          rateLimit: self.rateLimit,
          uid: self.uid,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// node_modules/svix/dist/models/applicationPatch.js
var require_applicationPatch = __commonJS({
  "node_modules/svix/dist/models/applicationPatch.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ApplicationPatchSerializer = void 0;
    exports2.ApplicationPatchSerializer = {
      _fromJsonObject(object) {
        return {
          metadata: object["metadata"],
          name: object["name"],
          rateLimit: object["rateLimit"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          metadata: self.metadata,
          name: self.name,
          rateLimit: self.rateLimit,
          uid: self.uid
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseApplicationOut.js
var require_listResponseApplicationOut = __commonJS({
  "node_modules/svix/dist/models/listResponseApplicationOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseApplicationOutSerializer = void 0;
    var applicationOut_1 = require_applicationOut();
    exports2.ListResponseApplicationOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => applicationOut_1.ApplicationOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => applicationOut_1.ApplicationOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/util.js
var require_util = __commonJS({
  "node_modules/svix/dist/util.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ApiException = void 0;
    var ApiException = class extends Error {
      constructor(code, body, headers) {
        super(`HTTP-Code: ${code}
Headers: ${JSON.stringify(headers)}`);
        this.code = code;
        this.body = body;
        this.headers = {};
        headers.forEach((value, name) => {
          this.headers[name] = value;
        });
      }
    };
    exports2.ApiException = ApiException;
  }
});

// node_modules/uuid/dist/esm-node/max.js
var max_default;
var init_max = __esm({
  "node_modules/uuid/dist/esm-node/max.js"() {
    max_default = "ffffffff-ffff-ffff-ffff-ffffffffffff";
  }
});

// node_modules/uuid/dist/esm-node/nil.js
var nil_default;
var init_nil = __esm({
  "node_modules/uuid/dist/esm-node/nil.js"() {
    nil_default = "00000000-0000-0000-0000-000000000000";
  }
});

// node_modules/uuid/dist/esm-node/regex.js
var regex_default;
var init_regex = __esm({
  "node_modules/uuid/dist/esm-node/regex.js"() {
    regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
  }
});

// node_modules/uuid/dist/esm-node/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
var validate_default;
var init_validate = __esm({
  "node_modules/uuid/dist/esm-node/validate.js"() {
    init_regex();
    validate_default = validate;
  }
});

// node_modules/uuid/dist/esm-node/parse.js
function parse(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  let v;
  const arr = new Uint8Array(16);
  arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
  arr[1] = v >>> 16 & 255;
  arr[2] = v >>> 8 & 255;
  arr[3] = v & 255;
  arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
  arr[5] = v & 255;
  arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
  arr[7] = v & 255;
  arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
  arr[9] = v & 255;
  arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
  arr[11] = v / 4294967296 & 255;
  arr[12] = v >>> 24 & 255;
  arr[13] = v >>> 16 & 255;
  arr[14] = v >>> 8 & 255;
  arr[15] = v & 255;
  return arr;
}
var parse_default;
var init_parse = __esm({
  "node_modules/uuid/dist/esm-node/parse.js"() {
    init_validate();
    parse_default = parse;
  }
});

// node_modules/uuid/dist/esm-node/stringify.js
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}
function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset);
  if (!validate_default(uuid)) {
    throw TypeError("Stringified UUID is invalid");
  }
  return uuid;
}
var byteToHex, stringify_default;
var init_stringify = __esm({
  "node_modules/uuid/dist/esm-node/stringify.js"() {
    init_validate();
    byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).slice(1));
    }
    stringify_default = stringify;
  }
});

// node_modules/uuid/dist/esm-node/rng.js
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    import_node_crypto.default.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
var import_node_crypto, rnds8Pool, poolPtr;
var init_rng = __esm({
  "node_modules/uuid/dist/esm-node/rng.js"() {
    import_node_crypto = __toESM(require("node:crypto"));
    rnds8Pool = new Uint8Array(256);
    poolPtr = rnds8Pool.length;
  }
});

// node_modules/uuid/dist/esm-node/v1.js
function v1(options, buf, offset) {
  let i = buf && offset || 0;
  const b = buf || new Array(16);
  options = options || {};
  let node = options.node;
  let clockseq = options.clockseq;
  if (!options._v6) {
    if (!node) {
      node = _nodeId;
    }
    if (clockseq == null) {
      clockseq = _clockseq;
    }
  }
  if (node == null || clockseq == null) {
    const seedBytes = options.random || (options.rng || rng)();
    if (node == null) {
      node = [seedBytes[0], seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
      if (!_nodeId && !options._v6) {
        node[0] |= 1;
        _nodeId = node;
      }
    }
    if (clockseq == null) {
      clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
      if (_clockseq === void 0 && !options._v6) {
        _clockseq = clockseq;
      }
    }
  }
  let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
  const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
  if (dt < 0 && options.clockseq === void 0) {
    clockseq = clockseq + 1 & 16383;
  }
  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
    nsecs = 0;
  }
  if (nsecs >= 1e4) {
    throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
  }
  _lastMSecs = msecs;
  _lastNSecs = nsecs;
  _clockseq = clockseq;
  msecs += 122192928e5;
  const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
  b[i++] = tl >>> 24 & 255;
  b[i++] = tl >>> 16 & 255;
  b[i++] = tl >>> 8 & 255;
  b[i++] = tl & 255;
  const tmh = msecs / 4294967296 * 1e4 & 268435455;
  b[i++] = tmh >>> 8 & 255;
  b[i++] = tmh & 255;
  b[i++] = tmh >>> 24 & 15 | 16;
  b[i++] = tmh >>> 16 & 255;
  b[i++] = clockseq >>> 8 | 128;
  b[i++] = clockseq & 255;
  for (let n = 0; n < 6; ++n) {
    b[i + n] = node[n];
  }
  return buf || unsafeStringify(b);
}
var _nodeId, _clockseq, _lastMSecs, _lastNSecs, v1_default;
var init_v1 = __esm({
  "node_modules/uuid/dist/esm-node/v1.js"() {
    init_rng();
    init_stringify();
    _lastMSecs = 0;
    _lastNSecs = 0;
    v1_default = v1;
  }
});

// node_modules/uuid/dist/esm-node/v1ToV6.js
function v1ToV6(uuid) {
  const v1Bytes = typeof uuid === "string" ? parse_default(uuid) : uuid;
  const v6Bytes = _v1ToV6(v1Bytes);
  return typeof uuid === "string" ? unsafeStringify(v6Bytes) : v6Bytes;
}
function _v1ToV6(v1Bytes, randomize = false) {
  return Uint8Array.of((v1Bytes[6] & 15) << 4 | v1Bytes[7] >> 4 & 15, (v1Bytes[7] & 15) << 4 | (v1Bytes[4] & 240) >> 4, (v1Bytes[4] & 15) << 4 | (v1Bytes[5] & 240) >> 4, (v1Bytes[5] & 15) << 4 | (v1Bytes[0] & 240) >> 4, (v1Bytes[0] & 15) << 4 | (v1Bytes[1] & 240) >> 4, (v1Bytes[1] & 15) << 4 | (v1Bytes[2] & 240) >> 4, 96 | v1Bytes[2] & 15, v1Bytes[3], v1Bytes[8], v1Bytes[9], v1Bytes[10], v1Bytes[11], v1Bytes[12], v1Bytes[13], v1Bytes[14], v1Bytes[15]);
}
var init_v1ToV6 = __esm({
  "node_modules/uuid/dist/esm-node/v1ToV6.js"() {
    init_parse();
    init_stringify();
  }
});

// node_modules/uuid/dist/esm-node/v35.js
function stringToBytes(str) {
  str = unescape(encodeURIComponent(str));
  const bytes = [];
  for (let i = 0; i < str.length; ++i) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}
function v35(name, version3, hashfunc) {
  function generateUUID(value, namespace, buf, offset) {
    var _namespace;
    if (typeof value === "string") {
      value = stringToBytes(value);
    }
    if (typeof namespace === "string") {
      namespace = parse_default(namespace);
    }
    if (((_namespace = namespace) === null || _namespace === void 0 ? void 0 : _namespace.length) !== 16) {
      throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
    }
    let bytes = new Uint8Array(16 + value.length);
    bytes.set(namespace);
    bytes.set(value, namespace.length);
    bytes = hashfunc(bytes);
    bytes[6] = bytes[6] & 15 | version3;
    bytes[8] = bytes[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (let i = 0; i < 16; ++i) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return unsafeStringify(bytes);
  }
  try {
    generateUUID.name = name;
  } catch (err) {
  }
  generateUUID.DNS = DNS;
  generateUUID.URL = URL2;
  return generateUUID;
}
var DNS, URL2;
var init_v35 = __esm({
  "node_modules/uuid/dist/esm-node/v35.js"() {
    init_stringify();
    init_parse();
    DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    URL2 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  }
});

// node_modules/uuid/dist/esm-node/md5.js
function md5(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return import_node_crypto2.default.createHash("md5").update(bytes).digest();
}
var import_node_crypto2, md5_default;
var init_md5 = __esm({
  "node_modules/uuid/dist/esm-node/md5.js"() {
    import_node_crypto2 = __toESM(require("node:crypto"));
    md5_default = md5;
  }
});

// node_modules/uuid/dist/esm-node/v3.js
var v3, v3_default;
var init_v3 = __esm({
  "node_modules/uuid/dist/esm-node/v3.js"() {
    init_v35();
    init_md5();
    v3 = v35("v3", 48, md5_default);
    v3_default = v3;
  }
});

// node_modules/uuid/dist/esm-node/native.js
var import_node_crypto3, native_default;
var init_native = __esm({
  "node_modules/uuid/dist/esm-node/native.js"() {
    import_node_crypto3 = __toESM(require("node:crypto"));
    native_default = {
      randomUUID: import_node_crypto3.default.randomUUID
    };
  }
});

// node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default;
var init_v4 = __esm({
  "node_modules/uuid/dist/esm-node/v4.js"() {
    init_native();
    init_rng();
    init_stringify();
    v4_default = v4;
  }
});

// node_modules/uuid/dist/esm-node/sha1.js
function sha1(bytes) {
  if (Array.isArray(bytes)) {
    bytes = Buffer.from(bytes);
  } else if (typeof bytes === "string") {
    bytes = Buffer.from(bytes, "utf8");
  }
  return import_node_crypto4.default.createHash("sha1").update(bytes).digest();
}
var import_node_crypto4, sha1_default;
var init_sha1 = __esm({
  "node_modules/uuid/dist/esm-node/sha1.js"() {
    import_node_crypto4 = __toESM(require("node:crypto"));
    sha1_default = sha1;
  }
});

// node_modules/uuid/dist/esm-node/v5.js
var v5, v5_default;
var init_v5 = __esm({
  "node_modules/uuid/dist/esm-node/v5.js"() {
    init_v35();
    init_sha1();
    v5 = v35("v5", 80, sha1_default);
    v5_default = v5;
  }
});

// node_modules/uuid/dist/esm-node/v6.js
function v6(options = {}, buf, offset = 0) {
  let bytes = v1_default({
    ...options,
    _v6: true
  }, new Uint8Array(16));
  bytes = v1ToV6(bytes);
  if (buf) {
    for (let i = 0; i < 16; i++) {
      buf[offset + i] = bytes[i];
    }
    return buf;
  }
  return unsafeStringify(bytes);
}
var init_v6 = __esm({
  "node_modules/uuid/dist/esm-node/v6.js"() {
    init_stringify();
    init_v1();
    init_v1ToV6();
  }
});

// node_modules/uuid/dist/esm-node/v6ToV1.js
function v6ToV1(uuid) {
  const v6Bytes = typeof uuid === "string" ? parse_default(uuid) : uuid;
  const v1Bytes = _v6ToV1(v6Bytes);
  return typeof uuid === "string" ? unsafeStringify(v1Bytes) : v1Bytes;
}
function _v6ToV1(v6Bytes) {
  return Uint8Array.of((v6Bytes[3] & 15) << 4 | v6Bytes[4] >> 4 & 15, (v6Bytes[4] & 15) << 4 | (v6Bytes[5] & 240) >> 4, (v6Bytes[5] & 15) << 4 | v6Bytes[6] & 15, v6Bytes[7], (v6Bytes[1] & 15) << 4 | (v6Bytes[2] & 240) >> 4, (v6Bytes[2] & 15) << 4 | (v6Bytes[3] & 240) >> 4, 16 | (v6Bytes[0] & 240) >> 4, (v6Bytes[0] & 15) << 4 | (v6Bytes[1] & 240) >> 4, v6Bytes[8], v6Bytes[9], v6Bytes[10], v6Bytes[11], v6Bytes[12], v6Bytes[13], v6Bytes[14], v6Bytes[15]);
}
var init_v6ToV1 = __esm({
  "node_modules/uuid/dist/esm-node/v6ToV1.js"() {
    init_parse();
    init_stringify();
  }
});

// node_modules/uuid/dist/esm-node/v7.js
function v7(options, buf, offset) {
  options = options || {};
  let i = buf && offset || 0;
  const b = buf || new Uint8Array(16);
  const rnds = options.random || (options.rng || rng)();
  const msecs = options.msecs !== void 0 ? options.msecs : Date.now();
  let seq = options.seq !== void 0 ? options.seq : null;
  let seqHigh = _seqHigh;
  let seqLow = _seqLow;
  if (msecs > _msecs && options.msecs === void 0) {
    _msecs = msecs;
    if (seq !== null) {
      seqHigh = null;
      seqLow = null;
    }
  }
  if (seq !== null) {
    if (seq > 2147483647) {
      seq = 2147483647;
    }
    seqHigh = seq >>> 19 & 4095;
    seqLow = seq & 524287;
  }
  if (seqHigh === null || seqLow === null) {
    seqHigh = rnds[6] & 127;
    seqHigh = seqHigh << 8 | rnds[7];
    seqLow = rnds[8] & 63;
    seqLow = seqLow << 8 | rnds[9];
    seqLow = seqLow << 5 | rnds[10] >>> 3;
  }
  if (msecs + 1e4 > _msecs && seq === null) {
    if (++seqLow > 524287) {
      seqLow = 0;
      if (++seqHigh > 4095) {
        seqHigh = 0;
        _msecs++;
      }
    }
  } else {
    _msecs = msecs;
  }
  _seqHigh = seqHigh;
  _seqLow = seqLow;
  b[i++] = _msecs / 1099511627776 & 255;
  b[i++] = _msecs / 4294967296 & 255;
  b[i++] = _msecs / 16777216 & 255;
  b[i++] = _msecs / 65536 & 255;
  b[i++] = _msecs / 256 & 255;
  b[i++] = _msecs & 255;
  b[i++] = seqHigh >>> 4 & 15 | 112;
  b[i++] = seqHigh & 255;
  b[i++] = seqLow >>> 13 & 63 | 128;
  b[i++] = seqLow >>> 5 & 255;
  b[i++] = seqLow << 3 & 255 | rnds[10] & 7;
  b[i++] = rnds[11];
  b[i++] = rnds[12];
  b[i++] = rnds[13];
  b[i++] = rnds[14];
  b[i++] = rnds[15];
  return buf || unsafeStringify(b);
}
var _seqLow, _seqHigh, _msecs, v7_default;
var init_v7 = __esm({
  "node_modules/uuid/dist/esm-node/v7.js"() {
    init_rng();
    init_stringify();
    _seqLow = null;
    _seqHigh = null;
    _msecs = 0;
    v7_default = v7;
  }
});

// node_modules/uuid/dist/esm-node/version.js
function version(uuid) {
  if (!validate_default(uuid)) {
    throw TypeError("Invalid UUID");
  }
  return parseInt(uuid.slice(14, 15), 16);
}
var version_default;
var init_version = __esm({
  "node_modules/uuid/dist/esm-node/version.js"() {
    init_validate();
    version_default = version;
  }
});

// node_modules/uuid/dist/esm-node/index.js
var esm_node_exports = {};
__export(esm_node_exports, {
  MAX: () => max_default,
  NIL: () => nil_default,
  parse: () => parse_default,
  stringify: () => stringify_default,
  v1: () => v1_default,
  v1ToV6: () => v1ToV6,
  v3: () => v3_default,
  v4: () => v4_default,
  v5: () => v5_default,
  v6: () => v6,
  v6ToV1: () => v6ToV1,
  v7: () => v7_default,
  validate: () => validate_default,
  version: () => version_default
});
var init_esm_node = __esm({
  "node_modules/uuid/dist/esm-node/index.js"() {
    init_max();
    init_nil();
    init_parse();
    init_stringify();
    init_v1();
    init_v1ToV6();
    init_v3();
    init_v4();
    init_v5();
    init_v6();
    init_v6ToV1();
    init_v7();
    init_validate();
    init_version();
  }
});

// node_modules/svix/dist/request.js
var require_request = __commonJS({
  "node_modules/svix/dist/request.js"(exports2) {
    "use strict";
    var __awaiter = exports2 && exports2.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SvixRequest = exports2.HttpMethod = exports2.LIB_VERSION = void 0;
    var util_1 = require_util();
    var uuid_1 = (init_esm_node(), __toCommonJS(esm_node_exports));
    exports2.LIB_VERSION = "1.88.0";
    var USER_AGENT = `svix-libs/${exports2.LIB_VERSION}/javascript`;
    var HttpMethod;
    (function(HttpMethod2) {
      HttpMethod2["GET"] = "GET";
      HttpMethod2["HEAD"] = "HEAD";
      HttpMethod2["POST"] = "POST";
      HttpMethod2["PUT"] = "PUT";
      HttpMethod2["DELETE"] = "DELETE";
      HttpMethod2["CONNECT"] = "CONNECT";
      HttpMethod2["OPTIONS"] = "OPTIONS";
      HttpMethod2["TRACE"] = "TRACE";
      HttpMethod2["PATCH"] = "PATCH";
    })(HttpMethod = exports2.HttpMethod || (exports2.HttpMethod = {}));
    var SvixRequest = class {
      constructor(method, path2) {
        this.method = method;
        this.path = path2;
        this.queryParams = {};
        this.headerParams = {};
      }
      setPathParam(name, value) {
        const newPath = this.path.replace(`{${name}}`, encodeURIComponent(value));
        if (this.path === newPath) {
          throw new Error(`path parameter ${name} not found`);
        }
        this.path = newPath;
      }
      setQueryParams(params) {
        for (const [name, value] of Object.entries(params)) {
          this.setQueryParam(name, value);
        }
      }
      setQueryParam(name, value) {
        if (value === void 0 || value === null) {
          return;
        }
        if (typeof value === "string") {
          this.queryParams[name] = value;
        } else if (typeof value === "boolean" || typeof value === "number") {
          this.queryParams[name] = value.toString();
        } else if (value instanceof Date) {
          this.queryParams[name] = value.toISOString();
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            this.queryParams[name] = value.join(",");
          }
        } else {
          const _assert_unreachable = value;
          throw new Error(`query parameter ${name} has unsupported type`);
        }
      }
      setHeaderParam(name, value) {
        if (value === void 0) {
          return;
        }
        this.headerParams[name] = value;
      }
      setBody(value) {
        this.body = JSON.stringify(value);
      }
      send(ctx, parseResponseBody) {
        return __awaiter(this, void 0, void 0, function* () {
          const response = yield this.sendInner(ctx);
          if (response.status === 204) {
            return null;
          }
          const responseBody = yield response.text();
          return parseResponseBody(JSON.parse(responseBody));
        });
      }
      sendNoResponseBody(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.sendInner(ctx);
        });
      }
      sendInner(ctx) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
          const url = new URL(ctx.baseUrl + this.path);
          for (const [name, value] of Object.entries(this.queryParams)) {
            url.searchParams.set(name, value);
          }
          if (this.headerParams["idempotency-key"] === void 0 && this.method.toUpperCase() === "POST") {
            this.headerParams["idempotency-key"] = `auto_${(0, uuid_1.v4)()}`;
          }
          const randomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
          if (this.body != null) {
            this.headerParams["content-type"] = "application/json";
          }
          const isCredentialsSupported = "credentials" in Request.prototype;
          const response = yield sendWithRetry(url, {
            method: this.method.toString(),
            body: this.body,
            headers: Object.assign({ accept: "application/json, */*;q=0.8", authorization: `Bearer ${ctx.token}`, "user-agent": USER_AGENT, "svix-req-id": randomId.toString() }, this.headerParams),
            credentials: isCredentialsSupported ? "same-origin" : void 0,
            signal: ctx.timeout !== void 0 ? AbortSignal.timeout(ctx.timeout) : void 0
          }, ctx.retryScheduleInMs, (_a = ctx.retryScheduleInMs) === null || _a === void 0 ? void 0 : _a[0], ((_b = ctx.retryScheduleInMs) === null || _b === void 0 ? void 0 : _b.length) || ctx.numRetries, ctx.fetch);
          return filterResponseForErrors(response);
        });
      }
    };
    exports2.SvixRequest = SvixRequest;
    function filterResponseForErrors(response) {
      return __awaiter(this, void 0, void 0, function* () {
        if (response.status < 300) {
          return response;
        }
        const responseBody = yield response.text();
        if (response.status === 422) {
          throw new util_1.ApiException(response.status, JSON.parse(responseBody), response.headers);
        }
        if (response.status >= 400 && response.status <= 499) {
          throw new util_1.ApiException(response.status, JSON.parse(responseBody), response.headers);
        }
        throw new util_1.ApiException(response.status, responseBody, response.headers);
      });
    }
    function sendWithRetry(url, init, retryScheduleInMs, nextInterval = 50, triesLeft = 2, fetchImpl = fetch, retryCount = 1) {
      return __awaiter(this, void 0, void 0, function* () {
        const sleep = (interval) => new Promise((resolve) => setTimeout(resolve, interval));
        try {
          const response = yield fetchImpl(url, init);
          if (triesLeft <= 0 || response.status < 500) {
            return response;
          }
        } catch (e) {
          if (triesLeft <= 0) {
            throw e;
          }
        }
        yield sleep(nextInterval);
        init.headers["svix-retry-count"] = retryCount.toString();
        nextInterval = (retryScheduleInMs === null || retryScheduleInMs === void 0 ? void 0 : retryScheduleInMs[retryCount]) || nextInterval * 2;
        return yield sendWithRetry(url, init, retryScheduleInMs, nextInterval, --triesLeft, fetchImpl, ++retryCount);
      });
    }
  }
});

// node_modules/svix/dist/api/application.js
var require_application = __commonJS({
  "node_modules/svix/dist/api/application.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Application = void 0;
    var applicationIn_1 = require_applicationIn();
    var applicationOut_1 = require_applicationOut();
    var applicationPatch_1 = require_applicationPatch();
    var listResponseApplicationOut_1 = require_listResponseApplicationOut();
    var request_1 = require_request();
    var Application = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app");
        request.setQueryParams({
          exclude_apps_with_no_endpoints: options === null || options === void 0 ? void 0 : options.excludeAppsWithNoEndpoints,
          exclude_apps_with_disabled_endpoints: options === null || options === void 0 ? void 0 : options.excludeAppsWithDisabledEndpoints,
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseApplicationOut_1.ListResponseApplicationOutSerializer._fromJsonObject);
      }
      create(applicationIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(applicationIn_1.ApplicationInSerializer._toJsonObject(applicationIn));
        return request.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
      }
      getOrCreate(applicationIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app");
        request.setQueryParam("get_if_exists", true);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(applicationIn_1.ApplicationInSerializer._toJsonObject(applicationIn));
        return request.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
      }
      get(appId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}");
        request.setPathParam("app_id", appId);
        return request.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
      }
      update(appId, applicationIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}");
        request.setPathParam("app_id", appId);
        request.setBody(applicationIn_1.ApplicationInSerializer._toJsonObject(applicationIn));
        return request.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
      }
      delete(appId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}");
        request.setPathParam("app_id", appId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      patch(appId, applicationPatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}");
        request.setPathParam("app_id", appId);
        request.setBody(applicationPatch_1.ApplicationPatchSerializer._toJsonObject(applicationPatch));
        return request.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
      }
    };
    exports2.Application = Application;
  }
});

// node_modules/svix/dist/models/apiTokenOut.js
var require_apiTokenOut = __commonJS({
  "node_modules/svix/dist/models/apiTokenOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ApiTokenOutSerializer = void 0;
    exports2.ApiTokenOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          expiresAt: object["expiresAt"] ? new Date(object["expiresAt"]) : null,
          id: object["id"],
          name: object["name"],
          scopes: object["scopes"],
          token: object["token"]
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          expiresAt: self.expiresAt,
          id: self.id,
          name: self.name,
          scopes: self.scopes,
          token: self.token
        };
      }
    };
  }
});

// node_modules/svix/dist/models/appPortalCapability.js
var require_appPortalCapability = __commonJS({
  "node_modules/svix/dist/models/appPortalCapability.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AppPortalCapabilitySerializer = exports2.AppPortalCapability = void 0;
    var AppPortalCapability;
    (function(AppPortalCapability2) {
      AppPortalCapability2["ViewBase"] = "ViewBase";
      AppPortalCapability2["ViewEndpointSecret"] = "ViewEndpointSecret";
      AppPortalCapability2["ManageEndpointSecret"] = "ManageEndpointSecret";
      AppPortalCapability2["ManageTransformations"] = "ManageTransformations";
      AppPortalCapability2["CreateAttempts"] = "CreateAttempts";
      AppPortalCapability2["ManageEndpoint"] = "ManageEndpoint";
    })(AppPortalCapability = exports2.AppPortalCapability || (exports2.AppPortalCapability = {}));
    exports2.AppPortalCapabilitySerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// node_modules/svix/dist/models/appPortalAccessIn.js
var require_appPortalAccessIn = __commonJS({
  "node_modules/svix/dist/models/appPortalAccessIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AppPortalAccessInSerializer = void 0;
    var appPortalCapability_1 = require_appPortalCapability();
    var applicationIn_1 = require_applicationIn();
    exports2.AppPortalAccessInSerializer = {
      _fromJsonObject(object) {
        var _a;
        return {
          application: object["application"] != null ? applicationIn_1.ApplicationInSerializer._fromJsonObject(object["application"]) : void 0,
          capabilities: (_a = object["capabilities"]) === null || _a === void 0 ? void 0 : _a.map((item) => appPortalCapability_1.AppPortalCapabilitySerializer._fromJsonObject(item)),
          expiry: object["expiry"],
          featureFlags: object["featureFlags"],
          readOnly: object["readOnly"],
          sessionId: object["sessionId"]
        };
      },
      _toJsonObject(self) {
        var _a;
        return {
          application: self.application != null ? applicationIn_1.ApplicationInSerializer._toJsonObject(self.application) : void 0,
          capabilities: (_a = self.capabilities) === null || _a === void 0 ? void 0 : _a.map((item) => appPortalCapability_1.AppPortalCapabilitySerializer._toJsonObject(item)),
          expiry: self.expiry,
          featureFlags: self.featureFlags,
          readOnly: self.readOnly,
          sessionId: self.sessionId
        };
      }
    };
  }
});

// node_modules/svix/dist/models/appPortalAccessOut.js
var require_appPortalAccessOut = __commonJS({
  "node_modules/svix/dist/models/appPortalAccessOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AppPortalAccessOutSerializer = void 0;
    exports2.AppPortalAccessOutSerializer = {
      _fromJsonObject(object) {
        return {
          token: object["token"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          token: self.token,
          url: self.url
        };
      }
    };
  }
});

// node_modules/svix/dist/models/applicationTokenExpireIn.js
var require_applicationTokenExpireIn = __commonJS({
  "node_modules/svix/dist/models/applicationTokenExpireIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ApplicationTokenExpireInSerializer = void 0;
    exports2.ApplicationTokenExpireInSerializer = {
      _fromJsonObject(object) {
        return {
          expiry: object["expiry"],
          sessionIds: object["sessionIds"]
        };
      },
      _toJsonObject(self) {
        return {
          expiry: self.expiry,
          sessionIds: self.sessionIds
        };
      }
    };
  }
});

// node_modules/svix/dist/models/rotatePollerTokenIn.js
var require_rotatePollerTokenIn = __commonJS({
  "node_modules/svix/dist/models/rotatePollerTokenIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RotatePollerTokenInSerializer = void 0;
    exports2.RotatePollerTokenInSerializer = {
      _fromJsonObject(object) {
        return {
          expiry: object["expiry"],
          oldTokenExpiry: object["oldTokenExpiry"]
        };
      },
      _toJsonObject(self) {
        return {
          expiry: self.expiry,
          oldTokenExpiry: self.oldTokenExpiry
        };
      }
    };
  }
});

// node_modules/svix/dist/models/streamPortalAccessIn.js
var require_streamPortalAccessIn = __commonJS({
  "node_modules/svix/dist/models/streamPortalAccessIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamPortalAccessInSerializer = void 0;
    exports2.StreamPortalAccessInSerializer = {
      _fromJsonObject(object) {
        return {
          expiry: object["expiry"],
          featureFlags: object["featureFlags"],
          sessionId: object["sessionId"]
        };
      },
      _toJsonObject(self) {
        return {
          expiry: self.expiry,
          featureFlags: self.featureFlags,
          sessionId: self.sessionId
        };
      }
    };
  }
});

// node_modules/svix/dist/models/dashboardAccessOut.js
var require_dashboardAccessOut = __commonJS({
  "node_modules/svix/dist/models/dashboardAccessOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DashboardAccessOutSerializer = void 0;
    exports2.DashboardAccessOutSerializer = {
      _fromJsonObject(object) {
        return {
          token: object["token"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          token: self.token,
          url: self.url
        };
      }
    };
  }
});

// node_modules/svix/dist/api/authentication.js
var require_authentication = __commonJS({
  "node_modules/svix/dist/api/authentication.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Authentication = void 0;
    var apiTokenOut_1 = require_apiTokenOut();
    var appPortalAccessIn_1 = require_appPortalAccessIn();
    var appPortalAccessOut_1 = require_appPortalAccessOut();
    var applicationTokenExpireIn_1 = require_applicationTokenExpireIn();
    var rotatePollerTokenIn_1 = require_rotatePollerTokenIn();
    var streamPortalAccessIn_1 = require_streamPortalAccessIn();
    var dashboardAccessOut_1 = require_dashboardAccessOut();
    var request_1 = require_request();
    var Authentication = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      appPortalAccess(appId, appPortalAccessIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/app-portal-access/{app_id}");
        request.setPathParam("app_id", appId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(appPortalAccessIn_1.AppPortalAccessInSerializer._toJsonObject(appPortalAccessIn));
        return request.send(this.requestCtx, appPortalAccessOut_1.AppPortalAccessOutSerializer._fromJsonObject);
      }
      expireAll(appId, applicationTokenExpireIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/app/{app_id}/expire-all");
        request.setPathParam("app_id", appId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(applicationTokenExpireIn_1.ApplicationTokenExpireInSerializer._toJsonObject(applicationTokenExpireIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
      dashboardAccess(appId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/dashboard-access/{app_id}");
        request.setPathParam("app_id", appId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        return request.send(this.requestCtx, dashboardAccessOut_1.DashboardAccessOutSerializer._fromJsonObject);
      }
      logout(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/logout");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        return request.sendNoResponseBody(this.requestCtx);
      }
      streamPortalAccess(streamId, streamPortalAccessIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/stream-portal-access/{stream_id}");
        request.setPathParam("stream_id", streamId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(streamPortalAccessIn_1.StreamPortalAccessInSerializer._toJsonObject(streamPortalAccessIn));
        return request.send(this.requestCtx, appPortalAccessOut_1.AppPortalAccessOutSerializer._fromJsonObject);
      }
      getStreamPollerToken(streamId, sinkId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/auth/stream/{stream_id}/sink/{sink_id}/poller/token");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        return request.send(this.requestCtx, apiTokenOut_1.ApiTokenOutSerializer._fromJsonObject);
      }
      rotateStreamPollerToken(streamId, sinkId, rotatePollerTokenIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/stream/{stream_id}/sink/{sink_id}/poller/token/rotate");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(rotatePollerTokenIn_1.RotatePollerTokenInSerializer._toJsonObject(rotatePollerTokenIn));
        return request.send(this.requestCtx, apiTokenOut_1.ApiTokenOutSerializer._fromJsonObject);
      }
    };
    exports2.Authentication = Authentication;
  }
});

// node_modules/svix/dist/models/backgroundTaskStatus.js
var require_backgroundTaskStatus = __commonJS({
  "node_modules/svix/dist/models/backgroundTaskStatus.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BackgroundTaskStatusSerializer = exports2.BackgroundTaskStatus = void 0;
    var BackgroundTaskStatus;
    (function(BackgroundTaskStatus2) {
      BackgroundTaskStatus2["Running"] = "running";
      BackgroundTaskStatus2["Finished"] = "finished";
      BackgroundTaskStatus2["Failed"] = "failed";
    })(BackgroundTaskStatus = exports2.BackgroundTaskStatus || (exports2.BackgroundTaskStatus = {}));
    exports2.BackgroundTaskStatusSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// node_modules/svix/dist/models/backgroundTaskType.js
var require_backgroundTaskType = __commonJS({
  "node_modules/svix/dist/models/backgroundTaskType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BackgroundTaskTypeSerializer = exports2.BackgroundTaskType = void 0;
    var BackgroundTaskType;
    (function(BackgroundTaskType2) {
      BackgroundTaskType2["EndpointReplay"] = "endpoint.replay";
      BackgroundTaskType2["EndpointRecover"] = "endpoint.recover";
      BackgroundTaskType2["ApplicationStats"] = "application.stats";
      BackgroundTaskType2["MessageBroadcast"] = "message.broadcast";
      BackgroundTaskType2["SdkGenerate"] = "sdk.generate";
      BackgroundTaskType2["EventTypeAggregate"] = "event-type.aggregate";
      BackgroundTaskType2["ApplicationPurgeContent"] = "application.purge_content";
      BackgroundTaskType2["EndpointBulkReplay"] = "endpoint.bulk_replay";
    })(BackgroundTaskType = exports2.BackgroundTaskType || (exports2.BackgroundTaskType = {}));
    exports2.BackgroundTaskTypeSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// node_modules/svix/dist/models/backgroundTaskOut.js
var require_backgroundTaskOut = __commonJS({
  "node_modules/svix/dist/models/backgroundTaskOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BackgroundTaskOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports2.BackgroundTaskOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"],
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"])
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data,
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task)
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseBackgroundTaskOut.js
var require_listResponseBackgroundTaskOut = __commonJS({
  "node_modules/svix/dist/models/listResponseBackgroundTaskOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseBackgroundTaskOutSerializer = void 0;
    var backgroundTaskOut_1 = require_backgroundTaskOut();
    exports2.ListResponseBackgroundTaskOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => backgroundTaskOut_1.BackgroundTaskOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => backgroundTaskOut_1.BackgroundTaskOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/api/backgroundTask.js
var require_backgroundTask = __commonJS({
  "node_modules/svix/dist/api/backgroundTask.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.BackgroundTask = void 0;
    var backgroundTaskOut_1 = require_backgroundTaskOut();
    var listResponseBackgroundTaskOut_1 = require_listResponseBackgroundTaskOut();
    var request_1 = require_request();
    var BackgroundTask = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/background-task");
        request.setQueryParams({
          status: options === null || options === void 0 ? void 0 : options.status,
          task: options === null || options === void 0 ? void 0 : options.task,
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseBackgroundTaskOut_1.ListResponseBackgroundTaskOutSerializer._fromJsonObject);
      }
      listByEndpoint(options) {
        return this.list(options);
      }
      get(taskId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/background-task/{task_id}");
        request.setPathParam("task_id", taskId);
        return request.send(this.requestCtx, backgroundTaskOut_1.BackgroundTaskOutSerializer._fromJsonObject);
      }
    };
    exports2.BackgroundTask = BackgroundTask;
  }
});

// node_modules/svix/dist/models/connectorKind.js
var require_connectorKind = __commonJS({
  "node_modules/svix/dist/models/connectorKind.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConnectorKindSerializer = exports2.ConnectorKind = void 0;
    var ConnectorKind;
    (function(ConnectorKind2) {
      ConnectorKind2["Custom"] = "Custom";
      ConnectorKind2["AgenticCommerceProtocol"] = "AgenticCommerceProtocol";
      ConnectorKind2["CloseCrm"] = "CloseCRM";
      ConnectorKind2["CustomerIo"] = "CustomerIO";
      ConnectorKind2["Discord"] = "Discord";
      ConnectorKind2["Hubspot"] = "Hubspot";
      ConnectorKind2["Inngest"] = "Inngest";
      ConnectorKind2["Loops"] = "Loops";
      ConnectorKind2["Otel"] = "Otel";
      ConnectorKind2["Resend"] = "Resend";
      ConnectorKind2["Salesforce"] = "Salesforce";
      ConnectorKind2["Segment"] = "Segment";
      ConnectorKind2["Sendgrid"] = "Sendgrid";
      ConnectorKind2["Slack"] = "Slack";
      ConnectorKind2["Teams"] = "Teams";
      ConnectorKind2["TriggerDev"] = "TriggerDev";
      ConnectorKind2["Windmill"] = "Windmill";
      ConnectorKind2["Zapier"] = "Zapier";
    })(ConnectorKind = exports2.ConnectorKind || (exports2.ConnectorKind = {}));
    exports2.ConnectorKindSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// node_modules/svix/dist/models/connectorProduct.js
var require_connectorProduct = __commonJS({
  "node_modules/svix/dist/models/connectorProduct.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConnectorProductSerializer = exports2.ConnectorProduct = void 0;
    var ConnectorProduct;
    (function(ConnectorProduct2) {
      ConnectorProduct2["Dispatch"] = "Dispatch";
      ConnectorProduct2["Stream"] = "Stream";
    })(ConnectorProduct = exports2.ConnectorProduct || (exports2.ConnectorProduct = {}));
    exports2.ConnectorProductSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// node_modules/svix/dist/models/connectorIn.js
var require_connectorIn = __commonJS({
  "node_modules/svix/dist/models/connectorIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConnectorInSerializer = void 0;
    var connectorKind_1 = require_connectorKind();
    var connectorProduct_1 = require_connectorProduct();
    exports2.ConnectorInSerializer = {
      _fromJsonObject(object) {
        return {
          allowedEventTypes: object["allowedEventTypes"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          instructions: object["instructions"],
          kind: object["kind"] != null ? connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]) : void 0,
          logo: object["logo"],
          name: object["name"],
          productType: object["productType"] != null ? connectorProduct_1.ConnectorProductSerializer._fromJsonObject(object["productType"]) : void 0,
          transformation: object["transformation"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          allowedEventTypes: self.allowedEventTypes,
          description: self.description,
          featureFlags: self.featureFlags,
          instructions: self.instructions,
          kind: self.kind != null ? connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind) : void 0,
          logo: self.logo,
          name: self.name,
          productType: self.productType != null ? connectorProduct_1.ConnectorProductSerializer._toJsonObject(self.productType) : void 0,
          transformation: self.transformation,
          uid: self.uid
        };
      }
    };
  }
});

// node_modules/svix/dist/models/connectorOut.js
var require_connectorOut = __commonJS({
  "node_modules/svix/dist/models/connectorOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConnectorOutSerializer = void 0;
    var connectorKind_1 = require_connectorKind();
    var connectorProduct_1 = require_connectorProduct();
    exports2.ConnectorOutSerializer = {
      _fromJsonObject(object) {
        return {
          allowedEventTypes: object["allowedEventTypes"],
          createdAt: new Date(object["createdAt"]),
          description: object["description"],
          featureFlags: object["featureFlags"],
          id: object["id"],
          instructions: object["instructions"],
          kind: connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]),
          logo: object["logo"],
          name: object["name"],
          orgId: object["orgId"],
          productType: connectorProduct_1.ConnectorProductSerializer._fromJsonObject(object["productType"]),
          transformation: object["transformation"],
          transformationUpdatedAt: new Date(object["transformationUpdatedAt"]),
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          allowedEventTypes: self.allowedEventTypes,
          createdAt: self.createdAt,
          description: self.description,
          featureFlags: self.featureFlags,
          id: self.id,
          instructions: self.instructions,
          kind: connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind),
          logo: self.logo,
          name: self.name,
          orgId: self.orgId,
          productType: connectorProduct_1.ConnectorProductSerializer._toJsonObject(self.productType),
          transformation: self.transformation,
          transformationUpdatedAt: self.transformationUpdatedAt,
          uid: self.uid,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// node_modules/svix/dist/models/connectorPatch.js
var require_connectorPatch = __commonJS({
  "node_modules/svix/dist/models/connectorPatch.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConnectorPatchSerializer = void 0;
    var connectorKind_1 = require_connectorKind();
    exports2.ConnectorPatchSerializer = {
      _fromJsonObject(object) {
        return {
          allowedEventTypes: object["allowedEventTypes"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          instructions: object["instructions"],
          kind: object["kind"] != null ? connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]) : void 0,
          logo: object["logo"],
          name: object["name"],
          transformation: object["transformation"]
        };
      },
      _toJsonObject(self) {
        return {
          allowedEventTypes: self.allowedEventTypes,
          description: self.description,
          featureFlags: self.featureFlags,
          instructions: self.instructions,
          kind: self.kind != null ? connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind) : void 0,
          logo: self.logo,
          name: self.name,
          transformation: self.transformation
        };
      }
    };
  }
});

// node_modules/svix/dist/models/connectorUpdate.js
var require_connectorUpdate = __commonJS({
  "node_modules/svix/dist/models/connectorUpdate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConnectorUpdateSerializer = void 0;
    var connectorKind_1 = require_connectorKind();
    exports2.ConnectorUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          allowedEventTypes: object["allowedEventTypes"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          instructions: object["instructions"],
          kind: object["kind"] != null ? connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]) : void 0,
          logo: object["logo"],
          name: object["name"],
          transformation: object["transformation"]
        };
      },
      _toJsonObject(self) {
        return {
          allowedEventTypes: self.allowedEventTypes,
          description: self.description,
          featureFlags: self.featureFlags,
          instructions: self.instructions,
          kind: self.kind != null ? connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind) : void 0,
          logo: self.logo,
          name: self.name,
          transformation: self.transformation
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseConnectorOut.js
var require_listResponseConnectorOut = __commonJS({
  "node_modules/svix/dist/models/listResponseConnectorOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseConnectorOutSerializer = void 0;
    var connectorOut_1 = require_connectorOut();
    exports2.ListResponseConnectorOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => connectorOut_1.ConnectorOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => connectorOut_1.ConnectorOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/api/connector.js
var require_connector = __commonJS({
  "node_modules/svix/dist/api/connector.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Connector = void 0;
    var connectorIn_1 = require_connectorIn();
    var connectorOut_1 = require_connectorOut();
    var connectorPatch_1 = require_connectorPatch();
    var connectorUpdate_1 = require_connectorUpdate();
    var listResponseConnectorOut_1 = require_listResponseConnectorOut();
    var request_1 = require_request();
    var Connector = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/connector");
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order,
          product_type: options === null || options === void 0 ? void 0 : options.productType
        });
        return request.send(this.requestCtx, listResponseConnectorOut_1.ListResponseConnectorOutSerializer._fromJsonObject);
      }
      create(connectorIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/connector");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(connectorIn_1.ConnectorInSerializer._toJsonObject(connectorIn));
        return request.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
      }
      get(connectorId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/connector/{connector_id}");
        request.setPathParam("connector_id", connectorId);
        return request.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
      }
      update(connectorId, connectorUpdate) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/connector/{connector_id}");
        request.setPathParam("connector_id", connectorId);
        request.setBody(connectorUpdate_1.ConnectorUpdateSerializer._toJsonObject(connectorUpdate));
        return request.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
      }
      delete(connectorId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/connector/{connector_id}");
        request.setPathParam("connector_id", connectorId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      patch(connectorId, connectorPatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/connector/{connector_id}");
        request.setPathParam("connector_id", connectorId);
        request.setBody(connectorPatch_1.ConnectorPatchSerializer._toJsonObject(connectorPatch));
        return request.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
      }
    };
    exports2.Connector = Connector;
  }
});

// node_modules/svix/dist/models/endpointHeadersIn.js
var require_endpointHeadersIn = __commonJS({
  "node_modules/svix/dist/models/endpointHeadersIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EndpointHeadersInSerializer = void 0;
    exports2.EndpointHeadersInSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers
        };
      }
    };
  }
});

// node_modules/svix/dist/models/endpointHeadersOut.js
var require_endpointHeadersOut = __commonJS({
  "node_modules/svix/dist/models/endpointHeadersOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EndpointHeadersOutSerializer = void 0;
    exports2.EndpointHeadersOutSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"],
          sensitive: object["sensitive"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers,
          sensitive: self.sensitive
        };
      }
    };
  }
});

// node_modules/svix/dist/models/endpointHeadersPatchIn.js
var require_endpointHeadersPatchIn = __commonJS({
  "node_modules/svix/dist/models/endpointHeadersPatchIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EndpointHeadersPatchInSerializer = void 0;
    exports2.EndpointHeadersPatchInSerializer = {
      _fromJsonObject(object) {
        return {
          deleteHeaders: object["deleteHeaders"],
          headers: object["headers"]
        };
      },
      _toJsonObject(self) {
        return {
          deleteHeaders: self.deleteHeaders,
          headers: self.headers
        };
      }
    };
  }
});

// node_modules/svix/dist/models/endpointIn.js
var require_endpointIn = __commonJS({
  "node_modules/svix/dist/models/endpointIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EndpointInSerializer = void 0;
    exports2.EndpointInSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          headers: object["headers"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          secret: object["secret"],
          uid: object["uid"],
          url: object["url"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          headers: self.headers,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          secret: self.secret,
          uid: self.uid,
          url: self.url,
          version: self.version
        };
      }
    };
  }
});

// node_modules/svix/dist/models/endpointOut.js
var require_endpointOut = __commonJS({
  "node_modules/svix/dist/models/endpointOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EndpointOutSerializer = void 0;
    exports2.EndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          createdAt: new Date(object["createdAt"]),
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          id: object["id"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"]),
          url: object["url"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          createdAt: self.createdAt,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          id: self.id,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          uid: self.uid,
          updatedAt: self.updatedAt,
          url: self.url,
          version: self.version
        };
      }
    };
  }
});

// node_modules/svix/dist/models/endpointPatch.js
var require_endpointPatch = __commonJS({
  "node_modules/svix/dist/models/endpointPatch.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EndpointPatchSerializer = void 0;
    exports2.EndpointPatchSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          secret: object["secret"],
          uid: object["uid"],
          url: object["url"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          secret: self.secret,
          uid: self.uid,
          url: self.url,
          version: self.version
        };
      }
    };
  }
});

// node_modules/svix/dist/models/endpointSecretOut.js
var require_endpointSecretOut = __commonJS({
  "node_modules/svix/dist/models/endpointSecretOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EndpointSecretOutSerializer = void 0;
    exports2.EndpointSecretOutSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// node_modules/svix/dist/models/endpointSecretRotateIn.js
var require_endpointSecretRotateIn = __commonJS({
  "node_modules/svix/dist/models/endpointSecretRotateIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EndpointSecretRotateInSerializer = void 0;
    exports2.EndpointSecretRotateInSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// node_modules/svix/dist/models/endpointStats.js
var require_endpointStats = __commonJS({
  "node_modules/svix/dist/models/endpointStats.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EndpointStatsSerializer = void 0;
    exports2.EndpointStatsSerializer = {
      _fromJsonObject(object) {
        return {
          fail: object["fail"],
          pending: object["pending"],
          sending: object["sending"],
          success: object["success"]
        };
      },
      _toJsonObject(self) {
        return {
          fail: self.fail,
          pending: self.pending,
          sending: self.sending,
          success: self.success
        };
      }
    };
  }
});

// node_modules/svix/dist/models/endpointTransformationIn.js
var require_endpointTransformationIn = __commonJS({
  "node_modules/svix/dist/models/endpointTransformationIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EndpointTransformationInSerializer = void 0;
    exports2.EndpointTransformationInSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled
        };
      }
    };
  }
});

// node_modules/svix/dist/models/endpointTransformationOut.js
var require_endpointTransformationOut = __commonJS({
  "node_modules/svix/dist/models/endpointTransformationOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EndpointTransformationOutSerializer = void 0;
    exports2.EndpointTransformationOutSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"],
          updatedAt: object["updatedAt"] ? new Date(object["updatedAt"]) : null
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// node_modules/svix/dist/models/endpointTransformationPatch.js
var require_endpointTransformationPatch = __commonJS({
  "node_modules/svix/dist/models/endpointTransformationPatch.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EndpointTransformationPatchSerializer = void 0;
    exports2.EndpointTransformationPatchSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled
        };
      }
    };
  }
});

// node_modules/svix/dist/models/endpointUpdate.js
var require_endpointUpdate = __commonJS({
  "node_modules/svix/dist/models/endpointUpdate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EndpointUpdateSerializer = void 0;
    exports2.EndpointUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          uid: object["uid"],
          url: object["url"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          uid: self.uid,
          url: self.url,
          version: self.version
        };
      }
    };
  }
});

// node_modules/svix/dist/models/eventExampleIn.js
var require_eventExampleIn = __commonJS({
  "node_modules/svix/dist/models/eventExampleIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventExampleInSerializer = void 0;
    exports2.EventExampleInSerializer = {
      _fromJsonObject(object) {
        return {
          eventType: object["eventType"],
          exampleIndex: object["exampleIndex"]
        };
      },
      _toJsonObject(self) {
        return {
          eventType: self.eventType,
          exampleIndex: self.exampleIndex
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseEndpointOut.js
var require_listResponseEndpointOut = __commonJS({
  "node_modules/svix/dist/models/listResponseEndpointOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseEndpointOutSerializer = void 0;
    var endpointOut_1 = require_endpointOut();
    exports2.ListResponseEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => endpointOut_1.EndpointOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => endpointOut_1.EndpointOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/models/messageOut.js
var require_messageOut = __commonJS({
  "node_modules/svix/dist/models/messageOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MessageOutSerializer = void 0;
    exports2.MessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
          eventId: object["eventId"],
          eventType: object["eventType"],
          id: object["id"],
          payload: object["payload"],
          tags: object["tags"],
          timestamp: new Date(object["timestamp"])
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          deliverAt: self.deliverAt,
          eventId: self.eventId,
          eventType: self.eventType,
          id: self.id,
          payload: self.payload,
          tags: self.tags,
          timestamp: self.timestamp
        };
      }
    };
  }
});

// node_modules/svix/dist/models/recoverIn.js
var require_recoverIn = __commonJS({
  "node_modules/svix/dist/models/recoverIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RecoverInSerializer = void 0;
    exports2.RecoverInSerializer = {
      _fromJsonObject(object) {
        return {
          since: new Date(object["since"]),
          until: object["until"] ? new Date(object["until"]) : null
        };
      },
      _toJsonObject(self) {
        return {
          since: self.since,
          until: self.until
        };
      }
    };
  }
});

// node_modules/svix/dist/models/recoverOut.js
var require_recoverOut = __commonJS({
  "node_modules/svix/dist/models/recoverOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RecoverOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports2.RecoverOutSerializer = {
      _fromJsonObject(object) {
        return {
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"])
        };
      },
      _toJsonObject(self) {
        return {
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task)
        };
      }
    };
  }
});

// node_modules/svix/dist/models/replayIn.js
var require_replayIn = __commonJS({
  "node_modules/svix/dist/models/replayIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReplayInSerializer = void 0;
    exports2.ReplayInSerializer = {
      _fromJsonObject(object) {
        return {
          since: new Date(object["since"]),
          until: object["until"] ? new Date(object["until"]) : null
        };
      },
      _toJsonObject(self) {
        return {
          since: self.since,
          until: self.until
        };
      }
    };
  }
});

// node_modules/svix/dist/models/replayOut.js
var require_replayOut = __commonJS({
  "node_modules/svix/dist/models/replayOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReplayOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports2.ReplayOutSerializer = {
      _fromJsonObject(object) {
        return {
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"])
        };
      },
      _toJsonObject(self) {
        return {
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task)
        };
      }
    };
  }
});

// node_modules/svix/dist/api/endpoint.js
var require_endpoint = __commonJS({
  "node_modules/svix/dist/api/endpoint.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Endpoint = void 0;
    var endpointHeadersIn_1 = require_endpointHeadersIn();
    var endpointHeadersOut_1 = require_endpointHeadersOut();
    var endpointHeadersPatchIn_1 = require_endpointHeadersPatchIn();
    var endpointIn_1 = require_endpointIn();
    var endpointOut_1 = require_endpointOut();
    var endpointPatch_1 = require_endpointPatch();
    var endpointSecretOut_1 = require_endpointSecretOut();
    var endpointSecretRotateIn_1 = require_endpointSecretRotateIn();
    var endpointStats_1 = require_endpointStats();
    var endpointTransformationIn_1 = require_endpointTransformationIn();
    var endpointTransformationOut_1 = require_endpointTransformationOut();
    var endpointTransformationPatch_1 = require_endpointTransformationPatch();
    var endpointUpdate_1 = require_endpointUpdate();
    var eventExampleIn_1 = require_eventExampleIn();
    var listResponseEndpointOut_1 = require_listResponseEndpointOut();
    var messageOut_1 = require_messageOut();
    var recoverIn_1 = require_recoverIn();
    var recoverOut_1 = require_recoverOut();
    var replayIn_1 = require_replayIn();
    var replayOut_1 = require_replayOut();
    var request_1 = require_request();
    var Endpoint = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(appId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint");
        request.setPathParam("app_id", appId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseEndpointOut_1.ListResponseEndpointOutSerializer._fromJsonObject);
      }
      create(appId, endpointIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint");
        request.setPathParam("app_id", appId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(endpointIn_1.EndpointInSerializer._toJsonObject(endpointIn));
        return request.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
      }
      get(appId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
      }
      update(appId, endpointId, endpointUpdate) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(endpointUpdate_1.EndpointUpdateSerializer._toJsonObject(endpointUpdate));
        return request.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
      }
      delete(appId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      patch(appId, endpointId, endpointPatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(endpointPatch_1.EndpointPatchSerializer._toJsonObject(endpointPatch));
        return request.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
      }
      getHeaders(appId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, endpointHeadersOut_1.EndpointHeadersOutSerializer._fromJsonObject);
      }
      updateHeaders(appId, endpointId, endpointHeadersIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(endpointHeadersIn_1.EndpointHeadersInSerializer._toJsonObject(endpointHeadersIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
      headersUpdate(appId, endpointId, endpointHeadersIn) {
        return this.updateHeaders(appId, endpointId, endpointHeadersIn);
      }
      patchHeaders(appId, endpointId, endpointHeadersPatchIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(endpointHeadersPatchIn_1.EndpointHeadersPatchInSerializer._toJsonObject(endpointHeadersPatchIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
      headersPatch(appId, endpointId, endpointHeadersPatchIn) {
        return this.patchHeaders(appId, endpointId, endpointHeadersPatchIn);
      }
      recover(appId, endpointId, recoverIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/recover");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(recoverIn_1.RecoverInSerializer._toJsonObject(recoverIn));
        return request.send(this.requestCtx, recoverOut_1.RecoverOutSerializer._fromJsonObject);
      }
      replayMissing(appId, endpointId, replayIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/replay-missing");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(replayIn_1.ReplayInSerializer._toJsonObject(replayIn));
        return request.send(this.requestCtx, replayOut_1.ReplayOutSerializer._fromJsonObject);
      }
      getSecret(appId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/secret");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, endpointSecretOut_1.EndpointSecretOutSerializer._fromJsonObject);
      }
      rotateSecret(appId, endpointId, endpointSecretRotateIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/secret/rotate");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(endpointSecretRotateIn_1.EndpointSecretRotateInSerializer._toJsonObject(endpointSecretRotateIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
      sendExample(appId, endpointId, eventExampleIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/send-example");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(eventExampleIn_1.EventExampleInSerializer._toJsonObject(eventExampleIn));
        return request.send(this.requestCtx, messageOut_1.MessageOutSerializer._fromJsonObject);
      }
      getStats(appId, endpointId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/stats");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setQueryParams({
          since: options === null || options === void 0 ? void 0 : options.since,
          until: options === null || options === void 0 ? void 0 : options.until
        });
        return request.send(this.requestCtx, endpointStats_1.EndpointStatsSerializer._fromJsonObject);
      }
      transformationGet(appId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, endpointTransformationOut_1.EndpointTransformationOutSerializer._fromJsonObject);
      }
      patchTransformation(appId, endpointId, endpointTransformationPatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(endpointTransformationPatch_1.EndpointTransformationPatchSerializer._toJsonObject(endpointTransformationPatch));
        return request.sendNoResponseBody(this.requestCtx);
      }
      transformationPartialUpdate(appId, endpointId, endpointTransformationIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(endpointTransformationIn_1.EndpointTransformationInSerializer._toJsonObject(endpointTransformationIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
    };
    exports2.Endpoint = Endpoint;
  }
});

// node_modules/svix/dist/models/eventTypeIn.js
var require_eventTypeIn = __commonJS({
  "node_modules/svix/dist/models/eventTypeIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventTypeInSerializer = void 0;
    exports2.EventTypeInSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlag: object["featureFlag"],
          featureFlags: object["featureFlags"],
          groupName: object["groupName"],
          name: object["name"],
          schemas: object["schemas"]
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          deprecated: self.deprecated,
          description: self.description,
          featureFlag: self.featureFlag,
          featureFlags: self.featureFlags,
          groupName: self.groupName,
          name: self.name,
          schemas: self.schemas
        };
      }
    };
  }
});

// node_modules/svix/dist/models/environmentIn.js
var require_environmentIn = __commonJS({
  "node_modules/svix/dist/models/environmentIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EnvironmentInSerializer = void 0;
    var connectorIn_1 = require_connectorIn();
    var eventTypeIn_1 = require_eventTypeIn();
    exports2.EnvironmentInSerializer = {
      _fromJsonObject(object) {
        var _a, _b;
        return {
          connectors: (_a = object["connectors"]) === null || _a === void 0 ? void 0 : _a.map((item) => connectorIn_1.ConnectorInSerializer._fromJsonObject(item)),
          eventTypes: (_b = object["eventTypes"]) === null || _b === void 0 ? void 0 : _b.map((item) => eventTypeIn_1.EventTypeInSerializer._fromJsonObject(item)),
          settings: object["settings"]
        };
      },
      _toJsonObject(self) {
        var _a, _b;
        return {
          connectors: (_a = self.connectors) === null || _a === void 0 ? void 0 : _a.map((item) => connectorIn_1.ConnectorInSerializer._toJsonObject(item)),
          eventTypes: (_b = self.eventTypes) === null || _b === void 0 ? void 0 : _b.map((item) => eventTypeIn_1.EventTypeInSerializer._toJsonObject(item)),
          settings: self.settings
        };
      }
    };
  }
});

// node_modules/svix/dist/models/eventTypeOut.js
var require_eventTypeOut = __commonJS({
  "node_modules/svix/dist/models/eventTypeOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventTypeOutSerializer = void 0;
    exports2.EventTypeOutSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          createdAt: new Date(object["createdAt"]),
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlag: object["featureFlag"],
          featureFlags: object["featureFlags"],
          groupName: object["groupName"],
          name: object["name"],
          schemas: object["schemas"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          createdAt: self.createdAt,
          deprecated: self.deprecated,
          description: self.description,
          featureFlag: self.featureFlag,
          featureFlags: self.featureFlags,
          groupName: self.groupName,
          name: self.name,
          schemas: self.schemas,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// node_modules/svix/dist/models/environmentOut.js
var require_environmentOut = __commonJS({
  "node_modules/svix/dist/models/environmentOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EnvironmentOutSerializer = void 0;
    var connectorOut_1 = require_connectorOut();
    var eventTypeOut_1 = require_eventTypeOut();
    exports2.EnvironmentOutSerializer = {
      _fromJsonObject(object) {
        return {
          connectors: object["connectors"].map((item) => connectorOut_1.ConnectorOutSerializer._fromJsonObject(item)),
          createdAt: new Date(object["createdAt"]),
          eventTypes: object["eventTypes"].map((item) => eventTypeOut_1.EventTypeOutSerializer._fromJsonObject(item)),
          settings: object["settings"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          connectors: self.connectors.map((item) => connectorOut_1.ConnectorOutSerializer._toJsonObject(item)),
          createdAt: self.createdAt,
          eventTypes: self.eventTypes.map((item) => eventTypeOut_1.EventTypeOutSerializer._toJsonObject(item)),
          settings: self.settings,
          version: self.version
        };
      }
    };
  }
});

// node_modules/svix/dist/api/environment.js
var require_environment = __commonJS({
  "node_modules/svix/dist/api/environment.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Environment = void 0;
    var environmentIn_1 = require_environmentIn();
    var environmentOut_1 = require_environmentOut();
    var request_1 = require_request();
    var Environment = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      export(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/environment/export");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        return request.send(this.requestCtx, environmentOut_1.EnvironmentOutSerializer._fromJsonObject);
      }
      import(environmentIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/environment/import");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(environmentIn_1.EnvironmentInSerializer._toJsonObject(environmentIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
    };
    exports2.Environment = Environment;
  }
});

// node_modules/svix/dist/models/eventTypeImportOpenApiIn.js
var require_eventTypeImportOpenApiIn = __commonJS({
  "node_modules/svix/dist/models/eventTypeImportOpenApiIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventTypeImportOpenApiInSerializer = void 0;
    exports2.EventTypeImportOpenApiInSerializer = {
      _fromJsonObject(object) {
        return {
          dryRun: object["dryRun"],
          replaceAll: object["replaceAll"],
          spec: object["spec"],
          specRaw: object["specRaw"]
        };
      },
      _toJsonObject(self) {
        return {
          dryRun: self.dryRun,
          replaceAll: self.replaceAll,
          spec: self.spec,
          specRaw: self.specRaw
        };
      }
    };
  }
});

// node_modules/svix/dist/models/eventTypeFromOpenApi.js
var require_eventTypeFromOpenApi = __commonJS({
  "node_modules/svix/dist/models/eventTypeFromOpenApi.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventTypeFromOpenApiSerializer = void 0;
    exports2.EventTypeFromOpenApiSerializer = {
      _fromJsonObject(object) {
        return {
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlag: object["featureFlag"],
          featureFlags: object["featureFlags"],
          groupName: object["groupName"],
          name: object["name"],
          schemas: object["schemas"]
        };
      },
      _toJsonObject(self) {
        return {
          deprecated: self.deprecated,
          description: self.description,
          featureFlag: self.featureFlag,
          featureFlags: self.featureFlags,
          groupName: self.groupName,
          name: self.name,
          schemas: self.schemas
        };
      }
    };
  }
});

// node_modules/svix/dist/models/eventTypeImportOpenApiOutData.js
var require_eventTypeImportOpenApiOutData = __commonJS({
  "node_modules/svix/dist/models/eventTypeImportOpenApiOutData.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventTypeImportOpenApiOutDataSerializer = void 0;
    var eventTypeFromOpenApi_1 = require_eventTypeFromOpenApi();
    exports2.EventTypeImportOpenApiOutDataSerializer = {
      _fromJsonObject(object) {
        var _a;
        return {
          modified: object["modified"],
          toModify: (_a = object["to_modify"]) === null || _a === void 0 ? void 0 : _a.map((item) => eventTypeFromOpenApi_1.EventTypeFromOpenApiSerializer._fromJsonObject(item))
        };
      },
      _toJsonObject(self) {
        var _a;
        return {
          modified: self.modified,
          to_modify: (_a = self.toModify) === null || _a === void 0 ? void 0 : _a.map((item) => eventTypeFromOpenApi_1.EventTypeFromOpenApiSerializer._toJsonObject(item))
        };
      }
    };
  }
});

// node_modules/svix/dist/models/eventTypeImportOpenApiOut.js
var require_eventTypeImportOpenApiOut = __commonJS({
  "node_modules/svix/dist/models/eventTypeImportOpenApiOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventTypeImportOpenApiOutSerializer = void 0;
    var eventTypeImportOpenApiOutData_1 = require_eventTypeImportOpenApiOutData();
    exports2.EventTypeImportOpenApiOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: eventTypeImportOpenApiOutData_1.EventTypeImportOpenApiOutDataSerializer._fromJsonObject(object["data"])
        };
      },
      _toJsonObject(self) {
        return {
          data: eventTypeImportOpenApiOutData_1.EventTypeImportOpenApiOutDataSerializer._toJsonObject(self.data)
        };
      }
    };
  }
});

// node_modules/svix/dist/models/eventTypePatch.js
var require_eventTypePatch = __commonJS({
  "node_modules/svix/dist/models/eventTypePatch.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventTypePatchSerializer = void 0;
    exports2.EventTypePatchSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlag: object["featureFlag"],
          featureFlags: object["featureFlags"],
          groupName: object["groupName"],
          schemas: object["schemas"]
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          deprecated: self.deprecated,
          description: self.description,
          featureFlag: self.featureFlag,
          featureFlags: self.featureFlags,
          groupName: self.groupName,
          schemas: self.schemas
        };
      }
    };
  }
});

// node_modules/svix/dist/models/eventTypeUpdate.js
var require_eventTypeUpdate = __commonJS({
  "node_modules/svix/dist/models/eventTypeUpdate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventTypeUpdateSerializer = void 0;
    exports2.EventTypeUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlag: object["featureFlag"],
          featureFlags: object["featureFlags"],
          groupName: object["groupName"],
          schemas: object["schemas"]
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          deprecated: self.deprecated,
          description: self.description,
          featureFlag: self.featureFlag,
          featureFlags: self.featureFlags,
          groupName: self.groupName,
          schemas: self.schemas
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseEventTypeOut.js
var require_listResponseEventTypeOut = __commonJS({
  "node_modules/svix/dist/models/listResponseEventTypeOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseEventTypeOutSerializer = void 0;
    var eventTypeOut_1 = require_eventTypeOut();
    exports2.ListResponseEventTypeOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => eventTypeOut_1.EventTypeOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => eventTypeOut_1.EventTypeOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/api/eventType.js
var require_eventType = __commonJS({
  "node_modules/svix/dist/api/eventType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventType = void 0;
    var eventTypeImportOpenApiIn_1 = require_eventTypeImportOpenApiIn();
    var eventTypeImportOpenApiOut_1 = require_eventTypeImportOpenApiOut();
    var eventTypeIn_1 = require_eventTypeIn();
    var eventTypeOut_1 = require_eventTypeOut();
    var eventTypePatch_1 = require_eventTypePatch();
    var eventTypeUpdate_1 = require_eventTypeUpdate();
    var listResponseEventTypeOut_1 = require_listResponseEventTypeOut();
    var request_1 = require_request();
    var EventType = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/event-type");
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order,
          include_archived: options === null || options === void 0 ? void 0 : options.includeArchived,
          with_content: options === null || options === void 0 ? void 0 : options.withContent
        });
        return request.send(this.requestCtx, listResponseEventTypeOut_1.ListResponseEventTypeOutSerializer._fromJsonObject);
      }
      create(eventTypeIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/event-type");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(eventTypeIn_1.EventTypeInSerializer._toJsonObject(eventTypeIn));
        return request.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
      }
      importOpenapi(eventTypeImportOpenApiIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/event-type/import/openapi");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(eventTypeImportOpenApiIn_1.EventTypeImportOpenApiInSerializer._toJsonObject(eventTypeImportOpenApiIn));
        return request.send(this.requestCtx, eventTypeImportOpenApiOut_1.EventTypeImportOpenApiOutSerializer._fromJsonObject);
      }
      get(eventTypeName) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/event-type/{event_type_name}");
        request.setPathParam("event_type_name", eventTypeName);
        return request.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
      }
      update(eventTypeName, eventTypeUpdate) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/event-type/{event_type_name}");
        request.setPathParam("event_type_name", eventTypeName);
        request.setBody(eventTypeUpdate_1.EventTypeUpdateSerializer._toJsonObject(eventTypeUpdate));
        return request.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
      }
      delete(eventTypeName, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/event-type/{event_type_name}");
        request.setPathParam("event_type_name", eventTypeName);
        request.setQueryParams({
          expunge: options === null || options === void 0 ? void 0 : options.expunge
        });
        return request.sendNoResponseBody(this.requestCtx);
      }
      patch(eventTypeName, eventTypePatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/event-type/{event_type_name}");
        request.setPathParam("event_type_name", eventTypeName);
        request.setBody(eventTypePatch_1.EventTypePatchSerializer._toJsonObject(eventTypePatch));
        return request.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
      }
    };
    exports2.EventType = EventType;
  }
});

// node_modules/svix/dist/api/health.js
var require_health = __commonJS({
  "node_modules/svix/dist/api/health.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Health = void 0;
    var request_1 = require_request();
    var Health = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get() {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/health");
        return request.sendNoResponseBody(this.requestCtx);
      }
    };
    exports2.Health = Health;
  }
});

// node_modules/svix/dist/models/ingestSourceConsumerPortalAccessIn.js
var require_ingestSourceConsumerPortalAccessIn = __commonJS({
  "node_modules/svix/dist/models/ingestSourceConsumerPortalAccessIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IngestSourceConsumerPortalAccessInSerializer = void 0;
    exports2.IngestSourceConsumerPortalAccessInSerializer = {
      _fromJsonObject(object) {
        return {
          expiry: object["expiry"],
          readOnly: object["readOnly"]
        };
      },
      _toJsonObject(self) {
        return {
          expiry: self.expiry,
          readOnly: self.readOnly
        };
      }
    };
  }
});

// node_modules/svix/dist/models/ingestEndpointHeadersIn.js
var require_ingestEndpointHeadersIn = __commonJS({
  "node_modules/svix/dist/models/ingestEndpointHeadersIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IngestEndpointHeadersInSerializer = void 0;
    exports2.IngestEndpointHeadersInSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers
        };
      }
    };
  }
});

// node_modules/svix/dist/models/ingestEndpointHeadersOut.js
var require_ingestEndpointHeadersOut = __commonJS({
  "node_modules/svix/dist/models/ingestEndpointHeadersOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IngestEndpointHeadersOutSerializer = void 0;
    exports2.IngestEndpointHeadersOutSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"],
          sensitive: object["sensitive"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers,
          sensitive: self.sensitive
        };
      }
    };
  }
});

// node_modules/svix/dist/models/ingestEndpointIn.js
var require_ingestEndpointIn = __commonJS({
  "node_modules/svix/dist/models/ingestEndpointIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IngestEndpointInSerializer = void 0;
    exports2.IngestEndpointInSerializer = {
      _fromJsonObject(object) {
        return {
          description: object["description"],
          disabled: object["disabled"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          secret: object["secret"],
          uid: object["uid"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          description: self.description,
          disabled: self.disabled,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          secret: self.secret,
          uid: self.uid,
          url: self.url
        };
      }
    };
  }
});

// node_modules/svix/dist/models/ingestEndpointOut.js
var require_ingestEndpointOut = __commonJS({
  "node_modules/svix/dist/models/ingestEndpointOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IngestEndpointOutSerializer = void 0;
    exports2.IngestEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          description: object["description"],
          disabled: object["disabled"],
          id: object["id"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"]),
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          description: self.description,
          disabled: self.disabled,
          id: self.id,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          uid: self.uid,
          updatedAt: self.updatedAt,
          url: self.url
        };
      }
    };
  }
});

// node_modules/svix/dist/models/ingestEndpointSecretIn.js
var require_ingestEndpointSecretIn = __commonJS({
  "node_modules/svix/dist/models/ingestEndpointSecretIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IngestEndpointSecretInSerializer = void 0;
    exports2.IngestEndpointSecretInSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// node_modules/svix/dist/models/ingestEndpointSecretOut.js
var require_ingestEndpointSecretOut = __commonJS({
  "node_modules/svix/dist/models/ingestEndpointSecretOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IngestEndpointSecretOutSerializer = void 0;
    exports2.IngestEndpointSecretOutSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// node_modules/svix/dist/models/ingestEndpointTransformationOut.js
var require_ingestEndpointTransformationOut = __commonJS({
  "node_modules/svix/dist/models/ingestEndpointTransformationOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IngestEndpointTransformationOutSerializer = void 0;
    exports2.IngestEndpointTransformationOutSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled
        };
      }
    };
  }
});

// node_modules/svix/dist/models/ingestEndpointTransformationPatch.js
var require_ingestEndpointTransformationPatch = __commonJS({
  "node_modules/svix/dist/models/ingestEndpointTransformationPatch.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IngestEndpointTransformationPatchSerializer = void 0;
    exports2.IngestEndpointTransformationPatchSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled
        };
      }
    };
  }
});

// node_modules/svix/dist/models/ingestEndpointUpdate.js
var require_ingestEndpointUpdate = __commonJS({
  "node_modules/svix/dist/models/ingestEndpointUpdate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IngestEndpointUpdateSerializer = void 0;
    exports2.IngestEndpointUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          description: object["description"],
          disabled: object["disabled"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          uid: object["uid"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          description: self.description,
          disabled: self.disabled,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          uid: self.uid,
          url: self.url
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseIngestEndpointOut.js
var require_listResponseIngestEndpointOut = __commonJS({
  "node_modules/svix/dist/models/listResponseIngestEndpointOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseIngestEndpointOutSerializer = void 0;
    var ingestEndpointOut_1 = require_ingestEndpointOut();
    exports2.ListResponseIngestEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => ingestEndpointOut_1.IngestEndpointOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/api/ingestEndpoint.js
var require_ingestEndpoint = __commonJS({
  "node_modules/svix/dist/api/ingestEndpoint.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IngestEndpoint = void 0;
    var ingestEndpointHeadersIn_1 = require_ingestEndpointHeadersIn();
    var ingestEndpointHeadersOut_1 = require_ingestEndpointHeadersOut();
    var ingestEndpointIn_1 = require_ingestEndpointIn();
    var ingestEndpointOut_1 = require_ingestEndpointOut();
    var ingestEndpointSecretIn_1 = require_ingestEndpointSecretIn();
    var ingestEndpointSecretOut_1 = require_ingestEndpointSecretOut();
    var ingestEndpointTransformationOut_1 = require_ingestEndpointTransformationOut();
    var ingestEndpointTransformationPatch_1 = require_ingestEndpointTransformationPatch();
    var ingestEndpointUpdate_1 = require_ingestEndpointUpdate();
    var listResponseIngestEndpointOut_1 = require_listResponseIngestEndpointOut();
    var request_1 = require_request();
    var IngestEndpoint = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(sourceId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint");
        request.setPathParam("source_id", sourceId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseIngestEndpointOut_1.ListResponseIngestEndpointOutSerializer._fromJsonObject);
      }
      create(sourceId, ingestEndpointIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/endpoint");
        request.setPathParam("source_id", sourceId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(ingestEndpointIn_1.IngestEndpointInSerializer._toJsonObject(ingestEndpointIn));
        return request.send(this.requestCtx, ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject);
      }
      get(sourceId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject);
      }
      update(sourceId, endpointId, ingestEndpointUpdate) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(ingestEndpointUpdate_1.IngestEndpointUpdateSerializer._toJsonObject(ingestEndpointUpdate));
        return request.send(this.requestCtx, ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject);
      }
      delete(sourceId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      getHeaders(sourceId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/headers");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, ingestEndpointHeadersOut_1.IngestEndpointHeadersOutSerializer._fromJsonObject);
      }
      updateHeaders(sourceId, endpointId, ingestEndpointHeadersIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/headers");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(ingestEndpointHeadersIn_1.IngestEndpointHeadersInSerializer._toJsonObject(ingestEndpointHeadersIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
      getSecret(sourceId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/secret");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, ingestEndpointSecretOut_1.IngestEndpointSecretOutSerializer._fromJsonObject);
      }
      rotateSecret(sourceId, endpointId, ingestEndpointSecretIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/secret/rotate");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(ingestEndpointSecretIn_1.IngestEndpointSecretInSerializer._toJsonObject(ingestEndpointSecretIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
      getTransformation(sourceId, endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/transformation");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, ingestEndpointTransformationOut_1.IngestEndpointTransformationOutSerializer._fromJsonObject);
      }
      setTransformation(sourceId, endpointId, ingestEndpointTransformationPatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/transformation");
        request.setPathParam("source_id", sourceId);
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(ingestEndpointTransformationPatch_1.IngestEndpointTransformationPatchSerializer._toJsonObject(ingestEndpointTransformationPatch));
        return request.sendNoResponseBody(this.requestCtx);
      }
    };
    exports2.IngestEndpoint = IngestEndpoint;
  }
});

// node_modules/svix/dist/models/adobeSignConfig.js
var require_adobeSignConfig = __commonJS({
  "node_modules/svix/dist/models/adobeSignConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AdobeSignConfigSerializer = void 0;
    exports2.AdobeSignConfigSerializer = {
      _fromJsonObject(object) {
        return {
          clientId: object["clientId"]
        };
      },
      _toJsonObject(self) {
        return {
          clientId: self.clientId
        };
      }
    };
  }
});

// node_modules/svix/dist/models/airwallexConfig.js
var require_airwallexConfig = __commonJS({
  "node_modules/svix/dist/models/airwallexConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AirwallexConfigSerializer = void 0;
    exports2.AirwallexConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/checkbookConfig.js
var require_checkbookConfig = __commonJS({
  "node_modules/svix/dist/models/checkbookConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CheckbookConfigSerializer = void 0;
    exports2.CheckbookConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/cronConfig.js
var require_cronConfig = __commonJS({
  "node_modules/svix/dist/models/cronConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CronConfigSerializer = void 0;
    exports2.CronConfigSerializer = {
      _fromJsonObject(object) {
        return {
          contentType: object["contentType"],
          payload: object["payload"],
          schedule: object["schedule"]
        };
      },
      _toJsonObject(self) {
        return {
          contentType: self.contentType,
          payload: self.payload,
          schedule: self.schedule
        };
      }
    };
  }
});

// node_modules/svix/dist/models/docusignConfig.js
var require_docusignConfig = __commonJS({
  "node_modules/svix/dist/models/docusignConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DocusignConfigSerializer = void 0;
    exports2.DocusignConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/easypostConfig.js
var require_easypostConfig = __commonJS({
  "node_modules/svix/dist/models/easypostConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EasypostConfigSerializer = void 0;
    exports2.EasypostConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/githubConfig.js
var require_githubConfig = __commonJS({
  "node_modules/svix/dist/models/githubConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.GithubConfigSerializer = void 0;
    exports2.GithubConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/hubspotConfig.js
var require_hubspotConfig = __commonJS({
  "node_modules/svix/dist/models/hubspotConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.HubspotConfigSerializer = void 0;
    exports2.HubspotConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/orumIoConfig.js
var require_orumIoConfig = __commonJS({
  "node_modules/svix/dist/models/orumIoConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OrumIoConfigSerializer = void 0;
    exports2.OrumIoConfigSerializer = {
      _fromJsonObject(object) {
        return {
          publicKey: object["publicKey"]
        };
      },
      _toJsonObject(self) {
        return {
          publicKey: self.publicKey
        };
      }
    };
  }
});

// node_modules/svix/dist/models/pandaDocConfig.js
var require_pandaDocConfig = __commonJS({
  "node_modules/svix/dist/models/pandaDocConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PandaDocConfigSerializer = void 0;
    exports2.PandaDocConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/portIoConfig.js
var require_portIoConfig = __commonJS({
  "node_modules/svix/dist/models/portIoConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PortIoConfigSerializer = void 0;
    exports2.PortIoConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/rutterConfig.js
var require_rutterConfig = __commonJS({
  "node_modules/svix/dist/models/rutterConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RutterConfigSerializer = void 0;
    exports2.RutterConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/segmentConfig.js
var require_segmentConfig = __commonJS({
  "node_modules/svix/dist/models/segmentConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SegmentConfigSerializer = void 0;
    exports2.SegmentConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/shopifyConfig.js
var require_shopifyConfig = __commonJS({
  "node_modules/svix/dist/models/shopifyConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ShopifyConfigSerializer = void 0;
    exports2.ShopifyConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/slackConfig.js
var require_slackConfig = __commonJS({
  "node_modules/svix/dist/models/slackConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SlackConfigSerializer = void 0;
    exports2.SlackConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/stripeConfig.js
var require_stripeConfig = __commonJS({
  "node_modules/svix/dist/models/stripeConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StripeConfigSerializer = void 0;
    exports2.StripeConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/svixConfig.js
var require_svixConfig = __commonJS({
  "node_modules/svix/dist/models/svixConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SvixConfigSerializer = void 0;
    exports2.SvixConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/telnyxConfig.js
var require_telnyxConfig = __commonJS({
  "node_modules/svix/dist/models/telnyxConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TelnyxConfigSerializer = void 0;
    exports2.TelnyxConfigSerializer = {
      _fromJsonObject(object) {
        return {
          publicKey: object["publicKey"]
        };
      },
      _toJsonObject(self) {
        return {
          publicKey: self.publicKey
        };
      }
    };
  }
});

// node_modules/svix/dist/models/vapiConfig.js
var require_vapiConfig = __commonJS({
  "node_modules/svix/dist/models/vapiConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VapiConfigSerializer = void 0;
    exports2.VapiConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/veriffConfig.js
var require_veriffConfig = __commonJS({
  "node_modules/svix/dist/models/veriffConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VeriffConfigSerializer = void 0;
    exports2.VeriffConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/zoomConfig.js
var require_zoomConfig = __commonJS({
  "node_modules/svix/dist/models/zoomConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ZoomConfigSerializer = void 0;
    exports2.ZoomConfigSerializer = {
      _fromJsonObject(object) {
        return {
          secret: object["secret"]
        };
      },
      _toJsonObject(self) {
        return {
          secret: self.secret
        };
      }
    };
  }
});

// node_modules/svix/dist/models/ingestSourceIn.js
var require_ingestSourceIn = __commonJS({
  "node_modules/svix/dist/models/ingestSourceIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IngestSourceInSerializer = void 0;
    var adobeSignConfig_1 = require_adobeSignConfig();
    var airwallexConfig_1 = require_airwallexConfig();
    var checkbookConfig_1 = require_checkbookConfig();
    var cronConfig_1 = require_cronConfig();
    var docusignConfig_1 = require_docusignConfig();
    var easypostConfig_1 = require_easypostConfig();
    var githubConfig_1 = require_githubConfig();
    var hubspotConfig_1 = require_hubspotConfig();
    var orumIoConfig_1 = require_orumIoConfig();
    var pandaDocConfig_1 = require_pandaDocConfig();
    var portIoConfig_1 = require_portIoConfig();
    var rutterConfig_1 = require_rutterConfig();
    var segmentConfig_1 = require_segmentConfig();
    var shopifyConfig_1 = require_shopifyConfig();
    var slackConfig_1 = require_slackConfig();
    var stripeConfig_1 = require_stripeConfig();
    var svixConfig_1 = require_svixConfig();
    var telnyxConfig_1 = require_telnyxConfig();
    var vapiConfig_1 = require_vapiConfig();
    var veriffConfig_1 = require_veriffConfig();
    var zoomConfig_1 = require_zoomConfig();
    exports2.IngestSourceInSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "generic-webhook":
              return {};
            case "cron":
              return cronConfig_1.CronConfigSerializer._fromJsonObject(object["config"]);
            case "adobe-sign":
              return adobeSignConfig_1.AdobeSignConfigSerializer._fromJsonObject(object["config"]);
            case "beehiiv":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "brex":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "checkbook":
              return checkbookConfig_1.CheckbookConfigSerializer._fromJsonObject(object["config"]);
            case "clerk":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "docusign":
              return docusignConfig_1.DocusignConfigSerializer._fromJsonObject(object["config"]);
            case "easypost":
              return easypostConfig_1.EasypostConfigSerializer._fromJsonObject(object["config"]);
            case "github":
              return githubConfig_1.GithubConfigSerializer._fromJsonObject(object["config"]);
            case "guesty":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "hubspot":
              return hubspotConfig_1.HubspotConfigSerializer._fromJsonObject(object["config"]);
            case "incident-io":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "lithic":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "nash":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "orum-io":
              return orumIoConfig_1.OrumIoConfigSerializer._fromJsonObject(object["config"]);
            case "panda-doc":
              return pandaDocConfig_1.PandaDocConfigSerializer._fromJsonObject(object["config"]);
            case "port-io":
              return portIoConfig_1.PortIoConfigSerializer._fromJsonObject(object["config"]);
            case "pleo":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "replicate":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "resend":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "rutter":
              return rutterConfig_1.RutterConfigSerializer._fromJsonObject(object["config"]);
            case "safebase":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "sardine":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "segment":
              return segmentConfig_1.SegmentConfigSerializer._fromJsonObject(object["config"]);
            case "shopify":
              return shopifyConfig_1.ShopifyConfigSerializer._fromJsonObject(object["config"]);
            case "slack":
              return slackConfig_1.SlackConfigSerializer._fromJsonObject(object["config"]);
            case "stripe":
              return stripeConfig_1.StripeConfigSerializer._fromJsonObject(object["config"]);
            case "stych":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "svix":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "zoom":
              return zoomConfig_1.ZoomConfigSerializer._fromJsonObject(object["config"]);
            case "telnyx":
              return telnyxConfig_1.TelnyxConfigSerializer._fromJsonObject(object["config"]);
            case "vapi":
              return vapiConfig_1.VapiConfigSerializer._fromJsonObject(object["config"]);
            case "open-ai":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "render":
              return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
            case "veriff":
              return veriffConfig_1.VeriffConfigSerializer._fromJsonObject(object["config"]);
            case "airwallex":
              return airwallexConfig_1.AirwallexConfigSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        return {
          type,
          config: getConfig(type),
          metadata: object["metadata"],
          name: object["name"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "generic-webhook":
            config = {};
            break;
          case "cron":
            config = cronConfig_1.CronConfigSerializer._toJsonObject(self.config);
            break;
          case "adobe-sign":
            config = adobeSignConfig_1.AdobeSignConfigSerializer._toJsonObject(self.config);
            break;
          case "beehiiv":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "brex":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "checkbook":
            config = checkbookConfig_1.CheckbookConfigSerializer._toJsonObject(self.config);
            break;
          case "clerk":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "docusign":
            config = docusignConfig_1.DocusignConfigSerializer._toJsonObject(self.config);
            break;
          case "easypost":
            config = easypostConfig_1.EasypostConfigSerializer._toJsonObject(self.config);
            break;
          case "github":
            config = githubConfig_1.GithubConfigSerializer._toJsonObject(self.config);
            break;
          case "guesty":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "hubspot":
            config = hubspotConfig_1.HubspotConfigSerializer._toJsonObject(self.config);
            break;
          case "incident-io":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "lithic":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "nash":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "orum-io":
            config = orumIoConfig_1.OrumIoConfigSerializer._toJsonObject(self.config);
            break;
          case "panda-doc":
            config = pandaDocConfig_1.PandaDocConfigSerializer._toJsonObject(self.config);
            break;
          case "port-io":
            config = portIoConfig_1.PortIoConfigSerializer._toJsonObject(self.config);
            break;
          case "pleo":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "replicate":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "resend":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "rutter":
            config = rutterConfig_1.RutterConfigSerializer._toJsonObject(self.config);
            break;
          case "safebase":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "sardine":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "segment":
            config = segmentConfig_1.SegmentConfigSerializer._toJsonObject(self.config);
            break;
          case "shopify":
            config = shopifyConfig_1.ShopifyConfigSerializer._toJsonObject(self.config);
            break;
          case "slack":
            config = slackConfig_1.SlackConfigSerializer._toJsonObject(self.config);
            break;
          case "stripe":
            config = stripeConfig_1.StripeConfigSerializer._toJsonObject(self.config);
            break;
          case "stych":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "svix":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "zoom":
            config = zoomConfig_1.ZoomConfigSerializer._toJsonObject(self.config);
            break;
          case "telnyx":
            config = telnyxConfig_1.TelnyxConfigSerializer._toJsonObject(self.config);
            break;
          case "vapi":
            config = vapiConfig_1.VapiConfigSerializer._toJsonObject(self.config);
            break;
          case "open-ai":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "render":
            config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
            break;
          case "veriff":
            config = veriffConfig_1.VeriffConfigSerializer._toJsonObject(self.config);
            break;
          case "airwallex":
            config = airwallexConfig_1.AirwallexConfigSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config,
          metadata: self.metadata,
          name: self.name,
          uid: self.uid
        };
      }
    };
  }
});

// node_modules/svix/dist/models/adobeSignConfigOut.js
var require_adobeSignConfigOut = __commonJS({
  "node_modules/svix/dist/models/adobeSignConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AdobeSignConfigOutSerializer = void 0;
    exports2.AdobeSignConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/airwallexConfigOut.js
var require_airwallexConfigOut = __commonJS({
  "node_modules/svix/dist/models/airwallexConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AirwallexConfigOutSerializer = void 0;
    exports2.AirwallexConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/checkbookConfigOut.js
var require_checkbookConfigOut = __commonJS({
  "node_modules/svix/dist/models/checkbookConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CheckbookConfigOutSerializer = void 0;
    exports2.CheckbookConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/docusignConfigOut.js
var require_docusignConfigOut = __commonJS({
  "node_modules/svix/dist/models/docusignConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DocusignConfigOutSerializer = void 0;
    exports2.DocusignConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/easypostConfigOut.js
var require_easypostConfigOut = __commonJS({
  "node_modules/svix/dist/models/easypostConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EasypostConfigOutSerializer = void 0;
    exports2.EasypostConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/githubConfigOut.js
var require_githubConfigOut = __commonJS({
  "node_modules/svix/dist/models/githubConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.GithubConfigOutSerializer = void 0;
    exports2.GithubConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/hubspotConfigOut.js
var require_hubspotConfigOut = __commonJS({
  "node_modules/svix/dist/models/hubspotConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.HubspotConfigOutSerializer = void 0;
    exports2.HubspotConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/orumIoConfigOut.js
var require_orumIoConfigOut = __commonJS({
  "node_modules/svix/dist/models/orumIoConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OrumIoConfigOutSerializer = void 0;
    exports2.OrumIoConfigOutSerializer = {
      _fromJsonObject(object) {
        return {
          publicKey: object["publicKey"]
        };
      },
      _toJsonObject(self) {
        return {
          publicKey: self.publicKey
        };
      }
    };
  }
});

// node_modules/svix/dist/models/pandaDocConfigOut.js
var require_pandaDocConfigOut = __commonJS({
  "node_modules/svix/dist/models/pandaDocConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PandaDocConfigOutSerializer = void 0;
    exports2.PandaDocConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/portIoConfigOut.js
var require_portIoConfigOut = __commonJS({
  "node_modules/svix/dist/models/portIoConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PortIoConfigOutSerializer = void 0;
    exports2.PortIoConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/rutterConfigOut.js
var require_rutterConfigOut = __commonJS({
  "node_modules/svix/dist/models/rutterConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RutterConfigOutSerializer = void 0;
    exports2.RutterConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/segmentConfigOut.js
var require_segmentConfigOut = __commonJS({
  "node_modules/svix/dist/models/segmentConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SegmentConfigOutSerializer = void 0;
    exports2.SegmentConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/shopifyConfigOut.js
var require_shopifyConfigOut = __commonJS({
  "node_modules/svix/dist/models/shopifyConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ShopifyConfigOutSerializer = void 0;
    exports2.ShopifyConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/slackConfigOut.js
var require_slackConfigOut = __commonJS({
  "node_modules/svix/dist/models/slackConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SlackConfigOutSerializer = void 0;
    exports2.SlackConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/stripeConfigOut.js
var require_stripeConfigOut = __commonJS({
  "node_modules/svix/dist/models/stripeConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StripeConfigOutSerializer = void 0;
    exports2.StripeConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/svixConfigOut.js
var require_svixConfigOut = __commonJS({
  "node_modules/svix/dist/models/svixConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SvixConfigOutSerializer = void 0;
    exports2.SvixConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/telnyxConfigOut.js
var require_telnyxConfigOut = __commonJS({
  "node_modules/svix/dist/models/telnyxConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TelnyxConfigOutSerializer = void 0;
    exports2.TelnyxConfigOutSerializer = {
      _fromJsonObject(object) {
        return {
          publicKey: object["publicKey"]
        };
      },
      _toJsonObject(self) {
        return {
          publicKey: self.publicKey
        };
      }
    };
  }
});

// node_modules/svix/dist/models/vapiConfigOut.js
var require_vapiConfigOut = __commonJS({
  "node_modules/svix/dist/models/vapiConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VapiConfigOutSerializer = void 0;
    exports2.VapiConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/veriffConfigOut.js
var require_veriffConfigOut = __commonJS({
  "node_modules/svix/dist/models/veriffConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.VeriffConfigOutSerializer = void 0;
    exports2.VeriffConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/zoomConfigOut.js
var require_zoomConfigOut = __commonJS({
  "node_modules/svix/dist/models/zoomConfigOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ZoomConfigOutSerializer = void 0;
    exports2.ZoomConfigOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/ingestSourceOut.js
var require_ingestSourceOut = __commonJS({
  "node_modules/svix/dist/models/ingestSourceOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IngestSourceOutSerializer = void 0;
    var adobeSignConfigOut_1 = require_adobeSignConfigOut();
    var airwallexConfigOut_1 = require_airwallexConfigOut();
    var checkbookConfigOut_1 = require_checkbookConfigOut();
    var cronConfig_1 = require_cronConfig();
    var docusignConfigOut_1 = require_docusignConfigOut();
    var easypostConfigOut_1 = require_easypostConfigOut();
    var githubConfigOut_1 = require_githubConfigOut();
    var hubspotConfigOut_1 = require_hubspotConfigOut();
    var orumIoConfigOut_1 = require_orumIoConfigOut();
    var pandaDocConfigOut_1 = require_pandaDocConfigOut();
    var portIoConfigOut_1 = require_portIoConfigOut();
    var rutterConfigOut_1 = require_rutterConfigOut();
    var segmentConfigOut_1 = require_segmentConfigOut();
    var shopifyConfigOut_1 = require_shopifyConfigOut();
    var slackConfigOut_1 = require_slackConfigOut();
    var stripeConfigOut_1 = require_stripeConfigOut();
    var svixConfigOut_1 = require_svixConfigOut();
    var telnyxConfigOut_1 = require_telnyxConfigOut();
    var vapiConfigOut_1 = require_vapiConfigOut();
    var veriffConfigOut_1 = require_veriffConfigOut();
    var zoomConfigOut_1 = require_zoomConfigOut();
    exports2.IngestSourceOutSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "generic-webhook":
              return {};
            case "cron":
              return cronConfig_1.CronConfigSerializer._fromJsonObject(object["config"]);
            case "adobe-sign":
              return adobeSignConfigOut_1.AdobeSignConfigOutSerializer._fromJsonObject(object["config"]);
            case "beehiiv":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "brex":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "checkbook":
              return checkbookConfigOut_1.CheckbookConfigOutSerializer._fromJsonObject(object["config"]);
            case "clerk":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "docusign":
              return docusignConfigOut_1.DocusignConfigOutSerializer._fromJsonObject(object["config"]);
            case "easypost":
              return easypostConfigOut_1.EasypostConfigOutSerializer._fromJsonObject(object["config"]);
            case "github":
              return githubConfigOut_1.GithubConfigOutSerializer._fromJsonObject(object["config"]);
            case "guesty":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "hubspot":
              return hubspotConfigOut_1.HubspotConfigOutSerializer._fromJsonObject(object["config"]);
            case "incident-io":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "lithic":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "nash":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "orum-io":
              return orumIoConfigOut_1.OrumIoConfigOutSerializer._fromJsonObject(object["config"]);
            case "panda-doc":
              return pandaDocConfigOut_1.PandaDocConfigOutSerializer._fromJsonObject(object["config"]);
            case "port-io":
              return portIoConfigOut_1.PortIoConfigOutSerializer._fromJsonObject(object["config"]);
            case "pleo":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "replicate":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "resend":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "rutter":
              return rutterConfigOut_1.RutterConfigOutSerializer._fromJsonObject(object["config"]);
            case "safebase":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "sardine":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "segment":
              return segmentConfigOut_1.SegmentConfigOutSerializer._fromJsonObject(object["config"]);
            case "shopify":
              return shopifyConfigOut_1.ShopifyConfigOutSerializer._fromJsonObject(object["config"]);
            case "slack":
              return slackConfigOut_1.SlackConfigOutSerializer._fromJsonObject(object["config"]);
            case "stripe":
              return stripeConfigOut_1.StripeConfigOutSerializer._fromJsonObject(object["config"]);
            case "stych":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "svix":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "zoom":
              return zoomConfigOut_1.ZoomConfigOutSerializer._fromJsonObject(object["config"]);
            case "telnyx":
              return telnyxConfigOut_1.TelnyxConfigOutSerializer._fromJsonObject(object["config"]);
            case "vapi":
              return vapiConfigOut_1.VapiConfigOutSerializer._fromJsonObject(object["config"]);
            case "open-ai":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "render":
              return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
            case "veriff":
              return veriffConfigOut_1.VeriffConfigOutSerializer._fromJsonObject(object["config"]);
            case "airwallex":
              return airwallexConfigOut_1.AirwallexConfigOutSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        return {
          type,
          config: getConfig(type),
          createdAt: new Date(object["createdAt"]),
          id: object["id"],
          ingestUrl: object["ingestUrl"],
          metadata: object["metadata"],
          name: object["name"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "generic-webhook":
            config = {};
            break;
          case "cron":
            config = cronConfig_1.CronConfigSerializer._toJsonObject(self.config);
            break;
          case "adobe-sign":
            config = adobeSignConfigOut_1.AdobeSignConfigOutSerializer._toJsonObject(self.config);
            break;
          case "beehiiv":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "brex":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "checkbook":
            config = checkbookConfigOut_1.CheckbookConfigOutSerializer._toJsonObject(self.config);
            break;
          case "clerk":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "docusign":
            config = docusignConfigOut_1.DocusignConfigOutSerializer._toJsonObject(self.config);
            break;
          case "easypost":
            config = easypostConfigOut_1.EasypostConfigOutSerializer._toJsonObject(self.config);
            break;
          case "github":
            config = githubConfigOut_1.GithubConfigOutSerializer._toJsonObject(self.config);
            break;
          case "guesty":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "hubspot":
            config = hubspotConfigOut_1.HubspotConfigOutSerializer._toJsonObject(self.config);
            break;
          case "incident-io":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "lithic":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "nash":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "orum-io":
            config = orumIoConfigOut_1.OrumIoConfigOutSerializer._toJsonObject(self.config);
            break;
          case "panda-doc":
            config = pandaDocConfigOut_1.PandaDocConfigOutSerializer._toJsonObject(self.config);
            break;
          case "port-io":
            config = portIoConfigOut_1.PortIoConfigOutSerializer._toJsonObject(self.config);
            break;
          case "pleo":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "replicate":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "resend":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "rutter":
            config = rutterConfigOut_1.RutterConfigOutSerializer._toJsonObject(self.config);
            break;
          case "safebase":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "sardine":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "segment":
            config = segmentConfigOut_1.SegmentConfigOutSerializer._toJsonObject(self.config);
            break;
          case "shopify":
            config = shopifyConfigOut_1.ShopifyConfigOutSerializer._toJsonObject(self.config);
            break;
          case "slack":
            config = slackConfigOut_1.SlackConfigOutSerializer._toJsonObject(self.config);
            break;
          case "stripe":
            config = stripeConfigOut_1.StripeConfigOutSerializer._toJsonObject(self.config);
            break;
          case "stych":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "svix":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "zoom":
            config = zoomConfigOut_1.ZoomConfigOutSerializer._toJsonObject(self.config);
            break;
          case "telnyx":
            config = telnyxConfigOut_1.TelnyxConfigOutSerializer._toJsonObject(self.config);
            break;
          case "vapi":
            config = vapiConfigOut_1.VapiConfigOutSerializer._toJsonObject(self.config);
            break;
          case "open-ai":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "render":
            config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
            break;
          case "veriff":
            config = veriffConfigOut_1.VeriffConfigOutSerializer._toJsonObject(self.config);
            break;
          case "airwallex":
            config = airwallexConfigOut_1.AirwallexConfigOutSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config,
          createdAt: self.createdAt,
          id: self.id,
          ingestUrl: self.ingestUrl,
          metadata: self.metadata,
          name: self.name,
          uid: self.uid,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseIngestSourceOut.js
var require_listResponseIngestSourceOut = __commonJS({
  "node_modules/svix/dist/models/listResponseIngestSourceOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseIngestSourceOutSerializer = void 0;
    var ingestSourceOut_1 = require_ingestSourceOut();
    exports2.ListResponseIngestSourceOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => ingestSourceOut_1.IngestSourceOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/models/rotateTokenOut.js
var require_rotateTokenOut = __commonJS({
  "node_modules/svix/dist/models/rotateTokenOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RotateTokenOutSerializer = void 0;
    exports2.RotateTokenOutSerializer = {
      _fromJsonObject(object) {
        return {
          ingestUrl: object["ingestUrl"]
        };
      },
      _toJsonObject(self) {
        return {
          ingestUrl: self.ingestUrl
        };
      }
    };
  }
});

// node_modules/svix/dist/api/ingestSource.js
var require_ingestSource = __commonJS({
  "node_modules/svix/dist/api/ingestSource.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IngestSource = void 0;
    var ingestSourceIn_1 = require_ingestSourceIn();
    var ingestSourceOut_1 = require_ingestSourceOut();
    var listResponseIngestSourceOut_1 = require_listResponseIngestSourceOut();
    var rotateTokenOut_1 = require_rotateTokenOut();
    var request_1 = require_request();
    var IngestSource = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source");
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseIngestSourceOut_1.ListResponseIngestSourceOutSerializer._fromJsonObject);
      }
      create(ingestSourceIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(ingestSourceIn_1.IngestSourceInSerializer._toJsonObject(ingestSourceIn));
        return request.send(this.requestCtx, ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject);
      }
      get(sourceId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}");
        request.setPathParam("source_id", sourceId);
        return request.send(this.requestCtx, ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject);
      }
      update(sourceId, ingestSourceIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/ingest/api/v1/source/{source_id}");
        request.setPathParam("source_id", sourceId);
        request.setBody(ingestSourceIn_1.IngestSourceInSerializer._toJsonObject(ingestSourceIn));
        return request.send(this.requestCtx, ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject);
      }
      delete(sourceId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/ingest/api/v1/source/{source_id}");
        request.setPathParam("source_id", sourceId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      rotateToken(sourceId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/token/rotate");
        request.setPathParam("source_id", sourceId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        return request.send(this.requestCtx, rotateTokenOut_1.RotateTokenOutSerializer._fromJsonObject);
      }
    };
    exports2.IngestSource = IngestSource;
  }
});

// node_modules/svix/dist/api/ingest.js
var require_ingest = __commonJS({
  "node_modules/svix/dist/api/ingest.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Ingest = void 0;
    var dashboardAccessOut_1 = require_dashboardAccessOut();
    var ingestSourceConsumerPortalAccessIn_1 = require_ingestSourceConsumerPortalAccessIn();
    var ingestEndpoint_1 = require_ingestEndpoint();
    var ingestSource_1 = require_ingestSource();
    var request_1 = require_request();
    var Ingest = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get endpoint() {
        return new ingestEndpoint_1.IngestEndpoint(this.requestCtx);
      }
      get source() {
        return new ingestSource_1.IngestSource(this.requestCtx);
      }
      dashboard(sourceId, ingestSourceConsumerPortalAccessIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/dashboard");
        request.setPathParam("source_id", sourceId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(ingestSourceConsumerPortalAccessIn_1.IngestSourceConsumerPortalAccessInSerializer._toJsonObject(ingestSourceConsumerPortalAccessIn));
        return request.send(this.requestCtx, dashboardAccessOut_1.DashboardAccessOutSerializer._fromJsonObject);
      }
    };
    exports2.Ingest = Ingest;
  }
});

// node_modules/svix/dist/models/integrationIn.js
var require_integrationIn = __commonJS({
  "node_modules/svix/dist/models/integrationIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IntegrationInSerializer = void 0;
    exports2.IntegrationInSerializer = {
      _fromJsonObject(object) {
        return {
          featureFlags: object["featureFlags"],
          name: object["name"]
        };
      },
      _toJsonObject(self) {
        return {
          featureFlags: self.featureFlags,
          name: self.name
        };
      }
    };
  }
});

// node_modules/svix/dist/models/integrationKeyOut.js
var require_integrationKeyOut = __commonJS({
  "node_modules/svix/dist/models/integrationKeyOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IntegrationKeyOutSerializer = void 0;
    exports2.IntegrationKeyOutSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// node_modules/svix/dist/models/integrationOut.js
var require_integrationOut = __commonJS({
  "node_modules/svix/dist/models/integrationOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IntegrationOutSerializer = void 0;
    exports2.IntegrationOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          featureFlags: object["featureFlags"],
          id: object["id"],
          name: object["name"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          featureFlags: self.featureFlags,
          id: self.id,
          name: self.name,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// node_modules/svix/dist/models/integrationUpdate.js
var require_integrationUpdate = __commonJS({
  "node_modules/svix/dist/models/integrationUpdate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.IntegrationUpdateSerializer = void 0;
    exports2.IntegrationUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          featureFlags: object["featureFlags"],
          name: object["name"]
        };
      },
      _toJsonObject(self) {
        return {
          featureFlags: self.featureFlags,
          name: self.name
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseIntegrationOut.js
var require_listResponseIntegrationOut = __commonJS({
  "node_modules/svix/dist/models/listResponseIntegrationOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseIntegrationOutSerializer = void 0;
    var integrationOut_1 = require_integrationOut();
    exports2.ListResponseIntegrationOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => integrationOut_1.IntegrationOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => integrationOut_1.IntegrationOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/api/integration.js
var require_integration = __commonJS({
  "node_modules/svix/dist/api/integration.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Integration = void 0;
    var integrationIn_1 = require_integrationIn();
    var integrationKeyOut_1 = require_integrationKeyOut();
    var integrationOut_1 = require_integrationOut();
    var integrationUpdate_1 = require_integrationUpdate();
    var listResponseIntegrationOut_1 = require_listResponseIntegrationOut();
    var request_1 = require_request();
    var Integration = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(appId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/integration");
        request.setPathParam("app_id", appId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseIntegrationOut_1.ListResponseIntegrationOutSerializer._fromJsonObject);
      }
      create(appId, integrationIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/integration");
        request.setPathParam("app_id", appId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(integrationIn_1.IntegrationInSerializer._toJsonObject(integrationIn));
        return request.send(this.requestCtx, integrationOut_1.IntegrationOutSerializer._fromJsonObject);
      }
      get(appId, integId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/integration/{integ_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("integ_id", integId);
        return request.send(this.requestCtx, integrationOut_1.IntegrationOutSerializer._fromJsonObject);
      }
      update(appId, integId, integrationUpdate) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}/integration/{integ_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("integ_id", integId);
        request.setBody(integrationUpdate_1.IntegrationUpdateSerializer._toJsonObject(integrationUpdate));
        return request.send(this.requestCtx, integrationOut_1.IntegrationOutSerializer._fromJsonObject);
      }
      delete(appId, integId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/integration/{integ_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("integ_id", integId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      getKey(appId, integId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/integration/{integ_id}/key");
        request.setPathParam("app_id", appId);
        request.setPathParam("integ_id", integId);
        return request.send(this.requestCtx, integrationKeyOut_1.IntegrationKeyOutSerializer._fromJsonObject);
      }
      rotateKey(appId, integId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/integration/{integ_id}/key/rotate");
        request.setPathParam("app_id", appId);
        request.setPathParam("integ_id", integId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        return request.send(this.requestCtx, integrationKeyOut_1.IntegrationKeyOutSerializer._fromJsonObject);
      }
    };
    exports2.Integration = Integration;
  }
});

// node_modules/svix/dist/models/expungeAllContentsOut.js
var require_expungeAllContentsOut = __commonJS({
  "node_modules/svix/dist/models/expungeAllContentsOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ExpungeAllContentsOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports2.ExpungeAllContentsOutSerializer = {
      _fromJsonObject(object) {
        return {
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"])
        };
      },
      _toJsonObject(self) {
        return {
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task)
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseMessageOut.js
var require_listResponseMessageOut = __commonJS({
  "node_modules/svix/dist/models/listResponseMessageOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseMessageOutSerializer = void 0;
    var messageOut_1 = require_messageOut();
    exports2.ListResponseMessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => messageOut_1.MessageOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => messageOut_1.MessageOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/models/messagePrecheckIn.js
var require_messagePrecheckIn = __commonJS({
  "node_modules/svix/dist/models/messagePrecheckIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MessagePrecheckInSerializer = void 0;
    exports2.MessagePrecheckInSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          eventType: object["eventType"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          eventType: self.eventType
        };
      }
    };
  }
});

// node_modules/svix/dist/models/messagePrecheckOut.js
var require_messagePrecheckOut = __commonJS({
  "node_modules/svix/dist/models/messagePrecheckOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MessagePrecheckOutSerializer = void 0;
    exports2.MessagePrecheckOutSerializer = {
      _fromJsonObject(object) {
        return {
          active: object["active"]
        };
      },
      _toJsonObject(self) {
        return {
          active: self.active
        };
      }
    };
  }
});

// node_modules/svix/dist/models/pollingEndpointConsumerSeekIn.js
var require_pollingEndpointConsumerSeekIn = __commonJS({
  "node_modules/svix/dist/models/pollingEndpointConsumerSeekIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PollingEndpointConsumerSeekInSerializer = void 0;
    exports2.PollingEndpointConsumerSeekInSerializer = {
      _fromJsonObject(object) {
        return {
          after: new Date(object["after"])
        };
      },
      _toJsonObject(self) {
        return {
          after: self.after
        };
      }
    };
  }
});

// node_modules/svix/dist/models/pollingEndpointConsumerSeekOut.js
var require_pollingEndpointConsumerSeekOut = __commonJS({
  "node_modules/svix/dist/models/pollingEndpointConsumerSeekOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PollingEndpointConsumerSeekOutSerializer = void 0;
    exports2.PollingEndpointConsumerSeekOutSerializer = {
      _fromJsonObject(object) {
        return {
          iterator: object["iterator"]
        };
      },
      _toJsonObject(self) {
        return {
          iterator: self.iterator
        };
      }
    };
  }
});

// node_modules/svix/dist/models/pollingEndpointMessageOut.js
var require_pollingEndpointMessageOut = __commonJS({
  "node_modules/svix/dist/models/pollingEndpointMessageOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PollingEndpointMessageOutSerializer = void 0;
    exports2.PollingEndpointMessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
          eventId: object["eventId"],
          eventType: object["eventType"],
          headers: object["headers"],
          id: object["id"],
          payload: object["payload"],
          tags: object["tags"],
          timestamp: new Date(object["timestamp"])
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          deliverAt: self.deliverAt,
          eventId: self.eventId,
          eventType: self.eventType,
          headers: self.headers,
          id: self.id,
          payload: self.payload,
          tags: self.tags,
          timestamp: self.timestamp
        };
      }
    };
  }
});

// node_modules/svix/dist/models/pollingEndpointOut.js
var require_pollingEndpointOut = __commonJS({
  "node_modules/svix/dist/models/pollingEndpointOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PollingEndpointOutSerializer = void 0;
    var pollingEndpointMessageOut_1 = require_pollingEndpointMessageOut();
    exports2.PollingEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => pollingEndpointMessageOut_1.PollingEndpointMessageOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => pollingEndpointMessageOut_1.PollingEndpointMessageOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator
        };
      }
    };
  }
});

// node_modules/svix/dist/api/messagePoller.js
var require_messagePoller = __commonJS({
  "node_modules/svix/dist/api/messagePoller.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MessagePoller = void 0;
    var pollingEndpointConsumerSeekIn_1 = require_pollingEndpointConsumerSeekIn();
    var pollingEndpointConsumerSeekOut_1 = require_pollingEndpointConsumerSeekOut();
    var pollingEndpointOut_1 = require_pollingEndpointOut();
    var request_1 = require_request();
    var MessagePoller = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      poll(appId, sinkId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/poller/{sink_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("sink_id", sinkId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          event_type: options === null || options === void 0 ? void 0 : options.eventType,
          channel: options === null || options === void 0 ? void 0 : options.channel,
          after: options === null || options === void 0 ? void 0 : options.after
        });
        return request.send(this.requestCtx, pollingEndpointOut_1.PollingEndpointOutSerializer._fromJsonObject);
      }
      consumerPoll(appId, sinkId, consumerId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/poller/{sink_id}/consumer/{consumer_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("sink_id", sinkId);
        request.setPathParam("consumer_id", consumerId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator
        });
        return request.send(this.requestCtx, pollingEndpointOut_1.PollingEndpointOutSerializer._fromJsonObject);
      }
      consumerSeek(appId, sinkId, consumerId, pollingEndpointConsumerSeekIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/poller/{sink_id}/consumer/{consumer_id}/seek");
        request.setPathParam("app_id", appId);
        request.setPathParam("sink_id", sinkId);
        request.setPathParam("consumer_id", consumerId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(pollingEndpointConsumerSeekIn_1.PollingEndpointConsumerSeekInSerializer._toJsonObject(pollingEndpointConsumerSeekIn));
        return request.send(this.requestCtx, pollingEndpointConsumerSeekOut_1.PollingEndpointConsumerSeekOutSerializer._fromJsonObject);
      }
    };
    exports2.MessagePoller = MessagePoller;
  }
});

// node_modules/svix/dist/models/messageIn.js
var require_messageIn = __commonJS({
  "node_modules/svix/dist/models/messageIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MessageInSerializer = void 0;
    var applicationIn_1 = require_applicationIn();
    exports2.MessageInSerializer = {
      _fromJsonObject(object) {
        return {
          application: object["application"] != null ? applicationIn_1.ApplicationInSerializer._fromJsonObject(object["application"]) : void 0,
          channels: object["channels"],
          deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
          eventId: object["eventId"],
          eventType: object["eventType"],
          payload: object["payload"],
          payloadRetentionHours: object["payloadRetentionHours"],
          payloadRetentionPeriod: object["payloadRetentionPeriod"],
          tags: object["tags"],
          transformationsParams: object["transformationsParams"]
        };
      },
      _toJsonObject(self) {
        return {
          application: self.application != null ? applicationIn_1.ApplicationInSerializer._toJsonObject(self.application) : void 0,
          channels: self.channels,
          deliverAt: self.deliverAt,
          eventId: self.eventId,
          eventType: self.eventType,
          payload: self.payload,
          payloadRetentionHours: self.payloadRetentionHours,
          payloadRetentionPeriod: self.payloadRetentionPeriod,
          tags: self.tags,
          transformationsParams: self.transformationsParams
        };
      }
    };
  }
});

// node_modules/svix/dist/api/message.js
var require_message = __commonJS({
  "node_modules/svix/dist/api/message.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.messageInRaw = exports2.Message = void 0;
    var expungeAllContentsOut_1 = require_expungeAllContentsOut();
    var listResponseMessageOut_1 = require_listResponseMessageOut();
    var messageOut_1 = require_messageOut();
    var messagePrecheckIn_1 = require_messagePrecheckIn();
    var messagePrecheckOut_1 = require_messagePrecheckOut();
    var messagePoller_1 = require_messagePoller();
    var request_1 = require_request();
    var messageIn_1 = require_messageIn();
    var Message = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get poller() {
        return new messagePoller_1.MessagePoller(this.requestCtx);
      }
      list(appId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg");
        request.setPathParam("app_id", appId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          channel: options === null || options === void 0 ? void 0 : options.channel,
          before: options === null || options === void 0 ? void 0 : options.before,
          after: options === null || options === void 0 ? void 0 : options.after,
          with_content: options === null || options === void 0 ? void 0 : options.withContent,
          tag: options === null || options === void 0 ? void 0 : options.tag,
          event_types: options === null || options === void 0 ? void 0 : options.eventTypes
        });
        return request.send(this.requestCtx, listResponseMessageOut_1.ListResponseMessageOutSerializer._fromJsonObject);
      }
      create(appId, messageIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/msg");
        request.setPathParam("app_id", appId);
        request.setQueryParams({
          with_content: options === null || options === void 0 ? void 0 : options.withContent
        });
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(messageIn_1.MessageInSerializer._toJsonObject(messageIn));
        return request.send(this.requestCtx, messageOut_1.MessageOutSerializer._fromJsonObject);
      }
      expungeAllContents(appId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/msg/expunge-all-contents");
        request.setPathParam("app_id", appId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        return request.send(this.requestCtx, expungeAllContentsOut_1.ExpungeAllContentsOutSerializer._fromJsonObject);
      }
      precheck(appId, messagePrecheckIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/msg/precheck/active");
        request.setPathParam("app_id", appId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(messagePrecheckIn_1.MessagePrecheckInSerializer._toJsonObject(messagePrecheckIn));
        return request.send(this.requestCtx, messagePrecheckOut_1.MessagePrecheckOutSerializer._fromJsonObject);
      }
      get(appId, msgId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg/{msg_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("msg_id", msgId);
        request.setQueryParams({
          with_content: options === null || options === void 0 ? void 0 : options.withContent
        });
        return request.send(this.requestCtx, messageOut_1.MessageOutSerializer._fromJsonObject);
      }
      expungeContent(appId, msgId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/msg/{msg_id}/content");
        request.setPathParam("app_id", appId);
        request.setPathParam("msg_id", msgId);
        return request.sendNoResponseBody(this.requestCtx);
      }
    };
    exports2.Message = Message;
    function messageInRaw(eventType, payload, contentType) {
      const headers = contentType ? { "content-type": contentType } : void 0;
      return {
        eventType,
        payload: {},
        transformationsParams: {
          rawPayload: payload,
          headers
        }
      };
    }
    exports2.messageInRaw = messageInRaw;
  }
});

// node_modules/svix/dist/models/emptyResponse.js
var require_emptyResponse = __commonJS({
  "node_modules/svix/dist/models/emptyResponse.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EmptyResponseSerializer = void 0;
    exports2.EmptyResponseSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/messageStatus.js
var require_messageStatus = __commonJS({
  "node_modules/svix/dist/models/messageStatus.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MessageStatusSerializer = exports2.MessageStatus = void 0;
    var MessageStatus;
    (function(MessageStatus2) {
      MessageStatus2[MessageStatus2["Success"] = 0] = "Success";
      MessageStatus2[MessageStatus2["Pending"] = 1] = "Pending";
      MessageStatus2[MessageStatus2["Fail"] = 2] = "Fail";
      MessageStatus2[MessageStatus2["Sending"] = 3] = "Sending";
    })(MessageStatus = exports2.MessageStatus || (exports2.MessageStatus = {}));
    exports2.MessageStatusSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// node_modules/svix/dist/models/messageStatusText.js
var require_messageStatusText = __commonJS({
  "node_modules/svix/dist/models/messageStatusText.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MessageStatusTextSerializer = exports2.MessageStatusText = void 0;
    var MessageStatusText;
    (function(MessageStatusText2) {
      MessageStatusText2["Success"] = "success";
      MessageStatusText2["Pending"] = "pending";
      MessageStatusText2["Fail"] = "fail";
      MessageStatusText2["Sending"] = "sending";
    })(MessageStatusText = exports2.MessageStatusText || (exports2.MessageStatusText = {}));
    exports2.MessageStatusTextSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// node_modules/svix/dist/models/endpointMessageOut.js
var require_endpointMessageOut = __commonJS({
  "node_modules/svix/dist/models/endpointMessageOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EndpointMessageOutSerializer = void 0;
    var messageStatus_1 = require_messageStatus();
    var messageStatusText_1 = require_messageStatusText();
    exports2.EndpointMessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
          eventId: object["eventId"],
          eventType: object["eventType"],
          id: object["id"],
          nextAttempt: object["nextAttempt"] ? new Date(object["nextAttempt"]) : null,
          payload: object["payload"],
          status: messageStatus_1.MessageStatusSerializer._fromJsonObject(object["status"]),
          statusText: messageStatusText_1.MessageStatusTextSerializer._fromJsonObject(object["statusText"]),
          tags: object["tags"],
          timestamp: new Date(object["timestamp"])
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          deliverAt: self.deliverAt,
          eventId: self.eventId,
          eventType: self.eventType,
          id: self.id,
          nextAttempt: self.nextAttempt,
          payload: self.payload,
          status: messageStatus_1.MessageStatusSerializer._toJsonObject(self.status),
          statusText: messageStatusText_1.MessageStatusTextSerializer._toJsonObject(self.statusText),
          tags: self.tags,
          timestamp: self.timestamp
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseEndpointMessageOut.js
var require_listResponseEndpointMessageOut = __commonJS({
  "node_modules/svix/dist/models/listResponseEndpointMessageOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseEndpointMessageOutSerializer = void 0;
    var endpointMessageOut_1 = require_endpointMessageOut();
    exports2.ListResponseEndpointMessageOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => endpointMessageOut_1.EndpointMessageOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => endpointMessageOut_1.EndpointMessageOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/models/messageAttemptTriggerType.js
var require_messageAttemptTriggerType = __commonJS({
  "node_modules/svix/dist/models/messageAttemptTriggerType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MessageAttemptTriggerTypeSerializer = exports2.MessageAttemptTriggerType = void 0;
    var MessageAttemptTriggerType;
    (function(MessageAttemptTriggerType2) {
      MessageAttemptTriggerType2[MessageAttemptTriggerType2["Scheduled"] = 0] = "Scheduled";
      MessageAttemptTriggerType2[MessageAttemptTriggerType2["Manual"] = 1] = "Manual";
    })(MessageAttemptTriggerType = exports2.MessageAttemptTriggerType || (exports2.MessageAttemptTriggerType = {}));
    exports2.MessageAttemptTriggerTypeSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// node_modules/svix/dist/models/messageAttemptOut.js
var require_messageAttemptOut = __commonJS({
  "node_modules/svix/dist/models/messageAttemptOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MessageAttemptOutSerializer = void 0;
    var messageAttemptTriggerType_1 = require_messageAttemptTriggerType();
    var messageOut_1 = require_messageOut();
    var messageStatus_1 = require_messageStatus();
    var messageStatusText_1 = require_messageStatusText();
    exports2.MessageAttemptOutSerializer = {
      _fromJsonObject(object) {
        return {
          endpointId: object["endpointId"],
          id: object["id"],
          msg: object["msg"] != null ? messageOut_1.MessageOutSerializer._fromJsonObject(object["msg"]) : void 0,
          msgId: object["msgId"],
          response: object["response"],
          responseDurationMs: object["responseDurationMs"],
          responseStatusCode: object["responseStatusCode"],
          status: messageStatus_1.MessageStatusSerializer._fromJsonObject(object["status"]),
          statusText: messageStatusText_1.MessageStatusTextSerializer._fromJsonObject(object["statusText"]),
          timestamp: new Date(object["timestamp"]),
          triggerType: messageAttemptTriggerType_1.MessageAttemptTriggerTypeSerializer._fromJsonObject(object["triggerType"]),
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          endpointId: self.endpointId,
          id: self.id,
          msg: self.msg != null ? messageOut_1.MessageOutSerializer._toJsonObject(self.msg) : void 0,
          msgId: self.msgId,
          response: self.response,
          responseDurationMs: self.responseDurationMs,
          responseStatusCode: self.responseStatusCode,
          status: messageStatus_1.MessageStatusSerializer._toJsonObject(self.status),
          statusText: messageStatusText_1.MessageStatusTextSerializer._toJsonObject(self.statusText),
          timestamp: self.timestamp,
          triggerType: messageAttemptTriggerType_1.MessageAttemptTriggerTypeSerializer._toJsonObject(self.triggerType),
          url: self.url
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseMessageAttemptOut.js
var require_listResponseMessageAttemptOut = __commonJS({
  "node_modules/svix/dist/models/listResponseMessageAttemptOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseMessageAttemptOutSerializer = void 0;
    var messageAttemptOut_1 = require_messageAttemptOut();
    exports2.ListResponseMessageAttemptOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => messageAttemptOut_1.MessageAttemptOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => messageAttemptOut_1.MessageAttemptOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/models/messageEndpointOut.js
var require_messageEndpointOut = __commonJS({
  "node_modules/svix/dist/models/messageEndpointOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MessageEndpointOutSerializer = void 0;
    var messageStatus_1 = require_messageStatus();
    var messageStatusText_1 = require_messageStatusText();
    exports2.MessageEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          channels: object["channels"],
          createdAt: new Date(object["createdAt"]),
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          id: object["id"],
          nextAttempt: object["nextAttempt"] ? new Date(object["nextAttempt"]) : null,
          rateLimit: object["rateLimit"],
          status: messageStatus_1.MessageStatusSerializer._fromJsonObject(object["status"]),
          statusText: messageStatusText_1.MessageStatusTextSerializer._fromJsonObject(object["statusText"]),
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"]),
          url: object["url"],
          version: object["version"]
        };
      },
      _toJsonObject(self) {
        return {
          channels: self.channels,
          createdAt: self.createdAt,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          id: self.id,
          nextAttempt: self.nextAttempt,
          rateLimit: self.rateLimit,
          status: messageStatus_1.MessageStatusSerializer._toJsonObject(self.status),
          statusText: messageStatusText_1.MessageStatusTextSerializer._toJsonObject(self.statusText),
          uid: self.uid,
          updatedAt: self.updatedAt,
          url: self.url,
          version: self.version
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseMessageEndpointOut.js
var require_listResponseMessageEndpointOut = __commonJS({
  "node_modules/svix/dist/models/listResponseMessageEndpointOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseMessageEndpointOutSerializer = void 0;
    var messageEndpointOut_1 = require_messageEndpointOut();
    exports2.ListResponseMessageEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => messageEndpointOut_1.MessageEndpointOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => messageEndpointOut_1.MessageEndpointOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/api/messageAttempt.js
var require_messageAttempt = __commonJS({
  "node_modules/svix/dist/api/messageAttempt.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MessageAttempt = void 0;
    var emptyResponse_1 = require_emptyResponse();
    var listResponseEndpointMessageOut_1 = require_listResponseEndpointMessageOut();
    var listResponseMessageAttemptOut_1 = require_listResponseMessageAttemptOut();
    var listResponseMessageEndpointOut_1 = require_listResponseMessageEndpointOut();
    var messageAttemptOut_1 = require_messageAttemptOut();
    var request_1 = require_request();
    var MessageAttempt = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      listByEndpoint(appId, endpointId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/attempt/endpoint/{endpoint_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          status: options === null || options === void 0 ? void 0 : options.status,
          status_code_class: options === null || options === void 0 ? void 0 : options.statusCodeClass,
          channel: options === null || options === void 0 ? void 0 : options.channel,
          tag: options === null || options === void 0 ? void 0 : options.tag,
          before: options === null || options === void 0 ? void 0 : options.before,
          after: options === null || options === void 0 ? void 0 : options.after,
          with_content: options === null || options === void 0 ? void 0 : options.withContent,
          with_msg: options === null || options === void 0 ? void 0 : options.withMsg,
          event_types: options === null || options === void 0 ? void 0 : options.eventTypes
        });
        return request.send(this.requestCtx, listResponseMessageAttemptOut_1.ListResponseMessageAttemptOutSerializer._fromJsonObject);
      }
      listByMsg(appId, msgId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/attempt/msg/{msg_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("msg_id", msgId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          status: options === null || options === void 0 ? void 0 : options.status,
          status_code_class: options === null || options === void 0 ? void 0 : options.statusCodeClass,
          channel: options === null || options === void 0 ? void 0 : options.channel,
          tag: options === null || options === void 0 ? void 0 : options.tag,
          endpoint_id: options === null || options === void 0 ? void 0 : options.endpointId,
          before: options === null || options === void 0 ? void 0 : options.before,
          after: options === null || options === void 0 ? void 0 : options.after,
          with_content: options === null || options === void 0 ? void 0 : options.withContent,
          event_types: options === null || options === void 0 ? void 0 : options.eventTypes
        });
        return request.send(this.requestCtx, listResponseMessageAttemptOut_1.ListResponseMessageAttemptOutSerializer._fromJsonObject);
      }
      listAttemptedMessages(appId, endpointId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/msg");
        request.setPathParam("app_id", appId);
        request.setPathParam("endpoint_id", endpointId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          channel: options === null || options === void 0 ? void 0 : options.channel,
          tag: options === null || options === void 0 ? void 0 : options.tag,
          status: options === null || options === void 0 ? void 0 : options.status,
          before: options === null || options === void 0 ? void 0 : options.before,
          after: options === null || options === void 0 ? void 0 : options.after,
          with_content: options === null || options === void 0 ? void 0 : options.withContent,
          event_types: options === null || options === void 0 ? void 0 : options.eventTypes
        });
        return request.send(this.requestCtx, listResponseEndpointMessageOut_1.ListResponseEndpointMessageOutSerializer._fromJsonObject);
      }
      get(appId, msgId, attemptId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg/{msg_id}/attempt/{attempt_id}");
        request.setPathParam("app_id", appId);
        request.setPathParam("msg_id", msgId);
        request.setPathParam("attempt_id", attemptId);
        return request.send(this.requestCtx, messageAttemptOut_1.MessageAttemptOutSerializer._fromJsonObject);
      }
      expungeContent(appId, msgId, attemptId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/msg/{msg_id}/attempt/{attempt_id}/content");
        request.setPathParam("app_id", appId);
        request.setPathParam("msg_id", msgId);
        request.setPathParam("attempt_id", attemptId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      listAttemptedDestinations(appId, msgId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg/{msg_id}/endpoint");
        request.setPathParam("app_id", appId);
        request.setPathParam("msg_id", msgId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator
        });
        return request.send(this.requestCtx, listResponseMessageEndpointOut_1.ListResponseMessageEndpointOutSerializer._fromJsonObject);
      }
      resend(appId, msgId, endpointId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/msg/{msg_id}/endpoint/{endpoint_id}/resend");
        request.setPathParam("app_id", appId);
        request.setPathParam("msg_id", msgId);
        request.setPathParam("endpoint_id", endpointId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        return request.send(this.requestCtx, emptyResponse_1.EmptyResponseSerializer._fromJsonObject);
      }
    };
    exports2.MessageAttempt = MessageAttempt;
  }
});

// node_modules/svix/dist/models/operationalWebhookEndpointOut.js
var require_operationalWebhookEndpointOut = __commonJS({
  "node_modules/svix/dist/models/operationalWebhookEndpointOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OperationalWebhookEndpointOutSerializer = void 0;
    exports2.OperationalWebhookEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          id: object["id"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"]),
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          id: self.id,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          uid: self.uid,
          updatedAt: self.updatedAt,
          url: self.url
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseOperationalWebhookEndpointOut.js
var require_listResponseOperationalWebhookEndpointOut = __commonJS({
  "node_modules/svix/dist/models/listResponseOperationalWebhookEndpointOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseOperationalWebhookEndpointOutSerializer = void 0;
    var operationalWebhookEndpointOut_1 = require_operationalWebhookEndpointOut();
    exports2.ListResponseOperationalWebhookEndpointOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/models/operationalWebhookEndpointHeadersIn.js
var require_operationalWebhookEndpointHeadersIn = __commonJS({
  "node_modules/svix/dist/models/operationalWebhookEndpointHeadersIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OperationalWebhookEndpointHeadersInSerializer = void 0;
    exports2.OperationalWebhookEndpointHeadersInSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers
        };
      }
    };
  }
});

// node_modules/svix/dist/models/operationalWebhookEndpointHeadersOut.js
var require_operationalWebhookEndpointHeadersOut = __commonJS({
  "node_modules/svix/dist/models/operationalWebhookEndpointHeadersOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OperationalWebhookEndpointHeadersOutSerializer = void 0;
    exports2.OperationalWebhookEndpointHeadersOutSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"],
          sensitive: object["sensitive"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers,
          sensitive: self.sensitive
        };
      }
    };
  }
});

// node_modules/svix/dist/models/operationalWebhookEndpointIn.js
var require_operationalWebhookEndpointIn = __commonJS({
  "node_modules/svix/dist/models/operationalWebhookEndpointIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OperationalWebhookEndpointInSerializer = void 0;
    exports2.OperationalWebhookEndpointInSerializer = {
      _fromJsonObject(object) {
        return {
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          secret: object["secret"],
          uid: object["uid"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          secret: self.secret,
          uid: self.uid,
          url: self.url
        };
      }
    };
  }
});

// node_modules/svix/dist/models/operationalWebhookEndpointSecretIn.js
var require_operationalWebhookEndpointSecretIn = __commonJS({
  "node_modules/svix/dist/models/operationalWebhookEndpointSecretIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OperationalWebhookEndpointSecretInSerializer = void 0;
    exports2.OperationalWebhookEndpointSecretInSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// node_modules/svix/dist/models/operationalWebhookEndpointSecretOut.js
var require_operationalWebhookEndpointSecretOut = __commonJS({
  "node_modules/svix/dist/models/operationalWebhookEndpointSecretOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OperationalWebhookEndpointSecretOutSerializer = void 0;
    exports2.OperationalWebhookEndpointSecretOutSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// node_modules/svix/dist/models/operationalWebhookEndpointUpdate.js
var require_operationalWebhookEndpointUpdate = __commonJS({
  "node_modules/svix/dist/models/operationalWebhookEndpointUpdate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OperationalWebhookEndpointUpdateSerializer = void 0;
    exports2.OperationalWebhookEndpointUpdateSerializer = {
      _fromJsonObject(object) {
        return {
          description: object["description"],
          disabled: object["disabled"],
          filterTypes: object["filterTypes"],
          metadata: object["metadata"],
          rateLimit: object["rateLimit"],
          uid: object["uid"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          description: self.description,
          disabled: self.disabled,
          filterTypes: self.filterTypes,
          metadata: self.metadata,
          rateLimit: self.rateLimit,
          uid: self.uid,
          url: self.url
        };
      }
    };
  }
});

// node_modules/svix/dist/api/operationalWebhookEndpoint.js
var require_operationalWebhookEndpoint = __commonJS({
  "node_modules/svix/dist/api/operationalWebhookEndpoint.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OperationalWebhookEndpoint = void 0;
    var listResponseOperationalWebhookEndpointOut_1 = require_listResponseOperationalWebhookEndpointOut();
    var operationalWebhookEndpointHeadersIn_1 = require_operationalWebhookEndpointHeadersIn();
    var operationalWebhookEndpointHeadersOut_1 = require_operationalWebhookEndpointHeadersOut();
    var operationalWebhookEndpointIn_1 = require_operationalWebhookEndpointIn();
    var operationalWebhookEndpointOut_1 = require_operationalWebhookEndpointOut();
    var operationalWebhookEndpointSecretIn_1 = require_operationalWebhookEndpointSecretIn();
    var operationalWebhookEndpointSecretOut_1 = require_operationalWebhookEndpointSecretOut();
    var operationalWebhookEndpointUpdate_1 = require_operationalWebhookEndpointUpdate();
    var request_1 = require_request();
    var OperationalWebhookEndpoint = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint");
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseOperationalWebhookEndpointOut_1.ListResponseOperationalWebhookEndpointOutSerializer._fromJsonObject);
      }
      create(operationalWebhookEndpointIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/operational-webhook/endpoint");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(operationalWebhookEndpointIn_1.OperationalWebhookEndpointInSerializer._toJsonObject(operationalWebhookEndpointIn));
        return request.send(this.requestCtx, operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject);
      }
      get(endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint/{endpoint_id}");
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject);
      }
      update(endpointId, operationalWebhookEndpointUpdate) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/operational-webhook/endpoint/{endpoint_id}");
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(operationalWebhookEndpointUpdate_1.OperationalWebhookEndpointUpdateSerializer._toJsonObject(operationalWebhookEndpointUpdate));
        return request.send(this.requestCtx, operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject);
      }
      delete(endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/operational-webhook/endpoint/{endpoint_id}");
        request.setPathParam("endpoint_id", endpointId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      getHeaders(endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint/{endpoint_id}/headers");
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, operationalWebhookEndpointHeadersOut_1.OperationalWebhookEndpointHeadersOutSerializer._fromJsonObject);
      }
      updateHeaders(endpointId, operationalWebhookEndpointHeadersIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/operational-webhook/endpoint/{endpoint_id}/headers");
        request.setPathParam("endpoint_id", endpointId);
        request.setBody(operationalWebhookEndpointHeadersIn_1.OperationalWebhookEndpointHeadersInSerializer._toJsonObject(operationalWebhookEndpointHeadersIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
      getSecret(endpointId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint/{endpoint_id}/secret");
        request.setPathParam("endpoint_id", endpointId);
        return request.send(this.requestCtx, operationalWebhookEndpointSecretOut_1.OperationalWebhookEndpointSecretOutSerializer._fromJsonObject);
      }
      rotateSecret(endpointId, operationalWebhookEndpointSecretIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/operational-webhook/endpoint/{endpoint_id}/secret/rotate");
        request.setPathParam("endpoint_id", endpointId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(operationalWebhookEndpointSecretIn_1.OperationalWebhookEndpointSecretInSerializer._toJsonObject(operationalWebhookEndpointSecretIn));
        return request.sendNoResponseBody(this.requestCtx);
      }
    };
    exports2.OperationalWebhookEndpoint = OperationalWebhookEndpoint;
  }
});

// node_modules/svix/dist/api/operationalWebhook.js
var require_operationalWebhook = __commonJS({
  "node_modules/svix/dist/api/operationalWebhook.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OperationalWebhook = void 0;
    var operationalWebhookEndpoint_1 = require_operationalWebhookEndpoint();
    var OperationalWebhook = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get endpoint() {
        return new operationalWebhookEndpoint_1.OperationalWebhookEndpoint(this.requestCtx);
      }
    };
    exports2.OperationalWebhook = OperationalWebhook;
  }
});

// node_modules/svix/dist/models/aggregateEventTypesOut.js
var require_aggregateEventTypesOut = __commonJS({
  "node_modules/svix/dist/models/aggregateEventTypesOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AggregateEventTypesOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports2.AggregateEventTypesOutSerializer = {
      _fromJsonObject(object) {
        return {
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"])
        };
      },
      _toJsonObject(self) {
        return {
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task)
        };
      }
    };
  }
});

// node_modules/svix/dist/models/appUsageStatsIn.js
var require_appUsageStatsIn = __commonJS({
  "node_modules/svix/dist/models/appUsageStatsIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AppUsageStatsInSerializer = void 0;
    exports2.AppUsageStatsInSerializer = {
      _fromJsonObject(object) {
        return {
          appIds: object["appIds"],
          since: new Date(object["since"]),
          until: new Date(object["until"])
        };
      },
      _toJsonObject(self) {
        return {
          appIds: self.appIds,
          since: self.since,
          until: self.until
        };
      }
    };
  }
});

// node_modules/svix/dist/models/appUsageStatsOut.js
var require_appUsageStatsOut = __commonJS({
  "node_modules/svix/dist/models/appUsageStatsOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AppUsageStatsOutSerializer = void 0;
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    var backgroundTaskType_1 = require_backgroundTaskType();
    exports2.AppUsageStatsOutSerializer = {
      _fromJsonObject(object) {
        return {
          id: object["id"],
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"]),
          unresolvedAppIds: object["unresolvedAppIds"]
        };
      },
      _toJsonObject(self) {
        return {
          id: self.id,
          status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
          task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task),
          unresolvedAppIds: self.unresolvedAppIds
        };
      }
    };
  }
});

// node_modules/svix/dist/api/statistics.js
var require_statistics = __commonJS({
  "node_modules/svix/dist/api/statistics.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Statistics = void 0;
    var aggregateEventTypesOut_1 = require_aggregateEventTypesOut();
    var appUsageStatsIn_1 = require_appUsageStatsIn();
    var appUsageStatsOut_1 = require_appUsageStatsOut();
    var request_1 = require_request();
    var Statistics = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      aggregateAppStats(appUsageStatsIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stats/usage/app");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(appUsageStatsIn_1.AppUsageStatsInSerializer._toJsonObject(appUsageStatsIn));
        return request.send(this.requestCtx, appUsageStatsOut_1.AppUsageStatsOutSerializer._fromJsonObject);
      }
      aggregateEventTypes() {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stats/usage/event-types");
        return request.send(this.requestCtx, aggregateEventTypesOut_1.AggregateEventTypesOutSerializer._fromJsonObject);
      }
    };
    exports2.Statistics = Statistics;
  }
});

// node_modules/svix/dist/models/httpSinkHeadersPatchIn.js
var require_httpSinkHeadersPatchIn = __commonJS({
  "node_modules/svix/dist/models/httpSinkHeadersPatchIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.HttpSinkHeadersPatchInSerializer = void 0;
    exports2.HttpSinkHeadersPatchInSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers
        };
      }
    };
  }
});

// node_modules/svix/dist/models/sinkTransformationOut.js
var require_sinkTransformationOut = __commonJS({
  "node_modules/svix/dist/models/sinkTransformationOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SinkTransformationOutSerializer = void 0;
    exports2.SinkTransformationOutSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"],
          enabled: object["enabled"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code,
          enabled: self.enabled
        };
      }
    };
  }
});

// node_modules/svix/dist/models/streamEventTypeOut.js
var require_streamEventTypeOut = __commonJS({
  "node_modules/svix/dist/models/streamEventTypeOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamEventTypeOutSerializer = void 0;
    exports2.StreamEventTypeOutSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          createdAt: new Date(object["createdAt"]),
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          name: object["name"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          createdAt: self.createdAt,
          deprecated: self.deprecated,
          description: self.description,
          featureFlags: self.featureFlags,
          name: self.name,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseStreamEventTypeOut.js
var require_listResponseStreamEventTypeOut = __commonJS({
  "node_modules/svix/dist/models/listResponseStreamEventTypeOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseStreamEventTypeOutSerializer = void 0;
    var streamEventTypeOut_1 = require_streamEventTypeOut();
    exports2.ListResponseStreamEventTypeOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => streamEventTypeOut_1.StreamEventTypeOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/models/streamEventTypeIn.js
var require_streamEventTypeIn = __commonJS({
  "node_modules/svix/dist/models/streamEventTypeIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamEventTypeInSerializer = void 0;
    exports2.StreamEventTypeInSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          name: object["name"]
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          deprecated: self.deprecated,
          description: self.description,
          featureFlags: self.featureFlags,
          name: self.name
        };
      }
    };
  }
});

// node_modules/svix/dist/models/streamEventTypePatch.js
var require_streamEventTypePatch = __commonJS({
  "node_modules/svix/dist/models/streamEventTypePatch.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamEventTypePatchSerializer = void 0;
    exports2.StreamEventTypePatchSerializer = {
      _fromJsonObject(object) {
        return {
          archived: object["archived"],
          deprecated: object["deprecated"],
          description: object["description"],
          featureFlags: object["featureFlags"],
          name: object["name"]
        };
      },
      _toJsonObject(self) {
        return {
          archived: self.archived,
          deprecated: self.deprecated,
          description: self.description,
          featureFlags: self.featureFlags,
          name: self.name
        };
      }
    };
  }
});

// node_modules/svix/dist/api/streamingEventType.js
var require_streamingEventType = __commonJS({
  "node_modules/svix/dist/api/streamingEventType.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamingEventType = void 0;
    var listResponseStreamEventTypeOut_1 = require_listResponseStreamEventTypeOut();
    var streamEventTypeIn_1 = require_streamEventTypeIn();
    var streamEventTypeOut_1 = require_streamEventTypeOut();
    var streamEventTypePatch_1 = require_streamEventTypePatch();
    var request_1 = require_request();
    var StreamingEventType = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/event-type");
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order,
          include_archived: options === null || options === void 0 ? void 0 : options.includeArchived
        });
        return request.send(this.requestCtx, listResponseStreamEventTypeOut_1.ListResponseStreamEventTypeOutSerializer._fromJsonObject);
      }
      create(streamEventTypeIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/event-type");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(streamEventTypeIn_1.StreamEventTypeInSerializer._toJsonObject(streamEventTypeIn));
        return request.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
      }
      get(name) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/event-type/{name}");
        request.setPathParam("name", name);
        return request.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
      }
      update(name, streamEventTypeIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stream/event-type/{name}");
        request.setPathParam("name", name);
        request.setBody(streamEventTypeIn_1.StreamEventTypeInSerializer._toJsonObject(streamEventTypeIn));
        return request.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
      }
      delete(name, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/stream/event-type/{name}");
        request.setPathParam("name", name);
        request.setQueryParams({
          expunge: options === null || options === void 0 ? void 0 : options.expunge
        });
        return request.sendNoResponseBody(this.requestCtx);
      }
      patch(name, streamEventTypePatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/event-type/{name}");
        request.setPathParam("name", name);
        request.setBody(streamEventTypePatch_1.StreamEventTypePatchSerializer._toJsonObject(streamEventTypePatch));
        return request.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
      }
    };
    exports2.StreamingEventType = StreamingEventType;
  }
});

// node_modules/svix/dist/models/eventIn.js
var require_eventIn = __commonJS({
  "node_modules/svix/dist/models/eventIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventInSerializer = void 0;
    exports2.EventInSerializer = {
      _fromJsonObject(object) {
        return {
          eventType: object["eventType"],
          payload: object["payload"]
        };
      },
      _toJsonObject(self) {
        return {
          eventType: self.eventType,
          payload: self.payload
        };
      }
    };
  }
});

// node_modules/svix/dist/models/streamIn.js
var require_streamIn = __commonJS({
  "node_modules/svix/dist/models/streamIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamInSerializer = void 0;
    exports2.StreamInSerializer = {
      _fromJsonObject(object) {
        return {
          metadata: object["metadata"],
          name: object["name"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          metadata: self.metadata,
          name: self.name,
          uid: self.uid
        };
      }
    };
  }
});

// node_modules/svix/dist/models/createStreamEventsIn.js
var require_createStreamEventsIn = __commonJS({
  "node_modules/svix/dist/models/createStreamEventsIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CreateStreamEventsInSerializer = void 0;
    var eventIn_1 = require_eventIn();
    var streamIn_1 = require_streamIn();
    exports2.CreateStreamEventsInSerializer = {
      _fromJsonObject(object) {
        return {
          events: object["events"].map((item) => eventIn_1.EventInSerializer._fromJsonObject(item)),
          stream: object["stream"] != null ? streamIn_1.StreamInSerializer._fromJsonObject(object["stream"]) : void 0
        };
      },
      _toJsonObject(self) {
        return {
          events: self.events.map((item) => eventIn_1.EventInSerializer._toJsonObject(item)),
          stream: self.stream != null ? streamIn_1.StreamInSerializer._toJsonObject(self.stream) : void 0
        };
      }
    };
  }
});

// node_modules/svix/dist/models/createStreamEventsOut.js
var require_createStreamEventsOut = __commonJS({
  "node_modules/svix/dist/models/createStreamEventsOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CreateStreamEventsOutSerializer = void 0;
    exports2.CreateStreamEventsOutSerializer = {
      _fromJsonObject(_object) {
        return {};
      },
      _toJsonObject(_self) {
        return {};
      }
    };
  }
});

// node_modules/svix/dist/models/eventOut.js
var require_eventOut = __commonJS({
  "node_modules/svix/dist/models/eventOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventOutSerializer = void 0;
    exports2.EventOutSerializer = {
      _fromJsonObject(object) {
        return {
          eventType: object["eventType"],
          payload: object["payload"],
          timestamp: new Date(object["timestamp"])
        };
      },
      _toJsonObject(self) {
        return {
          eventType: self.eventType,
          payload: self.payload,
          timestamp: self.timestamp
        };
      }
    };
  }
});

// node_modules/svix/dist/models/eventStreamOut.js
var require_eventStreamOut = __commonJS({
  "node_modules/svix/dist/models/eventStreamOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EventStreamOutSerializer = void 0;
    var eventOut_1 = require_eventOut();
    exports2.EventStreamOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => eventOut_1.EventOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => eventOut_1.EventOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator
        };
      }
    };
  }
});

// node_modules/svix/dist/api/streamingEvents.js
var require_streamingEvents = __commonJS({
  "node_modules/svix/dist/api/streamingEvents.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamingEvents = void 0;
    var createStreamEventsIn_1 = require_createStreamEventsIn();
    var createStreamEventsOut_1 = require_createStreamEventsOut();
    var eventStreamOut_1 = require_eventStreamOut();
    var request_1 = require_request();
    var StreamingEvents = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      create(streamId, createStreamEventsIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/{stream_id}/events");
        request.setPathParam("stream_id", streamId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(createStreamEventsIn_1.CreateStreamEventsInSerializer._toJsonObject(createStreamEventsIn));
        return request.send(this.requestCtx, createStreamEventsOut_1.CreateStreamEventsOutSerializer._fromJsonObject);
      }
      get(streamId, sinkId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/events");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          after: options === null || options === void 0 ? void 0 : options.after
        });
        return request.send(this.requestCtx, eventStreamOut_1.EventStreamOutSerializer._fromJsonObject);
      }
    };
    exports2.StreamingEvents = StreamingEvents;
  }
});

// node_modules/svix/dist/models/azureBlobStorageConfig.js
var require_azureBlobStorageConfig = __commonJS({
  "node_modules/svix/dist/models/azureBlobStorageConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AzureBlobStorageConfigSerializer = void 0;
    exports2.AzureBlobStorageConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKey: object["accessKey"],
          account: object["account"],
          container: object["container"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKey: self.accessKey,
          account: self.account,
          container: self.container
        };
      }
    };
  }
});

// node_modules/svix/dist/models/googleCloudStorageConfig.js
var require_googleCloudStorageConfig = __commonJS({
  "node_modules/svix/dist/models/googleCloudStorageConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.GoogleCloudStorageConfigSerializer = void 0;
    exports2.GoogleCloudStorageConfigSerializer = {
      _fromJsonObject(object) {
        return {
          bucket: object["bucket"],
          credentials: object["credentials"]
        };
      },
      _toJsonObject(self) {
        return {
          bucket: self.bucket,
          credentials: self.credentials
        };
      }
    };
  }
});

// node_modules/svix/dist/models/s3Config.js
var require_s3Config = __commonJS({
  "node_modules/svix/dist/models/s3Config.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.S3ConfigSerializer = void 0;
    exports2.S3ConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKeyId: object["accessKeyId"],
          bucket: object["bucket"],
          region: object["region"],
          secretAccessKey: object["secretAccessKey"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKeyId: self.accessKeyId,
          bucket: self.bucket,
          region: self.region,
          secretAccessKey: self.secretAccessKey
        };
      }
    };
  }
});

// node_modules/svix/dist/models/sinkHttpConfig.js
var require_sinkHttpConfig = __commonJS({
  "node_modules/svix/dist/models/sinkHttpConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SinkHttpConfigSerializer = void 0;
    exports2.SinkHttpConfigSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"],
          key: object["key"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers,
          key: self.key,
          url: self.url
        };
      }
    };
  }
});

// node_modules/svix/dist/models/sinkOtelV1Config.js
var require_sinkOtelV1Config = __commonJS({
  "node_modules/svix/dist/models/sinkOtelV1Config.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SinkOtelV1ConfigSerializer = void 0;
    exports2.SinkOtelV1ConfigSerializer = {
      _fromJsonObject(object) {
        return {
          headers: object["headers"],
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          headers: self.headers,
          url: self.url
        };
      }
    };
  }
});

// node_modules/svix/dist/models/sinkStatus.js
var require_sinkStatus = __commonJS({
  "node_modules/svix/dist/models/sinkStatus.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SinkStatusSerializer = exports2.SinkStatus = void 0;
    var SinkStatus;
    (function(SinkStatus2) {
      SinkStatus2["Enabled"] = "enabled";
      SinkStatus2["Paused"] = "paused";
      SinkStatus2["Disabled"] = "disabled";
      SinkStatus2["Retrying"] = "retrying";
    })(SinkStatus = exports2.SinkStatus || (exports2.SinkStatus = {}));
    exports2.SinkStatusSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// node_modules/svix/dist/models/streamSinkOut.js
var require_streamSinkOut = __commonJS({
  "node_modules/svix/dist/models/streamSinkOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamSinkOutSerializer = void 0;
    var azureBlobStorageConfig_1 = require_azureBlobStorageConfig();
    var googleCloudStorageConfig_1 = require_googleCloudStorageConfig();
    var s3Config_1 = require_s3Config();
    var sinkHttpConfig_1 = require_sinkHttpConfig();
    var sinkOtelV1Config_1 = require_sinkOtelV1Config();
    var sinkStatus_1 = require_sinkStatus();
    exports2.StreamSinkOutSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "poller":
              return {};
            case "azureBlobStorage":
              return azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._fromJsonObject(object["config"]);
            case "otelTracing":
              return sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._fromJsonObject(object["config"]);
            case "http":
              return sinkHttpConfig_1.SinkHttpConfigSerializer._fromJsonObject(object["config"]);
            case "amazonS3":
              return s3Config_1.S3ConfigSerializer._fromJsonObject(object["config"]);
            case "googleCloudStorage":
              return googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        return {
          type,
          config: getConfig(type),
          batchSize: object["batchSize"],
          createdAt: new Date(object["createdAt"]),
          currentIterator: object["currentIterator"],
          eventTypes: object["eventTypes"],
          failureReason: object["failureReason"],
          id: object["id"],
          maxWaitSecs: object["maxWaitSecs"],
          metadata: object["metadata"],
          nextRetryAt: object["nextRetryAt"] ? new Date(object["nextRetryAt"]) : null,
          status: sinkStatus_1.SinkStatusSerializer._fromJsonObject(object["status"]),
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "poller":
            config = {};
            break;
          case "azureBlobStorage":
            config = azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._toJsonObject(self.config);
            break;
          case "otelTracing":
            config = sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._toJsonObject(self.config);
            break;
          case "http":
            config = sinkHttpConfig_1.SinkHttpConfigSerializer._toJsonObject(self.config);
            break;
          case "amazonS3":
            config = s3Config_1.S3ConfigSerializer._toJsonObject(self.config);
            break;
          case "googleCloudStorage":
            config = googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config,
          batchSize: self.batchSize,
          createdAt: self.createdAt,
          currentIterator: self.currentIterator,
          eventTypes: self.eventTypes,
          failureReason: self.failureReason,
          id: self.id,
          maxWaitSecs: self.maxWaitSecs,
          metadata: self.metadata,
          nextRetryAt: self.nextRetryAt,
          status: sinkStatus_1.SinkStatusSerializer._toJsonObject(self.status),
          uid: self.uid,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseStreamSinkOut.js
var require_listResponseStreamSinkOut = __commonJS({
  "node_modules/svix/dist/models/listResponseStreamSinkOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseStreamSinkOutSerializer = void 0;
    var streamSinkOut_1 = require_streamSinkOut();
    exports2.ListResponseStreamSinkOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => streamSinkOut_1.StreamSinkOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/models/sinkSecretOut.js
var require_sinkSecretOut = __commonJS({
  "node_modules/svix/dist/models/sinkSecretOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SinkSecretOutSerializer = void 0;
    exports2.SinkSecretOutSerializer = {
      _fromJsonObject(object) {
        return {
          key: object["key"]
        };
      },
      _toJsonObject(self) {
        return {
          key: self.key
        };
      }
    };
  }
});

// node_modules/svix/dist/models/sinkTransformIn.js
var require_sinkTransformIn = __commonJS({
  "node_modules/svix/dist/models/sinkTransformIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SinkTransformInSerializer = void 0;
    exports2.SinkTransformInSerializer = {
      _fromJsonObject(object) {
        return {
          code: object["code"]
        };
      },
      _toJsonObject(self) {
        return {
          code: self.code
        };
      }
    };
  }
});

// node_modules/svix/dist/models/sinkStatusIn.js
var require_sinkStatusIn = __commonJS({
  "node_modules/svix/dist/models/sinkStatusIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SinkStatusInSerializer = exports2.SinkStatusIn = void 0;
    var SinkStatusIn;
    (function(SinkStatusIn2) {
      SinkStatusIn2["Enabled"] = "enabled";
      SinkStatusIn2["Disabled"] = "disabled";
    })(SinkStatusIn = exports2.SinkStatusIn || (exports2.SinkStatusIn = {}));
    exports2.SinkStatusInSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// node_modules/svix/dist/models/streamSinkIn.js
var require_streamSinkIn = __commonJS({
  "node_modules/svix/dist/models/streamSinkIn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamSinkInSerializer = void 0;
    var azureBlobStorageConfig_1 = require_azureBlobStorageConfig();
    var googleCloudStorageConfig_1 = require_googleCloudStorageConfig();
    var s3Config_1 = require_s3Config();
    var sinkHttpConfig_1 = require_sinkHttpConfig();
    var sinkOtelV1Config_1 = require_sinkOtelV1Config();
    var sinkStatusIn_1 = require_sinkStatusIn();
    exports2.StreamSinkInSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "poller":
              return {};
            case "azureBlobStorage":
              return azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._fromJsonObject(object["config"]);
            case "otelTracing":
              return sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._fromJsonObject(object["config"]);
            case "http":
              return sinkHttpConfig_1.SinkHttpConfigSerializer._fromJsonObject(object["config"]);
            case "amazonS3":
              return s3Config_1.S3ConfigSerializer._fromJsonObject(object["config"]);
            case "googleCloudStorage":
              return googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        return {
          type,
          config: getConfig(type),
          batchSize: object["batchSize"],
          eventTypes: object["eventTypes"],
          maxWaitSecs: object["maxWaitSecs"],
          metadata: object["metadata"],
          status: object["status"] != null ? sinkStatusIn_1.SinkStatusInSerializer._fromJsonObject(object["status"]) : void 0,
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "poller":
            config = {};
            break;
          case "azureBlobStorage":
            config = azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._toJsonObject(self.config);
            break;
          case "otelTracing":
            config = sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._toJsonObject(self.config);
            break;
          case "http":
            config = sinkHttpConfig_1.SinkHttpConfigSerializer._toJsonObject(self.config);
            break;
          case "amazonS3":
            config = s3Config_1.S3ConfigSerializer._toJsonObject(self.config);
            break;
          case "googleCloudStorage":
            config = googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config,
          batchSize: self.batchSize,
          eventTypes: self.eventTypes,
          maxWaitSecs: self.maxWaitSecs,
          metadata: self.metadata,
          status: self.status != null ? sinkStatusIn_1.SinkStatusInSerializer._toJsonObject(self.status) : void 0,
          uid: self.uid
        };
      }
    };
  }
});

// node_modules/svix/dist/models/amazonS3PatchConfig.js
var require_amazonS3PatchConfig = __commonJS({
  "node_modules/svix/dist/models/amazonS3PatchConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AmazonS3PatchConfigSerializer = void 0;
    exports2.AmazonS3PatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKeyId: object["accessKeyId"],
          bucket: object["bucket"],
          region: object["region"],
          secretAccessKey: object["secretAccessKey"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKeyId: self.accessKeyId,
          bucket: self.bucket,
          region: self.region,
          secretAccessKey: self.secretAccessKey
        };
      }
    };
  }
});

// node_modules/svix/dist/models/azureBlobStoragePatchConfig.js
var require_azureBlobStoragePatchConfig = __commonJS({
  "node_modules/svix/dist/models/azureBlobStoragePatchConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AzureBlobStoragePatchConfigSerializer = void 0;
    exports2.AzureBlobStoragePatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          accessKey: object["accessKey"],
          account: object["account"],
          container: object["container"]
        };
      },
      _toJsonObject(self) {
        return {
          accessKey: self.accessKey,
          account: self.account,
          container: self.container
        };
      }
    };
  }
});

// node_modules/svix/dist/models/googleCloudStoragePatchConfig.js
var require_googleCloudStoragePatchConfig = __commonJS({
  "node_modules/svix/dist/models/googleCloudStoragePatchConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.GoogleCloudStoragePatchConfigSerializer = void 0;
    exports2.GoogleCloudStoragePatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          bucket: object["bucket"],
          credentials: object["credentials"]
        };
      },
      _toJsonObject(self) {
        return {
          bucket: self.bucket,
          credentials: self.credentials
        };
      }
    };
  }
});

// node_modules/svix/dist/models/httpPatchConfig.js
var require_httpPatchConfig = __commonJS({
  "node_modules/svix/dist/models/httpPatchConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.HttpPatchConfigSerializer = void 0;
    exports2.HttpPatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          url: self.url
        };
      }
    };
  }
});

// node_modules/svix/dist/models/otelTracingPatchConfig.js
var require_otelTracingPatchConfig = __commonJS({
  "node_modules/svix/dist/models/otelTracingPatchConfig.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OtelTracingPatchConfigSerializer = void 0;
    exports2.OtelTracingPatchConfigSerializer = {
      _fromJsonObject(object) {
        return {
          url: object["url"]
        };
      },
      _toJsonObject(self) {
        return {
          url: self.url
        };
      }
    };
  }
});

// node_modules/svix/dist/models/streamSinkPatch.js
var require_streamSinkPatch = __commonJS({
  "node_modules/svix/dist/models/streamSinkPatch.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamSinkPatchSerializer = void 0;
    var amazonS3PatchConfig_1 = require_amazonS3PatchConfig();
    var azureBlobStoragePatchConfig_1 = require_azureBlobStoragePatchConfig();
    var googleCloudStoragePatchConfig_1 = require_googleCloudStoragePatchConfig();
    var httpPatchConfig_1 = require_httpPatchConfig();
    var otelTracingPatchConfig_1 = require_otelTracingPatchConfig();
    var sinkStatusIn_1 = require_sinkStatusIn();
    exports2.StreamSinkPatchSerializer = {
      _fromJsonObject(object) {
        const type = object["type"];
        function getConfig(type2) {
          switch (type2) {
            case "poller":
              return {};
            case "azureBlobStorage":
              return azureBlobStoragePatchConfig_1.AzureBlobStoragePatchConfigSerializer._fromJsonObject(object["config"]);
            case "otelTracing":
              return otelTracingPatchConfig_1.OtelTracingPatchConfigSerializer._fromJsonObject(object["config"]);
            case "http":
              return httpPatchConfig_1.HttpPatchConfigSerializer._fromJsonObject(object["config"]);
            case "amazonS3":
              return amazonS3PatchConfig_1.AmazonS3PatchConfigSerializer._fromJsonObject(object["config"]);
            case "googleCloudStorage":
              return googleCloudStoragePatchConfig_1.GoogleCloudStoragePatchConfigSerializer._fromJsonObject(object["config"]);
            default:
              throw new Error(`Unexpected type: ${type2}`);
          }
        }
        return {
          type,
          config: getConfig(type),
          batchSize: object["batchSize"],
          eventTypes: object["eventTypes"],
          maxWaitSecs: object["maxWaitSecs"],
          metadata: object["metadata"],
          status: object["status"] != null ? sinkStatusIn_1.SinkStatusInSerializer._fromJsonObject(object["status"]) : void 0,
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        let config;
        switch (self.type) {
          case "poller":
            config = {};
            break;
          case "azureBlobStorage":
            config = azureBlobStoragePatchConfig_1.AzureBlobStoragePatchConfigSerializer._toJsonObject(self.config);
            break;
          case "otelTracing":
            config = otelTracingPatchConfig_1.OtelTracingPatchConfigSerializer._toJsonObject(self.config);
            break;
          case "http":
            config = httpPatchConfig_1.HttpPatchConfigSerializer._toJsonObject(self.config);
            break;
          case "amazonS3":
            config = amazonS3PatchConfig_1.AmazonS3PatchConfigSerializer._toJsonObject(self.config);
            break;
          case "googleCloudStorage":
            config = googleCloudStoragePatchConfig_1.GoogleCloudStoragePatchConfigSerializer._toJsonObject(self.config);
            break;
        }
        return {
          type: self.type,
          config,
          batchSize: self.batchSize,
          eventTypes: self.eventTypes,
          maxWaitSecs: self.maxWaitSecs,
          metadata: self.metadata,
          status: self.status != null ? sinkStatusIn_1.SinkStatusInSerializer._toJsonObject(self.status) : void 0,
          uid: self.uid
        };
      }
    };
  }
});

// node_modules/svix/dist/api/streamingSink.js
var require_streamingSink = __commonJS({
  "node_modules/svix/dist/api/streamingSink.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamingSink = void 0;
    var emptyResponse_1 = require_emptyResponse();
    var endpointSecretRotateIn_1 = require_endpointSecretRotateIn();
    var listResponseStreamSinkOut_1 = require_listResponseStreamSinkOut();
    var sinkSecretOut_1 = require_sinkSecretOut();
    var sinkTransformIn_1 = require_sinkTransformIn();
    var streamSinkIn_1 = require_streamSinkIn();
    var streamSinkOut_1 = require_streamSinkOut();
    var streamSinkPatch_1 = require_streamSinkPatch();
    var request_1 = require_request();
    var StreamingSink = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(streamId, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink");
        request.setPathParam("stream_id", streamId);
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseStreamSinkOut_1.ListResponseStreamSinkOutSerializer._fromJsonObject);
      }
      create(streamId, streamSinkIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/{stream_id}/sink");
        request.setPathParam("stream_id", streamId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(streamSinkIn_1.StreamSinkInSerializer._toJsonObject(streamSinkIn));
        return request.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
      }
      get(streamId, sinkId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        return request.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
      }
      update(streamId, sinkId, streamSinkIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stream/{stream_id}/sink/{sink_id}");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        request.setBody(streamSinkIn_1.StreamSinkInSerializer._toJsonObject(streamSinkIn));
        return request.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
      }
      delete(streamId, sinkId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/stream/{stream_id}/sink/{sink_id}");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      patch(streamId, sinkId, streamSinkPatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}/sink/{sink_id}");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        request.setBody(streamSinkPatch_1.StreamSinkPatchSerializer._toJsonObject(streamSinkPatch));
        return request.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
      }
      getSecret(streamId, sinkId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/secret");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        return request.send(this.requestCtx, sinkSecretOut_1.SinkSecretOutSerializer._fromJsonObject);
      }
      rotateSecret(streamId, sinkId, endpointSecretRotateIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/{stream_id}/sink/{sink_id}/secret/rotate");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(endpointSecretRotateIn_1.EndpointSecretRotateInSerializer._toJsonObject(endpointSecretRotateIn));
        return request.send(this.requestCtx, emptyResponse_1.EmptyResponseSerializer._fromJsonObject);
      }
      transformationPartialUpdate(streamId, sinkId, sinkTransformIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}/sink/{sink_id}/transformation");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        request.setBody(sinkTransformIn_1.SinkTransformInSerializer._toJsonObject(sinkTransformIn));
        return request.send(this.requestCtx, emptyResponse_1.EmptyResponseSerializer._fromJsonObject);
      }
    };
    exports2.StreamingSink = StreamingSink;
  }
});

// node_modules/svix/dist/models/streamOut.js
var require_streamOut = __commonJS({
  "node_modules/svix/dist/models/streamOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamOutSerializer = void 0;
    exports2.StreamOutSerializer = {
      _fromJsonObject(object) {
        return {
          createdAt: new Date(object["createdAt"]),
          id: object["id"],
          metadata: object["metadata"],
          name: object["name"],
          uid: object["uid"],
          updatedAt: new Date(object["updatedAt"])
        };
      },
      _toJsonObject(self) {
        return {
          createdAt: self.createdAt,
          id: self.id,
          metadata: self.metadata,
          name: self.name,
          uid: self.uid,
          updatedAt: self.updatedAt
        };
      }
    };
  }
});

// node_modules/svix/dist/models/listResponseStreamOut.js
var require_listResponseStreamOut = __commonJS({
  "node_modules/svix/dist/models/listResponseStreamOut.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ListResponseStreamOutSerializer = void 0;
    var streamOut_1 = require_streamOut();
    exports2.ListResponseStreamOutSerializer = {
      _fromJsonObject(object) {
        return {
          data: object["data"].map((item) => streamOut_1.StreamOutSerializer._fromJsonObject(item)),
          done: object["done"],
          iterator: object["iterator"],
          prevIterator: object["prevIterator"]
        };
      },
      _toJsonObject(self) {
        return {
          data: self.data.map((item) => streamOut_1.StreamOutSerializer._toJsonObject(item)),
          done: self.done,
          iterator: self.iterator,
          prevIterator: self.prevIterator
        };
      }
    };
  }
});

// node_modules/svix/dist/models/streamPatch.js
var require_streamPatch = __commonJS({
  "node_modules/svix/dist/models/streamPatch.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamPatchSerializer = void 0;
    exports2.StreamPatchSerializer = {
      _fromJsonObject(object) {
        return {
          description: object["description"],
          metadata: object["metadata"],
          uid: object["uid"]
        };
      },
      _toJsonObject(self) {
        return {
          description: self.description,
          metadata: self.metadata,
          uid: self.uid
        };
      }
    };
  }
});

// node_modules/svix/dist/api/streamingStream.js
var require_streamingStream = __commonJS({
  "node_modules/svix/dist/api/streamingStream.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamingStream = void 0;
    var listResponseStreamOut_1 = require_listResponseStreamOut();
    var streamIn_1 = require_streamIn();
    var streamOut_1 = require_streamOut();
    var streamPatch_1 = require_streamPatch();
    var request_1 = require_request();
    var StreamingStream = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      list(options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream");
        request.setQueryParams({
          limit: options === null || options === void 0 ? void 0 : options.limit,
          iterator: options === null || options === void 0 ? void 0 : options.iterator,
          order: options === null || options === void 0 ? void 0 : options.order
        });
        return request.send(this.requestCtx, listResponseStreamOut_1.ListResponseStreamOutSerializer._fromJsonObject);
      }
      create(streamIn, options) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream");
        request.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
        request.setBody(streamIn_1.StreamInSerializer._toJsonObject(streamIn));
        return request.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
      }
      get(streamId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}");
        request.setPathParam("stream_id", streamId);
        return request.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
      }
      update(streamId, streamIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stream/{stream_id}");
        request.setPathParam("stream_id", streamId);
        request.setBody(streamIn_1.StreamInSerializer._toJsonObject(streamIn));
        return request.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
      }
      delete(streamId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/stream/{stream_id}");
        request.setPathParam("stream_id", streamId);
        return request.sendNoResponseBody(this.requestCtx);
      }
      patch(streamId, streamPatch) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}");
        request.setPathParam("stream_id", streamId);
        request.setBody(streamPatch_1.StreamPatchSerializer._toJsonObject(streamPatch));
        return request.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
      }
    };
    exports2.StreamingStream = StreamingStream;
  }
});

// node_modules/svix/dist/api/streaming.js
var require_streaming = __commonJS({
  "node_modules/svix/dist/api/streaming.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Streaming = void 0;
    var endpointHeadersOut_1 = require_endpointHeadersOut();
    var httpSinkHeadersPatchIn_1 = require_httpSinkHeadersPatchIn();
    var sinkTransformationOut_1 = require_sinkTransformationOut();
    var streamingEventType_1 = require_streamingEventType();
    var streamingEvents_1 = require_streamingEvents();
    var streamingSink_1 = require_streamingSink();
    var streamingStream_1 = require_streamingStream();
    var request_1 = require_request();
    var Streaming = class {
      constructor(requestCtx) {
        this.requestCtx = requestCtx;
      }
      get event_type() {
        return new streamingEventType_1.StreamingEventType(this.requestCtx);
      }
      get events() {
        return new streamingEvents_1.StreamingEvents(this.requestCtx);
      }
      get sink() {
        return new streamingSink_1.StreamingSink(this.requestCtx);
      }
      get stream() {
        return new streamingStream_1.StreamingStream(this.requestCtx);
      }
      sinkHeadersGet(streamId, sinkId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/headers");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        return request.send(this.requestCtx, endpointHeadersOut_1.EndpointHeadersOutSerializer._fromJsonObject);
      }
      sinkHeadersPatch(streamId, sinkId, httpSinkHeadersPatchIn) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}/sink/{sink_id}/headers");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        request.setBody(httpSinkHeadersPatchIn_1.HttpSinkHeadersPatchInSerializer._toJsonObject(httpSinkHeadersPatchIn));
        return request.send(this.requestCtx, endpointHeadersOut_1.EndpointHeadersOutSerializer._fromJsonObject);
      }
      sinkTransformationGet(streamId, sinkId) {
        const request = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/transformation");
        request.setPathParam("stream_id", streamId);
        request.setPathParam("sink_id", sinkId);
        return request.send(this.requestCtx, sinkTransformationOut_1.SinkTransformationOutSerializer._fromJsonObject);
      }
    };
    exports2.Streaming = Streaming;
  }
});

// node_modules/svix/dist/HttpErrors.js
var require_HttpErrors = __commonJS({
  "node_modules/svix/dist/HttpErrors.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.HTTPValidationError = exports2.ValidationError = exports2.HttpErrorOut = void 0;
    var HttpErrorOut = class _HttpErrorOut {
      static getAttributeTypeMap() {
        return _HttpErrorOut.attributeTypeMap;
      }
    };
    exports2.HttpErrorOut = HttpErrorOut;
    HttpErrorOut.discriminator = void 0;
    HttpErrorOut.mapping = void 0;
    HttpErrorOut.attributeTypeMap = [
      {
        name: "code",
        baseName: "code",
        type: "string",
        format: ""
      },
      {
        name: "detail",
        baseName: "detail",
        type: "string",
        format: ""
      }
    ];
    var ValidationError = class _ValidationError {
      static getAttributeTypeMap() {
        return _ValidationError.attributeTypeMap;
      }
    };
    exports2.ValidationError = ValidationError;
    ValidationError.discriminator = void 0;
    ValidationError.mapping = void 0;
    ValidationError.attributeTypeMap = [
      {
        name: "loc",
        baseName: "loc",
        type: "Array<string>",
        format: ""
      },
      {
        name: "msg",
        baseName: "msg",
        type: "string",
        format: ""
      },
      {
        name: "type",
        baseName: "type",
        type: "string",
        format: ""
      }
    ];
    var HTTPValidationError = class _HTTPValidationError {
      static getAttributeTypeMap() {
        return _HTTPValidationError.attributeTypeMap;
      }
    };
    exports2.HTTPValidationError = HTTPValidationError;
    HTTPValidationError.discriminator = void 0;
    HTTPValidationError.mapping = void 0;
    HTTPValidationError.attributeTypeMap = [
      {
        name: "detail",
        baseName: "detail",
        type: "Array<ValidationError>",
        format: ""
      }
    ];
  }
});

// node_modules/standardwebhooks/dist/timing_safe_equal.js
var require_timing_safe_equal = __commonJS({
  "node_modules/standardwebhooks/dist/timing_safe_equal.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.timingSafeEqual = void 0;
    function assert(expr, msg = "") {
      if (!expr) {
        throw new Error(msg);
      }
    }
    function timingSafeEqual(a, b) {
      if (a.byteLength !== b.byteLength) {
        return false;
      }
      if (!(a instanceof DataView)) {
        a = new DataView(ArrayBuffer.isView(a) ? a.buffer : a);
      }
      if (!(b instanceof DataView)) {
        b = new DataView(ArrayBuffer.isView(b) ? b.buffer : b);
      }
      assert(a instanceof DataView);
      assert(b instanceof DataView);
      const length = a.byteLength;
      let out = 0;
      let i = -1;
      while (++i < length) {
        out |= a.getUint8(i) ^ b.getUint8(i);
      }
      return out === 0;
    }
    exports2.timingSafeEqual = timingSafeEqual;
  }
});

// node_modules/@stablelib/base64/lib/base64.js
var require_base64 = __commonJS({
  "node_modules/@stablelib/base64/lib/base64.js"(exports2) {
    "use strict";
    var __extends = exports2 && exports2.__extends || /* @__PURE__ */ function() {
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2)
            if (b2.hasOwnProperty(p))
              d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      return function(d, b) {
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    Object.defineProperty(exports2, "__esModule", { value: true });
    var INVALID_BYTE = 256;
    var Coder = (
      /** @class */
      function() {
        function Coder2(_paddingCharacter) {
          if (_paddingCharacter === void 0) {
            _paddingCharacter = "=";
          }
          this._paddingCharacter = _paddingCharacter;
        }
        Coder2.prototype.encodedLength = function(length) {
          if (!this._paddingCharacter) {
            return (length * 8 + 5) / 6 | 0;
          }
          return (length + 2) / 3 * 4 | 0;
        };
        Coder2.prototype.encode = function(data) {
          var out = "";
          var i = 0;
          for (; i < data.length - 2; i += 3) {
            var c = data[i] << 16 | data[i + 1] << 8 | data[i + 2];
            out += this._encodeByte(c >>> 3 * 6 & 63);
            out += this._encodeByte(c >>> 2 * 6 & 63);
            out += this._encodeByte(c >>> 1 * 6 & 63);
            out += this._encodeByte(c >>> 0 * 6 & 63);
          }
          var left = data.length - i;
          if (left > 0) {
            var c = data[i] << 16 | (left === 2 ? data[i + 1] << 8 : 0);
            out += this._encodeByte(c >>> 3 * 6 & 63);
            out += this._encodeByte(c >>> 2 * 6 & 63);
            if (left === 2) {
              out += this._encodeByte(c >>> 1 * 6 & 63);
            } else {
              out += this._paddingCharacter || "";
            }
            out += this._paddingCharacter || "";
          }
          return out;
        };
        Coder2.prototype.maxDecodedLength = function(length) {
          if (!this._paddingCharacter) {
            return (length * 6 + 7) / 8 | 0;
          }
          return length / 4 * 3 | 0;
        };
        Coder2.prototype.decodedLength = function(s) {
          return this.maxDecodedLength(s.length - this._getPaddingLength(s));
        };
        Coder2.prototype.decode = function(s) {
          if (s.length === 0) {
            return new Uint8Array(0);
          }
          var paddingLength = this._getPaddingLength(s);
          var length = s.length - paddingLength;
          var out = new Uint8Array(this.maxDecodedLength(length));
          var op = 0;
          var i = 0;
          var haveBad = 0;
          var v0 = 0, v12 = 0, v2 = 0, v32 = 0;
          for (; i < length - 4; i += 4) {
            v0 = this._decodeChar(s.charCodeAt(i + 0));
            v12 = this._decodeChar(s.charCodeAt(i + 1));
            v2 = this._decodeChar(s.charCodeAt(i + 2));
            v32 = this._decodeChar(s.charCodeAt(i + 3));
            out[op++] = v0 << 2 | v12 >>> 4;
            out[op++] = v12 << 4 | v2 >>> 2;
            out[op++] = v2 << 6 | v32;
            haveBad |= v0 & INVALID_BYTE;
            haveBad |= v12 & INVALID_BYTE;
            haveBad |= v2 & INVALID_BYTE;
            haveBad |= v32 & INVALID_BYTE;
          }
          if (i < length - 1) {
            v0 = this._decodeChar(s.charCodeAt(i));
            v12 = this._decodeChar(s.charCodeAt(i + 1));
            out[op++] = v0 << 2 | v12 >>> 4;
            haveBad |= v0 & INVALID_BYTE;
            haveBad |= v12 & INVALID_BYTE;
          }
          if (i < length - 2) {
            v2 = this._decodeChar(s.charCodeAt(i + 2));
            out[op++] = v12 << 4 | v2 >>> 2;
            haveBad |= v2 & INVALID_BYTE;
          }
          if (i < length - 3) {
            v32 = this._decodeChar(s.charCodeAt(i + 3));
            out[op++] = v2 << 6 | v32;
            haveBad |= v32 & INVALID_BYTE;
          }
          if (haveBad !== 0) {
            throw new Error("Base64Coder: incorrect characters for decoding");
          }
          return out;
        };
        Coder2.prototype._encodeByte = function(b) {
          var result = b;
          result += 65;
          result += 25 - b >>> 8 & 0 - 65 - 26 + 97;
          result += 51 - b >>> 8 & 26 - 97 - 52 + 48;
          result += 61 - b >>> 8 & 52 - 48 - 62 + 43;
          result += 62 - b >>> 8 & 62 - 43 - 63 + 47;
          return String.fromCharCode(result);
        };
        Coder2.prototype._decodeChar = function(c) {
          var result = INVALID_BYTE;
          result += (42 - c & c - 44) >>> 8 & -INVALID_BYTE + c - 43 + 62;
          result += (46 - c & c - 48) >>> 8 & -INVALID_BYTE + c - 47 + 63;
          result += (47 - c & c - 58) >>> 8 & -INVALID_BYTE + c - 48 + 52;
          result += (64 - c & c - 91) >>> 8 & -INVALID_BYTE + c - 65 + 0;
          result += (96 - c & c - 123) >>> 8 & -INVALID_BYTE + c - 97 + 26;
          return result;
        };
        Coder2.prototype._getPaddingLength = function(s) {
          var paddingLength = 0;
          if (this._paddingCharacter) {
            for (var i = s.length - 1; i >= 0; i--) {
              if (s[i] !== this._paddingCharacter) {
                break;
              }
              paddingLength++;
            }
            if (s.length < 4 || paddingLength > 2) {
              throw new Error("Base64Coder: incorrect padding");
            }
          }
          return paddingLength;
        };
        return Coder2;
      }()
    );
    exports2.Coder = Coder;
    var stdCoder = new Coder();
    function encode(data) {
      return stdCoder.encode(data);
    }
    exports2.encode = encode;
    function decode(s) {
      return stdCoder.decode(s);
    }
    exports2.decode = decode;
    var URLSafeCoder = (
      /** @class */
      function(_super) {
        __extends(URLSafeCoder2, _super);
        function URLSafeCoder2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        URLSafeCoder2.prototype._encodeByte = function(b) {
          var result = b;
          result += 65;
          result += 25 - b >>> 8 & 0 - 65 - 26 + 97;
          result += 51 - b >>> 8 & 26 - 97 - 52 + 48;
          result += 61 - b >>> 8 & 52 - 48 - 62 + 45;
          result += 62 - b >>> 8 & 62 - 45 - 63 + 95;
          return String.fromCharCode(result);
        };
        URLSafeCoder2.prototype._decodeChar = function(c) {
          var result = INVALID_BYTE;
          result += (44 - c & c - 46) >>> 8 & -INVALID_BYTE + c - 45 + 62;
          result += (94 - c & c - 96) >>> 8 & -INVALID_BYTE + c - 95 + 63;
          result += (47 - c & c - 58) >>> 8 & -INVALID_BYTE + c - 48 + 52;
          result += (64 - c & c - 91) >>> 8 & -INVALID_BYTE + c - 65 + 0;
          result += (96 - c & c - 123) >>> 8 & -INVALID_BYTE + c - 97 + 26;
          return result;
        };
        return URLSafeCoder2;
      }(Coder)
    );
    exports2.URLSafeCoder = URLSafeCoder;
    var urlSafeCoder = new URLSafeCoder();
    function encodeURLSafe(data) {
      return urlSafeCoder.encode(data);
    }
    exports2.encodeURLSafe = encodeURLSafe;
    function decodeURLSafe(s) {
      return urlSafeCoder.decode(s);
    }
    exports2.decodeURLSafe = decodeURLSafe;
    exports2.encodedLength = function(length) {
      return stdCoder.encodedLength(length);
    };
    exports2.maxDecodedLength = function(length) {
      return stdCoder.maxDecodedLength(length);
    };
    exports2.decodedLength = function(s) {
      return stdCoder.decodedLength(s);
    };
  }
});

// node_modules/fast-sha256/sha256.js
var require_sha256 = __commonJS({
  "node_modules/fast-sha256/sha256.js"(exports2, module2) {
    (function(root, factory) {
      var exports3 = {};
      factory(exports3);
      var sha256 = exports3["default"];
      for (var k in exports3) {
        sha256[k] = exports3[k];
      }
      if (typeof module2 === "object" && typeof module2.exports === "object") {
        module2.exports = sha256;
      } else if (typeof define === "function" && define.amd) {
        define(function() {
          return sha256;
        });
      } else {
        root.sha256 = sha256;
      }
    })(exports2, function(exports3) {
      "use strict";
      exports3.__esModule = true;
      exports3.digestLength = 32;
      exports3.blockSize = 64;
      var K = new Uint32Array([
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ]);
      function hashBlocks(w, v, p, pos, len) {
        var a, b, c, d, e, f, g, h, u, i, j, t1, t2;
        while (len >= 64) {
          a = v[0];
          b = v[1];
          c = v[2];
          d = v[3];
          e = v[4];
          f = v[5];
          g = v[6];
          h = v[7];
          for (i = 0; i < 16; i++) {
            j = pos + i * 4;
            w[i] = (p[j] & 255) << 24 | (p[j + 1] & 255) << 16 | (p[j + 2] & 255) << 8 | p[j + 3] & 255;
          }
          for (i = 16; i < 64; i++) {
            u = w[i - 2];
            t1 = (u >>> 17 | u << 32 - 17) ^ (u >>> 19 | u << 32 - 19) ^ u >>> 10;
            u = w[i - 15];
            t2 = (u >>> 7 | u << 32 - 7) ^ (u >>> 18 | u << 32 - 18) ^ u >>> 3;
            w[i] = (t1 + w[i - 7] | 0) + (t2 + w[i - 16] | 0);
          }
          for (i = 0; i < 64; i++) {
            t1 = (((e >>> 6 | e << 32 - 6) ^ (e >>> 11 | e << 32 - 11) ^ (e >>> 25 | e << 32 - 25)) + (e & f ^ ~e & g) | 0) + (h + (K[i] + w[i] | 0) | 0) | 0;
            t2 = ((a >>> 2 | a << 32 - 2) ^ (a >>> 13 | a << 32 - 13) ^ (a >>> 22 | a << 32 - 22)) + (a & b ^ a & c ^ b & c) | 0;
            h = g;
            g = f;
            f = e;
            e = d + t1 | 0;
            d = c;
            c = b;
            b = a;
            a = t1 + t2 | 0;
          }
          v[0] += a;
          v[1] += b;
          v[2] += c;
          v[3] += d;
          v[4] += e;
          v[5] += f;
          v[6] += g;
          v[7] += h;
          pos += 64;
          len -= 64;
        }
        return pos;
      }
      var Hash = (
        /** @class */
        function() {
          function Hash2() {
            this.digestLength = exports3.digestLength;
            this.blockSize = exports3.blockSize;
            this.state = new Int32Array(8);
            this.temp = new Int32Array(64);
            this.buffer = new Uint8Array(128);
            this.bufferLength = 0;
            this.bytesHashed = 0;
            this.finished = false;
            this.reset();
          }
          Hash2.prototype.reset = function() {
            this.state[0] = 1779033703;
            this.state[1] = 3144134277;
            this.state[2] = 1013904242;
            this.state[3] = 2773480762;
            this.state[4] = 1359893119;
            this.state[5] = 2600822924;
            this.state[6] = 528734635;
            this.state[7] = 1541459225;
            this.bufferLength = 0;
            this.bytesHashed = 0;
            this.finished = false;
            return this;
          };
          Hash2.prototype.clean = function() {
            for (var i = 0; i < this.buffer.length; i++) {
              this.buffer[i] = 0;
            }
            for (var i = 0; i < this.temp.length; i++) {
              this.temp[i] = 0;
            }
            this.reset();
          };
          Hash2.prototype.update = function(data, dataLength) {
            if (dataLength === void 0) {
              dataLength = data.length;
            }
            if (this.finished) {
              throw new Error("SHA256: can't update because hash was finished.");
            }
            var dataPos = 0;
            this.bytesHashed += dataLength;
            if (this.bufferLength > 0) {
              while (this.bufferLength < 64 && dataLength > 0) {
                this.buffer[this.bufferLength++] = data[dataPos++];
                dataLength--;
              }
              if (this.bufferLength === 64) {
                hashBlocks(this.temp, this.state, this.buffer, 0, 64);
                this.bufferLength = 0;
              }
            }
            if (dataLength >= 64) {
              dataPos = hashBlocks(this.temp, this.state, data, dataPos, dataLength);
              dataLength %= 64;
            }
            while (dataLength > 0) {
              this.buffer[this.bufferLength++] = data[dataPos++];
              dataLength--;
            }
            return this;
          };
          Hash2.prototype.finish = function(out) {
            if (!this.finished) {
              var bytesHashed = this.bytesHashed;
              var left = this.bufferLength;
              var bitLenHi = bytesHashed / 536870912 | 0;
              var bitLenLo = bytesHashed << 3;
              var padLength = bytesHashed % 64 < 56 ? 64 : 128;
              this.buffer[left] = 128;
              for (var i = left + 1; i < padLength - 8; i++) {
                this.buffer[i] = 0;
              }
              this.buffer[padLength - 8] = bitLenHi >>> 24 & 255;
              this.buffer[padLength - 7] = bitLenHi >>> 16 & 255;
              this.buffer[padLength - 6] = bitLenHi >>> 8 & 255;
              this.buffer[padLength - 5] = bitLenHi >>> 0 & 255;
              this.buffer[padLength - 4] = bitLenLo >>> 24 & 255;
              this.buffer[padLength - 3] = bitLenLo >>> 16 & 255;
              this.buffer[padLength - 2] = bitLenLo >>> 8 & 255;
              this.buffer[padLength - 1] = bitLenLo >>> 0 & 255;
              hashBlocks(this.temp, this.state, this.buffer, 0, padLength);
              this.finished = true;
            }
            for (var i = 0; i < 8; i++) {
              out[i * 4 + 0] = this.state[i] >>> 24 & 255;
              out[i * 4 + 1] = this.state[i] >>> 16 & 255;
              out[i * 4 + 2] = this.state[i] >>> 8 & 255;
              out[i * 4 + 3] = this.state[i] >>> 0 & 255;
            }
            return this;
          };
          Hash2.prototype.digest = function() {
            var out = new Uint8Array(this.digestLength);
            this.finish(out);
            return out;
          };
          Hash2.prototype._saveState = function(out) {
            for (var i = 0; i < this.state.length; i++) {
              out[i] = this.state[i];
            }
          };
          Hash2.prototype._restoreState = function(from, bytesHashed) {
            for (var i = 0; i < this.state.length; i++) {
              this.state[i] = from[i];
            }
            this.bytesHashed = bytesHashed;
            this.finished = false;
            this.bufferLength = 0;
          };
          return Hash2;
        }()
      );
      exports3.Hash = Hash;
      var HMAC = (
        /** @class */
        function() {
          function HMAC2(key) {
            this.inner = new Hash();
            this.outer = new Hash();
            this.blockSize = this.inner.blockSize;
            this.digestLength = this.inner.digestLength;
            var pad = new Uint8Array(this.blockSize);
            if (key.length > this.blockSize) {
              new Hash().update(key).finish(pad).clean();
            } else {
              for (var i = 0; i < key.length; i++) {
                pad[i] = key[i];
              }
            }
            for (var i = 0; i < pad.length; i++) {
              pad[i] ^= 54;
            }
            this.inner.update(pad);
            for (var i = 0; i < pad.length; i++) {
              pad[i] ^= 54 ^ 92;
            }
            this.outer.update(pad);
            this.istate = new Uint32Array(8);
            this.ostate = new Uint32Array(8);
            this.inner._saveState(this.istate);
            this.outer._saveState(this.ostate);
            for (var i = 0; i < pad.length; i++) {
              pad[i] = 0;
            }
          }
          HMAC2.prototype.reset = function() {
            this.inner._restoreState(this.istate, this.inner.blockSize);
            this.outer._restoreState(this.ostate, this.outer.blockSize);
            return this;
          };
          HMAC2.prototype.clean = function() {
            for (var i = 0; i < this.istate.length; i++) {
              this.ostate[i] = this.istate[i] = 0;
            }
            this.inner.clean();
            this.outer.clean();
          };
          HMAC2.prototype.update = function(data) {
            this.inner.update(data);
            return this;
          };
          HMAC2.prototype.finish = function(out) {
            if (this.outer.finished) {
              this.outer.finish(out);
            } else {
              this.inner.finish(out);
              this.outer.update(out, this.digestLength).finish(out);
            }
            return this;
          };
          HMAC2.prototype.digest = function() {
            var out = new Uint8Array(this.digestLength);
            this.finish(out);
            return out;
          };
          return HMAC2;
        }()
      );
      exports3.HMAC = HMAC;
      function hash(data) {
        var h = new Hash().update(data);
        var digest = h.digest();
        h.clean();
        return digest;
      }
      exports3.hash = hash;
      exports3["default"] = hash;
      function hmac(key, data) {
        var h = new HMAC(key).update(data);
        var digest = h.digest();
        h.clean();
        return digest;
      }
      exports3.hmac = hmac;
      function fillBuffer(buffer, hmac2, info, counter) {
        var num = counter[0];
        if (num === 0) {
          throw new Error("hkdf: cannot expand more");
        }
        hmac2.reset();
        if (num > 1) {
          hmac2.update(buffer);
        }
        if (info) {
          hmac2.update(info);
        }
        hmac2.update(counter);
        hmac2.finish(buffer);
        counter[0]++;
      }
      var hkdfSalt = new Uint8Array(exports3.digestLength);
      function hkdf(key, salt, info, length) {
        if (salt === void 0) {
          salt = hkdfSalt;
        }
        if (length === void 0) {
          length = 32;
        }
        var counter = new Uint8Array([1]);
        var okm = hmac(salt, key);
        var hmac_ = new HMAC(okm);
        var buffer = new Uint8Array(hmac_.digestLength);
        var bufpos = buffer.length;
        var out = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
          if (bufpos === buffer.length) {
            fillBuffer(buffer, hmac_, info, counter);
            bufpos = 0;
          }
          out[i] = buffer[bufpos++];
        }
        hmac_.clean();
        buffer.fill(0);
        counter.fill(0);
        return out;
      }
      exports3.hkdf = hkdf;
      function pbkdf2(password, salt, iterations, dkLen) {
        var prf = new HMAC(password);
        var len = prf.digestLength;
        var ctr = new Uint8Array(4);
        var t = new Uint8Array(len);
        var u = new Uint8Array(len);
        var dk = new Uint8Array(dkLen);
        for (var i = 0; i * len < dkLen; i++) {
          var c = i + 1;
          ctr[0] = c >>> 24 & 255;
          ctr[1] = c >>> 16 & 255;
          ctr[2] = c >>> 8 & 255;
          ctr[3] = c >>> 0 & 255;
          prf.reset();
          prf.update(salt);
          prf.update(ctr);
          prf.finish(u);
          for (var j = 0; j < len; j++) {
            t[j] = u[j];
          }
          for (var j = 2; j <= iterations; j++) {
            prf.reset();
            prf.update(u).finish(u);
            for (var k = 0; k < len; k++) {
              t[k] ^= u[k];
            }
          }
          for (var j = 0; j < len && i * len + j < dkLen; j++) {
            dk[i * len + j] = t[j];
          }
        }
        for (var i = 0; i < len; i++) {
          t[i] = u[i] = 0;
        }
        for (var i = 0; i < 4; i++) {
          ctr[i] = 0;
        }
        prf.clean();
        return dk;
      }
      exports3.pbkdf2 = pbkdf2;
    });
  }
});

// node_modules/standardwebhooks/dist/index.js
var require_dist = __commonJS({
  "node_modules/standardwebhooks/dist/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Webhook = exports2.WebhookVerificationError = void 0;
    var timing_safe_equal_1 = require_timing_safe_equal();
    var base64 = require_base64();
    var sha256 = require_sha256();
    var WEBHOOK_TOLERANCE_IN_SECONDS = 5 * 60;
    var ExtendableError = class _ExtendableError extends Error {
      constructor(message) {
        super(message);
        Object.setPrototypeOf(this, _ExtendableError.prototype);
        this.name = "ExtendableError";
        this.stack = new Error(message).stack;
      }
    };
    var WebhookVerificationError = class _WebhookVerificationError extends ExtendableError {
      constructor(message) {
        super(message);
        Object.setPrototypeOf(this, _WebhookVerificationError.prototype);
        this.name = "WebhookVerificationError";
      }
    };
    exports2.WebhookVerificationError = WebhookVerificationError;
    var Webhook2 = class _Webhook {
      constructor(secret, options) {
        if (!secret) {
          throw new Error("Secret can't be empty.");
        }
        if ((options === null || options === void 0 ? void 0 : options.format) === "raw") {
          if (secret instanceof Uint8Array) {
            this.key = secret;
          } else {
            this.key = Uint8Array.from(secret, (c) => c.charCodeAt(0));
          }
        } else {
          if (typeof secret !== "string") {
            throw new Error("Expected secret to be of type string");
          }
          if (secret.startsWith(_Webhook.prefix)) {
            secret = secret.substring(_Webhook.prefix.length);
          }
          this.key = base64.decode(secret);
        }
      }
      verify(payload, headers_) {
        const headers = {};
        for (const key of Object.keys(headers_)) {
          headers[key.toLowerCase()] = headers_[key];
        }
        const msgId = headers["webhook-id"];
        const msgSignature = headers["webhook-signature"];
        const msgTimestamp = headers["webhook-timestamp"];
        if (!msgSignature || !msgId || !msgTimestamp) {
          throw new WebhookVerificationError("Missing required headers");
        }
        const timestamp2 = this.verifyTimestamp(msgTimestamp);
        const computedSignature = this.sign(msgId, timestamp2, payload);
        const expectedSignature = computedSignature.split(",")[1];
        const passedSignatures = msgSignature.split(" ");
        const encoder = new globalThis.TextEncoder();
        for (const versionedSignature of passedSignatures) {
          const [version3, signature] = versionedSignature.split(",");
          if (version3 !== "v1") {
            continue;
          }
          if ((0, timing_safe_equal_1.timingSafeEqual)(encoder.encode(signature), encoder.encode(expectedSignature))) {
            return JSON.parse(payload.toString());
          }
        }
        throw new WebhookVerificationError("No matching signature found");
      }
      sign(msgId, timestamp2, payload) {
        if (typeof payload === "string") {
        } else if (payload.constructor.name === "Buffer") {
          payload = payload.toString();
        } else {
          throw new Error("Expected payload to be of type string or Buffer.");
        }
        const encoder = new TextEncoder();
        const timestampNumber = Math.floor(timestamp2.getTime() / 1e3);
        const toSign = encoder.encode(`${msgId}.${timestampNumber}.${payload}`);
        const expectedSignature = base64.encode(sha256.hmac(this.key, toSign));
        return `v1,${expectedSignature}`;
      }
      verifyTimestamp(timestampHeader) {
        const now = Math.floor(Date.now() / 1e3);
        const timestamp2 = parseInt(timestampHeader, 10);
        if (isNaN(timestamp2)) {
          throw new WebhookVerificationError("Invalid Signature Headers");
        }
        if (now - timestamp2 > WEBHOOK_TOLERANCE_IN_SECONDS) {
          throw new WebhookVerificationError("Message timestamp too old");
        }
        if (timestamp2 > now + WEBHOOK_TOLERANCE_IN_SECONDS) {
          throw new WebhookVerificationError("Message timestamp too new");
        }
        return new Date(timestamp2 * 1e3);
      }
    };
    exports2.Webhook = Webhook2;
    Webhook2.prefix = "whsec_";
  }
});

// node_modules/svix/dist/webhook.js
var require_webhook = __commonJS({
  "node_modules/svix/dist/webhook.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Webhook = exports2.WebhookVerificationError = void 0;
    var standardwebhooks_1 = require_dist();
    var standardwebhooks_2 = require_dist();
    Object.defineProperty(exports2, "WebhookVerificationError", { enumerable: true, get: function() {
      return standardwebhooks_2.WebhookVerificationError;
    } });
    var Webhook2 = class {
      constructor(secret, options) {
        this.inner = new standardwebhooks_1.Webhook(secret, options);
      }
      verify(payload, headers_) {
        var _a, _b, _c, _d, _e, _f;
        const headers = {};
        for (const key of Object.keys(headers_)) {
          headers[key.toLowerCase()] = headers_[key];
        }
        headers["webhook-id"] = (_b = (_a = headers["svix-id"]) !== null && _a !== void 0 ? _a : headers["webhook-id"]) !== null && _b !== void 0 ? _b : "";
        headers["webhook-signature"] = (_d = (_c = headers["svix-signature"]) !== null && _c !== void 0 ? _c : headers["webhook-signature"]) !== null && _d !== void 0 ? _d : "";
        headers["webhook-timestamp"] = (_f = (_e = headers["svix-timestamp"]) !== null && _e !== void 0 ? _e : headers["webhook-timestamp"]) !== null && _f !== void 0 ? _f : "";
        return this.inner.verify(payload, headers);
      }
      sign(msgId, timestamp2, payload) {
        return this.inner.sign(msgId, timestamp2, payload);
      }
    };
    exports2.Webhook = Webhook2;
  }
});

// node_modules/svix/dist/models/endpointDisabledTrigger.js
var require_endpointDisabledTrigger = __commonJS({
  "node_modules/svix/dist/models/endpointDisabledTrigger.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EndpointDisabledTriggerSerializer = exports2.EndpointDisabledTrigger = void 0;
    var EndpointDisabledTrigger;
    (function(EndpointDisabledTrigger2) {
      EndpointDisabledTrigger2["Manual"] = "manual";
      EndpointDisabledTrigger2["Automatic"] = "automatic";
    })(EndpointDisabledTrigger = exports2.EndpointDisabledTrigger || (exports2.EndpointDisabledTrigger = {}));
    exports2.EndpointDisabledTriggerSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// node_modules/svix/dist/models/ordering.js
var require_ordering = __commonJS({
  "node_modules/svix/dist/models/ordering.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.OrderingSerializer = exports2.Ordering = void 0;
    var Ordering;
    (function(Ordering2) {
      Ordering2["Ascending"] = "ascending";
      Ordering2["Descending"] = "descending";
    })(Ordering = exports2.Ordering || (exports2.Ordering = {}));
    exports2.OrderingSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// node_modules/svix/dist/models/statusCodeClass.js
var require_statusCodeClass = __commonJS({
  "node_modules/svix/dist/models/statusCodeClass.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StatusCodeClassSerializer = exports2.StatusCodeClass = void 0;
    var StatusCodeClass;
    (function(StatusCodeClass2) {
      StatusCodeClass2[StatusCodeClass2["CodeNone"] = 0] = "CodeNone";
      StatusCodeClass2[StatusCodeClass2["Code1xx"] = 100] = "Code1xx";
      StatusCodeClass2[StatusCodeClass2["Code2xx"] = 200] = "Code2xx";
      StatusCodeClass2[StatusCodeClass2["Code3xx"] = 300] = "Code3xx";
      StatusCodeClass2[StatusCodeClass2["Code4xx"] = 400] = "Code4xx";
      StatusCodeClass2[StatusCodeClass2["Code5xx"] = 500] = "Code5xx";
    })(StatusCodeClass = exports2.StatusCodeClass || (exports2.StatusCodeClass = {}));
    exports2.StatusCodeClassSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  }
});

// node_modules/svix/dist/models/index.js
var require_models = __commonJS({
  "node_modules/svix/dist/models/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StatusCodeClass = exports2.SinkStatusIn = exports2.SinkStatus = exports2.Ordering = exports2.MessageStatusText = exports2.MessageStatus = exports2.MessageAttemptTriggerType = exports2.EndpointDisabledTrigger = exports2.ConnectorProduct = exports2.ConnectorKind = exports2.BackgroundTaskType = exports2.BackgroundTaskStatus = exports2.AppPortalCapability = void 0;
    var appPortalCapability_1 = require_appPortalCapability();
    Object.defineProperty(exports2, "AppPortalCapability", { enumerable: true, get: function() {
      return appPortalCapability_1.AppPortalCapability;
    } });
    var backgroundTaskStatus_1 = require_backgroundTaskStatus();
    Object.defineProperty(exports2, "BackgroundTaskStatus", { enumerable: true, get: function() {
      return backgroundTaskStatus_1.BackgroundTaskStatus;
    } });
    var backgroundTaskType_1 = require_backgroundTaskType();
    Object.defineProperty(exports2, "BackgroundTaskType", { enumerable: true, get: function() {
      return backgroundTaskType_1.BackgroundTaskType;
    } });
    var connectorKind_1 = require_connectorKind();
    Object.defineProperty(exports2, "ConnectorKind", { enumerable: true, get: function() {
      return connectorKind_1.ConnectorKind;
    } });
    var connectorProduct_1 = require_connectorProduct();
    Object.defineProperty(exports2, "ConnectorProduct", { enumerable: true, get: function() {
      return connectorProduct_1.ConnectorProduct;
    } });
    var endpointDisabledTrigger_1 = require_endpointDisabledTrigger();
    Object.defineProperty(exports2, "EndpointDisabledTrigger", { enumerable: true, get: function() {
      return endpointDisabledTrigger_1.EndpointDisabledTrigger;
    } });
    var messageAttemptTriggerType_1 = require_messageAttemptTriggerType();
    Object.defineProperty(exports2, "MessageAttemptTriggerType", { enumerable: true, get: function() {
      return messageAttemptTriggerType_1.MessageAttemptTriggerType;
    } });
    var messageStatus_1 = require_messageStatus();
    Object.defineProperty(exports2, "MessageStatus", { enumerable: true, get: function() {
      return messageStatus_1.MessageStatus;
    } });
    var messageStatusText_1 = require_messageStatusText();
    Object.defineProperty(exports2, "MessageStatusText", { enumerable: true, get: function() {
      return messageStatusText_1.MessageStatusText;
    } });
    var ordering_1 = require_ordering();
    Object.defineProperty(exports2, "Ordering", { enumerable: true, get: function() {
      return ordering_1.Ordering;
    } });
    var sinkStatus_1 = require_sinkStatus();
    Object.defineProperty(exports2, "SinkStatus", { enumerable: true, get: function() {
      return sinkStatus_1.SinkStatus;
    } });
    var sinkStatusIn_1 = require_sinkStatusIn();
    Object.defineProperty(exports2, "SinkStatusIn", { enumerable: true, get: function() {
      return sinkStatusIn_1.SinkStatusIn;
    } });
    var statusCodeClass_1 = require_statusCodeClass();
    Object.defineProperty(exports2, "StatusCodeClass", { enumerable: true, get: function() {
      return statusCodeClass_1.StatusCodeClass;
    } });
  }
});

// node_modules/svix/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/svix/dist/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc3 = Object.getOwnPropertyDescriptor(m, k);
      if (!desc3 || ("get" in desc3 ? !m.__esModule : desc3.writable || desc3.configurable)) {
        desc3 = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc3);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Svix = exports2.messageInRaw = exports2.ValidationError = exports2.HttpErrorOut = exports2.HTTPValidationError = exports2.ApiException = void 0;
    var application_1 = require_application();
    var authentication_1 = require_authentication();
    var backgroundTask_1 = require_backgroundTask();
    var connector_1 = require_connector();
    var endpoint_1 = require_endpoint();
    var environment_1 = require_environment();
    var eventType_1 = require_eventType();
    var health_1 = require_health();
    var ingest_1 = require_ingest();
    var integration_1 = require_integration();
    var message_1 = require_message();
    var messageAttempt_1 = require_messageAttempt();
    var operationalWebhook_1 = require_operationalWebhook();
    var statistics_1 = require_statistics();
    var streaming_1 = require_streaming();
    var operationalWebhookEndpoint_1 = require_operationalWebhookEndpoint();
    var util_1 = require_util();
    Object.defineProperty(exports2, "ApiException", { enumerable: true, get: function() {
      return util_1.ApiException;
    } });
    var HttpErrors_1 = require_HttpErrors();
    Object.defineProperty(exports2, "HTTPValidationError", { enumerable: true, get: function() {
      return HttpErrors_1.HTTPValidationError;
    } });
    Object.defineProperty(exports2, "HttpErrorOut", { enumerable: true, get: function() {
      return HttpErrors_1.HttpErrorOut;
    } });
    Object.defineProperty(exports2, "ValidationError", { enumerable: true, get: function() {
      return HttpErrors_1.ValidationError;
    } });
    __exportStar(require_webhook(), exports2);
    __exportStar(require_models(), exports2);
    var message_2 = require_message();
    Object.defineProperty(exports2, "messageInRaw", { enumerable: true, get: function() {
      return message_2.messageInRaw;
    } });
    var REGIONS = [
      { region: "us", url: "https://api.us.svix.com" },
      { region: "eu", url: "https://api.eu.svix.com" },
      { region: "in", url: "https://api.in.svix.com" },
      { region: "ca", url: "https://api.ca.svix.com" },
      { region: "au", url: "https://api.au.svix.com" }
    ];
    var Svix = class {
      constructor(token, options = {}) {
        var _a, _b, _c;
        const regionalUrl = (_a = REGIONS.find((x) => x.region === token.split(".")[1])) === null || _a === void 0 ? void 0 : _a.url;
        const baseUrl2 = (_c = (_b = options.serverUrl) !== null && _b !== void 0 ? _b : regionalUrl) !== null && _c !== void 0 ? _c : "https://api.svix.com";
        if (options.retryScheduleInMs) {
          this.requestCtx = {
            baseUrl: baseUrl2,
            token,
            timeout: options.requestTimeout,
            retryScheduleInMs: options.retryScheduleInMs,
            fetch: options.fetch
          };
          return;
        }
        if (options.numRetries) {
          this.requestCtx = {
            baseUrl: baseUrl2,
            token,
            timeout: options.requestTimeout,
            numRetries: options.numRetries,
            fetch: options.fetch
          };
          return;
        }
        this.requestCtx = {
          baseUrl: baseUrl2,
          token,
          timeout: options.requestTimeout,
          fetch: options.fetch
        };
      }
      get application() {
        return new application_1.Application(this.requestCtx);
      }
      get authentication() {
        return new authentication_1.Authentication(this.requestCtx);
      }
      get backgroundTask() {
        return new backgroundTask_1.BackgroundTask(this.requestCtx);
      }
      get connector() {
        return new connector_1.Connector(this.requestCtx);
      }
      get endpoint() {
        return new endpoint_1.Endpoint(this.requestCtx);
      }
      get environment() {
        return new environment_1.Environment(this.requestCtx);
      }
      get eventType() {
        return new eventType_1.EventType(this.requestCtx);
      }
      get health() {
        return new health_1.Health(this.requestCtx);
      }
      get ingest() {
        return new ingest_1.Ingest(this.requestCtx);
      }
      get integration() {
        return new integration_1.Integration(this.requestCtx);
      }
      get message() {
        return new message_1.Message(this.requestCtx);
      }
      get messageAttempt() {
        return new messageAttempt_1.MessageAttempt(this.requestCtx);
      }
      get operationalWebhook() {
        return new operationalWebhook_1.OperationalWebhook(this.requestCtx);
      }
      get statistics() {
        return new statistics_1.Statistics(this.requestCtx);
      }
      get streaming() {
        return new streaming_1.Streaming(this.requestCtx);
      }
      get operationalWebhookEndpoint() {
        return new operationalWebhookEndpoint_1.OperationalWebhookEndpoint(this.requestCtx);
      }
    };
    exports2.Svix = Svix;
  }
});

// services/cache-service.ts
var cache_service_exports = {};
__export(cache_service_exports, {
  CacheService: () => CacheService,
  cacheService: () => cacheService
});
var import_drizzle_orm2, CacheService, cacheService;
var init_cache_service = __esm({
  "services/cache-service.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm2 = require("drizzle-orm");
    init_phish_api();
    CacheService = class {
      constructor() {
        this.phishApi = new PhishNetService();
      }
      // Check if cache is fresh based on refresh interval
      async isCacheFresh(cacheType) {
        try {
          const [metadata] = await db.select().from(cacheMetadata).where((0, import_drizzle_orm2.eq)(cacheMetadata.cacheType, cacheType));
          if (!metadata || !metadata.lastRefreshed || !metadata.refreshInterval) {
            return false;
          }
          const now = /* @__PURE__ */ new Date();
          const lastRefreshed = new Date(metadata.lastRefreshed);
          const refreshIntervalMs = metadata.refreshInterval * 1e3;
          return now.getTime() - lastRefreshed.getTime() < refreshIntervalMs;
        } catch (error) {
          console.error(`Error checking cache freshness for ${cacheType}:`, error);
          return false;
        }
      }
      // Update cache metadata
      async updateCacheMetadata(cacheType, totalRecords, error) {
        try {
          await db.insert(cacheMetadata).values({
            cacheType,
            lastRefreshed: /* @__PURE__ */ new Date(),
            totalRecords,
            isRefreshing: false,
            lastError: error || null
          }).onConflictDoUpdate({
            target: cacheMetadata.cacheType,
            set: {
              lastRefreshed: /* @__PURE__ */ new Date(),
              totalRecords,
              isRefreshing: false,
              lastError: error || null
            }
          });
        } catch (error2) {
          console.error(`Error updating cache metadata for ${cacheType}:`, error2);
        }
      }
      // Get cached songs with optional refresh
      async getCachedSongs(forceRefresh = false) {
        const cacheType = "songs";
        const needsRefresh = forceRefresh || !await this.isCacheFresh(cacheType);
        if (needsRefresh) {
          await this.refreshSongsCache();
        }
        return await db.select().from(cachedSongs).orderBy((0, import_drizzle_orm2.desc)(cachedSongs.timesPlayed));
      }
      // Get cached shows with optional refresh
      async getCachedShows(forceRefresh = false) {
        const cacheType = "shows";
        const needsRefresh = forceRefresh || !await this.isCacheFresh(cacheType);
        if (needsRefresh) {
          await this.refreshShowsCache();
        }
        return await db.select().from(cachedShows).orderBy((0, import_drizzle_orm2.desc)(cachedShows.showDate));
      }
      // Get cached setlist for a specific date
      async getCachedSetlist(showDate, forceRefresh = false) {
        const [cached] = await db.select().from(cachedSetlists).where((0, import_drizzle_orm2.eq)(cachedSetlists.showDate, showDate));
        if (cached && !forceRefresh) {
          return cached;
        }
        return await this.refreshSetlistCache(showDate);
      }
      // Refresh songs cache from Phish.net API
      async refreshSongsCache() {
        console.log("\u{1F504} [CacheService] refreshSongsCache v2 (dedup+upsert) - STARTING...");
        try {
          await db.insert(cacheMetadata).values({
            cacheType: "songs",
            isRefreshing: true
          }).onConflictDoUpdate({
            target: cacheMetadata.cacheType,
            set: { isRefreshing: true }
          });
          const apiSongs = await this.phishApi.getAllSongsForDraft();
          console.log(`Fetched ${apiSongs.length} songs from Phish.net API`);
          if (apiSongs.length > 0) {
            const plays24MonthsMap = await this.calculate24MonthPlays();
            await db.delete(cachedSongs);
            const normalizeId = (s, idx) => String(s.songid ?? s.id ?? s.slug ?? idx + 1e4);
            const seen = /* @__PURE__ */ new Set();
            const deduped = apiSongs.filter((s, i) => {
              const id = normalizeId(s, i);
              if (seen.has(id))
                return false;
              seen.add(id);
              s.__normId = id;
              return true;
            });
            console.log(`\u2705 Deduplicated ${apiSongs.length} songs to ${deduped.length} unique songs (string-based)`);
            const batchSize = 100;
            for (let i = 0; i < deduped.length; i += batchSize) {
              const batch = deduped.slice(i, i + batchSize);
              const insertData = batch.map((song) => ({
                phishNetId: song.__normId,
                // Use normalized string ID
                title: song.song,
                artist: "Phish",
                timesPlayed: song.times_played || 0,
                plays24Months: plays24MonthsMap.get(song.song) || 0,
                debutDate: song.debut_date || null,
                lastPlayed: song.last_played || null,
                gap: song.gap || 0,
                originalArtist: song.original_artist || null,
                category: this.categoryzeSong(song.song),
                rarityScore: this.calculateRarityScore(song.times_played || 0, song.gap || 0)
              }));
              await db.insert(cachedSongs).values(insertData).onConflictDoNothing();
            }
            await this.updateCacheMetadata("songs", apiSongs.length);
            console.log(`Successfully cached ${apiSongs.length} songs`);
          }
        } catch (error) {
          console.error("Error refreshing songs cache:", error);
          await this.updateCacheMetadata("songs", 0, error instanceof Error ? error.message : String(error));
        }
      }
      // Refresh shows cache from Phish.net API
      async refreshShowsCache() {
        console.log("Refreshing shows cache from Phish.net API...");
        try {
          await db.insert(cacheMetadata).values({ cacheType: "shows", isRefreshing: true }).onConflictDoUpdate({ target: cacheMetadata.cacheType, set: { isRefreshing: true } });
          const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
          const years = [currentYear, currentYear - 1, currentYear - 2];
          const allShows = [];
          for (const year of years) {
            const shows = await this.phishApi.getShowsByYear(year);
            allShows.push(...shows);
          }
          console.log(`Fetched ${allShows.length} shows from Phish.net API`);
          if (allShows.length > 0) {
            const seen = /* @__PURE__ */ new Set();
            const uniqueShows = allShows.filter((show) => {
              if (seen.has(show.showdate))
                return false;
              seen.add(show.showdate);
              return true;
            });
            const insertData = uniqueShows.map((show) => ({
              phishNetId: String(show.showid || show.showdate),
              showDate: /* @__PURE__ */ new Date(show.showdate + "T00:00:00Z"),
              venue: show.venue || "Unknown Venue",
              city: show.city || "Unknown City",
              state: show.state || null,
              country: show.country || "USA",
              tourid: show.tourid || null,
              setlistdata: show.setlistdata || null,
              isCompleted: show.showdate < (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
            }));
            await db.delete(cachedShows);
            const batchSize = 50;
            for (let i = 0; i < insertData.length; i += batchSize) {
              await db.insert(cachedShows).values(insertData.slice(i, i + batchSize)).onConflictDoNothing();
            }
            await this.updateCacheMetadata("shows", uniqueShows.length);
            console.log(`Successfully cached ${uniqueShows.length} shows`);
          }
        } catch (error) {
          console.error("Error refreshing shows cache:", error);
          await this.updateCacheMetadata("shows", 0, error instanceof Error ? error.message : String(error));
        }
      }
      // Refresh specific setlist cache
      async refreshSetlistCache(showDate) {
        console.log(`Refreshing setlist cache for ${showDate}...`);
        try {
          const setlistData = await this.phishApi.getSetlist(showDate);
          if (setlistData) {
            const songs2 = Array.isArray(setlistData) ? setlistData.map((song) => song.song || song.title || song.songname).filter(Boolean) : [];
            const insertData = {
              showDate,
              setlistData,
              songs: songs2
            };
            const [cached] = await db.insert(cachedSetlists).values(insertData).onConflictDoUpdate({
              target: cachedSetlists.showDate,
              set: {
                setlistData: insertData.setlistData,
                songs: insertData.songs,
                cachedAt: /* @__PURE__ */ new Date()
              }
            }).returning();
            console.log(`Successfully cached setlist for ${showDate}`);
            return cached;
          }
        } catch (error) {
          console.error(`Error refreshing setlist cache for ${showDate}:`, error);
        }
        return null;
      }
      // Calculate 24-month play counts from cached shows and setlists
      async calculate24MonthPlays() {
        console.log("\u{1F4CA} Calculating 24-month play counts from cached shows...");
        const songPlayCounts = /* @__PURE__ */ new Map();
        try {
          const twentyFourMonthsAgo = /* @__PURE__ */ new Date();
          twentyFourMonthsAgo.setMonth(twentyFourMonthsAgo.getMonth() - 24);
          const recentShows = await db.select().from(cachedShows).where((0, import_drizzle_orm2.eq)(cachedShows.isCompleted, true)).orderBy((0, import_drizzle_orm2.desc)(cachedShows.showDate));
          const showsLast24Months = recentShows.filter(
            (show) => new Date(show.showDate) >= twentyFourMonthsAgo
          );
          console.log(`Found ${showsLast24Months.length} shows in last 24 months`);
          for (const show of showsLast24Months) {
            const showDateStr = show.showDate.toISOString().split("T")[0];
            const [cachedSetlist] = await db.select().from(cachedSetlists).where((0, import_drizzle_orm2.eq)(cachedSetlists.showDate, showDateStr));
            let songs2 = [];
            if (cachedSetlist && cachedSetlist.songs) {
              songs2 = Array.isArray(cachedSetlist.songs) ? cachedSetlist.songs : [];
            } else if (show.setlistdata) {
              const setlistData = show.setlistdata;
              if (Array.isArray(setlistData)) {
                songs2 = setlistData.map((s) => s.song || s.title || s.songname).filter(Boolean);
              }
            }
            for (const songTitle of songs2) {
              const count = songPlayCounts.get(songTitle) || 0;
              songPlayCounts.set(songTitle, count + 1);
            }
          }
          console.log(`\u2705 Calculated plays for ${songPlayCounts.size} unique songs`);
        } catch (error) {
          console.error("Error calculating 24-month plays:", error);
        }
        return songPlayCounts;
      }
      // Helper method to categorize songs (copied from phish-api.ts)
      categoryzeSong(title) {
        const lowerTitle = title.toLowerCase();
        const gamehengePattern = /\b(wilson|tela|colonel forbin|famous mockingbird|lizards|the sloth|unit monster|n2o|the man who stepped into yesterday|avenu malkenu|icculus|ac\/dc bag|possum)\b/;
        if (gamehengePattern.test(lowerTitle)) {
          return "Gamehendge";
        }
        const epicPattern = /\b(you enjoy myself|tweezer|ghost|harry hood|stash|fluffhead|divided sky|reba|run like an antelope|david bowie)\b/;
        if (epicPattern.test(lowerTitle)) {
          return "Epic";
        }
        const classicPattern = /\b(wilson|sample in a jar|character zero|bouncing around the room|lawn boy|suzy greenberg|golgi apparatus|fee|maze|cavern|punch you in the eye|the squirming coil|foam|esther|dinner and a movie|bold as love|loving cup)\b/;
        if (classicPattern.test(lowerTitle)) {
          return "Classic";
        }
        const coverPattern = /\b(good times bad times|bold as love|loving cup|cities|sneakin' sally|rocky top|i am the walrus|while my guitar gently weeps|fire on the mountain|weekapaug groove)\b/;
        if (coverPattern.test(lowerTitle)) {
          return "Cover";
        }
        const modernPattern = /\b(ghost|sigma oasis|everything's right|blaze on|more|mercury|ruby waves|soul planet|about to run|threads|we are come to outlive our brains|carini|joy|backwards down the number line|kill devil falls|ocelot|twenty years later)\b/;
        if (modernPattern.test(lowerTitle)) {
          return "Modern";
        }
        return "Standard";
      }
      // Helper method to calculate rarity score (copied from phish-api.ts)
      calculateRarityScore(timesPlayed, gap) {
        let score = 1;
        if (timesPlayed < 5)
          score += 4;
        else if (timesPlayed < 20)
          score += 3;
        else if (timesPlayed < 50)
          score += 2;
        else if (timesPlayed < 100)
          score += 1;
        if (gap > 500)
          score += 2;
        else if (gap > 100)
          score += 1;
        return Math.min(score, 7);
      }
      // Get cache statistics
      async getCacheStats() {
        try {
          const metadata = await db.select().from(cacheMetadata);
          const stats = {};
          for (const meta of metadata) {
            stats[meta.cacheType] = {
              lastRefreshed: meta.lastRefreshed,
              totalRecords: meta.totalRecords,
              isRefreshing: meta.isRefreshing,
              lastError: meta.lastError,
              refreshInterval: meta.refreshInterval
            };
          }
          return stats;
        } catch (error) {
          console.error("Error getting cache stats:", error);
          return {};
        }
      }
      // Force refresh all caches
      async refreshAllCaches() {
        console.log("Force refreshing all caches...");
        await Promise.all([
          this.refreshSongsCache(),
          this.refreshShowsCache()
        ]);
      }
    };
    cacheService = new CacheService();
  }
});

// index.ts
var import_express2 = __toESM(require("express"));
var import_express_session2 = __toESM(require("express-session"));
var import_serverless2 = require("@neondatabase/serverless");
var import_ws2 = __toESM(require("ws"));
var import_connect_pg_simple2 = __toESM(require("connect-pg-simple"));
var import_path = __toESM(require("path"));
var import_http2 = require("http");

// routes.ts
var import_http = require("http");
init_storage_db();
init_schema();
init_phish_api();

// auth.ts
var import_express_session = __toESM(require("express-session"));
var import_connect_pg_simple = __toESM(require("connect-pg-simple"));
var import_bcrypt = __toESM(require("bcrypt"));
init_storage_db();

// services/sms.ts
var import_twilio = __toESM(require("twilio"));
var SMSService = class {
  constructor() {
    this.client = null;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || "";
    if (accountSid && authToken && this.fromNumber) {
      this.client = (0, import_twilio.default)(accountSid, authToken);
    } else {
      console.warn("Twilio credentials not found. SMS functionality disabled.");
    }
  }
  async sendLeagueInvite(phoneNumber, leagueName, inviteCode) {
    if (!this.client) {
      console.warn("SMS service not initialized - Twilio credentials missing");
      return false;
    }
    try {
      const message = `\u{1F3B5} You're invited to join "${leagueName}" on PhishDraft! Use code: ${inviteCode} or visit: ${process.env.REPLIT_DOMAINS || "localhost"}/join/${inviteCode}`;
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });
      return true;
    } catch (error) {
      console.error("SMS send error:", error);
      return false;
    }
  }
  async sendAuthCode(phoneNumber, code) {
    if (!this.client) {
      console.warn("SMS service not initialized - Twilio credentials missing");
      return false;
    }
    try {
      const message = `Your PhishDraft verification code is: ${code}. This code expires in 10 minutes.`;
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });
      return true;
    } catch (error) {
      console.error("SMS auth code send error:", error);
      return false;
    }
  }
  async sendPasswordReset(phoneNumber, resetToken, baseUrl2) {
    if (!this.client) {
      console.warn("SMS service not initialized - Twilio credentials missing");
      return false;
    }
    try {
      const resetUrl = `${baseUrl2}/reset-password?token=${resetToken}`;
      const message = `PhishDraft: Reset your password at ${resetUrl}

Expires in 1 hour. Ignore if you didn't request this.`;
      await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: phoneNumber
      });
      return true;
    } catch (error) {
      console.error("SMS password reset error:", error);
      return false;
    }
  }
  isAvailable() {
    return this.client !== null;
  }
};
var smsService = new SMSService();

// auth.ts
init_db();
function setupAuth(app2) {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET not set");
  }
  const pgStore = (0, import_connect_pg_simple.default)(import_express_session.default);
  const sessionStore = new pgStore({
    pool,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  app2.use((0, import_express_session.default)({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl
    }
  }));
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { username, phoneNumber, password } = req.body;
      const email = req.body.email?.toLowerCase();
      if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      if (phoneNumber) {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(phoneNumber)) {
          return res.status(400).json({ message: "Invalid phone number format" });
        }
      }
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }
      if (phoneNumber) {
        const existingPhone = await storage.getUserByPhone(phoneNumber);
        if (existingPhone) {
          return res.status(409).json({ message: "Phone number already exists" });
        }
      }
      const hashedPassword = await import_bcrypt.default.hash(password, 10);
      const user = await storage.createUser({
        username,
        email,
        phoneNumber: phoneNumber || void 0,
        password: hashedPassword,
        totalPoints: 0
      });
      req.session.userId = user.id;
      res.json({ user: { id: user.id, username: user.username, email: user.email, phoneNumber: user.phoneNumber, totalPoints: user.totalPoints } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { usernameOrEmail, password } = req.body;
      if (!usernameOrEmail || !password) {
        return res.status(400).json({ message: "Username/email and password are required" });
      }
      let user = await storage.getUserByUsername(usernameOrEmail);
      if (!user) {
        user = await storage.getUserByEmail(usernameOrEmail);
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isValidPassword = await import_bcrypt.default.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || "user"
      };
      res.json({ user: { id: user.id, username: user.username, email: user.email, totalPoints: user.totalPoints, role: user.role || "user" } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.patch("/api/auth/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { email, phoneNumber } = req.body;
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }
      if (phoneNumber && phoneNumber.trim() !== "" && !/^\+?[\d\s\-\(\)]+$/.test(phoneNumber)) {
        return res.status(400).json({ message: "Please enter a valid phone number" });
      }
      const updatedUser = await storage.updateUserProfile(userId, {
        email: email || void 0,
        phoneNumber: phoneNumber && phoneNumber.trim() !== "" ? phoneNumber : null
      });
      res.json({
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          totalPoints: updatedUser.totalPoints,
          role: updatedUser.role || "user"
        }
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(400).json({ message: error.message || "Failed to update profile" });
    }
  });
  app2.get("/api/auth/user", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user: { id: user.id, username: user.username, email: user.email, totalPoints: user.totalPoints, role: user.role || "user" } });
    } catch (error) {
      console.error("User fetch error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/request-phone-code", async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      const user = await storage.getUserByPhone(phoneNumber);
      if (!user) {
        return res.status(404).json({ message: "Phone number not registered" });
      }
      const code = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
      await storage.createPhoneVerificationCode({
        phoneNumber,
        code,
        expiresAt
      });
      if (smsService.isAvailable()) {
        const sent = await smsService.sendAuthCode(phoneNumber, code);
        if (sent) {
          res.json({ message: "Verification code sent to your phone" });
        } else {
          res.json({ message: "Code generated but SMS failed. Check console for code.", code });
        }
      } else {
        res.json({ message: "SMS service unavailable. Your code is:", code });
      }
    } catch (error) {
      console.error("Phone code request error:", error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });
  app2.post("/api/auth/verify-phone-code", async (req, res) => {
    try {
      const { phoneNumber, code } = req.body;
      if (!phoneNumber || !code) {
        return res.status(400).json({ message: "Phone number and code are required" });
      }
      const verificationCode = await storage.getValidPhoneVerificationCode(phoneNumber, code);
      if (!verificationCode) {
        return res.status(400).json({ message: "Invalid or expired verification code" });
      }
      await storage.markPhoneVerificationCodeUsed(verificationCode.id);
      const user = await storage.getUserByPhone(phoneNumber);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      req.session.userId = user.id;
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          phoneNumber: user.phoneNumber,
          totalPoints: user.totalPoints
        }
      });
    } catch (error) {
      console.error("Phone verification error:", error);
      res.status(500).json({ message: "Verification failed" });
    }
  });
  app2.post("/api/auth/send-sms-invite", async (req, res) => {
    try {
      const { phoneNumber, leagueName, inviteCode } = req.body;
      if (!phoneNumber || !leagueName || !inviteCode) {
        return res.status(400).json({ message: "Phone number, league name, and invite code are required" });
      }
      if (smsService.isAvailable()) {
        const sent = await smsService.sendLeagueInvite(phoneNumber, leagueName, inviteCode);
        if (sent) {
          res.json({ message: "Invite sent successfully" });
        } else {
          res.status(500).json({ message: "Failed to send SMS invite" });
        }
      } else {
        res.status(503).json({ message: "SMS service unavailable" });
      }
    } catch (error) {
      console.error("SMS invite error:", error);
      res.status(500).json({ message: "Failed to send SMS invite" });
    }
  });
}
function requireAuth(req, res, next) {
  const userId = req.session?.userId;
  if (!userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  req.userId = userId;
  next();
}

// node_modules/postal-mime/src/decode-strings.js
var textEncoder = new TextEncoder();
var base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var base64Lookup = new Uint8Array(256);
for (let i = 0; i < base64Chars.length; i++) {
  base64Lookup[base64Chars.charCodeAt(i)] = i;
}
function decodeBase64(base64) {
  let bufferLength = Math.ceil(base64.length / 4) * 3;
  const len = base64.length;
  let p = 0;
  if (base64.length % 4 === 3) {
    bufferLength--;
  } else if (base64.length % 4 === 2) {
    bufferLength -= 2;
  } else if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < len; i += 4) {
    let encoded1 = base64Lookup[base64.charCodeAt(i)];
    let encoded2 = base64Lookup[base64.charCodeAt(i + 1)];
    let encoded3 = base64Lookup[base64.charCodeAt(i + 2)];
    let encoded4 = base64Lookup[base64.charCodeAt(i + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }
  return arrayBuffer;
}
function getDecoder(charset) {
  charset = charset || "utf8";
  let decoder;
  try {
    decoder = new TextDecoder(charset);
  } catch (err) {
    decoder = new TextDecoder("windows-1252");
  }
  return decoder;
}
async function blobToArrayBuffer(blob) {
  if ("arrayBuffer" in blob) {
    return await blob.arrayBuffer();
  }
  const fr = new FileReader();
  return new Promise((resolve, reject) => {
    fr.onload = function(e) {
      resolve(e.target.result);
    };
    fr.onerror = function(e) {
      reject(fr.error);
    };
    fr.readAsArrayBuffer(blob);
  });
}
function getHex(c) {
  if (c >= 48 && c <= 57 || c >= 97 && c <= 102 || c >= 65 && c <= 70) {
    return String.fromCharCode(c);
  }
  return false;
}
function decodeWord(charset, encoding, str) {
  let splitPos = charset.indexOf("*");
  if (splitPos >= 0) {
    charset = charset.substr(0, splitPos);
  }
  encoding = encoding.toUpperCase();
  let byteStr;
  if (encoding === "Q") {
    str = str.replace(/=\s+([0-9a-fA-F])/g, "=$1").replace(/[_\s]/g, " ");
    let buf = textEncoder.encode(str);
    let encodedBytes = [];
    for (let i = 0, len = buf.length; i < len; i++) {
      let c = buf[i];
      if (i <= len - 2 && c === 61) {
        let c1 = getHex(buf[i + 1]);
        let c2 = getHex(buf[i + 2]);
        if (c1 && c2) {
          let c3 = parseInt(c1 + c2, 16);
          encodedBytes.push(c3);
          i += 2;
          continue;
        }
      }
      encodedBytes.push(c);
    }
    byteStr = new ArrayBuffer(encodedBytes.length);
    let dataView = new DataView(byteStr);
    for (let i = 0, len = encodedBytes.length; i < len; i++) {
      dataView.setUint8(i, encodedBytes[i]);
    }
  } else if (encoding === "B") {
    byteStr = decodeBase64(str.replace(/[^a-zA-Z0-9\+\/=]+/g, ""));
  } else {
    byteStr = textEncoder.encode(str);
  }
  return getDecoder(charset).decode(byteStr);
}
function decodeWords(str) {
  let joinString = true;
  let done = false;
  while (!done) {
    let result = (str || "").toString().replace(
      /(=\?([^?]+)\?[Bb]\?([^?]*)\?=)\s*(?==\?([^?]+)\?[Bb]\?[^?]*\?=)/g,
      (match, left, chLeft, encodedLeftStr, chRight) => {
        if (!joinString) {
          return match;
        }
        if (chLeft === chRight && encodedLeftStr.length % 4 === 0 && !/=$/.test(encodedLeftStr)) {
          return left + "__\0JOIN\0__";
        }
        return match;
      }
    ).replace(
      /(=\?([^?]+)\?[Qq]\?[^?]*\?=)\s*(?==\?([^?]+)\?[Qq]\?[^?]*\?=)/g,
      (match, left, chLeft, chRight) => {
        if (!joinString) {
          return match;
        }
        if (chLeft === chRight) {
          return left + "__\0JOIN\0__";
        }
        return match;
      }
    ).replace(/(\?=)?__\x00JOIN\x00__(=\?([^?]+)\?[QqBb]\?)?/g, "").replace(/(=\?[^?]+\?[QqBb]\?[^?]*\?=)\s+(?==\?[^?]+\?[QqBb]\?[^?]*\?=)/g, "$1").replace(
      /=\?([\w_\-*]+)\?([QqBb])\?([^?]*)\?=/g,
      (m, charset, encoding, text2) => decodeWord(charset, encoding, text2)
    );
    if (joinString && result.indexOf("\uFFFD") >= 0) {
      joinString = false;
    } else {
      return result;
    }
  }
}
function decodeURIComponentWithCharset(encodedStr, charset) {
  charset = charset || "utf-8";
  let encodedBytes = [];
  for (let i = 0; i < encodedStr.length; i++) {
    let c = encodedStr.charAt(i);
    if (c === "%" && /^[a-f0-9]{2}/i.test(encodedStr.substr(i + 1, 2))) {
      let byte = encodedStr.substr(i + 1, 2);
      i += 2;
      encodedBytes.push(parseInt(byte, 16));
    } else if (c.charCodeAt(0) > 126) {
      c = textEncoder.encode(c);
      for (let j = 0; j < c.length; j++) {
        encodedBytes.push(c[j]);
      }
    } else {
      encodedBytes.push(c.charCodeAt(0));
    }
  }
  const byteStr = new ArrayBuffer(encodedBytes.length);
  const dataView = new DataView(byteStr);
  for (let i = 0, len = encodedBytes.length; i < len; i++) {
    dataView.setUint8(i, encodedBytes[i]);
  }
  return getDecoder(charset).decode(byteStr);
}
function decodeParameterValueContinuations(header) {
  let paramKeys = /* @__PURE__ */ new Map();
  Object.keys(header.params).forEach((key) => {
    let match = key.match(/\*((\d+)\*?)?$/);
    if (!match) {
      return;
    }
    let actualKey = key.substr(0, match.index).toLowerCase();
    let nr = Number(match[2]) || 0;
    let paramVal;
    if (!paramKeys.has(actualKey)) {
      paramVal = {
        charset: false,
        values: []
      };
      paramKeys.set(actualKey, paramVal);
    } else {
      paramVal = paramKeys.get(actualKey);
    }
    let value = header.params[key];
    if (nr === 0 && match[0].charAt(match[0].length - 1) === "*" && (match = value.match(/^([^']*)'[^']*'(.*)$/))) {
      paramVal.charset = match[1] || "utf-8";
      value = match[2];
    }
    paramVal.values.push({ nr, value });
    delete header.params[key];
  });
  paramKeys.forEach((paramVal, key) => {
    header.params[key] = decodeURIComponentWithCharset(
      paramVal.values.sort((a, b) => a.nr - b.nr).map((a) => a.value).join(""),
      paramVal.charset
    );
  });
}

// node_modules/postal-mime/src/pass-through-decoder.js
var PassThroughDecoder = class {
  constructor() {
    this.chunks = [];
  }
  update(line) {
    this.chunks.push(line);
    this.chunks.push("\n");
  }
  finalize() {
    return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
  }
};

// node_modules/postal-mime/src/base64-decoder.js
var Base64Decoder = class {
  constructor(opts) {
    opts = opts || {};
    this.decoder = opts.decoder || new TextDecoder();
    this.maxChunkSize = 100 * 1024;
    this.chunks = [];
    this.remainder = "";
  }
  update(buffer) {
    let str = this.decoder.decode(buffer);
    str = str.replace(/[^a-zA-Z0-9+\/]+/g, "");
    this.remainder += str;
    if (this.remainder.length >= this.maxChunkSize) {
      let allowedBytes = Math.floor(this.remainder.length / 4) * 4;
      let base64Str;
      if (allowedBytes === this.remainder.length) {
        base64Str = this.remainder;
        this.remainder = "";
      } else {
        base64Str = this.remainder.substr(0, allowedBytes);
        this.remainder = this.remainder.substr(allowedBytes);
      }
      if (base64Str.length) {
        this.chunks.push(decodeBase64(base64Str));
      }
    }
  }
  finalize() {
    if (this.remainder && !/^=+$/.test(this.remainder)) {
      this.chunks.push(decodeBase64(this.remainder));
    }
    return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
  }
};

// node_modules/postal-mime/src/qp-decoder.js
var VALID_QP_REGEX = /^=[a-f0-9]{2}$/i;
var QP_SPLIT_REGEX = /(?==[a-f0-9]{2})/i;
var SOFT_LINE_BREAK_REGEX = /=\r?\n/g;
var PARTIAL_QP_ENDING_REGEX = /=[a-fA-F0-9]?$/;
var QPDecoder = class {
  constructor(opts) {
    opts = opts || {};
    this.decoder = opts.decoder || new TextDecoder();
    this.maxChunkSize = 100 * 1024;
    this.remainder = "";
    this.chunks = [];
  }
  decodeQPBytes(encodedBytes) {
    let buf = new ArrayBuffer(encodedBytes.length);
    let dataView = new DataView(buf);
    for (let i = 0, len = encodedBytes.length; i < len; i++) {
      dataView.setUint8(i, parseInt(encodedBytes[i], 16));
    }
    return buf;
  }
  decodeChunks(str) {
    str = str.replace(SOFT_LINE_BREAK_REGEX, "");
    let list = str.split(QP_SPLIT_REGEX);
    let encodedBytes = [];
    for (let part of list) {
      if (part.charAt(0) !== "=") {
        if (encodedBytes.length) {
          this.chunks.push(this.decodeQPBytes(encodedBytes));
          encodedBytes = [];
        }
        this.chunks.push(part);
        continue;
      }
      if (part.length === 3) {
        if (VALID_QP_REGEX.test(part)) {
          encodedBytes.push(part.substr(1));
        } else {
          if (encodedBytes.length) {
            this.chunks.push(this.decodeQPBytes(encodedBytes));
            encodedBytes = [];
          }
          this.chunks.push(part);
        }
        continue;
      }
      if (part.length > 3) {
        const firstThree = part.substr(0, 3);
        if (VALID_QP_REGEX.test(firstThree)) {
          encodedBytes.push(part.substr(1, 2));
          this.chunks.push(this.decodeQPBytes(encodedBytes));
          encodedBytes = [];
          part = part.substr(3);
          this.chunks.push(part);
        } else {
          if (encodedBytes.length) {
            this.chunks.push(this.decodeQPBytes(encodedBytes));
            encodedBytes = [];
          }
          this.chunks.push(part);
        }
      }
    }
    if (encodedBytes.length) {
      this.chunks.push(this.decodeQPBytes(encodedBytes));
    }
  }
  update(buffer) {
    let str = this.decoder.decode(buffer) + "\n";
    str = this.remainder + str;
    if (str.length < this.maxChunkSize) {
      this.remainder = str;
      return;
    }
    this.remainder = "";
    let partialEnding = str.match(PARTIAL_QP_ENDING_REGEX);
    if (partialEnding) {
      if (partialEnding.index === 0) {
        this.remainder = str;
        return;
      }
      this.remainder = str.substr(partialEnding.index);
      str = str.substr(0, partialEnding.index);
    }
    this.decodeChunks(str);
  }
  finalize() {
    if (this.remainder.length) {
      this.decodeChunks(this.remainder);
      this.remainder = "";
    }
    return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
  }
};

// node_modules/postal-mime/src/mime-node.js
var defaultDecoder = getDecoder();
var MimeNode = class {
  constructor(options) {
    this.options = options || {};
    this.postalMime = this.options.postalMime;
    this.root = !!this.options.parentNode;
    this.childNodes = [];
    if (this.options.parentNode) {
      this.parentNode = this.options.parentNode;
      this.depth = this.parentNode.depth + 1;
      if (this.depth > this.options.maxNestingDepth) {
        throw new Error(`Maximum MIME nesting depth of ${this.options.maxNestingDepth} levels exceeded`);
      }
      this.options.parentNode.childNodes.push(this);
    } else {
      this.depth = 0;
    }
    this.state = "header";
    this.headerLines = [];
    this.headerSize = 0;
    const parentMultipartType = this.options.parentMultipartType || null;
    const defaultContentType = parentMultipartType === "digest" ? "message/rfc822" : "text/plain";
    this.contentType = {
      value: defaultContentType,
      default: true
    };
    this.contentTransferEncoding = {
      value: "8bit"
    };
    this.contentDisposition = {
      value: ""
    };
    this.headers = [];
    this.contentDecoder = false;
  }
  setupContentDecoder(transferEncoding) {
    if (/base64/i.test(transferEncoding)) {
      this.contentDecoder = new Base64Decoder();
    } else if (/quoted-printable/i.test(transferEncoding)) {
      this.contentDecoder = new QPDecoder({ decoder: getDecoder(this.contentType.parsed.params.charset) });
    } else {
      this.contentDecoder = new PassThroughDecoder();
    }
  }
  async finalize() {
    if (this.state === "finished") {
      return;
    }
    if (this.state === "header") {
      this.processHeaders();
    }
    let boundaries = this.postalMime.boundaries;
    for (let i = boundaries.length - 1; i >= 0; i--) {
      let boundary = boundaries[i];
      if (boundary.node === this) {
        boundaries.splice(i, 1);
        break;
      }
    }
    await this.finalizeChildNodes();
    this.content = this.contentDecoder ? await this.contentDecoder.finalize() : null;
    this.state = "finished";
  }
  async finalizeChildNodes() {
    for (let childNode of this.childNodes) {
      await childNode.finalize();
    }
  }
  // Strip RFC 822 comments (parenthesized text) from structured header values
  stripComments(str) {
    let result = "";
    let depth = 0;
    let escaped = false;
    let inQuote = false;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charAt(i);
      if (escaped) {
        if (depth === 0) {
          result += chr;
        }
        escaped = false;
        continue;
      }
      if (chr === "\\") {
        escaped = true;
        if (depth === 0) {
          result += chr;
        }
        continue;
      }
      if (chr === '"' && depth === 0) {
        inQuote = !inQuote;
        result += chr;
        continue;
      }
      if (!inQuote) {
        if (chr === "(") {
          depth++;
          continue;
        }
        if (chr === ")" && depth > 0) {
          depth--;
          continue;
        }
      }
      if (depth === 0) {
        result += chr;
      }
    }
    return result;
  }
  parseStructuredHeader(str) {
    str = this.stripComments(str);
    let response = {
      value: false,
      params: {}
    };
    let key = false;
    let value = "";
    let stage = "value";
    let quote = false;
    let escaped = false;
    let chr;
    for (let i = 0, len = str.length; i < len; i++) {
      chr = str.charAt(i);
      switch (stage) {
        case "key":
          if (chr === "=") {
            key = value.trim().toLowerCase();
            stage = "value";
            value = "";
            break;
          }
          value += chr;
          break;
        case "value":
          if (escaped) {
            value += chr;
          } else if (chr === "\\") {
            escaped = true;
            continue;
          } else if (quote && chr === quote) {
            quote = false;
          } else if (!quote && chr === '"') {
            quote = chr;
          } else if (!quote && chr === ";") {
            if (key === false) {
              response.value = value.trim();
            } else {
              response.params[key] = value.trim();
            }
            stage = "key";
            value = "";
          } else {
            value += chr;
          }
          escaped = false;
          break;
      }
    }
    value = value.trim();
    if (stage === "value") {
      if (key === false) {
        response.value = value;
      } else {
        response.params[key] = value;
      }
    } else if (value) {
      response.params[value.toLowerCase()] = "";
    }
    if (response.value) {
      response.value = response.value.toLowerCase();
    }
    decodeParameterValueContinuations(response);
    return response;
  }
  decodeFlowedText(str, delSp) {
    return str.split(/\r?\n/).reduce((previousValue, currentValue) => {
      if (previousValue.endsWith(" ") && previousValue !== "-- " && !previousValue.endsWith("\n-- ")) {
        if (delSp) {
          return previousValue.slice(0, -1) + currentValue;
        } else {
          return previousValue + currentValue;
        }
      } else {
        return previousValue + "\n" + currentValue;
      }
    }).replace(/^ /gm, "");
  }
  getTextContent() {
    if (!this.content) {
      return "";
    }
    let str = getDecoder(this.contentType.parsed.params.charset).decode(this.content);
    if (/^flowed$/i.test(this.contentType.parsed.params.format)) {
      str = this.decodeFlowedText(str, /^yes$/i.test(this.contentType.parsed.params.delsp));
    }
    return str;
  }
  processHeaders() {
    for (let i = this.headerLines.length - 1; i >= 0; i--) {
      let line = this.headerLines[i];
      if (i && /^\s/.test(line)) {
        this.headerLines[i - 1] += "\n" + line;
        this.headerLines.splice(i, 1);
      }
    }
    this.rawHeaderLines = [];
    for (let i = this.headerLines.length - 1; i >= 0; i--) {
      let rawLine = this.headerLines[i];
      let sep = rawLine.indexOf(":");
      let rawKey = sep < 0 ? rawLine.trim() : rawLine.substr(0, sep).trim();
      this.rawHeaderLines.push({
        key: rawKey.toLowerCase(),
        line: rawLine
      });
      let normalizedLine = rawLine.replace(/\s+/g, " ");
      sep = normalizedLine.indexOf(":");
      let key = sep < 0 ? normalizedLine.trim() : normalizedLine.substr(0, sep).trim();
      let value = sep < 0 ? "" : normalizedLine.substr(sep + 1).trim();
      this.headers.push({ key: key.toLowerCase(), originalKey: key, value });
      switch (key.toLowerCase()) {
        case "content-type":
          if (this.contentType.default) {
            this.contentType = { value, parsed: {} };
          }
          break;
        case "content-transfer-encoding":
          this.contentTransferEncoding = { value, parsed: {} };
          break;
        case "content-disposition":
          this.contentDisposition = { value, parsed: {} };
          break;
        case "content-id":
          this.contentId = value;
          break;
        case "content-description":
          this.contentDescription = value;
          break;
      }
    }
    this.contentType.parsed = this.parseStructuredHeader(this.contentType.value);
    this.contentType.multipart = /^multipart\//i.test(this.contentType.parsed.value) ? this.contentType.parsed.value.substr(this.contentType.parsed.value.indexOf("/") + 1) : false;
    if (this.contentType.multipart && this.contentType.parsed.params.boundary) {
      this.postalMime.boundaries.push({
        value: textEncoder.encode(this.contentType.parsed.params.boundary),
        node: this
      });
    }
    this.contentDisposition.parsed = this.parseStructuredHeader(this.contentDisposition.value);
    this.contentTransferEncoding.encoding = this.contentTransferEncoding.value.toLowerCase().split(/[^\w-]/).shift();
    this.setupContentDecoder(this.contentTransferEncoding.encoding);
  }
  feed(line) {
    switch (this.state) {
      case "header":
        if (!line.length) {
          this.state = "body";
          return this.processHeaders();
        }
        this.headerSize += line.length;
        if (this.headerSize > this.options.maxHeadersSize) {
          let error = new Error(`Maximum header size of ${this.options.maxHeadersSize} bytes exceeded`);
          throw error;
        }
        this.headerLines.push(defaultDecoder.decode(line));
        break;
      case "body": {
        this.contentDecoder.update(line);
      }
    }
  }
};

// node_modules/postal-mime/src/html-entities.js
var htmlEntities = {
  "&AElig": "\xC6",
  "&AElig;": "\xC6",
  "&AMP": "&",
  "&AMP;": "&",
  "&Aacute": "\xC1",
  "&Aacute;": "\xC1",
  "&Abreve;": "\u0102",
  "&Acirc": "\xC2",
  "&Acirc;": "\xC2",
  "&Acy;": "\u0410",
  "&Afr;": "\u{1D504}",
  "&Agrave": "\xC0",
  "&Agrave;": "\xC0",
  "&Alpha;": "\u0391",
  "&Amacr;": "\u0100",
  "&And;": "\u2A53",
  "&Aogon;": "\u0104",
  "&Aopf;": "\u{1D538}",
  "&ApplyFunction;": "\u2061",
  "&Aring": "\xC5",
  "&Aring;": "\xC5",
  "&Ascr;": "\u{1D49C}",
  "&Assign;": "\u2254",
  "&Atilde": "\xC3",
  "&Atilde;": "\xC3",
  "&Auml": "\xC4",
  "&Auml;": "\xC4",
  "&Backslash;": "\u2216",
  "&Barv;": "\u2AE7",
  "&Barwed;": "\u2306",
  "&Bcy;": "\u0411",
  "&Because;": "\u2235",
  "&Bernoullis;": "\u212C",
  "&Beta;": "\u0392",
  "&Bfr;": "\u{1D505}",
  "&Bopf;": "\u{1D539}",
  "&Breve;": "\u02D8",
  "&Bscr;": "\u212C",
  "&Bumpeq;": "\u224E",
  "&CHcy;": "\u0427",
  "&COPY": "\xA9",
  "&COPY;": "\xA9",
  "&Cacute;": "\u0106",
  "&Cap;": "\u22D2",
  "&CapitalDifferentialD;": "\u2145",
  "&Cayleys;": "\u212D",
  "&Ccaron;": "\u010C",
  "&Ccedil": "\xC7",
  "&Ccedil;": "\xC7",
  "&Ccirc;": "\u0108",
  "&Cconint;": "\u2230",
  "&Cdot;": "\u010A",
  "&Cedilla;": "\xB8",
  "&CenterDot;": "\xB7",
  "&Cfr;": "\u212D",
  "&Chi;": "\u03A7",
  "&CircleDot;": "\u2299",
  "&CircleMinus;": "\u2296",
  "&CirclePlus;": "\u2295",
  "&CircleTimes;": "\u2297",
  "&ClockwiseContourIntegral;": "\u2232",
  "&CloseCurlyDoubleQuote;": "\u201D",
  "&CloseCurlyQuote;": "\u2019",
  "&Colon;": "\u2237",
  "&Colone;": "\u2A74",
  "&Congruent;": "\u2261",
  "&Conint;": "\u222F",
  "&ContourIntegral;": "\u222E",
  "&Copf;": "\u2102",
  "&Coproduct;": "\u2210",
  "&CounterClockwiseContourIntegral;": "\u2233",
  "&Cross;": "\u2A2F",
  "&Cscr;": "\u{1D49E}",
  "&Cup;": "\u22D3",
  "&CupCap;": "\u224D",
  "&DD;": "\u2145",
  "&DDotrahd;": "\u2911",
  "&DJcy;": "\u0402",
  "&DScy;": "\u0405",
  "&DZcy;": "\u040F",
  "&Dagger;": "\u2021",
  "&Darr;": "\u21A1",
  "&Dashv;": "\u2AE4",
  "&Dcaron;": "\u010E",
  "&Dcy;": "\u0414",
  "&Del;": "\u2207",
  "&Delta;": "\u0394",
  "&Dfr;": "\u{1D507}",
  "&DiacriticalAcute;": "\xB4",
  "&DiacriticalDot;": "\u02D9",
  "&DiacriticalDoubleAcute;": "\u02DD",
  "&DiacriticalGrave;": "`",
  "&DiacriticalTilde;": "\u02DC",
  "&Diamond;": "\u22C4",
  "&DifferentialD;": "\u2146",
  "&Dopf;": "\u{1D53B}",
  "&Dot;": "\xA8",
  "&DotDot;": "\u20DC",
  "&DotEqual;": "\u2250",
  "&DoubleContourIntegral;": "\u222F",
  "&DoubleDot;": "\xA8",
  "&DoubleDownArrow;": "\u21D3",
  "&DoubleLeftArrow;": "\u21D0",
  "&DoubleLeftRightArrow;": "\u21D4",
  "&DoubleLeftTee;": "\u2AE4",
  "&DoubleLongLeftArrow;": "\u27F8",
  "&DoubleLongLeftRightArrow;": "\u27FA",
  "&DoubleLongRightArrow;": "\u27F9",
  "&DoubleRightArrow;": "\u21D2",
  "&DoubleRightTee;": "\u22A8",
  "&DoubleUpArrow;": "\u21D1",
  "&DoubleUpDownArrow;": "\u21D5",
  "&DoubleVerticalBar;": "\u2225",
  "&DownArrow;": "\u2193",
  "&DownArrowBar;": "\u2913",
  "&DownArrowUpArrow;": "\u21F5",
  "&DownBreve;": "\u0311",
  "&DownLeftRightVector;": "\u2950",
  "&DownLeftTeeVector;": "\u295E",
  "&DownLeftVector;": "\u21BD",
  "&DownLeftVectorBar;": "\u2956",
  "&DownRightTeeVector;": "\u295F",
  "&DownRightVector;": "\u21C1",
  "&DownRightVectorBar;": "\u2957",
  "&DownTee;": "\u22A4",
  "&DownTeeArrow;": "\u21A7",
  "&Downarrow;": "\u21D3",
  "&Dscr;": "\u{1D49F}",
  "&Dstrok;": "\u0110",
  "&ENG;": "\u014A",
  "&ETH": "\xD0",
  "&ETH;": "\xD0",
  "&Eacute": "\xC9",
  "&Eacute;": "\xC9",
  "&Ecaron;": "\u011A",
  "&Ecirc": "\xCA",
  "&Ecirc;": "\xCA",
  "&Ecy;": "\u042D",
  "&Edot;": "\u0116",
  "&Efr;": "\u{1D508}",
  "&Egrave": "\xC8",
  "&Egrave;": "\xC8",
  "&Element;": "\u2208",
  "&Emacr;": "\u0112",
  "&EmptySmallSquare;": "\u25FB",
  "&EmptyVerySmallSquare;": "\u25AB",
  "&Eogon;": "\u0118",
  "&Eopf;": "\u{1D53C}",
  "&Epsilon;": "\u0395",
  "&Equal;": "\u2A75",
  "&EqualTilde;": "\u2242",
  "&Equilibrium;": "\u21CC",
  "&Escr;": "\u2130",
  "&Esim;": "\u2A73",
  "&Eta;": "\u0397",
  "&Euml": "\xCB",
  "&Euml;": "\xCB",
  "&Exists;": "\u2203",
  "&ExponentialE;": "\u2147",
  "&Fcy;": "\u0424",
  "&Ffr;": "\u{1D509}",
  "&FilledSmallSquare;": "\u25FC",
  "&FilledVerySmallSquare;": "\u25AA",
  "&Fopf;": "\u{1D53D}",
  "&ForAll;": "\u2200",
  "&Fouriertrf;": "\u2131",
  "&Fscr;": "\u2131",
  "&GJcy;": "\u0403",
  "&GT": ">",
  "&GT;": ">",
  "&Gamma;": "\u0393",
  "&Gammad;": "\u03DC",
  "&Gbreve;": "\u011E",
  "&Gcedil;": "\u0122",
  "&Gcirc;": "\u011C",
  "&Gcy;": "\u0413",
  "&Gdot;": "\u0120",
  "&Gfr;": "\u{1D50A}",
  "&Gg;": "\u22D9",
  "&Gopf;": "\u{1D53E}",
  "&GreaterEqual;": "\u2265",
  "&GreaterEqualLess;": "\u22DB",
  "&GreaterFullEqual;": "\u2267",
  "&GreaterGreater;": "\u2AA2",
  "&GreaterLess;": "\u2277",
  "&GreaterSlantEqual;": "\u2A7E",
  "&GreaterTilde;": "\u2273",
  "&Gscr;": "\u{1D4A2}",
  "&Gt;": "\u226B",
  "&HARDcy;": "\u042A",
  "&Hacek;": "\u02C7",
  "&Hat;": "^",
  "&Hcirc;": "\u0124",
  "&Hfr;": "\u210C",
  "&HilbertSpace;": "\u210B",
  "&Hopf;": "\u210D",
  "&HorizontalLine;": "\u2500",
  "&Hscr;": "\u210B",
  "&Hstrok;": "\u0126",
  "&HumpDownHump;": "\u224E",
  "&HumpEqual;": "\u224F",
  "&IEcy;": "\u0415",
  "&IJlig;": "\u0132",
  "&IOcy;": "\u0401",
  "&Iacute": "\xCD",
  "&Iacute;": "\xCD",
  "&Icirc": "\xCE",
  "&Icirc;": "\xCE",
  "&Icy;": "\u0418",
  "&Idot;": "\u0130",
  "&Ifr;": "\u2111",
  "&Igrave": "\xCC",
  "&Igrave;": "\xCC",
  "&Im;": "\u2111",
  "&Imacr;": "\u012A",
  "&ImaginaryI;": "\u2148",
  "&Implies;": "\u21D2",
  "&Int;": "\u222C",
  "&Integral;": "\u222B",
  "&Intersection;": "\u22C2",
  "&InvisibleComma;": "\u2063",
  "&InvisibleTimes;": "\u2062",
  "&Iogon;": "\u012E",
  "&Iopf;": "\u{1D540}",
  "&Iota;": "\u0399",
  "&Iscr;": "\u2110",
  "&Itilde;": "\u0128",
  "&Iukcy;": "\u0406",
  "&Iuml": "\xCF",
  "&Iuml;": "\xCF",
  "&Jcirc;": "\u0134",
  "&Jcy;": "\u0419",
  "&Jfr;": "\u{1D50D}",
  "&Jopf;": "\u{1D541}",
  "&Jscr;": "\u{1D4A5}",
  "&Jsercy;": "\u0408",
  "&Jukcy;": "\u0404",
  "&KHcy;": "\u0425",
  "&KJcy;": "\u040C",
  "&Kappa;": "\u039A",
  "&Kcedil;": "\u0136",
  "&Kcy;": "\u041A",
  "&Kfr;": "\u{1D50E}",
  "&Kopf;": "\u{1D542}",
  "&Kscr;": "\u{1D4A6}",
  "&LJcy;": "\u0409",
  "&LT": "<",
  "&LT;": "<",
  "&Lacute;": "\u0139",
  "&Lambda;": "\u039B",
  "&Lang;": "\u27EA",
  "&Laplacetrf;": "\u2112",
  "&Larr;": "\u219E",
  "&Lcaron;": "\u013D",
  "&Lcedil;": "\u013B",
  "&Lcy;": "\u041B",
  "&LeftAngleBracket;": "\u27E8",
  "&LeftArrow;": "\u2190",
  "&LeftArrowBar;": "\u21E4",
  "&LeftArrowRightArrow;": "\u21C6",
  "&LeftCeiling;": "\u2308",
  "&LeftDoubleBracket;": "\u27E6",
  "&LeftDownTeeVector;": "\u2961",
  "&LeftDownVector;": "\u21C3",
  "&LeftDownVectorBar;": "\u2959",
  "&LeftFloor;": "\u230A",
  "&LeftRightArrow;": "\u2194",
  "&LeftRightVector;": "\u294E",
  "&LeftTee;": "\u22A3",
  "&LeftTeeArrow;": "\u21A4",
  "&LeftTeeVector;": "\u295A",
  "&LeftTriangle;": "\u22B2",
  "&LeftTriangleBar;": "\u29CF",
  "&LeftTriangleEqual;": "\u22B4",
  "&LeftUpDownVector;": "\u2951",
  "&LeftUpTeeVector;": "\u2960",
  "&LeftUpVector;": "\u21BF",
  "&LeftUpVectorBar;": "\u2958",
  "&LeftVector;": "\u21BC",
  "&LeftVectorBar;": "\u2952",
  "&Leftarrow;": "\u21D0",
  "&Leftrightarrow;": "\u21D4",
  "&LessEqualGreater;": "\u22DA",
  "&LessFullEqual;": "\u2266",
  "&LessGreater;": "\u2276",
  "&LessLess;": "\u2AA1",
  "&LessSlantEqual;": "\u2A7D",
  "&LessTilde;": "\u2272",
  "&Lfr;": "\u{1D50F}",
  "&Ll;": "\u22D8",
  "&Lleftarrow;": "\u21DA",
  "&Lmidot;": "\u013F",
  "&LongLeftArrow;": "\u27F5",
  "&LongLeftRightArrow;": "\u27F7",
  "&LongRightArrow;": "\u27F6",
  "&Longleftarrow;": "\u27F8",
  "&Longleftrightarrow;": "\u27FA",
  "&Longrightarrow;": "\u27F9",
  "&Lopf;": "\u{1D543}",
  "&LowerLeftArrow;": "\u2199",
  "&LowerRightArrow;": "\u2198",
  "&Lscr;": "\u2112",
  "&Lsh;": "\u21B0",
  "&Lstrok;": "\u0141",
  "&Lt;": "\u226A",
  "&Map;": "\u2905",
  "&Mcy;": "\u041C",
  "&MediumSpace;": "\u205F",
  "&Mellintrf;": "\u2133",
  "&Mfr;": "\u{1D510}",
  "&MinusPlus;": "\u2213",
  "&Mopf;": "\u{1D544}",
  "&Mscr;": "\u2133",
  "&Mu;": "\u039C",
  "&NJcy;": "\u040A",
  "&Nacute;": "\u0143",
  "&Ncaron;": "\u0147",
  "&Ncedil;": "\u0145",
  "&Ncy;": "\u041D",
  "&NegativeMediumSpace;": "\u200B",
  "&NegativeThickSpace;": "\u200B",
  "&NegativeThinSpace;": "\u200B",
  "&NegativeVeryThinSpace;": "\u200B",
  "&NestedGreaterGreater;": "\u226B",
  "&NestedLessLess;": "\u226A",
  "&NewLine;": "\n",
  "&Nfr;": "\u{1D511}",
  "&NoBreak;": "\u2060",
  "&NonBreakingSpace;": "\xA0",
  "&Nopf;": "\u2115",
  "&Not;": "\u2AEC",
  "&NotCongruent;": "\u2262",
  "&NotCupCap;": "\u226D",
  "&NotDoubleVerticalBar;": "\u2226",
  "&NotElement;": "\u2209",
  "&NotEqual;": "\u2260",
  "&NotEqualTilde;": "\u2242\u0338",
  "&NotExists;": "\u2204",
  "&NotGreater;": "\u226F",
  "&NotGreaterEqual;": "\u2271",
  "&NotGreaterFullEqual;": "\u2267\u0338",
  "&NotGreaterGreater;": "\u226B\u0338",
  "&NotGreaterLess;": "\u2279",
  "&NotGreaterSlantEqual;": "\u2A7E\u0338",
  "&NotGreaterTilde;": "\u2275",
  "&NotHumpDownHump;": "\u224E\u0338",
  "&NotHumpEqual;": "\u224F\u0338",
  "&NotLeftTriangle;": "\u22EA",
  "&NotLeftTriangleBar;": "\u29CF\u0338",
  "&NotLeftTriangleEqual;": "\u22EC",
  "&NotLess;": "\u226E",
  "&NotLessEqual;": "\u2270",
  "&NotLessGreater;": "\u2278",
  "&NotLessLess;": "\u226A\u0338",
  "&NotLessSlantEqual;": "\u2A7D\u0338",
  "&NotLessTilde;": "\u2274",
  "&NotNestedGreaterGreater;": "\u2AA2\u0338",
  "&NotNestedLessLess;": "\u2AA1\u0338",
  "&NotPrecedes;": "\u2280",
  "&NotPrecedesEqual;": "\u2AAF\u0338",
  "&NotPrecedesSlantEqual;": "\u22E0",
  "&NotReverseElement;": "\u220C",
  "&NotRightTriangle;": "\u22EB",
  "&NotRightTriangleBar;": "\u29D0\u0338",
  "&NotRightTriangleEqual;": "\u22ED",
  "&NotSquareSubset;": "\u228F\u0338",
  "&NotSquareSubsetEqual;": "\u22E2",
  "&NotSquareSuperset;": "\u2290\u0338",
  "&NotSquareSupersetEqual;": "\u22E3",
  "&NotSubset;": "\u2282\u20D2",
  "&NotSubsetEqual;": "\u2288",
  "&NotSucceeds;": "\u2281",
  "&NotSucceedsEqual;": "\u2AB0\u0338",
  "&NotSucceedsSlantEqual;": "\u22E1",
  "&NotSucceedsTilde;": "\u227F\u0338",
  "&NotSuperset;": "\u2283\u20D2",
  "&NotSupersetEqual;": "\u2289",
  "&NotTilde;": "\u2241",
  "&NotTildeEqual;": "\u2244",
  "&NotTildeFullEqual;": "\u2247",
  "&NotTildeTilde;": "\u2249",
  "&NotVerticalBar;": "\u2224",
  "&Nscr;": "\u{1D4A9}",
  "&Ntilde": "\xD1",
  "&Ntilde;": "\xD1",
  "&Nu;": "\u039D",
  "&OElig;": "\u0152",
  "&Oacute": "\xD3",
  "&Oacute;": "\xD3",
  "&Ocirc": "\xD4",
  "&Ocirc;": "\xD4",
  "&Ocy;": "\u041E",
  "&Odblac;": "\u0150",
  "&Ofr;": "\u{1D512}",
  "&Ograve": "\xD2",
  "&Ograve;": "\xD2",
  "&Omacr;": "\u014C",
  "&Omega;": "\u03A9",
  "&Omicron;": "\u039F",
  "&Oopf;": "\u{1D546}",
  "&OpenCurlyDoubleQuote;": "\u201C",
  "&OpenCurlyQuote;": "\u2018",
  "&Or;": "\u2A54",
  "&Oscr;": "\u{1D4AA}",
  "&Oslash": "\xD8",
  "&Oslash;": "\xD8",
  "&Otilde": "\xD5",
  "&Otilde;": "\xD5",
  "&Otimes;": "\u2A37",
  "&Ouml": "\xD6",
  "&Ouml;": "\xD6",
  "&OverBar;": "\u203E",
  "&OverBrace;": "\u23DE",
  "&OverBracket;": "\u23B4",
  "&OverParenthesis;": "\u23DC",
  "&PartialD;": "\u2202",
  "&Pcy;": "\u041F",
  "&Pfr;": "\u{1D513}",
  "&Phi;": "\u03A6",
  "&Pi;": "\u03A0",
  "&PlusMinus;": "\xB1",
  "&Poincareplane;": "\u210C",
  "&Popf;": "\u2119",
  "&Pr;": "\u2ABB",
  "&Precedes;": "\u227A",
  "&PrecedesEqual;": "\u2AAF",
  "&PrecedesSlantEqual;": "\u227C",
  "&PrecedesTilde;": "\u227E",
  "&Prime;": "\u2033",
  "&Product;": "\u220F",
  "&Proportion;": "\u2237",
  "&Proportional;": "\u221D",
  "&Pscr;": "\u{1D4AB}",
  "&Psi;": "\u03A8",
  "&QUOT": '"',
  "&QUOT;": '"',
  "&Qfr;": "\u{1D514}",
  "&Qopf;": "\u211A",
  "&Qscr;": "\u{1D4AC}",
  "&RBarr;": "\u2910",
  "&REG": "\xAE",
  "&REG;": "\xAE",
  "&Racute;": "\u0154",
  "&Rang;": "\u27EB",
  "&Rarr;": "\u21A0",
  "&Rarrtl;": "\u2916",
  "&Rcaron;": "\u0158",
  "&Rcedil;": "\u0156",
  "&Rcy;": "\u0420",
  "&Re;": "\u211C",
  "&ReverseElement;": "\u220B",
  "&ReverseEquilibrium;": "\u21CB",
  "&ReverseUpEquilibrium;": "\u296F",
  "&Rfr;": "\u211C",
  "&Rho;": "\u03A1",
  "&RightAngleBracket;": "\u27E9",
  "&RightArrow;": "\u2192",
  "&RightArrowBar;": "\u21E5",
  "&RightArrowLeftArrow;": "\u21C4",
  "&RightCeiling;": "\u2309",
  "&RightDoubleBracket;": "\u27E7",
  "&RightDownTeeVector;": "\u295D",
  "&RightDownVector;": "\u21C2",
  "&RightDownVectorBar;": "\u2955",
  "&RightFloor;": "\u230B",
  "&RightTee;": "\u22A2",
  "&RightTeeArrow;": "\u21A6",
  "&RightTeeVector;": "\u295B",
  "&RightTriangle;": "\u22B3",
  "&RightTriangleBar;": "\u29D0",
  "&RightTriangleEqual;": "\u22B5",
  "&RightUpDownVector;": "\u294F",
  "&RightUpTeeVector;": "\u295C",
  "&RightUpVector;": "\u21BE",
  "&RightUpVectorBar;": "\u2954",
  "&RightVector;": "\u21C0",
  "&RightVectorBar;": "\u2953",
  "&Rightarrow;": "\u21D2",
  "&Ropf;": "\u211D",
  "&RoundImplies;": "\u2970",
  "&Rrightarrow;": "\u21DB",
  "&Rscr;": "\u211B",
  "&Rsh;": "\u21B1",
  "&RuleDelayed;": "\u29F4",
  "&SHCHcy;": "\u0429",
  "&SHcy;": "\u0428",
  "&SOFTcy;": "\u042C",
  "&Sacute;": "\u015A",
  "&Sc;": "\u2ABC",
  "&Scaron;": "\u0160",
  "&Scedil;": "\u015E",
  "&Scirc;": "\u015C",
  "&Scy;": "\u0421",
  "&Sfr;": "\u{1D516}",
  "&ShortDownArrow;": "\u2193",
  "&ShortLeftArrow;": "\u2190",
  "&ShortRightArrow;": "\u2192",
  "&ShortUpArrow;": "\u2191",
  "&Sigma;": "\u03A3",
  "&SmallCircle;": "\u2218",
  "&Sopf;": "\u{1D54A}",
  "&Sqrt;": "\u221A",
  "&Square;": "\u25A1",
  "&SquareIntersection;": "\u2293",
  "&SquareSubset;": "\u228F",
  "&SquareSubsetEqual;": "\u2291",
  "&SquareSuperset;": "\u2290",
  "&SquareSupersetEqual;": "\u2292",
  "&SquareUnion;": "\u2294",
  "&Sscr;": "\u{1D4AE}",
  "&Star;": "\u22C6",
  "&Sub;": "\u22D0",
  "&Subset;": "\u22D0",
  "&SubsetEqual;": "\u2286",
  "&Succeeds;": "\u227B",
  "&SucceedsEqual;": "\u2AB0",
  "&SucceedsSlantEqual;": "\u227D",
  "&SucceedsTilde;": "\u227F",
  "&SuchThat;": "\u220B",
  "&Sum;": "\u2211",
  "&Sup;": "\u22D1",
  "&Superset;": "\u2283",
  "&SupersetEqual;": "\u2287",
  "&Supset;": "\u22D1",
  "&THORN": "\xDE",
  "&THORN;": "\xDE",
  "&TRADE;": "\u2122",
  "&TSHcy;": "\u040B",
  "&TScy;": "\u0426",
  "&Tab;": "	",
  "&Tau;": "\u03A4",
  "&Tcaron;": "\u0164",
  "&Tcedil;": "\u0162",
  "&Tcy;": "\u0422",
  "&Tfr;": "\u{1D517}",
  "&Therefore;": "\u2234",
  "&Theta;": "\u0398",
  "&ThickSpace;": "\u205F\u200A",
  "&ThinSpace;": "\u2009",
  "&Tilde;": "\u223C",
  "&TildeEqual;": "\u2243",
  "&TildeFullEqual;": "\u2245",
  "&TildeTilde;": "\u2248",
  "&Topf;": "\u{1D54B}",
  "&TripleDot;": "\u20DB",
  "&Tscr;": "\u{1D4AF}",
  "&Tstrok;": "\u0166",
  "&Uacute": "\xDA",
  "&Uacute;": "\xDA",
  "&Uarr;": "\u219F",
  "&Uarrocir;": "\u2949",
  "&Ubrcy;": "\u040E",
  "&Ubreve;": "\u016C",
  "&Ucirc": "\xDB",
  "&Ucirc;": "\xDB",
  "&Ucy;": "\u0423",
  "&Udblac;": "\u0170",
  "&Ufr;": "\u{1D518}",
  "&Ugrave": "\xD9",
  "&Ugrave;": "\xD9",
  "&Umacr;": "\u016A",
  "&UnderBar;": "_",
  "&UnderBrace;": "\u23DF",
  "&UnderBracket;": "\u23B5",
  "&UnderParenthesis;": "\u23DD",
  "&Union;": "\u22C3",
  "&UnionPlus;": "\u228E",
  "&Uogon;": "\u0172",
  "&Uopf;": "\u{1D54C}",
  "&UpArrow;": "\u2191",
  "&UpArrowBar;": "\u2912",
  "&UpArrowDownArrow;": "\u21C5",
  "&UpDownArrow;": "\u2195",
  "&UpEquilibrium;": "\u296E",
  "&UpTee;": "\u22A5",
  "&UpTeeArrow;": "\u21A5",
  "&Uparrow;": "\u21D1",
  "&Updownarrow;": "\u21D5",
  "&UpperLeftArrow;": "\u2196",
  "&UpperRightArrow;": "\u2197",
  "&Upsi;": "\u03D2",
  "&Upsilon;": "\u03A5",
  "&Uring;": "\u016E",
  "&Uscr;": "\u{1D4B0}",
  "&Utilde;": "\u0168",
  "&Uuml": "\xDC",
  "&Uuml;": "\xDC",
  "&VDash;": "\u22AB",
  "&Vbar;": "\u2AEB",
  "&Vcy;": "\u0412",
  "&Vdash;": "\u22A9",
  "&Vdashl;": "\u2AE6",
  "&Vee;": "\u22C1",
  "&Verbar;": "\u2016",
  "&Vert;": "\u2016",
  "&VerticalBar;": "\u2223",
  "&VerticalLine;": "|",
  "&VerticalSeparator;": "\u2758",
  "&VerticalTilde;": "\u2240",
  "&VeryThinSpace;": "\u200A",
  "&Vfr;": "\u{1D519}",
  "&Vopf;": "\u{1D54D}",
  "&Vscr;": "\u{1D4B1}",
  "&Vvdash;": "\u22AA",
  "&Wcirc;": "\u0174",
  "&Wedge;": "\u22C0",
  "&Wfr;": "\u{1D51A}",
  "&Wopf;": "\u{1D54E}",
  "&Wscr;": "\u{1D4B2}",
  "&Xfr;": "\u{1D51B}",
  "&Xi;": "\u039E",
  "&Xopf;": "\u{1D54F}",
  "&Xscr;": "\u{1D4B3}",
  "&YAcy;": "\u042F",
  "&YIcy;": "\u0407",
  "&YUcy;": "\u042E",
  "&Yacute": "\xDD",
  "&Yacute;": "\xDD",
  "&Ycirc;": "\u0176",
  "&Ycy;": "\u042B",
  "&Yfr;": "\u{1D51C}",
  "&Yopf;": "\u{1D550}",
  "&Yscr;": "\u{1D4B4}",
  "&Yuml;": "\u0178",
  "&ZHcy;": "\u0416",
  "&Zacute;": "\u0179",
  "&Zcaron;": "\u017D",
  "&Zcy;": "\u0417",
  "&Zdot;": "\u017B",
  "&ZeroWidthSpace;": "\u200B",
  "&Zeta;": "\u0396",
  "&Zfr;": "\u2128",
  "&Zopf;": "\u2124",
  "&Zscr;": "\u{1D4B5}",
  "&aacute": "\xE1",
  "&aacute;": "\xE1",
  "&abreve;": "\u0103",
  "&ac;": "\u223E",
  "&acE;": "\u223E\u0333",
  "&acd;": "\u223F",
  "&acirc": "\xE2",
  "&acirc;": "\xE2",
  "&acute": "\xB4",
  "&acute;": "\xB4",
  "&acy;": "\u0430",
  "&aelig": "\xE6",
  "&aelig;": "\xE6",
  "&af;": "\u2061",
  "&afr;": "\u{1D51E}",
  "&agrave": "\xE0",
  "&agrave;": "\xE0",
  "&alefsym;": "\u2135",
  "&aleph;": "\u2135",
  "&alpha;": "\u03B1",
  "&amacr;": "\u0101",
  "&amalg;": "\u2A3F",
  "&amp": "&",
  "&amp;": "&",
  "&and;": "\u2227",
  "&andand;": "\u2A55",
  "&andd;": "\u2A5C",
  "&andslope;": "\u2A58",
  "&andv;": "\u2A5A",
  "&ang;": "\u2220",
  "&ange;": "\u29A4",
  "&angle;": "\u2220",
  "&angmsd;": "\u2221",
  "&angmsdaa;": "\u29A8",
  "&angmsdab;": "\u29A9",
  "&angmsdac;": "\u29AA",
  "&angmsdad;": "\u29AB",
  "&angmsdae;": "\u29AC",
  "&angmsdaf;": "\u29AD",
  "&angmsdag;": "\u29AE",
  "&angmsdah;": "\u29AF",
  "&angrt;": "\u221F",
  "&angrtvb;": "\u22BE",
  "&angrtvbd;": "\u299D",
  "&angsph;": "\u2222",
  "&angst;": "\xC5",
  "&angzarr;": "\u237C",
  "&aogon;": "\u0105",
  "&aopf;": "\u{1D552}",
  "&ap;": "\u2248",
  "&apE;": "\u2A70",
  "&apacir;": "\u2A6F",
  "&ape;": "\u224A",
  "&apid;": "\u224B",
  "&apos;": "'",
  "&approx;": "\u2248",
  "&approxeq;": "\u224A",
  "&aring": "\xE5",
  "&aring;": "\xE5",
  "&ascr;": "\u{1D4B6}",
  "&ast;": "*",
  "&asymp;": "\u2248",
  "&asympeq;": "\u224D",
  "&atilde": "\xE3",
  "&atilde;": "\xE3",
  "&auml": "\xE4",
  "&auml;": "\xE4",
  "&awconint;": "\u2233",
  "&awint;": "\u2A11",
  "&bNot;": "\u2AED",
  "&backcong;": "\u224C",
  "&backepsilon;": "\u03F6",
  "&backprime;": "\u2035",
  "&backsim;": "\u223D",
  "&backsimeq;": "\u22CD",
  "&barvee;": "\u22BD",
  "&barwed;": "\u2305",
  "&barwedge;": "\u2305",
  "&bbrk;": "\u23B5",
  "&bbrktbrk;": "\u23B6",
  "&bcong;": "\u224C",
  "&bcy;": "\u0431",
  "&bdquo;": "\u201E",
  "&becaus;": "\u2235",
  "&because;": "\u2235",
  "&bemptyv;": "\u29B0",
  "&bepsi;": "\u03F6",
  "&bernou;": "\u212C",
  "&beta;": "\u03B2",
  "&beth;": "\u2136",
  "&between;": "\u226C",
  "&bfr;": "\u{1D51F}",
  "&bigcap;": "\u22C2",
  "&bigcirc;": "\u25EF",
  "&bigcup;": "\u22C3",
  "&bigodot;": "\u2A00",
  "&bigoplus;": "\u2A01",
  "&bigotimes;": "\u2A02",
  "&bigsqcup;": "\u2A06",
  "&bigstar;": "\u2605",
  "&bigtriangledown;": "\u25BD",
  "&bigtriangleup;": "\u25B3",
  "&biguplus;": "\u2A04",
  "&bigvee;": "\u22C1",
  "&bigwedge;": "\u22C0",
  "&bkarow;": "\u290D",
  "&blacklozenge;": "\u29EB",
  "&blacksquare;": "\u25AA",
  "&blacktriangle;": "\u25B4",
  "&blacktriangledown;": "\u25BE",
  "&blacktriangleleft;": "\u25C2",
  "&blacktriangleright;": "\u25B8",
  "&blank;": "\u2423",
  "&blk12;": "\u2592",
  "&blk14;": "\u2591",
  "&blk34;": "\u2593",
  "&block;": "\u2588",
  "&bne;": "=\u20E5",
  "&bnequiv;": "\u2261\u20E5",
  "&bnot;": "\u2310",
  "&bopf;": "\u{1D553}",
  "&bot;": "\u22A5",
  "&bottom;": "\u22A5",
  "&bowtie;": "\u22C8",
  "&boxDL;": "\u2557",
  "&boxDR;": "\u2554",
  "&boxDl;": "\u2556",
  "&boxDr;": "\u2553",
  "&boxH;": "\u2550",
  "&boxHD;": "\u2566",
  "&boxHU;": "\u2569",
  "&boxHd;": "\u2564",
  "&boxHu;": "\u2567",
  "&boxUL;": "\u255D",
  "&boxUR;": "\u255A",
  "&boxUl;": "\u255C",
  "&boxUr;": "\u2559",
  "&boxV;": "\u2551",
  "&boxVH;": "\u256C",
  "&boxVL;": "\u2563",
  "&boxVR;": "\u2560",
  "&boxVh;": "\u256B",
  "&boxVl;": "\u2562",
  "&boxVr;": "\u255F",
  "&boxbox;": "\u29C9",
  "&boxdL;": "\u2555",
  "&boxdR;": "\u2552",
  "&boxdl;": "\u2510",
  "&boxdr;": "\u250C",
  "&boxh;": "\u2500",
  "&boxhD;": "\u2565",
  "&boxhU;": "\u2568",
  "&boxhd;": "\u252C",
  "&boxhu;": "\u2534",
  "&boxminus;": "\u229F",
  "&boxplus;": "\u229E",
  "&boxtimes;": "\u22A0",
  "&boxuL;": "\u255B",
  "&boxuR;": "\u2558",
  "&boxul;": "\u2518",
  "&boxur;": "\u2514",
  "&boxv;": "\u2502",
  "&boxvH;": "\u256A",
  "&boxvL;": "\u2561",
  "&boxvR;": "\u255E",
  "&boxvh;": "\u253C",
  "&boxvl;": "\u2524",
  "&boxvr;": "\u251C",
  "&bprime;": "\u2035",
  "&breve;": "\u02D8",
  "&brvbar": "\xA6",
  "&brvbar;": "\xA6",
  "&bscr;": "\u{1D4B7}",
  "&bsemi;": "\u204F",
  "&bsim;": "\u223D",
  "&bsime;": "\u22CD",
  "&bsol;": "\\",
  "&bsolb;": "\u29C5",
  "&bsolhsub;": "\u27C8",
  "&bull;": "\u2022",
  "&bullet;": "\u2022",
  "&bump;": "\u224E",
  "&bumpE;": "\u2AAE",
  "&bumpe;": "\u224F",
  "&bumpeq;": "\u224F",
  "&cacute;": "\u0107",
  "&cap;": "\u2229",
  "&capand;": "\u2A44",
  "&capbrcup;": "\u2A49",
  "&capcap;": "\u2A4B",
  "&capcup;": "\u2A47",
  "&capdot;": "\u2A40",
  "&caps;": "\u2229\uFE00",
  "&caret;": "\u2041",
  "&caron;": "\u02C7",
  "&ccaps;": "\u2A4D",
  "&ccaron;": "\u010D",
  "&ccedil": "\xE7",
  "&ccedil;": "\xE7",
  "&ccirc;": "\u0109",
  "&ccups;": "\u2A4C",
  "&ccupssm;": "\u2A50",
  "&cdot;": "\u010B",
  "&cedil": "\xB8",
  "&cedil;": "\xB8",
  "&cemptyv;": "\u29B2",
  "&cent": "\xA2",
  "&cent;": "\xA2",
  "&centerdot;": "\xB7",
  "&cfr;": "\u{1D520}",
  "&chcy;": "\u0447",
  "&check;": "\u2713",
  "&checkmark;": "\u2713",
  "&chi;": "\u03C7",
  "&cir;": "\u25CB",
  "&cirE;": "\u29C3",
  "&circ;": "\u02C6",
  "&circeq;": "\u2257",
  "&circlearrowleft;": "\u21BA",
  "&circlearrowright;": "\u21BB",
  "&circledR;": "\xAE",
  "&circledS;": "\u24C8",
  "&circledast;": "\u229B",
  "&circledcirc;": "\u229A",
  "&circleddash;": "\u229D",
  "&cire;": "\u2257",
  "&cirfnint;": "\u2A10",
  "&cirmid;": "\u2AEF",
  "&cirscir;": "\u29C2",
  "&clubs;": "\u2663",
  "&clubsuit;": "\u2663",
  "&colon;": ":",
  "&colone;": "\u2254",
  "&coloneq;": "\u2254",
  "&comma;": ",",
  "&commat;": "@",
  "&comp;": "\u2201",
  "&compfn;": "\u2218",
  "&complement;": "\u2201",
  "&complexes;": "\u2102",
  "&cong;": "\u2245",
  "&congdot;": "\u2A6D",
  "&conint;": "\u222E",
  "&copf;": "\u{1D554}",
  "&coprod;": "\u2210",
  "&copy": "\xA9",
  "&copy;": "\xA9",
  "&copysr;": "\u2117",
  "&crarr;": "\u21B5",
  "&cross;": "\u2717",
  "&cscr;": "\u{1D4B8}",
  "&csub;": "\u2ACF",
  "&csube;": "\u2AD1",
  "&csup;": "\u2AD0",
  "&csupe;": "\u2AD2",
  "&ctdot;": "\u22EF",
  "&cudarrl;": "\u2938",
  "&cudarrr;": "\u2935",
  "&cuepr;": "\u22DE",
  "&cuesc;": "\u22DF",
  "&cularr;": "\u21B6",
  "&cularrp;": "\u293D",
  "&cup;": "\u222A",
  "&cupbrcap;": "\u2A48",
  "&cupcap;": "\u2A46",
  "&cupcup;": "\u2A4A",
  "&cupdot;": "\u228D",
  "&cupor;": "\u2A45",
  "&cups;": "\u222A\uFE00",
  "&curarr;": "\u21B7",
  "&curarrm;": "\u293C",
  "&curlyeqprec;": "\u22DE",
  "&curlyeqsucc;": "\u22DF",
  "&curlyvee;": "\u22CE",
  "&curlywedge;": "\u22CF",
  "&curren": "\xA4",
  "&curren;": "\xA4",
  "&curvearrowleft;": "\u21B6",
  "&curvearrowright;": "\u21B7",
  "&cuvee;": "\u22CE",
  "&cuwed;": "\u22CF",
  "&cwconint;": "\u2232",
  "&cwint;": "\u2231",
  "&cylcty;": "\u232D",
  "&dArr;": "\u21D3",
  "&dHar;": "\u2965",
  "&dagger;": "\u2020",
  "&daleth;": "\u2138",
  "&darr;": "\u2193",
  "&dash;": "\u2010",
  "&dashv;": "\u22A3",
  "&dbkarow;": "\u290F",
  "&dblac;": "\u02DD",
  "&dcaron;": "\u010F",
  "&dcy;": "\u0434",
  "&dd;": "\u2146",
  "&ddagger;": "\u2021",
  "&ddarr;": "\u21CA",
  "&ddotseq;": "\u2A77",
  "&deg": "\xB0",
  "&deg;": "\xB0",
  "&delta;": "\u03B4",
  "&demptyv;": "\u29B1",
  "&dfisht;": "\u297F",
  "&dfr;": "\u{1D521}",
  "&dharl;": "\u21C3",
  "&dharr;": "\u21C2",
  "&diam;": "\u22C4",
  "&diamond;": "\u22C4",
  "&diamondsuit;": "\u2666",
  "&diams;": "\u2666",
  "&die;": "\xA8",
  "&digamma;": "\u03DD",
  "&disin;": "\u22F2",
  "&div;": "\xF7",
  "&divide": "\xF7",
  "&divide;": "\xF7",
  "&divideontimes;": "\u22C7",
  "&divonx;": "\u22C7",
  "&djcy;": "\u0452",
  "&dlcorn;": "\u231E",
  "&dlcrop;": "\u230D",
  "&dollar;": "$",
  "&dopf;": "\u{1D555}",
  "&dot;": "\u02D9",
  "&doteq;": "\u2250",
  "&doteqdot;": "\u2251",
  "&dotminus;": "\u2238",
  "&dotplus;": "\u2214",
  "&dotsquare;": "\u22A1",
  "&doublebarwedge;": "\u2306",
  "&downarrow;": "\u2193",
  "&downdownarrows;": "\u21CA",
  "&downharpoonleft;": "\u21C3",
  "&downharpoonright;": "\u21C2",
  "&drbkarow;": "\u2910",
  "&drcorn;": "\u231F",
  "&drcrop;": "\u230C",
  "&dscr;": "\u{1D4B9}",
  "&dscy;": "\u0455",
  "&dsol;": "\u29F6",
  "&dstrok;": "\u0111",
  "&dtdot;": "\u22F1",
  "&dtri;": "\u25BF",
  "&dtrif;": "\u25BE",
  "&duarr;": "\u21F5",
  "&duhar;": "\u296F",
  "&dwangle;": "\u29A6",
  "&dzcy;": "\u045F",
  "&dzigrarr;": "\u27FF",
  "&eDDot;": "\u2A77",
  "&eDot;": "\u2251",
  "&eacute": "\xE9",
  "&eacute;": "\xE9",
  "&easter;": "\u2A6E",
  "&ecaron;": "\u011B",
  "&ecir;": "\u2256",
  "&ecirc": "\xEA",
  "&ecirc;": "\xEA",
  "&ecolon;": "\u2255",
  "&ecy;": "\u044D",
  "&edot;": "\u0117",
  "&ee;": "\u2147",
  "&efDot;": "\u2252",
  "&efr;": "\u{1D522}",
  "&eg;": "\u2A9A",
  "&egrave": "\xE8",
  "&egrave;": "\xE8",
  "&egs;": "\u2A96",
  "&egsdot;": "\u2A98",
  "&el;": "\u2A99",
  "&elinters;": "\u23E7",
  "&ell;": "\u2113",
  "&els;": "\u2A95",
  "&elsdot;": "\u2A97",
  "&emacr;": "\u0113",
  "&empty;": "\u2205",
  "&emptyset;": "\u2205",
  "&emptyv;": "\u2205",
  "&emsp13;": "\u2004",
  "&emsp14;": "\u2005",
  "&emsp;": "\u2003",
  "&eng;": "\u014B",
  "&ensp;": "\u2002",
  "&eogon;": "\u0119",
  "&eopf;": "\u{1D556}",
  "&epar;": "\u22D5",
  "&eparsl;": "\u29E3",
  "&eplus;": "\u2A71",
  "&epsi;": "\u03B5",
  "&epsilon;": "\u03B5",
  "&epsiv;": "\u03F5",
  "&eqcirc;": "\u2256",
  "&eqcolon;": "\u2255",
  "&eqsim;": "\u2242",
  "&eqslantgtr;": "\u2A96",
  "&eqslantless;": "\u2A95",
  "&equals;": "=",
  "&equest;": "\u225F",
  "&equiv;": "\u2261",
  "&equivDD;": "\u2A78",
  "&eqvparsl;": "\u29E5",
  "&erDot;": "\u2253",
  "&erarr;": "\u2971",
  "&escr;": "\u212F",
  "&esdot;": "\u2250",
  "&esim;": "\u2242",
  "&eta;": "\u03B7",
  "&eth": "\xF0",
  "&eth;": "\xF0",
  "&euml": "\xEB",
  "&euml;": "\xEB",
  "&euro;": "\u20AC",
  "&excl;": "!",
  "&exist;": "\u2203",
  "&expectation;": "\u2130",
  "&exponentiale;": "\u2147",
  "&fallingdotseq;": "\u2252",
  "&fcy;": "\u0444",
  "&female;": "\u2640",
  "&ffilig;": "\uFB03",
  "&fflig;": "\uFB00",
  "&ffllig;": "\uFB04",
  "&ffr;": "\u{1D523}",
  "&filig;": "\uFB01",
  "&fjlig;": "fj",
  "&flat;": "\u266D",
  "&fllig;": "\uFB02",
  "&fltns;": "\u25B1",
  "&fnof;": "\u0192",
  "&fopf;": "\u{1D557}",
  "&forall;": "\u2200",
  "&fork;": "\u22D4",
  "&forkv;": "\u2AD9",
  "&fpartint;": "\u2A0D",
  "&frac12": "\xBD",
  "&frac12;": "\xBD",
  "&frac13;": "\u2153",
  "&frac14": "\xBC",
  "&frac14;": "\xBC",
  "&frac15;": "\u2155",
  "&frac16;": "\u2159",
  "&frac18;": "\u215B",
  "&frac23;": "\u2154",
  "&frac25;": "\u2156",
  "&frac34": "\xBE",
  "&frac34;": "\xBE",
  "&frac35;": "\u2157",
  "&frac38;": "\u215C",
  "&frac45;": "\u2158",
  "&frac56;": "\u215A",
  "&frac58;": "\u215D",
  "&frac78;": "\u215E",
  "&frasl;": "\u2044",
  "&frown;": "\u2322",
  "&fscr;": "\u{1D4BB}",
  "&gE;": "\u2267",
  "&gEl;": "\u2A8C",
  "&gacute;": "\u01F5",
  "&gamma;": "\u03B3",
  "&gammad;": "\u03DD",
  "&gap;": "\u2A86",
  "&gbreve;": "\u011F",
  "&gcirc;": "\u011D",
  "&gcy;": "\u0433",
  "&gdot;": "\u0121",
  "&ge;": "\u2265",
  "&gel;": "\u22DB",
  "&geq;": "\u2265",
  "&geqq;": "\u2267",
  "&geqslant;": "\u2A7E",
  "&ges;": "\u2A7E",
  "&gescc;": "\u2AA9",
  "&gesdot;": "\u2A80",
  "&gesdoto;": "\u2A82",
  "&gesdotol;": "\u2A84",
  "&gesl;": "\u22DB\uFE00",
  "&gesles;": "\u2A94",
  "&gfr;": "\u{1D524}",
  "&gg;": "\u226B",
  "&ggg;": "\u22D9",
  "&gimel;": "\u2137",
  "&gjcy;": "\u0453",
  "&gl;": "\u2277",
  "&glE;": "\u2A92",
  "&gla;": "\u2AA5",
  "&glj;": "\u2AA4",
  "&gnE;": "\u2269",
  "&gnap;": "\u2A8A",
  "&gnapprox;": "\u2A8A",
  "&gne;": "\u2A88",
  "&gneq;": "\u2A88",
  "&gneqq;": "\u2269",
  "&gnsim;": "\u22E7",
  "&gopf;": "\u{1D558}",
  "&grave;": "`",
  "&gscr;": "\u210A",
  "&gsim;": "\u2273",
  "&gsime;": "\u2A8E",
  "&gsiml;": "\u2A90",
  "&gt": ">",
  "&gt;": ">",
  "&gtcc;": "\u2AA7",
  "&gtcir;": "\u2A7A",
  "&gtdot;": "\u22D7",
  "&gtlPar;": "\u2995",
  "&gtquest;": "\u2A7C",
  "&gtrapprox;": "\u2A86",
  "&gtrarr;": "\u2978",
  "&gtrdot;": "\u22D7",
  "&gtreqless;": "\u22DB",
  "&gtreqqless;": "\u2A8C",
  "&gtrless;": "\u2277",
  "&gtrsim;": "\u2273",
  "&gvertneqq;": "\u2269\uFE00",
  "&gvnE;": "\u2269\uFE00",
  "&hArr;": "\u21D4",
  "&hairsp;": "\u200A",
  "&half;": "\xBD",
  "&hamilt;": "\u210B",
  "&hardcy;": "\u044A",
  "&harr;": "\u2194",
  "&harrcir;": "\u2948",
  "&harrw;": "\u21AD",
  "&hbar;": "\u210F",
  "&hcirc;": "\u0125",
  "&hearts;": "\u2665",
  "&heartsuit;": "\u2665",
  "&hellip;": "\u2026",
  "&hercon;": "\u22B9",
  "&hfr;": "\u{1D525}",
  "&hksearow;": "\u2925",
  "&hkswarow;": "\u2926",
  "&hoarr;": "\u21FF",
  "&homtht;": "\u223B",
  "&hookleftarrow;": "\u21A9",
  "&hookrightarrow;": "\u21AA",
  "&hopf;": "\u{1D559}",
  "&horbar;": "\u2015",
  "&hscr;": "\u{1D4BD}",
  "&hslash;": "\u210F",
  "&hstrok;": "\u0127",
  "&hybull;": "\u2043",
  "&hyphen;": "\u2010",
  "&iacute": "\xED",
  "&iacute;": "\xED",
  "&ic;": "\u2063",
  "&icirc": "\xEE",
  "&icirc;": "\xEE",
  "&icy;": "\u0438",
  "&iecy;": "\u0435",
  "&iexcl": "\xA1",
  "&iexcl;": "\xA1",
  "&iff;": "\u21D4",
  "&ifr;": "\u{1D526}",
  "&igrave": "\xEC",
  "&igrave;": "\xEC",
  "&ii;": "\u2148",
  "&iiiint;": "\u2A0C",
  "&iiint;": "\u222D",
  "&iinfin;": "\u29DC",
  "&iiota;": "\u2129",
  "&ijlig;": "\u0133",
  "&imacr;": "\u012B",
  "&image;": "\u2111",
  "&imagline;": "\u2110",
  "&imagpart;": "\u2111",
  "&imath;": "\u0131",
  "&imof;": "\u22B7",
  "&imped;": "\u01B5",
  "&in;": "\u2208",
  "&incare;": "\u2105",
  "&infin;": "\u221E",
  "&infintie;": "\u29DD",
  "&inodot;": "\u0131",
  "&int;": "\u222B",
  "&intcal;": "\u22BA",
  "&integers;": "\u2124",
  "&intercal;": "\u22BA",
  "&intlarhk;": "\u2A17",
  "&intprod;": "\u2A3C",
  "&iocy;": "\u0451",
  "&iogon;": "\u012F",
  "&iopf;": "\u{1D55A}",
  "&iota;": "\u03B9",
  "&iprod;": "\u2A3C",
  "&iquest": "\xBF",
  "&iquest;": "\xBF",
  "&iscr;": "\u{1D4BE}",
  "&isin;": "\u2208",
  "&isinE;": "\u22F9",
  "&isindot;": "\u22F5",
  "&isins;": "\u22F4",
  "&isinsv;": "\u22F3",
  "&isinv;": "\u2208",
  "&it;": "\u2062",
  "&itilde;": "\u0129",
  "&iukcy;": "\u0456",
  "&iuml": "\xEF",
  "&iuml;": "\xEF",
  "&jcirc;": "\u0135",
  "&jcy;": "\u0439",
  "&jfr;": "\u{1D527}",
  "&jmath;": "\u0237",
  "&jopf;": "\u{1D55B}",
  "&jscr;": "\u{1D4BF}",
  "&jsercy;": "\u0458",
  "&jukcy;": "\u0454",
  "&kappa;": "\u03BA",
  "&kappav;": "\u03F0",
  "&kcedil;": "\u0137",
  "&kcy;": "\u043A",
  "&kfr;": "\u{1D528}",
  "&kgreen;": "\u0138",
  "&khcy;": "\u0445",
  "&kjcy;": "\u045C",
  "&kopf;": "\u{1D55C}",
  "&kscr;": "\u{1D4C0}",
  "&lAarr;": "\u21DA",
  "&lArr;": "\u21D0",
  "&lAtail;": "\u291B",
  "&lBarr;": "\u290E",
  "&lE;": "\u2266",
  "&lEg;": "\u2A8B",
  "&lHar;": "\u2962",
  "&lacute;": "\u013A",
  "&laemptyv;": "\u29B4",
  "&lagran;": "\u2112",
  "&lambda;": "\u03BB",
  "&lang;": "\u27E8",
  "&langd;": "\u2991",
  "&langle;": "\u27E8",
  "&lap;": "\u2A85",
  "&laquo": "\xAB",
  "&laquo;": "\xAB",
  "&larr;": "\u2190",
  "&larrb;": "\u21E4",
  "&larrbfs;": "\u291F",
  "&larrfs;": "\u291D",
  "&larrhk;": "\u21A9",
  "&larrlp;": "\u21AB",
  "&larrpl;": "\u2939",
  "&larrsim;": "\u2973",
  "&larrtl;": "\u21A2",
  "&lat;": "\u2AAB",
  "&latail;": "\u2919",
  "&late;": "\u2AAD",
  "&lates;": "\u2AAD\uFE00",
  "&lbarr;": "\u290C",
  "&lbbrk;": "\u2772",
  "&lbrace;": "{",
  "&lbrack;": "[",
  "&lbrke;": "\u298B",
  "&lbrksld;": "\u298F",
  "&lbrkslu;": "\u298D",
  "&lcaron;": "\u013E",
  "&lcedil;": "\u013C",
  "&lceil;": "\u2308",
  "&lcub;": "{",
  "&lcy;": "\u043B",
  "&ldca;": "\u2936",
  "&ldquo;": "\u201C",
  "&ldquor;": "\u201E",
  "&ldrdhar;": "\u2967",
  "&ldrushar;": "\u294B",
  "&ldsh;": "\u21B2",
  "&le;": "\u2264",
  "&leftarrow;": "\u2190",
  "&leftarrowtail;": "\u21A2",
  "&leftharpoondown;": "\u21BD",
  "&leftharpoonup;": "\u21BC",
  "&leftleftarrows;": "\u21C7",
  "&leftrightarrow;": "\u2194",
  "&leftrightarrows;": "\u21C6",
  "&leftrightharpoons;": "\u21CB",
  "&leftrightsquigarrow;": "\u21AD",
  "&leftthreetimes;": "\u22CB",
  "&leg;": "\u22DA",
  "&leq;": "\u2264",
  "&leqq;": "\u2266",
  "&leqslant;": "\u2A7D",
  "&les;": "\u2A7D",
  "&lescc;": "\u2AA8",
  "&lesdot;": "\u2A7F",
  "&lesdoto;": "\u2A81",
  "&lesdotor;": "\u2A83",
  "&lesg;": "\u22DA\uFE00",
  "&lesges;": "\u2A93",
  "&lessapprox;": "\u2A85",
  "&lessdot;": "\u22D6",
  "&lesseqgtr;": "\u22DA",
  "&lesseqqgtr;": "\u2A8B",
  "&lessgtr;": "\u2276",
  "&lesssim;": "\u2272",
  "&lfisht;": "\u297C",
  "&lfloor;": "\u230A",
  "&lfr;": "\u{1D529}",
  "&lg;": "\u2276",
  "&lgE;": "\u2A91",
  "&lhard;": "\u21BD",
  "&lharu;": "\u21BC",
  "&lharul;": "\u296A",
  "&lhblk;": "\u2584",
  "&ljcy;": "\u0459",
  "&ll;": "\u226A",
  "&llarr;": "\u21C7",
  "&llcorner;": "\u231E",
  "&llhard;": "\u296B",
  "&lltri;": "\u25FA",
  "&lmidot;": "\u0140",
  "&lmoust;": "\u23B0",
  "&lmoustache;": "\u23B0",
  "&lnE;": "\u2268",
  "&lnap;": "\u2A89",
  "&lnapprox;": "\u2A89",
  "&lne;": "\u2A87",
  "&lneq;": "\u2A87",
  "&lneqq;": "\u2268",
  "&lnsim;": "\u22E6",
  "&loang;": "\u27EC",
  "&loarr;": "\u21FD",
  "&lobrk;": "\u27E6",
  "&longleftarrow;": "\u27F5",
  "&longleftrightarrow;": "\u27F7",
  "&longmapsto;": "\u27FC",
  "&longrightarrow;": "\u27F6",
  "&looparrowleft;": "\u21AB",
  "&looparrowright;": "\u21AC",
  "&lopar;": "\u2985",
  "&lopf;": "\u{1D55D}",
  "&loplus;": "\u2A2D",
  "&lotimes;": "\u2A34",
  "&lowast;": "\u2217",
  "&lowbar;": "_",
  "&loz;": "\u25CA",
  "&lozenge;": "\u25CA",
  "&lozf;": "\u29EB",
  "&lpar;": "(",
  "&lparlt;": "\u2993",
  "&lrarr;": "\u21C6",
  "&lrcorner;": "\u231F",
  "&lrhar;": "\u21CB",
  "&lrhard;": "\u296D",
  "&lrm;": "\u200E",
  "&lrtri;": "\u22BF",
  "&lsaquo;": "\u2039",
  "&lscr;": "\u{1D4C1}",
  "&lsh;": "\u21B0",
  "&lsim;": "\u2272",
  "&lsime;": "\u2A8D",
  "&lsimg;": "\u2A8F",
  "&lsqb;": "[",
  "&lsquo;": "\u2018",
  "&lsquor;": "\u201A",
  "&lstrok;": "\u0142",
  "&lt": "<",
  "&lt;": "<",
  "&ltcc;": "\u2AA6",
  "&ltcir;": "\u2A79",
  "&ltdot;": "\u22D6",
  "&lthree;": "\u22CB",
  "&ltimes;": "\u22C9",
  "&ltlarr;": "\u2976",
  "&ltquest;": "\u2A7B",
  "&ltrPar;": "\u2996",
  "&ltri;": "\u25C3",
  "&ltrie;": "\u22B4",
  "&ltrif;": "\u25C2",
  "&lurdshar;": "\u294A",
  "&luruhar;": "\u2966",
  "&lvertneqq;": "\u2268\uFE00",
  "&lvnE;": "\u2268\uFE00",
  "&mDDot;": "\u223A",
  "&macr": "\xAF",
  "&macr;": "\xAF",
  "&male;": "\u2642",
  "&malt;": "\u2720",
  "&maltese;": "\u2720",
  "&map;": "\u21A6",
  "&mapsto;": "\u21A6",
  "&mapstodown;": "\u21A7",
  "&mapstoleft;": "\u21A4",
  "&mapstoup;": "\u21A5",
  "&marker;": "\u25AE",
  "&mcomma;": "\u2A29",
  "&mcy;": "\u043C",
  "&mdash;": "\u2014",
  "&measuredangle;": "\u2221",
  "&mfr;": "\u{1D52A}",
  "&mho;": "\u2127",
  "&micro": "\xB5",
  "&micro;": "\xB5",
  "&mid;": "\u2223",
  "&midast;": "*",
  "&midcir;": "\u2AF0",
  "&middot": "\xB7",
  "&middot;": "\xB7",
  "&minus;": "\u2212",
  "&minusb;": "\u229F",
  "&minusd;": "\u2238",
  "&minusdu;": "\u2A2A",
  "&mlcp;": "\u2ADB",
  "&mldr;": "\u2026",
  "&mnplus;": "\u2213",
  "&models;": "\u22A7",
  "&mopf;": "\u{1D55E}",
  "&mp;": "\u2213",
  "&mscr;": "\u{1D4C2}",
  "&mstpos;": "\u223E",
  "&mu;": "\u03BC",
  "&multimap;": "\u22B8",
  "&mumap;": "\u22B8",
  "&nGg;": "\u22D9\u0338",
  "&nGt;": "\u226B\u20D2",
  "&nGtv;": "\u226B\u0338",
  "&nLeftarrow;": "\u21CD",
  "&nLeftrightarrow;": "\u21CE",
  "&nLl;": "\u22D8\u0338",
  "&nLt;": "\u226A\u20D2",
  "&nLtv;": "\u226A\u0338",
  "&nRightarrow;": "\u21CF",
  "&nVDash;": "\u22AF",
  "&nVdash;": "\u22AE",
  "&nabla;": "\u2207",
  "&nacute;": "\u0144",
  "&nang;": "\u2220\u20D2",
  "&nap;": "\u2249",
  "&napE;": "\u2A70\u0338",
  "&napid;": "\u224B\u0338",
  "&napos;": "\u0149",
  "&napprox;": "\u2249",
  "&natur;": "\u266E",
  "&natural;": "\u266E",
  "&naturals;": "\u2115",
  "&nbsp": "\xA0",
  "&nbsp;": "\xA0",
  "&nbump;": "\u224E\u0338",
  "&nbumpe;": "\u224F\u0338",
  "&ncap;": "\u2A43",
  "&ncaron;": "\u0148",
  "&ncedil;": "\u0146",
  "&ncong;": "\u2247",
  "&ncongdot;": "\u2A6D\u0338",
  "&ncup;": "\u2A42",
  "&ncy;": "\u043D",
  "&ndash;": "\u2013",
  "&ne;": "\u2260",
  "&neArr;": "\u21D7",
  "&nearhk;": "\u2924",
  "&nearr;": "\u2197",
  "&nearrow;": "\u2197",
  "&nedot;": "\u2250\u0338",
  "&nequiv;": "\u2262",
  "&nesear;": "\u2928",
  "&nesim;": "\u2242\u0338",
  "&nexist;": "\u2204",
  "&nexists;": "\u2204",
  "&nfr;": "\u{1D52B}",
  "&ngE;": "\u2267\u0338",
  "&nge;": "\u2271",
  "&ngeq;": "\u2271",
  "&ngeqq;": "\u2267\u0338",
  "&ngeqslant;": "\u2A7E\u0338",
  "&nges;": "\u2A7E\u0338",
  "&ngsim;": "\u2275",
  "&ngt;": "\u226F",
  "&ngtr;": "\u226F",
  "&nhArr;": "\u21CE",
  "&nharr;": "\u21AE",
  "&nhpar;": "\u2AF2",
  "&ni;": "\u220B",
  "&nis;": "\u22FC",
  "&nisd;": "\u22FA",
  "&niv;": "\u220B",
  "&njcy;": "\u045A",
  "&nlArr;": "\u21CD",
  "&nlE;": "\u2266\u0338",
  "&nlarr;": "\u219A",
  "&nldr;": "\u2025",
  "&nle;": "\u2270",
  "&nleftarrow;": "\u219A",
  "&nleftrightarrow;": "\u21AE",
  "&nleq;": "\u2270",
  "&nleqq;": "\u2266\u0338",
  "&nleqslant;": "\u2A7D\u0338",
  "&nles;": "\u2A7D\u0338",
  "&nless;": "\u226E",
  "&nlsim;": "\u2274",
  "&nlt;": "\u226E",
  "&nltri;": "\u22EA",
  "&nltrie;": "\u22EC",
  "&nmid;": "\u2224",
  "&nopf;": "\u{1D55F}",
  "&not": "\xAC",
  "&not;": "\xAC",
  "&notin;": "\u2209",
  "&notinE;": "\u22F9\u0338",
  "&notindot;": "\u22F5\u0338",
  "&notinva;": "\u2209",
  "&notinvb;": "\u22F7",
  "&notinvc;": "\u22F6",
  "&notni;": "\u220C",
  "&notniva;": "\u220C",
  "&notnivb;": "\u22FE",
  "&notnivc;": "\u22FD",
  "&npar;": "\u2226",
  "&nparallel;": "\u2226",
  "&nparsl;": "\u2AFD\u20E5",
  "&npart;": "\u2202\u0338",
  "&npolint;": "\u2A14",
  "&npr;": "\u2280",
  "&nprcue;": "\u22E0",
  "&npre;": "\u2AAF\u0338",
  "&nprec;": "\u2280",
  "&npreceq;": "\u2AAF\u0338",
  "&nrArr;": "\u21CF",
  "&nrarr;": "\u219B",
  "&nrarrc;": "\u2933\u0338",
  "&nrarrw;": "\u219D\u0338",
  "&nrightarrow;": "\u219B",
  "&nrtri;": "\u22EB",
  "&nrtrie;": "\u22ED",
  "&nsc;": "\u2281",
  "&nsccue;": "\u22E1",
  "&nsce;": "\u2AB0\u0338",
  "&nscr;": "\u{1D4C3}",
  "&nshortmid;": "\u2224",
  "&nshortparallel;": "\u2226",
  "&nsim;": "\u2241",
  "&nsime;": "\u2244",
  "&nsimeq;": "\u2244",
  "&nsmid;": "\u2224",
  "&nspar;": "\u2226",
  "&nsqsube;": "\u22E2",
  "&nsqsupe;": "\u22E3",
  "&nsub;": "\u2284",
  "&nsubE;": "\u2AC5\u0338",
  "&nsube;": "\u2288",
  "&nsubset;": "\u2282\u20D2",
  "&nsubseteq;": "\u2288",
  "&nsubseteqq;": "\u2AC5\u0338",
  "&nsucc;": "\u2281",
  "&nsucceq;": "\u2AB0\u0338",
  "&nsup;": "\u2285",
  "&nsupE;": "\u2AC6\u0338",
  "&nsupe;": "\u2289",
  "&nsupset;": "\u2283\u20D2",
  "&nsupseteq;": "\u2289",
  "&nsupseteqq;": "\u2AC6\u0338",
  "&ntgl;": "\u2279",
  "&ntilde": "\xF1",
  "&ntilde;": "\xF1",
  "&ntlg;": "\u2278",
  "&ntriangleleft;": "\u22EA",
  "&ntrianglelefteq;": "\u22EC",
  "&ntriangleright;": "\u22EB",
  "&ntrianglerighteq;": "\u22ED",
  "&nu;": "\u03BD",
  "&num;": "#",
  "&numero;": "\u2116",
  "&numsp;": "\u2007",
  "&nvDash;": "\u22AD",
  "&nvHarr;": "\u2904",
  "&nvap;": "\u224D\u20D2",
  "&nvdash;": "\u22AC",
  "&nvge;": "\u2265\u20D2",
  "&nvgt;": ">\u20D2",
  "&nvinfin;": "\u29DE",
  "&nvlArr;": "\u2902",
  "&nvle;": "\u2264\u20D2",
  "&nvlt;": "<\u20D2",
  "&nvltrie;": "\u22B4\u20D2",
  "&nvrArr;": "\u2903",
  "&nvrtrie;": "\u22B5\u20D2",
  "&nvsim;": "\u223C\u20D2",
  "&nwArr;": "\u21D6",
  "&nwarhk;": "\u2923",
  "&nwarr;": "\u2196",
  "&nwarrow;": "\u2196",
  "&nwnear;": "\u2927",
  "&oS;": "\u24C8",
  "&oacute": "\xF3",
  "&oacute;": "\xF3",
  "&oast;": "\u229B",
  "&ocir;": "\u229A",
  "&ocirc": "\xF4",
  "&ocirc;": "\xF4",
  "&ocy;": "\u043E",
  "&odash;": "\u229D",
  "&odblac;": "\u0151",
  "&odiv;": "\u2A38",
  "&odot;": "\u2299",
  "&odsold;": "\u29BC",
  "&oelig;": "\u0153",
  "&ofcir;": "\u29BF",
  "&ofr;": "\u{1D52C}",
  "&ogon;": "\u02DB",
  "&ograve": "\xF2",
  "&ograve;": "\xF2",
  "&ogt;": "\u29C1",
  "&ohbar;": "\u29B5",
  "&ohm;": "\u03A9",
  "&oint;": "\u222E",
  "&olarr;": "\u21BA",
  "&olcir;": "\u29BE",
  "&olcross;": "\u29BB",
  "&oline;": "\u203E",
  "&olt;": "\u29C0",
  "&omacr;": "\u014D",
  "&omega;": "\u03C9",
  "&omicron;": "\u03BF",
  "&omid;": "\u29B6",
  "&ominus;": "\u2296",
  "&oopf;": "\u{1D560}",
  "&opar;": "\u29B7",
  "&operp;": "\u29B9",
  "&oplus;": "\u2295",
  "&or;": "\u2228",
  "&orarr;": "\u21BB",
  "&ord;": "\u2A5D",
  "&order;": "\u2134",
  "&orderof;": "\u2134",
  "&ordf": "\xAA",
  "&ordf;": "\xAA",
  "&ordm": "\xBA",
  "&ordm;": "\xBA",
  "&origof;": "\u22B6",
  "&oror;": "\u2A56",
  "&orslope;": "\u2A57",
  "&orv;": "\u2A5B",
  "&oscr;": "\u2134",
  "&oslash": "\xF8",
  "&oslash;": "\xF8",
  "&osol;": "\u2298",
  "&otilde": "\xF5",
  "&otilde;": "\xF5",
  "&otimes;": "\u2297",
  "&otimesas;": "\u2A36",
  "&ouml": "\xF6",
  "&ouml;": "\xF6",
  "&ovbar;": "\u233D",
  "&par;": "\u2225",
  "&para": "\xB6",
  "&para;": "\xB6",
  "&parallel;": "\u2225",
  "&parsim;": "\u2AF3",
  "&parsl;": "\u2AFD",
  "&part;": "\u2202",
  "&pcy;": "\u043F",
  "&percnt;": "%",
  "&period;": ".",
  "&permil;": "\u2030",
  "&perp;": "\u22A5",
  "&pertenk;": "\u2031",
  "&pfr;": "\u{1D52D}",
  "&phi;": "\u03C6",
  "&phiv;": "\u03D5",
  "&phmmat;": "\u2133",
  "&phone;": "\u260E",
  "&pi;": "\u03C0",
  "&pitchfork;": "\u22D4",
  "&piv;": "\u03D6",
  "&planck;": "\u210F",
  "&planckh;": "\u210E",
  "&plankv;": "\u210F",
  "&plus;": "+",
  "&plusacir;": "\u2A23",
  "&plusb;": "\u229E",
  "&pluscir;": "\u2A22",
  "&plusdo;": "\u2214",
  "&plusdu;": "\u2A25",
  "&pluse;": "\u2A72",
  "&plusmn": "\xB1",
  "&plusmn;": "\xB1",
  "&plussim;": "\u2A26",
  "&plustwo;": "\u2A27",
  "&pm;": "\xB1",
  "&pointint;": "\u2A15",
  "&popf;": "\u{1D561}",
  "&pound": "\xA3",
  "&pound;": "\xA3",
  "&pr;": "\u227A",
  "&prE;": "\u2AB3",
  "&prap;": "\u2AB7",
  "&prcue;": "\u227C",
  "&pre;": "\u2AAF",
  "&prec;": "\u227A",
  "&precapprox;": "\u2AB7",
  "&preccurlyeq;": "\u227C",
  "&preceq;": "\u2AAF",
  "&precnapprox;": "\u2AB9",
  "&precneqq;": "\u2AB5",
  "&precnsim;": "\u22E8",
  "&precsim;": "\u227E",
  "&prime;": "\u2032",
  "&primes;": "\u2119",
  "&prnE;": "\u2AB5",
  "&prnap;": "\u2AB9",
  "&prnsim;": "\u22E8",
  "&prod;": "\u220F",
  "&profalar;": "\u232E",
  "&profline;": "\u2312",
  "&profsurf;": "\u2313",
  "&prop;": "\u221D",
  "&propto;": "\u221D",
  "&prsim;": "\u227E",
  "&prurel;": "\u22B0",
  "&pscr;": "\u{1D4C5}",
  "&psi;": "\u03C8",
  "&puncsp;": "\u2008",
  "&qfr;": "\u{1D52E}",
  "&qint;": "\u2A0C",
  "&qopf;": "\u{1D562}",
  "&qprime;": "\u2057",
  "&qscr;": "\u{1D4C6}",
  "&quaternions;": "\u210D",
  "&quatint;": "\u2A16",
  "&quest;": "?",
  "&questeq;": "\u225F",
  "&quot": '"',
  "&quot;": '"',
  "&rAarr;": "\u21DB",
  "&rArr;": "\u21D2",
  "&rAtail;": "\u291C",
  "&rBarr;": "\u290F",
  "&rHar;": "\u2964",
  "&race;": "\u223D\u0331",
  "&racute;": "\u0155",
  "&radic;": "\u221A",
  "&raemptyv;": "\u29B3",
  "&rang;": "\u27E9",
  "&rangd;": "\u2992",
  "&range;": "\u29A5",
  "&rangle;": "\u27E9",
  "&raquo": "\xBB",
  "&raquo;": "\xBB",
  "&rarr;": "\u2192",
  "&rarrap;": "\u2975",
  "&rarrb;": "\u21E5",
  "&rarrbfs;": "\u2920",
  "&rarrc;": "\u2933",
  "&rarrfs;": "\u291E",
  "&rarrhk;": "\u21AA",
  "&rarrlp;": "\u21AC",
  "&rarrpl;": "\u2945",
  "&rarrsim;": "\u2974",
  "&rarrtl;": "\u21A3",
  "&rarrw;": "\u219D",
  "&ratail;": "\u291A",
  "&ratio;": "\u2236",
  "&rationals;": "\u211A",
  "&rbarr;": "\u290D",
  "&rbbrk;": "\u2773",
  "&rbrace;": "}",
  "&rbrack;": "]",
  "&rbrke;": "\u298C",
  "&rbrksld;": "\u298E",
  "&rbrkslu;": "\u2990",
  "&rcaron;": "\u0159",
  "&rcedil;": "\u0157",
  "&rceil;": "\u2309",
  "&rcub;": "}",
  "&rcy;": "\u0440",
  "&rdca;": "\u2937",
  "&rdldhar;": "\u2969",
  "&rdquo;": "\u201D",
  "&rdquor;": "\u201D",
  "&rdsh;": "\u21B3",
  "&real;": "\u211C",
  "&realine;": "\u211B",
  "&realpart;": "\u211C",
  "&reals;": "\u211D",
  "&rect;": "\u25AD",
  "&reg": "\xAE",
  "&reg;": "\xAE",
  "&rfisht;": "\u297D",
  "&rfloor;": "\u230B",
  "&rfr;": "\u{1D52F}",
  "&rhard;": "\u21C1",
  "&rharu;": "\u21C0",
  "&rharul;": "\u296C",
  "&rho;": "\u03C1",
  "&rhov;": "\u03F1",
  "&rightarrow;": "\u2192",
  "&rightarrowtail;": "\u21A3",
  "&rightharpoondown;": "\u21C1",
  "&rightharpoonup;": "\u21C0",
  "&rightleftarrows;": "\u21C4",
  "&rightleftharpoons;": "\u21CC",
  "&rightrightarrows;": "\u21C9",
  "&rightsquigarrow;": "\u219D",
  "&rightthreetimes;": "\u22CC",
  "&ring;": "\u02DA",
  "&risingdotseq;": "\u2253",
  "&rlarr;": "\u21C4",
  "&rlhar;": "\u21CC",
  "&rlm;": "\u200F",
  "&rmoust;": "\u23B1",
  "&rmoustache;": "\u23B1",
  "&rnmid;": "\u2AEE",
  "&roang;": "\u27ED",
  "&roarr;": "\u21FE",
  "&robrk;": "\u27E7",
  "&ropar;": "\u2986",
  "&ropf;": "\u{1D563}",
  "&roplus;": "\u2A2E",
  "&rotimes;": "\u2A35",
  "&rpar;": ")",
  "&rpargt;": "\u2994",
  "&rppolint;": "\u2A12",
  "&rrarr;": "\u21C9",
  "&rsaquo;": "\u203A",
  "&rscr;": "\u{1D4C7}",
  "&rsh;": "\u21B1",
  "&rsqb;": "]",
  "&rsquo;": "\u2019",
  "&rsquor;": "\u2019",
  "&rthree;": "\u22CC",
  "&rtimes;": "\u22CA",
  "&rtri;": "\u25B9",
  "&rtrie;": "\u22B5",
  "&rtrif;": "\u25B8",
  "&rtriltri;": "\u29CE",
  "&ruluhar;": "\u2968",
  "&rx;": "\u211E",
  "&sacute;": "\u015B",
  "&sbquo;": "\u201A",
  "&sc;": "\u227B",
  "&scE;": "\u2AB4",
  "&scap;": "\u2AB8",
  "&scaron;": "\u0161",
  "&sccue;": "\u227D",
  "&sce;": "\u2AB0",
  "&scedil;": "\u015F",
  "&scirc;": "\u015D",
  "&scnE;": "\u2AB6",
  "&scnap;": "\u2ABA",
  "&scnsim;": "\u22E9",
  "&scpolint;": "\u2A13",
  "&scsim;": "\u227F",
  "&scy;": "\u0441",
  "&sdot;": "\u22C5",
  "&sdotb;": "\u22A1",
  "&sdote;": "\u2A66",
  "&seArr;": "\u21D8",
  "&searhk;": "\u2925",
  "&searr;": "\u2198",
  "&searrow;": "\u2198",
  "&sect": "\xA7",
  "&sect;": "\xA7",
  "&semi;": ";",
  "&seswar;": "\u2929",
  "&setminus;": "\u2216",
  "&setmn;": "\u2216",
  "&sext;": "\u2736",
  "&sfr;": "\u{1D530}",
  "&sfrown;": "\u2322",
  "&sharp;": "\u266F",
  "&shchcy;": "\u0449",
  "&shcy;": "\u0448",
  "&shortmid;": "\u2223",
  "&shortparallel;": "\u2225",
  "&shy": "\xAD",
  "&shy;": "\xAD",
  "&sigma;": "\u03C3",
  "&sigmaf;": "\u03C2",
  "&sigmav;": "\u03C2",
  "&sim;": "\u223C",
  "&simdot;": "\u2A6A",
  "&sime;": "\u2243",
  "&simeq;": "\u2243",
  "&simg;": "\u2A9E",
  "&simgE;": "\u2AA0",
  "&siml;": "\u2A9D",
  "&simlE;": "\u2A9F",
  "&simne;": "\u2246",
  "&simplus;": "\u2A24",
  "&simrarr;": "\u2972",
  "&slarr;": "\u2190",
  "&smallsetminus;": "\u2216",
  "&smashp;": "\u2A33",
  "&smeparsl;": "\u29E4",
  "&smid;": "\u2223",
  "&smile;": "\u2323",
  "&smt;": "\u2AAA",
  "&smte;": "\u2AAC",
  "&smtes;": "\u2AAC\uFE00",
  "&softcy;": "\u044C",
  "&sol;": "/",
  "&solb;": "\u29C4",
  "&solbar;": "\u233F",
  "&sopf;": "\u{1D564}",
  "&spades;": "\u2660",
  "&spadesuit;": "\u2660",
  "&spar;": "\u2225",
  "&sqcap;": "\u2293",
  "&sqcaps;": "\u2293\uFE00",
  "&sqcup;": "\u2294",
  "&sqcups;": "\u2294\uFE00",
  "&sqsub;": "\u228F",
  "&sqsube;": "\u2291",
  "&sqsubset;": "\u228F",
  "&sqsubseteq;": "\u2291",
  "&sqsup;": "\u2290",
  "&sqsupe;": "\u2292",
  "&sqsupset;": "\u2290",
  "&sqsupseteq;": "\u2292",
  "&squ;": "\u25A1",
  "&square;": "\u25A1",
  "&squarf;": "\u25AA",
  "&squf;": "\u25AA",
  "&srarr;": "\u2192",
  "&sscr;": "\u{1D4C8}",
  "&ssetmn;": "\u2216",
  "&ssmile;": "\u2323",
  "&sstarf;": "\u22C6",
  "&star;": "\u2606",
  "&starf;": "\u2605",
  "&straightepsilon;": "\u03F5",
  "&straightphi;": "\u03D5",
  "&strns;": "\xAF",
  "&sub;": "\u2282",
  "&subE;": "\u2AC5",
  "&subdot;": "\u2ABD",
  "&sube;": "\u2286",
  "&subedot;": "\u2AC3",
  "&submult;": "\u2AC1",
  "&subnE;": "\u2ACB",
  "&subne;": "\u228A",
  "&subplus;": "\u2ABF",
  "&subrarr;": "\u2979",
  "&subset;": "\u2282",
  "&subseteq;": "\u2286",
  "&subseteqq;": "\u2AC5",
  "&subsetneq;": "\u228A",
  "&subsetneqq;": "\u2ACB",
  "&subsim;": "\u2AC7",
  "&subsub;": "\u2AD5",
  "&subsup;": "\u2AD3",
  "&succ;": "\u227B",
  "&succapprox;": "\u2AB8",
  "&succcurlyeq;": "\u227D",
  "&succeq;": "\u2AB0",
  "&succnapprox;": "\u2ABA",
  "&succneqq;": "\u2AB6",
  "&succnsim;": "\u22E9",
  "&succsim;": "\u227F",
  "&sum;": "\u2211",
  "&sung;": "\u266A",
  "&sup1": "\xB9",
  "&sup1;": "\xB9",
  "&sup2": "\xB2",
  "&sup2;": "\xB2",
  "&sup3": "\xB3",
  "&sup3;": "\xB3",
  "&sup;": "\u2283",
  "&supE;": "\u2AC6",
  "&supdot;": "\u2ABE",
  "&supdsub;": "\u2AD8",
  "&supe;": "\u2287",
  "&supedot;": "\u2AC4",
  "&suphsol;": "\u27C9",
  "&suphsub;": "\u2AD7",
  "&suplarr;": "\u297B",
  "&supmult;": "\u2AC2",
  "&supnE;": "\u2ACC",
  "&supne;": "\u228B",
  "&supplus;": "\u2AC0",
  "&supset;": "\u2283",
  "&supseteq;": "\u2287",
  "&supseteqq;": "\u2AC6",
  "&supsetneq;": "\u228B",
  "&supsetneqq;": "\u2ACC",
  "&supsim;": "\u2AC8",
  "&supsub;": "\u2AD4",
  "&supsup;": "\u2AD6",
  "&swArr;": "\u21D9",
  "&swarhk;": "\u2926",
  "&swarr;": "\u2199",
  "&swarrow;": "\u2199",
  "&swnwar;": "\u292A",
  "&szlig": "\xDF",
  "&szlig;": "\xDF",
  "&target;": "\u2316",
  "&tau;": "\u03C4",
  "&tbrk;": "\u23B4",
  "&tcaron;": "\u0165",
  "&tcedil;": "\u0163",
  "&tcy;": "\u0442",
  "&tdot;": "\u20DB",
  "&telrec;": "\u2315",
  "&tfr;": "\u{1D531}",
  "&there4;": "\u2234",
  "&therefore;": "\u2234",
  "&theta;": "\u03B8",
  "&thetasym;": "\u03D1",
  "&thetav;": "\u03D1",
  "&thickapprox;": "\u2248",
  "&thicksim;": "\u223C",
  "&thinsp;": "\u2009",
  "&thkap;": "\u2248",
  "&thksim;": "\u223C",
  "&thorn": "\xFE",
  "&thorn;": "\xFE",
  "&tilde;": "\u02DC",
  "&times": "\xD7",
  "&times;": "\xD7",
  "&timesb;": "\u22A0",
  "&timesbar;": "\u2A31",
  "&timesd;": "\u2A30",
  "&tint;": "\u222D",
  "&toea;": "\u2928",
  "&top;": "\u22A4",
  "&topbot;": "\u2336",
  "&topcir;": "\u2AF1",
  "&topf;": "\u{1D565}",
  "&topfork;": "\u2ADA",
  "&tosa;": "\u2929",
  "&tprime;": "\u2034",
  "&trade;": "\u2122",
  "&triangle;": "\u25B5",
  "&triangledown;": "\u25BF",
  "&triangleleft;": "\u25C3",
  "&trianglelefteq;": "\u22B4",
  "&triangleq;": "\u225C",
  "&triangleright;": "\u25B9",
  "&trianglerighteq;": "\u22B5",
  "&tridot;": "\u25EC",
  "&trie;": "\u225C",
  "&triminus;": "\u2A3A",
  "&triplus;": "\u2A39",
  "&trisb;": "\u29CD",
  "&tritime;": "\u2A3B",
  "&trpezium;": "\u23E2",
  "&tscr;": "\u{1D4C9}",
  "&tscy;": "\u0446",
  "&tshcy;": "\u045B",
  "&tstrok;": "\u0167",
  "&twixt;": "\u226C",
  "&twoheadleftarrow;": "\u219E",
  "&twoheadrightarrow;": "\u21A0",
  "&uArr;": "\u21D1",
  "&uHar;": "\u2963",
  "&uacute": "\xFA",
  "&uacute;": "\xFA",
  "&uarr;": "\u2191",
  "&ubrcy;": "\u045E",
  "&ubreve;": "\u016D",
  "&ucirc": "\xFB",
  "&ucirc;": "\xFB",
  "&ucy;": "\u0443",
  "&udarr;": "\u21C5",
  "&udblac;": "\u0171",
  "&udhar;": "\u296E",
  "&ufisht;": "\u297E",
  "&ufr;": "\u{1D532}",
  "&ugrave": "\xF9",
  "&ugrave;": "\xF9",
  "&uharl;": "\u21BF",
  "&uharr;": "\u21BE",
  "&uhblk;": "\u2580",
  "&ulcorn;": "\u231C",
  "&ulcorner;": "\u231C",
  "&ulcrop;": "\u230F",
  "&ultri;": "\u25F8",
  "&umacr;": "\u016B",
  "&uml": "\xA8",
  "&uml;": "\xA8",
  "&uogon;": "\u0173",
  "&uopf;": "\u{1D566}",
  "&uparrow;": "\u2191",
  "&updownarrow;": "\u2195",
  "&upharpoonleft;": "\u21BF",
  "&upharpoonright;": "\u21BE",
  "&uplus;": "\u228E",
  "&upsi;": "\u03C5",
  "&upsih;": "\u03D2",
  "&upsilon;": "\u03C5",
  "&upuparrows;": "\u21C8",
  "&urcorn;": "\u231D",
  "&urcorner;": "\u231D",
  "&urcrop;": "\u230E",
  "&uring;": "\u016F",
  "&urtri;": "\u25F9",
  "&uscr;": "\u{1D4CA}",
  "&utdot;": "\u22F0",
  "&utilde;": "\u0169",
  "&utri;": "\u25B5",
  "&utrif;": "\u25B4",
  "&uuarr;": "\u21C8",
  "&uuml": "\xFC",
  "&uuml;": "\xFC",
  "&uwangle;": "\u29A7",
  "&vArr;": "\u21D5",
  "&vBar;": "\u2AE8",
  "&vBarv;": "\u2AE9",
  "&vDash;": "\u22A8",
  "&vangrt;": "\u299C",
  "&varepsilon;": "\u03F5",
  "&varkappa;": "\u03F0",
  "&varnothing;": "\u2205",
  "&varphi;": "\u03D5",
  "&varpi;": "\u03D6",
  "&varpropto;": "\u221D",
  "&varr;": "\u2195",
  "&varrho;": "\u03F1",
  "&varsigma;": "\u03C2",
  "&varsubsetneq;": "\u228A\uFE00",
  "&varsubsetneqq;": "\u2ACB\uFE00",
  "&varsupsetneq;": "\u228B\uFE00",
  "&varsupsetneqq;": "\u2ACC\uFE00",
  "&vartheta;": "\u03D1",
  "&vartriangleleft;": "\u22B2",
  "&vartriangleright;": "\u22B3",
  "&vcy;": "\u0432",
  "&vdash;": "\u22A2",
  "&vee;": "\u2228",
  "&veebar;": "\u22BB",
  "&veeeq;": "\u225A",
  "&vellip;": "\u22EE",
  "&verbar;": "|",
  "&vert;": "|",
  "&vfr;": "\u{1D533}",
  "&vltri;": "\u22B2",
  "&vnsub;": "\u2282\u20D2",
  "&vnsup;": "\u2283\u20D2",
  "&vopf;": "\u{1D567}",
  "&vprop;": "\u221D",
  "&vrtri;": "\u22B3",
  "&vscr;": "\u{1D4CB}",
  "&vsubnE;": "\u2ACB\uFE00",
  "&vsubne;": "\u228A\uFE00",
  "&vsupnE;": "\u2ACC\uFE00",
  "&vsupne;": "\u228B\uFE00",
  "&vzigzag;": "\u299A",
  "&wcirc;": "\u0175",
  "&wedbar;": "\u2A5F",
  "&wedge;": "\u2227",
  "&wedgeq;": "\u2259",
  "&weierp;": "\u2118",
  "&wfr;": "\u{1D534}",
  "&wopf;": "\u{1D568}",
  "&wp;": "\u2118",
  "&wr;": "\u2240",
  "&wreath;": "\u2240",
  "&wscr;": "\u{1D4CC}",
  "&xcap;": "\u22C2",
  "&xcirc;": "\u25EF",
  "&xcup;": "\u22C3",
  "&xdtri;": "\u25BD",
  "&xfr;": "\u{1D535}",
  "&xhArr;": "\u27FA",
  "&xharr;": "\u27F7",
  "&xi;": "\u03BE",
  "&xlArr;": "\u27F8",
  "&xlarr;": "\u27F5",
  "&xmap;": "\u27FC",
  "&xnis;": "\u22FB",
  "&xodot;": "\u2A00",
  "&xopf;": "\u{1D569}",
  "&xoplus;": "\u2A01",
  "&xotime;": "\u2A02",
  "&xrArr;": "\u27F9",
  "&xrarr;": "\u27F6",
  "&xscr;": "\u{1D4CD}",
  "&xsqcup;": "\u2A06",
  "&xuplus;": "\u2A04",
  "&xutri;": "\u25B3",
  "&xvee;": "\u22C1",
  "&xwedge;": "\u22C0",
  "&yacute": "\xFD",
  "&yacute;": "\xFD",
  "&yacy;": "\u044F",
  "&ycirc;": "\u0177",
  "&ycy;": "\u044B",
  "&yen": "\xA5",
  "&yen;": "\xA5",
  "&yfr;": "\u{1D536}",
  "&yicy;": "\u0457",
  "&yopf;": "\u{1D56A}",
  "&yscr;": "\u{1D4CE}",
  "&yucy;": "\u044E",
  "&yuml": "\xFF",
  "&yuml;": "\xFF",
  "&zacute;": "\u017A",
  "&zcaron;": "\u017E",
  "&zcy;": "\u0437",
  "&zdot;": "\u017C",
  "&zeetrf;": "\u2128",
  "&zeta;": "\u03B6",
  "&zfr;": "\u{1D537}",
  "&zhcy;": "\u0436",
  "&zigrarr;": "\u21DD",
  "&zopf;": "\u{1D56B}",
  "&zscr;": "\u{1D4CF}",
  "&zwj;": "\u200D",
  "&zwnj;": "\u200C"
};
var html_entities_default = htmlEntities;

// node_modules/postal-mime/src/text-format.js
function decodeHTMLEntities(str) {
  return str.replace(/&(#\d+|#x[a-f0-9]+|[a-z]+\d*);?/gi, (match, entity) => {
    if (typeof html_entities_default[match] === "string") {
      return html_entities_default[match];
    }
    if (entity.charAt(0) !== "#" || match.charAt(match.length - 1) !== ";") {
      return match;
    }
    let codePoint;
    if (entity.charAt(1) === "x") {
      codePoint = parseInt(entity.substr(2), 16);
    } else {
      codePoint = parseInt(entity.substr(1), 10);
    }
    let output = "";
    if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
      return "\uFFFD";
    }
    if (codePoint > 65535) {
      codePoint -= 65536;
      output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    output += String.fromCharCode(codePoint);
    return output;
  });
}
function escapeHtml(str) {
  return str.trim().replace(/[<>"'?&]/g, (c) => {
    let hex = c.charCodeAt(0).toString(16);
    if (hex.length < 2) {
      hex = "0" + hex;
    }
    return "&#x" + hex.toUpperCase() + ";";
  });
}
function textToHtml(str) {
  let html = escapeHtml(str).replace(/\n/g, "<br />");
  return "<div>" + html + "</div>";
}
function htmlToText(str) {
  str = str.replace(/\r?\n/g, "").replace(/<\!\-\-.*?\-\->/gi, " ").replace(/<br\b[^>]*>/gi, "\n").replace(/<\/?(p|div|table|tr|td|th)\b[^>]*>/gi, "\n\n").replace(/<script\b[^>]*>.*?<\/script\b[^>]*>/gi, " ").replace(/^.*<body\b[^>]*>/i, "").replace(/^.*<\/head\b[^>]*>/i, "").replace(/^.*<\!doctype\b[^>]*>/i, "").replace(/<\/body\b[^>]*>.*$/i, "").replace(/<\/html\b[^>]*>.*$/i, "").replace(/<a\b[^>]*href\s*=\s*["']?([^\s"']+)[^>]*>/gi, " ($1) ").replace(/<\/?(span|em|i|strong|b|u|a)\b[^>]*>/gi, "").replace(/<li\b[^>]*>[\n\u0001\s]*/gi, "* ").replace(/<hr\b[^>]*>/g, "\n-------------\n").replace(/<[^>]*>/g, " ").replace(/\u0001/g, "\n").replace(/[ \t]+/g, " ").replace(/^\s+$/gm, "").replace(/\n\n+/g, "\n\n").replace(/^\n+/, "\n").replace(/\n+$/, "\n");
  str = decodeHTMLEntities(str);
  return str;
}
function formatTextAddress(address) {
  return [].concat(address.name || []).concat(address.name ? `<${address.address}>` : address.address).join(" ");
}
function formatTextAddresses(addresses) {
  let parts = [];
  let processAddress = (address, partCounter) => {
    if (partCounter) {
      parts.push(", ");
    }
    if (address.group) {
      let groupStart = `${address.name}:`;
      let groupEnd = `;`;
      parts.push(groupStart);
      address.group.forEach(processAddress);
      parts.push(groupEnd);
    } else {
      parts.push(formatTextAddress(address));
    }
  };
  addresses.forEach(processAddress);
  return parts.join("");
}
function formatHtmlAddress(address) {
  return `<a href="mailto:${escapeHtml(address.address)}" class="postal-email-address">${escapeHtml(address.name || `<${address.address}>`)}</a>`;
}
function formatHtmlAddresses(addresses) {
  let parts = [];
  let processAddress = (address, partCounter) => {
    if (partCounter) {
      parts.push('<span class="postal-email-address-separator">, </span>');
    }
    if (address.group) {
      let groupStart = `<span class="postal-email-address-group">${escapeHtml(address.name)}:</span>`;
      let groupEnd = `<span class="postal-email-address-group">;</span>`;
      parts.push(groupStart);
      address.group.forEach(processAddress);
      parts.push(groupEnd);
    } else {
      parts.push(formatHtmlAddress(address));
    }
  };
  addresses.forEach(processAddress);
  return parts.join(" ");
}
function foldLines(str, lineLength, afterSpace) {
  str = (str || "").toString();
  lineLength = lineLength || 76;
  let pos = 0, len = str.length, result = "", line, match;
  while (pos < len) {
    line = str.substr(pos, lineLength);
    if (line.length < lineLength) {
      result += line;
      break;
    }
    if (match = line.match(/^[^\n\r]*(\r?\n|\r)/)) {
      line = match[0];
      result += line;
      pos += line.length;
      continue;
    } else if ((match = line.match(/(\s+)[^\s]*$/)) && match[0].length - (afterSpace ? (match[1] || "").length : 0) < line.length) {
      line = line.substr(0, line.length - (match[0].length - (afterSpace ? (match[1] || "").length : 0)));
    } else if (match = str.substr(pos + line.length).match(/^[^\s]+(\s*)/)) {
      line = line + match[0].substr(0, match[0].length - (!afterSpace ? (match[1] || "").length : 0));
    }
    result += line;
    pos += line.length;
    if (pos < len) {
      result += "\r\n";
    }
  }
  return result;
}
function formatTextHeader(message) {
  let rows = [];
  if (message.from) {
    rows.push({ key: "From", val: formatTextAddress(message.from) });
  }
  if (message.subject) {
    rows.push({ key: "Subject", val: message.subject });
  }
  if (message.date) {
    let dateOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    };
    let dateStr = typeof Intl === "undefined" ? message.date : new Intl.DateTimeFormat("default", dateOptions).format(new Date(message.date));
    rows.push({ key: "Date", val: dateStr });
  }
  if (message.to && message.to.length) {
    rows.push({ key: "To", val: formatTextAddresses(message.to) });
  }
  if (message.cc && message.cc.length) {
    rows.push({ key: "Cc", val: formatTextAddresses(message.cc) });
  }
  if (message.bcc && message.bcc.length) {
    rows.push({ key: "Bcc", val: formatTextAddresses(message.bcc) });
  }
  let maxKeyLength = rows.map((r) => r.key.length).reduce((acc, cur) => {
    return cur > acc ? cur : acc;
  }, 0);
  rows = rows.flatMap((row) => {
    let sepLen = maxKeyLength - row.key.length;
    let prefix = `${row.key}: ${" ".repeat(sepLen)}`;
    let emptyPrefix = `${" ".repeat(row.key.length + 1)} ${" ".repeat(sepLen)}`;
    let foldedLines = foldLines(row.val, 80, true).split(/\r?\n/).map((line) => line.trim());
    return foldedLines.map((line, i) => `${i ? emptyPrefix : prefix}${line}`);
  });
  let maxLineLength = rows.map((r) => r.length).reduce((acc, cur) => {
    return cur > acc ? cur : acc;
  }, 0);
  let lineMarker = "-".repeat(maxLineLength);
  let template = `
${lineMarker}
${rows.join("\n")}
${lineMarker}
`;
  return template;
}
function formatHtmlHeader(message) {
  let rows = [];
  if (message.from) {
    rows.push(
      `<div class="postal-email-header-key">From</div><div class="postal-email-header-value">${formatHtmlAddress(message.from)}</div>`
    );
  }
  if (message.subject) {
    rows.push(
      `<div class="postal-email-header-key">Subject</div><div class="postal-email-header-value postal-email-header-subject">${escapeHtml(
        message.subject
      )}</div>`
    );
  }
  if (message.date) {
    let dateOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    };
    let dateStr = typeof Intl === "undefined" ? message.date : new Intl.DateTimeFormat("default", dateOptions).format(new Date(message.date));
    rows.push(
      `<div class="postal-email-header-key">Date</div><div class="postal-email-header-value postal-email-header-date" data-date="${escapeHtml(
        message.date
      )}">${escapeHtml(dateStr)}</div>`
    );
  }
  if (message.to && message.to.length) {
    rows.push(
      `<div class="postal-email-header-key">To</div><div class="postal-email-header-value">${formatHtmlAddresses(message.to)}</div>`
    );
  }
  if (message.cc && message.cc.length) {
    rows.push(
      `<div class="postal-email-header-key">Cc</div><div class="postal-email-header-value">${formatHtmlAddresses(message.cc)}</div>`
    );
  }
  if (message.bcc && message.bcc.length) {
    rows.push(
      `<div class="postal-email-header-key">Bcc</div><div class="postal-email-header-value">${formatHtmlAddresses(message.bcc)}</div>`
    );
  }
  let template = `<div class="postal-email-header">${rows.length ? '<div class="postal-email-header-row">' : ""}${rows.join(
    '</div>\n<div class="postal-email-header-row">'
  )}${rows.length ? "</div>" : ""}</div>`;
  return template;
}

// node_modules/postal-mime/src/address-parser.js
function _handleAddress(tokens, depth) {
  let isGroup = false;
  let state = "text";
  let address;
  let addresses = [];
  let data = {
    address: [],
    comment: [],
    group: [],
    text: [],
    textWasQuoted: []
    // Track which text tokens came from inside quotes
  };
  let i;
  let len;
  let insideQuotes = false;
  for (i = 0, len = tokens.length; i < len; i++) {
    let token = tokens[i];
    let prevToken = i ? tokens[i - 1] : null;
    if (token.type === "operator") {
      switch (token.value) {
        case "<":
          state = "address";
          insideQuotes = false;
          break;
        case "(":
          state = "comment";
          insideQuotes = false;
          break;
        case ":":
          state = "group";
          isGroup = true;
          insideQuotes = false;
          break;
        case '"':
          insideQuotes = !insideQuotes;
          state = "text";
          break;
        default:
          state = "text";
          insideQuotes = false;
          break;
      }
    } else if (token.value) {
      if (state === "address") {
        token.value = token.value.replace(/^[^<]*<\s*/, "");
      }
      if (prevToken && prevToken.noBreak && data[state].length) {
        data[state][data[state].length - 1] += token.value;
        if (state === "text" && insideQuotes) {
          data.textWasQuoted[data.textWasQuoted.length - 1] = true;
        }
      } else {
        data[state].push(token.value);
        if (state === "text") {
          data.textWasQuoted.push(insideQuotes);
        }
      }
    }
  }
  if (!data.text.length && data.comment.length) {
    data.text = data.comment;
    data.comment = [];
  }
  if (isGroup) {
    data.text = data.text.join(" ");
    let groupMembers = [];
    if (data.group.length) {
      let parsedGroup = addressParser(data.group.join(","), { _depth: depth + 1 });
      parsedGroup.forEach((member) => {
        if (member.group) {
          groupMembers = groupMembers.concat(member.group);
        } else {
          groupMembers.push(member);
        }
      });
    }
    addresses.push({
      name: decodeWords(data.text || address && address.name),
      group: groupMembers
    });
  } else {
    if (!data.address.length && data.text.length) {
      for (i = data.text.length - 1; i >= 0; i--) {
        if (!data.textWasQuoted[i] && data.text[i].match(/^[^@\s]+@[^@\s]+$/)) {
          data.address = data.text.splice(i, 1);
          data.textWasQuoted.splice(i, 1);
          break;
        }
      }
      let _regexHandler = function(address2) {
        if (!data.address.length) {
          data.address = [address2.trim()];
          return " ";
        } else {
          return address2;
        }
      };
      if (!data.address.length) {
        for (i = data.text.length - 1; i >= 0; i--) {
          if (!data.textWasQuoted[i]) {
            data.text[i] = data.text[i].replace(/\s*\b[^@\s]+@[^\s]+\b\s*/, _regexHandler).trim();
            if (data.address.length) {
              break;
            }
          }
        }
      }
    }
    if (!data.text.length && data.comment.length) {
      data.text = data.comment;
      data.comment = [];
    }
    if (data.address.length > 1) {
      data.text = data.text.concat(data.address.splice(1));
    }
    data.text = data.text.join(" ");
    data.address = data.address.join(" ");
    if (!data.address && /^=\?[^=]+?=$/.test(data.text.trim())) {
      const decodedText = decodeWords(data.text);
      if (/<[^<>]+@[^<>]+>/.test(decodedText)) {
        const parsedSubAddresses = addressParser(decodedText);
        if (parsedSubAddresses && parsedSubAddresses.length) {
          return parsedSubAddresses;
        }
      }
      return [{ address: "", name: decodedText }];
    }
    address = {
      address: data.address || data.text || "",
      name: decodeWords(data.text || data.address || "")
    };
    if (address.address === address.name) {
      if ((address.address || "").match(/@/)) {
        address.name = "";
      } else {
        address.address = "";
      }
    }
    addresses.push(address);
  }
  return addresses;
}
var Tokenizer = class {
  constructor(str) {
    this.str = (str || "").toString();
    this.operatorCurrent = "";
    this.operatorExpecting = "";
    this.node = null;
    this.escaped = false;
    this.list = [];
    this.operators = {
      '"': '"',
      "(": ")",
      "<": ">",
      ",": "",
      ":": ";",
      // Semicolons are not a legal delimiter per the RFC2822 grammar other
      // than for terminating a group, but they are also not valid for any
      // other use in this context.  Given that some mail clients have
      // historically allowed the semicolon as a delimiter equivalent to the
      // comma in their UI, it makes sense to treat them the same as a comma
      // when used outside of a group.
      ";": ""
    };
  }
  /**
   * Tokenizes the original input string
   *
   * @return {Array} An array of operator|text tokens
   */
  tokenize() {
    let list = [];
    for (let i = 0, len = this.str.length; i < len; i++) {
      let chr = this.str.charAt(i);
      let nextChr = i < len - 1 ? this.str.charAt(i + 1) : null;
      this.checkChar(chr, nextChr);
    }
    this.list.forEach((node) => {
      node.value = (node.value || "").toString().trim();
      if (node.value) {
        list.push(node);
      }
    });
    return list;
  }
  /**
   * Checks if a character is an operator or text and acts accordingly
   *
   * @param {String} chr Character from the address field
   */
  checkChar(chr, nextChr) {
    if (this.escaped) {
    } else if (chr === this.operatorExpecting) {
      this.node = {
        type: "operator",
        value: chr
      };
      if (nextChr && ![" ", "	", "\r", "\n", ",", ";"].includes(nextChr)) {
        this.node.noBreak = true;
      }
      this.list.push(this.node);
      this.node = null;
      this.operatorExpecting = "";
      this.escaped = false;
      return;
    } else if (!this.operatorExpecting && chr in this.operators) {
      this.node = {
        type: "operator",
        value: chr
      };
      this.list.push(this.node);
      this.node = null;
      this.operatorExpecting = this.operators[chr];
      this.escaped = false;
      return;
    } else if (this.operatorExpecting === '"' && chr === "\\") {
      this.escaped = true;
      return;
    }
    if (!this.node) {
      this.node = {
        type: "text",
        value: ""
      };
      this.list.push(this.node);
    }
    if (chr === "\n") {
      chr = " ";
    }
    if (chr.charCodeAt(0) >= 33 || [" ", "	"].includes(chr)) {
      this.node.value += chr;
    }
    this.escaped = false;
  }
};
var MAX_NESTED_GROUP_DEPTH = 50;
function addressParser(str, options) {
  options = options || {};
  let depth = options._depth || 0;
  if (depth > MAX_NESTED_GROUP_DEPTH) {
    return [];
  }
  let tokenizer = new Tokenizer(str);
  let tokens = tokenizer.tokenize();
  let addresses = [];
  let address = [];
  let parsedAddresses = [];
  tokens.forEach((token) => {
    if (token.type === "operator" && (token.value === "," || token.value === ";")) {
      if (address.length) {
        addresses.push(address);
      }
      address = [];
    } else {
      address.push(token);
    }
  });
  if (address.length) {
    addresses.push(address);
  }
  addresses.forEach((address2) => {
    address2 = _handleAddress(address2, depth);
    if (address2.length) {
      parsedAddresses = parsedAddresses.concat(address2);
    }
  });
  if (options.flatten) {
    let addresses2 = [];
    let walkAddressList = (list) => {
      list.forEach((address2) => {
        if (address2.group) {
          return walkAddressList(address2.group);
        } else {
          addresses2.push(address2);
        }
      });
    };
    walkAddressList(parsedAddresses);
    return addresses2;
  }
  return parsedAddresses;
}
var address_parser_default = addressParser;

// node_modules/postal-mime/src/base64-encoder.js
function base64ArrayBuffer(arrayBuffer) {
  var base64 = "";
  var encodings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var bytes = new Uint8Array(arrayBuffer);
  var byteLength = bytes.byteLength;
  var byteRemainder = byteLength % 3;
  var mainLength = byteLength - byteRemainder;
  var a, b, c, d;
  var chunk;
  for (var i = 0; i < mainLength; i = i + 3) {
    chunk = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
    a = (chunk & 16515072) >> 18;
    b = (chunk & 258048) >> 12;
    c = (chunk & 4032) >> 6;
    d = chunk & 63;
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2;
    b = (chunk & 3) << 4;
    base64 += encodings[a] + encodings[b] + "==";
  } else if (byteRemainder == 2) {
    chunk = bytes[mainLength] << 8 | bytes[mainLength + 1];
    a = (chunk & 64512) >> 10;
    b = (chunk & 1008) >> 4;
    c = (chunk & 15) << 2;
    base64 += encodings[a] + encodings[b] + encodings[c] + "=";
  }
  return base64;
}

// node_modules/postal-mime/src/postal-mime.js
var MAX_NESTING_DEPTH = 256;
var MAX_HEADERS_SIZE = 2 * 1024 * 1024;
function toCamelCase(key) {
  return key.replace(/-(.)/g, (o, c) => c.toUpperCase());
}
var PostalMime = class _PostalMime {
  static parse(buf, options) {
    const parser = new _PostalMime(options);
    return parser.parse(buf);
  }
  constructor(options) {
    this.options = options || {};
    this.mimeOptions = {
      maxNestingDepth: this.options.maxNestingDepth || MAX_NESTING_DEPTH,
      maxHeadersSize: this.options.maxHeadersSize || MAX_HEADERS_SIZE
    };
    this.root = this.currentNode = new MimeNode({
      postalMime: this,
      ...this.mimeOptions
    });
    this.boundaries = [];
    this.textContent = {};
    this.attachments = [];
    this.attachmentEncoding = (this.options.attachmentEncoding || "").toString().replace(/[-_\s]/g, "").trim().toLowerCase() || "arraybuffer";
    this.started = false;
  }
  async finalize() {
    await this.root.finalize();
  }
  async processLine(line, isFinal) {
    let boundaries = this.boundaries;
    if (boundaries.length && line.length > 2 && line[0] === 45 && line[1] === 45) {
      for (let i = boundaries.length - 1; i >= 0; i--) {
        let boundary = boundaries[i];
        if (line.length < boundary.value.length + 2) {
          continue;
        }
        let boundaryMatches = true;
        for (let j = 0; j < boundary.value.length; j++) {
          if (line[j + 2] !== boundary.value[j]) {
            boundaryMatches = false;
            break;
          }
        }
        if (!boundaryMatches) {
          continue;
        }
        let boundaryEnd = boundary.value.length + 2;
        let isTerminator = false;
        if (line.length >= boundary.value.length + 4 && line[boundary.value.length + 2] === 45 && line[boundary.value.length + 3] === 45) {
          isTerminator = true;
          boundaryEnd = boundary.value.length + 4;
        }
        let hasValidTrailing = true;
        for (let j = boundaryEnd; j < line.length; j++) {
          if (line[j] !== 32 && line[j] !== 9) {
            hasValidTrailing = false;
            break;
          }
        }
        if (!hasValidTrailing) {
          continue;
        }
        if (isTerminator) {
          await boundary.node.finalize();
          this.currentNode = boundary.node.parentNode || this.root;
        } else {
          await boundary.node.finalizeChildNodes();
          this.currentNode = new MimeNode({
            postalMime: this,
            parentNode: boundary.node,
            parentMultipartType: boundary.node.contentType.multipart,
            ...this.mimeOptions
          });
        }
        if (isFinal) {
          return this.finalize();
        }
        return;
      }
    }
    this.currentNode.feed(line);
    if (isFinal) {
      return this.finalize();
    }
  }
  readLine() {
    let startPos = this.readPos;
    let endPos = this.readPos;
    while (this.readPos < this.av.length) {
      const c = this.av[this.readPos++];
      if (c !== 13 && c !== 10) {
        endPos = this.readPos;
      }
      if (c === 10) {
        return {
          bytes: new Uint8Array(this.buf, startPos, endPos - startPos),
          done: this.readPos >= this.av.length
        };
      }
    }
    return {
      bytes: new Uint8Array(this.buf, startPos, endPos - startPos),
      done: this.readPos >= this.av.length
    };
  }
  async processNodeTree() {
    let textContent = {};
    let textTypes = /* @__PURE__ */ new Set();
    let textMap = this.textMap = /* @__PURE__ */ new Map();
    let forceRfc822Attachments = this.forceRfc822Attachments();
    let walk = async (node, alternative, related) => {
      alternative = alternative || false;
      related = related || false;
      if (!node.contentType.multipart) {
        if (this.isInlineMessageRfc822(node) && !forceRfc822Attachments) {
          const subParser = new _PostalMime();
          node.subMessage = await subParser.parse(node.content);
          if (!textMap.has(node)) {
            textMap.set(node, {});
          }
          let textEntry = textMap.get(node);
          if (node.subMessage.text || !node.subMessage.html) {
            textEntry.plain = textEntry.plain || [];
            textEntry.plain.push({ type: "subMessage", value: node.subMessage });
            textTypes.add("plain");
          }
          if (node.subMessage.html) {
            textEntry.html = textEntry.html || [];
            textEntry.html.push({ type: "subMessage", value: node.subMessage });
            textTypes.add("html");
          }
          if (subParser.textMap) {
            subParser.textMap.forEach((subTextEntry, subTextNode) => {
              textMap.set(subTextNode, subTextEntry);
            });
          }
          for (let attachment of node.subMessage.attachments || []) {
            this.attachments.push(attachment);
          }
        } else if (this.isInlineTextNode(node)) {
          let textType = node.contentType.parsed.value.substr(node.contentType.parsed.value.indexOf("/") + 1);
          let selectorNode = alternative || node;
          if (!textMap.has(selectorNode)) {
            textMap.set(selectorNode, {});
          }
          let textEntry = textMap.get(selectorNode);
          textEntry[textType] = textEntry[textType] || [];
          textEntry[textType].push({ type: "text", value: node.getTextContent() });
          textTypes.add(textType);
        } else if (node.content) {
          const filename = node.contentDisposition?.parsed?.params?.filename || node.contentType.parsed.params.name || null;
          const attachment = {
            filename: filename ? decodeWords(filename) : null,
            mimeType: node.contentType.parsed.value,
            disposition: node.contentDisposition?.parsed?.value || null
          };
          if (related && node.contentId) {
            attachment.related = true;
          }
          if (node.contentDescription) {
            attachment.description = node.contentDescription;
          }
          if (node.contentId) {
            attachment.contentId = node.contentId;
          }
          switch (node.contentType.parsed.value) {
            case "text/calendar":
            case "application/ics": {
              if (node.contentType.parsed.params.method) {
                attachment.method = node.contentType.parsed.params.method.toString().toUpperCase().trim();
              }
              const decodedText = node.getTextContent().replace(/\r?\n/g, "\n").replace(/\n*$/, "\n");
              attachment.content = textEncoder.encode(decodedText);
              break;
            }
            default:
              attachment.content = node.content;
          }
          this.attachments.push(attachment);
        }
      } else if (node.contentType.multipart === "alternative") {
        alternative = node;
      } else if (node.contentType.multipart === "related") {
        related = node;
      }
      for (let childNode of node.childNodes) {
        await walk(childNode, alternative, related);
      }
    };
    await walk(this.root, false, false);
    textMap.forEach((mapEntry) => {
      textTypes.forEach((textType) => {
        if (!textContent[textType]) {
          textContent[textType] = [];
        }
        if (mapEntry[textType]) {
          mapEntry[textType].forEach((textEntry) => {
            switch (textEntry.type) {
              case "text":
                textContent[textType].push(textEntry.value);
                break;
              case "subMessage":
                {
                  switch (textType) {
                    case "html":
                      textContent[textType].push(formatHtmlHeader(textEntry.value));
                      break;
                    case "plain":
                      textContent[textType].push(formatTextHeader(textEntry.value));
                      break;
                  }
                }
                break;
            }
          });
        } else {
          let alternativeType;
          switch (textType) {
            case "html":
              alternativeType = "plain";
              break;
            case "plain":
              alternativeType = "html";
              break;
          }
          (mapEntry[alternativeType] || []).forEach((textEntry) => {
            switch (textEntry.type) {
              case "text":
                switch (textType) {
                  case "html":
                    textContent[textType].push(textToHtml(textEntry.value));
                    break;
                  case "plain":
                    textContent[textType].push(htmlToText(textEntry.value));
                    break;
                }
                break;
              case "subMessage":
                {
                  switch (textType) {
                    case "html":
                      textContent[textType].push(formatHtmlHeader(textEntry.value));
                      break;
                    case "plain":
                      textContent[textType].push(formatTextHeader(textEntry.value));
                      break;
                  }
                }
                break;
            }
          });
        }
      });
    });
    Object.keys(textContent).forEach((textType) => {
      textContent[textType] = textContent[textType].join("\n");
    });
    this.textContent = textContent;
  }
  isInlineTextNode(node) {
    if (node.contentDisposition?.parsed?.value === "attachment") {
      return false;
    }
    switch (node.contentType.parsed?.value) {
      case "text/html":
      case "text/plain":
        return true;
      case "text/calendar":
      case "text/csv":
      default:
        return false;
    }
  }
  isInlineMessageRfc822(node) {
    if (node.contentType.parsed?.value !== "message/rfc822") {
      return false;
    }
    let disposition = node.contentDisposition?.parsed?.value || (this.options.rfc822Attachments ? "attachment" : "inline");
    return disposition === "inline";
  }
  // Check if this is a specially crafted report email where message/rfc822 content should not be inlined
  forceRfc822Attachments() {
    if (this.options.forceRfc822Attachments) {
      return true;
    }
    let forceRfc822Attachments = false;
    let walk = (node) => {
      if (!node.contentType.multipart) {
        if (node.contentType.parsed && ["message/delivery-status", "message/feedback-report"].includes(node.contentType.parsed.value)) {
          forceRfc822Attachments = true;
        }
      }
      for (let childNode of node.childNodes) {
        walk(childNode);
      }
    };
    walk(this.root);
    return forceRfc822Attachments;
  }
  async resolveStream(stream) {
    let chunkLen = 0;
    let chunks = [];
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      chunkLen += value.length;
    }
    const result = new Uint8Array(chunkLen);
    let chunkPointer = 0;
    for (let chunk of chunks) {
      result.set(chunk, chunkPointer);
      chunkPointer += chunk.length;
    }
    return result;
  }
  async parse(buf) {
    if (this.started) {
      throw new Error("Can not reuse parser, create a new PostalMime object");
    }
    this.started = true;
    if (buf && typeof buf.getReader === "function") {
      buf = await this.resolveStream(buf);
    }
    buf = buf || new ArrayBuffer(0);
    if (typeof buf === "string") {
      buf = textEncoder.encode(buf);
    }
    if (buf instanceof Blob || Object.prototype.toString.call(buf) === "[object Blob]") {
      buf = await blobToArrayBuffer(buf);
    }
    if (buf.buffer instanceof ArrayBuffer) {
      buf = new Uint8Array(buf).buffer;
    }
    this.buf = buf;
    this.av = new Uint8Array(buf);
    this.readPos = 0;
    while (this.readPos < this.av.length) {
      const line = this.readLine();
      await this.processLine(line.bytes, line.done);
    }
    await this.processNodeTree();
    const message = {
      headers: this.root.headers.map((entry) => ({ key: entry.key, originalKey: entry.originalKey, value: entry.value })).reverse()
    };
    for (const key of ["from", "sender"]) {
      const addressHeader = this.root.headers.find((line) => line.key === key);
      if (addressHeader && addressHeader.value) {
        const addresses = address_parser_default(addressHeader.value);
        if (addresses && addresses.length) {
          message[key] = addresses[0];
        }
      }
    }
    for (const key of ["delivered-to", "return-path"]) {
      const addressHeader = this.root.headers.find((line) => line.key === key);
      if (addressHeader && addressHeader.value) {
        const addresses = address_parser_default(addressHeader.value);
        if (addresses && addresses.length && addresses[0].address) {
          const camelKey = toCamelCase(key);
          message[camelKey] = addresses[0].address;
        }
      }
    }
    for (const key of ["to", "cc", "bcc", "reply-to"]) {
      const addressHeaders = this.root.headers.filter((line) => line.key === key);
      let addresses = [];
      addressHeaders.filter((entry) => entry && entry.value).map((entry) => address_parser_default(entry.value)).forEach((parsed) => addresses = addresses.concat(parsed || []));
      if (addresses && addresses.length) {
        const camelKey = toCamelCase(key);
        message[camelKey] = addresses;
      }
    }
    for (const key of ["subject", "message-id", "in-reply-to", "references"]) {
      const header = this.root.headers.find((line) => line.key === key);
      if (header && header.value) {
        const camelKey = toCamelCase(key);
        message[camelKey] = decodeWords(header.value);
      }
    }
    let dateHeader = this.root.headers.find((line) => line.key === "date");
    if (dateHeader) {
      let date = new Date(dateHeader.value);
      if (date.toString() === "Invalid Date") {
        date = dateHeader.value;
      } else {
        date = date.toISOString();
      }
      message.date = date;
    }
    if (this.textContent?.html) {
      message.html = this.textContent.html;
    }
    if (this.textContent?.plain) {
      message.text = this.textContent.plain;
    }
    message.attachments = this.attachments;
    message.headerLines = (this.root.rawHeaderLines || []).slice().reverse();
    switch (this.attachmentEncoding) {
      case "arraybuffer":
        break;
      case "base64":
        for (let attachment of message.attachments || []) {
          if (attachment?.content) {
            attachment.content = base64ArrayBuffer(attachment.content);
            attachment.encoding = "base64";
          }
        }
        break;
      case "utf8":
        let attachmentDecoder = new TextDecoder("utf8");
        for (let attachment of message.attachments || []) {
          if (attachment?.content) {
            attachment.content = attachmentDecoder.decode(attachment.content);
            attachment.encoding = "utf8";
          }
        }
        break;
      default:
        throw new Error("Unknown attachment encoding");
    }
    return message;
  }
};

// node_modules/resend/dist/index.mjs
var import_svix = __toESM(require_dist2(), 1);
var version2 = "6.10.0";
function buildPaginationQuery(options) {
  const searchParams = new URLSearchParams();
  if (options.limit !== void 0)
    searchParams.set("limit", options.limit.toString());
  if ("after" in options && options.after !== void 0)
    searchParams.set("after", options.after);
  if ("before" in options && options.before !== void 0)
    searchParams.set("before", options.before);
  return searchParams.toString();
}
var ApiKeys = class {
  constructor(resend2) {
    this.resend = resend2;
  }
  async create(payload, options = {}) {
    return await this.resend.post("/api-keys", payload, options);
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/api-keys?${queryString}` : "/api-keys";
    return await this.resend.get(url);
  }
  async remove(id) {
    return await this.resend.delete(`/api-keys/${id}`);
  }
};
function parseAttachments(attachments) {
  return attachments?.map((attachment) => ({
    content: attachment.content,
    filename: attachment.filename,
    path: attachment.path,
    content_type: attachment.contentType,
    content_id: attachment.contentId
  }));
}
function parseEmailToApiOptions(email) {
  return {
    attachments: parseAttachments(email.attachments),
    bcc: email.bcc,
    cc: email.cc,
    from: email.from,
    headers: email.headers,
    html: email.html,
    reply_to: email.replyTo,
    scheduled_at: email.scheduledAt,
    subject: email.subject,
    tags: email.tags,
    text: email.text,
    to: email.to,
    template: email.template ? {
      id: email.template.id,
      variables: email.template.variables
    } : void 0,
    topic_id: email.topicId
  };
}
async function render(node) {
  let render2;
  try {
    ({ render: render2 } = await import("@react-email/render"));
  } catch {
    throw new Error("Failed to render React component. Make sure to install `@react-email/render` or `@react-email/components`.");
  }
  return render2(node);
}
var Batch = class {
  constructor(resend2) {
    this.resend = resend2;
  }
  async send(payload, options) {
    return this.create(payload, options);
  }
  async create(payload, options) {
    const emails = [];
    for (const email of payload) {
      if (email.react) {
        email.html = await render(email.react);
        email.react = void 0;
      }
      emails.push(parseEmailToApiOptions(email));
    }
    return await this.resend.post("/emails/batch", emails, {
      ...options,
      headers: {
        "x-batch-validation": options?.batchValidation ?? "strict",
        ...options?.headers
      }
    });
  }
};
var Broadcasts = class {
  constructor(resend2) {
    this.resend = resend2;
  }
  async create(payload, options = {}) {
    if (payload.react)
      payload.html = await render(payload.react);
    return await this.resend.post("/broadcasts", {
      name: payload.name,
      segment_id: payload.segmentId,
      audience_id: payload.audienceId,
      preview_text: payload.previewText,
      from: payload.from,
      html: payload.html,
      reply_to: payload.replyTo,
      subject: payload.subject,
      text: payload.text,
      topic_id: payload.topicId,
      send: payload.send,
      scheduled_at: payload.scheduledAt
    }, options);
  }
  async send(id, payload) {
    return await this.resend.post(`/broadcasts/${id}/send`, { scheduled_at: payload?.scheduledAt });
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/broadcasts?${queryString}` : "/broadcasts";
    return await this.resend.get(url);
  }
  async get(id) {
    return await this.resend.get(`/broadcasts/${id}`);
  }
  async remove(id) {
    return await this.resend.delete(`/broadcasts/${id}`);
  }
  async update(id, payload) {
    if (payload.react)
      payload.html = await render(payload.react);
    return await this.resend.patch(`/broadcasts/${id}`, {
      name: payload.name,
      segment_id: payload.segmentId,
      audience_id: payload.audienceId,
      from: payload.from,
      html: payload.html,
      text: payload.text,
      subject: payload.subject,
      reply_to: payload.replyTo,
      preview_text: payload.previewText,
      topic_id: payload.topicId
    });
  }
};
function parseContactPropertyFromApi(contactProperty) {
  return {
    id: contactProperty.id,
    key: contactProperty.key,
    createdAt: contactProperty.created_at,
    type: contactProperty.type,
    fallbackValue: contactProperty.fallback_value
  };
}
function parseContactPropertyToApiOptions(contactProperty) {
  if ("key" in contactProperty)
    return {
      key: contactProperty.key,
      type: contactProperty.type,
      fallback_value: contactProperty.fallbackValue
    };
  return { fallback_value: contactProperty.fallbackValue };
}
var ContactProperties = class {
  constructor(resend2) {
    this.resend = resend2;
  }
  async create(options) {
    const apiOptions = parseContactPropertyToApiOptions(options);
    return await this.resend.post("/contact-properties", apiOptions);
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/contact-properties?${queryString}` : "/contact-properties";
    const response = await this.resend.get(url);
    if (response.data)
      return {
        data: {
          ...response.data,
          data: response.data.data.map((apiContactProperty) => parseContactPropertyFromApi(apiContactProperty))
        },
        headers: response.headers,
        error: null
      };
    return response;
  }
  async get(id) {
    if (!id)
      return {
        data: null,
        headers: null,
        error: {
          message: "Missing `id` field.",
          statusCode: null,
          name: "missing_required_field"
        }
      };
    const response = await this.resend.get(`/contact-properties/${id}`);
    if (response.data)
      return {
        data: {
          object: "contact_property",
          ...parseContactPropertyFromApi(response.data)
        },
        headers: response.headers,
        error: null
      };
    return response;
  }
  async update(payload) {
    if (!payload.id)
      return {
        data: null,
        headers: null,
        error: {
          message: "Missing `id` field.",
          statusCode: null,
          name: "missing_required_field"
        }
      };
    const apiOptions = parseContactPropertyToApiOptions(payload);
    return await this.resend.patch(`/contact-properties/${payload.id}`, apiOptions);
  }
  async remove(id) {
    if (!id)
      return {
        data: null,
        headers: null,
        error: {
          message: "Missing `id` field.",
          statusCode: null,
          name: "missing_required_field"
        }
      };
    return await this.resend.delete(`/contact-properties/${id}`);
  }
};
var ContactSegments = class {
  constructor(resend2) {
    this.resend = resend2;
  }
  async list(options) {
    if (!options.contactId && !options.email)
      return {
        data: null,
        headers: null,
        error: {
          message: "Missing `id` or `email` field.",
          statusCode: null,
          name: "missing_required_field"
        }
      };
    const identifier = options.email ? options.email : options.contactId;
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/contacts/${identifier}/segments?${queryString}` : `/contacts/${identifier}/segments`;
    return await this.resend.get(url);
  }
  async add(options) {
    if (!options.contactId && !options.email)
      return {
        data: null,
        headers: null,
        error: {
          message: "Missing `id` or `email` field.",
          statusCode: null,
          name: "missing_required_field"
        }
      };
    const identifier = options.email ? options.email : options.contactId;
    return this.resend.post(`/contacts/${identifier}/segments/${options.segmentId}`);
  }
  async remove(options) {
    if (!options.contactId && !options.email)
      return {
        data: null,
        headers: null,
        error: {
          message: "Missing `id` or `email` field.",
          statusCode: null,
          name: "missing_required_field"
        }
      };
    const identifier = options.email ? options.email : options.contactId;
    return this.resend.delete(`/contacts/${identifier}/segments/${options.segmentId}`);
  }
};
var ContactTopics = class {
  constructor(resend2) {
    this.resend = resend2;
  }
  async update(payload) {
    if (!payload.id && !payload.email)
      return {
        data: null,
        headers: null,
        error: {
          message: "Missing `id` or `email` field.",
          statusCode: null,
          name: "missing_required_field"
        }
      };
    const identifier = payload.email ? payload.email : payload.id;
    return this.resend.patch(`/contacts/${identifier}/topics`, payload.topics);
  }
  async list(options) {
    if (!options.id && !options.email)
      return {
        data: null,
        headers: null,
        error: {
          message: "Missing `id` or `email` field.",
          statusCode: null,
          name: "missing_required_field"
        }
      };
    const identifier = options.email ? options.email : options.id;
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/contacts/${identifier}/topics?${queryString}` : `/contacts/${identifier}/topics`;
    return this.resend.get(url);
  }
};
var Contacts = class {
  constructor(resend2) {
    this.resend = resend2;
    this.topics = new ContactTopics(this.resend);
    this.segments = new ContactSegments(this.resend);
  }
  async create(payload, options = {}) {
    if ("audienceId" in payload) {
      if ("segments" in payload || "topics" in payload)
        return {
          data: null,
          headers: null,
          error: {
            message: "`audienceId` is deprecated, and cannot be used together with `segments` or `topics`. Use `segments` instead to add one or more segments to the new contact.",
            statusCode: null,
            name: "invalid_parameter"
          }
        };
      return await this.resend.post(`/audiences/${payload.audienceId}/contacts`, {
        unsubscribed: payload.unsubscribed,
        email: payload.email,
        first_name: payload.firstName,
        last_name: payload.lastName,
        properties: payload.properties
      }, options);
    }
    return await this.resend.post("/contacts", {
      unsubscribed: payload.unsubscribed,
      email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      properties: payload.properties,
      segments: payload.segments,
      topics: payload.topics
    }, options);
  }
  async list(options = {}) {
    const segmentId = options.segmentId ?? options.audienceId;
    if (!segmentId) {
      const queryString2 = buildPaginationQuery(options);
      const url2 = queryString2 ? `/contacts?${queryString2}` : "/contacts";
      return await this.resend.get(url2);
    }
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/segments/${segmentId}/contacts?${queryString}` : `/segments/${segmentId}/contacts`;
    return await this.resend.get(url);
  }
  async get(options) {
    if (typeof options === "string")
      return this.resend.get(`/contacts/${options}`);
    if (!options.id && !options.email)
      return {
        data: null,
        headers: null,
        error: {
          message: "Missing `id` or `email` field.",
          statusCode: null,
          name: "missing_required_field"
        }
      };
    if (!options.audienceId)
      return this.resend.get(`/contacts/${options?.email ? options?.email : options?.id}`);
    return this.resend.get(`/audiences/${options.audienceId}/contacts/${options?.email ? options?.email : options?.id}`);
  }
  async update(options) {
    if (!options.id && !options.email)
      return {
        data: null,
        headers: null,
        error: {
          message: "Missing `id` or `email` field.",
          statusCode: null,
          name: "missing_required_field"
        }
      };
    if (!options.audienceId)
      return await this.resend.patch(`/contacts/${options?.email ? options?.email : options?.id}`, {
        unsubscribed: options.unsubscribed,
        first_name: options.firstName,
        last_name: options.lastName,
        properties: options.properties
      });
    return await this.resend.patch(`/audiences/${options.audienceId}/contacts/${options?.email ? options?.email : options?.id}`, {
      unsubscribed: options.unsubscribed,
      first_name: options.firstName,
      last_name: options.lastName,
      properties: options.properties
    });
  }
  async remove(payload) {
    if (typeof payload === "string")
      return this.resend.delete(`/contacts/${payload}`);
    if (!payload.id && !payload.email)
      return {
        data: null,
        headers: null,
        error: {
          message: "Missing `id` or `email` field.",
          statusCode: null,
          name: "missing_required_field"
        }
      };
    if (!payload.audienceId)
      return this.resend.delete(`/contacts/${payload?.email ? payload?.email : payload?.id}`);
    return this.resend.delete(`/audiences/${payload.audienceId}/contacts/${payload?.email ? payload?.email : payload?.id}`);
  }
};
function parseDomainToApiOptions(domain) {
  return {
    name: domain.name,
    region: domain.region,
    custom_return_path: domain.customReturnPath,
    capabilities: domain.capabilities,
    open_tracking: domain.openTracking,
    click_tracking: domain.clickTracking,
    tls: domain.tls
  };
}
var Domains = class {
  constructor(resend2) {
    this.resend = resend2;
  }
  async create(payload, options = {}) {
    return await this.resend.post("/domains", parseDomainToApiOptions(payload), options);
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/domains?${queryString}` : "/domains";
    return await this.resend.get(url);
  }
  async get(id) {
    return await this.resend.get(`/domains/${id}`);
  }
  async update(payload) {
    return await this.resend.patch(`/domains/${payload.id}`, {
      click_tracking: payload.clickTracking,
      open_tracking: payload.openTracking,
      tls: payload.tls,
      capabilities: payload.capabilities
    });
  }
  async remove(id) {
    return await this.resend.delete(`/domains/${id}`);
  }
  async verify(id) {
    return await this.resend.post(`/domains/${id}/verify`);
  }
};
var Attachments$1 = class {
  constructor(resend2) {
    this.resend = resend2;
  }
  async get(options) {
    const { emailId, id } = options;
    return await this.resend.get(`/emails/${emailId}/attachments/${id}`);
  }
  async list(options) {
    const { emailId } = options;
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/emails/${emailId}/attachments?${queryString}` : `/emails/${emailId}/attachments`;
    return await this.resend.get(url);
  }
};
var Attachments = class {
  constructor(resend2) {
    this.resend = resend2;
  }
  async get(options) {
    const { emailId, id } = options;
    return await this.resend.get(`/emails/receiving/${emailId}/attachments/${id}`);
  }
  async list(options) {
    const { emailId } = options;
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/emails/receiving/${emailId}/attachments?${queryString}` : `/emails/receiving/${emailId}/attachments`;
    return await this.resend.get(url);
  }
};
var Receiving = class {
  constructor(resend2) {
    this.resend = resend2;
    this.attachments = new Attachments(resend2);
  }
  async get(id) {
    return await this.resend.get(`/emails/receiving/${id}`);
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/emails/receiving?${queryString}` : "/emails/receiving";
    return await this.resend.get(url);
  }
  async forward(options) {
    const { emailId, to, from } = options;
    const passthrough = options.passthrough !== false;
    const emailResponse = await this.get(emailId);
    if (emailResponse.error)
      return {
        data: null,
        error: emailResponse.error,
        headers: emailResponse.headers
      };
    const email = emailResponse.data;
    const originalSubject = email.subject || "(no subject)";
    if (passthrough)
      return this.forwardPassthrough(email, {
        to,
        from,
        subject: originalSubject
      });
    const forwardSubject = originalSubject.startsWith("Fwd:") ? originalSubject : `Fwd: ${originalSubject}`;
    return this.forwardWrapped(email, {
      to,
      from,
      subject: forwardSubject,
      text: "text" in options ? options.text : void 0,
      html: "html" in options ? options.html : void 0
    });
  }
  async forwardPassthrough(email, options) {
    const { to, from, subject } = options;
    if (!email.raw?.download_url)
      return {
        data: null,
        error: {
          name: "validation_error",
          message: "Raw email content is not available for this email",
          statusCode: 400
        },
        headers: null
      };
    const rawResponse = await fetch(email.raw.download_url);
    if (!rawResponse.ok)
      return {
        data: null,
        error: {
          name: "application_error",
          message: "Failed to download raw email content",
          statusCode: rawResponse.status
        },
        headers: null
      };
    const rawEmailContent = await rawResponse.text();
    const parsed = await PostalMime.parse(rawEmailContent, { attachmentEncoding: "base64" });
    const attachments = parsed.attachments.map((attachment) => {
      const contentId = attachment.contentId ? attachment.contentId.replace(/^<|>$/g, "") : void 0;
      return {
        filename: attachment.filename,
        content: attachment.content.toString(),
        content_type: attachment.mimeType,
        content_id: contentId || void 0
      };
    });
    return await this.resend.post("/emails", {
      from,
      to,
      subject,
      text: parsed.text || void 0,
      html: parsed.html || void 0,
      attachments: attachments.length > 0 ? attachments : void 0
    });
  }
  async forwardWrapped(email, options) {
    const { to, from, subject, text: text2, html } = options;
    if (!email.raw?.download_url)
      return {
        data: null,
        error: {
          name: "validation_error",
          message: "Raw email content is not available for this email",
          statusCode: 400
        },
        headers: null
      };
    const rawResponse = await fetch(email.raw.download_url);
    if (!rawResponse.ok)
      return {
        data: null,
        error: {
          name: "application_error",
          message: "Failed to download raw email content",
          statusCode: rawResponse.status
        },
        headers: null
      };
    const rawEmailContent = await rawResponse.text();
    return await this.resend.post("/emails", {
      from,
      to,
      subject,
      text: text2,
      html,
      attachments: [{
        filename: "forwarded_message.eml",
        content: Buffer.from(rawEmailContent).toString("base64"),
        content_type: "message/rfc822"
      }]
    });
  }
};
var Emails = class {
  constructor(resend2) {
    this.resend = resend2;
    this.attachments = new Attachments$1(resend2);
    this.receiving = new Receiving(resend2);
  }
  async send(payload, options = {}) {
    return this.create(payload, options);
  }
  async create(payload, options = {}) {
    if (payload.react)
      payload.html = await render(payload.react);
    return await this.resend.post("/emails", parseEmailToApiOptions(payload), options);
  }
  async get(id) {
    return await this.resend.get(`/emails/${id}`);
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/emails?${queryString}` : "/emails";
    return await this.resend.get(url);
  }
  async update(payload) {
    return await this.resend.patch(`/emails/${payload.id}`, { scheduled_at: payload.scheduledAt });
  }
  async cancel(id) {
    return await this.resend.post(`/emails/${id}/cancel`);
  }
};
var Logs = class {
  constructor(resend2) {
    this.resend = resend2;
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/logs?${queryString}` : "/logs";
    return await this.resend.get(url);
  }
  async get(id) {
    return await this.resend.get(`/logs/${id}`);
  }
};
var Segments = class {
  constructor(resend2) {
    this.resend = resend2;
  }
  async create(payload, options = {}) {
    return await this.resend.post("/segments", payload, options);
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/segments?${queryString}` : "/segments";
    return await this.resend.get(url);
  }
  async get(id) {
    return await this.resend.get(`/segments/${id}`);
  }
  async remove(id) {
    return await this.resend.delete(`/segments/${id}`);
  }
};
function getPaginationQueryProperties(options = {}) {
  const query = new URLSearchParams();
  if (options.before)
    query.set("before", options.before);
  if (options.after)
    query.set("after", options.after);
  if (options.limit)
    query.set("limit", options.limit.toString());
  return query.size > 0 ? `?${query.toString()}` : "";
}
function parseVariables(variables) {
  return variables?.map((variable) => ({
    key: variable.key,
    type: variable.type,
    fallback_value: variable.fallbackValue
  }));
}
function parseTemplateToApiOptions(template) {
  return {
    name: "name" in template ? template.name : void 0,
    subject: template.subject,
    html: template.html,
    text: template.text,
    alias: template.alias,
    from: template.from,
    reply_to: template.replyTo,
    variables: parseVariables(template.variables)
  };
}
var ChainableTemplateResult = class {
  constructor(promise, publishFn) {
    this.promise = promise;
    this.publishFn = publishFn;
  }
  then(onfulfilled, onrejected) {
    return this.promise.then(onfulfilled, onrejected);
  }
  async publish() {
    const { data, error } = await this.promise;
    if (error)
      return {
        data: null,
        headers: null,
        error
      };
    return this.publishFn(data.id);
  }
};
var Templates = class {
  constructor(resend2) {
    this.resend = resend2;
  }
  create(payload) {
    return new ChainableTemplateResult(this.performCreate(payload), this.publish.bind(this));
  }
  async performCreate(payload) {
    if (payload.react) {
      if (!this.renderAsync)
        try {
          const { renderAsync } = await import("@react-email/render");
          this.renderAsync = renderAsync;
        } catch {
          throw new Error("Failed to render React component. Make sure to install `@react-email/render`");
        }
      payload.html = await this.renderAsync(payload.react);
    }
    return this.resend.post("/templates", parseTemplateToApiOptions(payload));
  }
  async remove(identifier) {
    return await this.resend.delete(`/templates/${identifier}`);
  }
  async get(identifier) {
    return await this.resend.get(`/templates/${identifier}`);
  }
  async list(options = {}) {
    return this.resend.get(`/templates${getPaginationQueryProperties(options)}`);
  }
  duplicate(identifier) {
    return new ChainableTemplateResult(this.resend.post(`/templates/${identifier}/duplicate`), this.publish.bind(this));
  }
  async publish(identifier) {
    return await this.resend.post(`/templates/${identifier}/publish`);
  }
  async update(identifier, payload) {
    return await this.resend.patch(`/templates/${identifier}`, parseTemplateToApiOptions(payload));
  }
};
var Topics = class {
  constructor(resend2) {
    this.resend = resend2;
  }
  async create(payload) {
    const { defaultSubscription, ...body } = payload;
    return await this.resend.post("/topics", {
      ...body,
      default_subscription: defaultSubscription
    });
  }
  async list() {
    return await this.resend.get("/topics");
  }
  async get(id) {
    if (!id)
      return {
        data: null,
        headers: null,
        error: {
          message: "Missing `id` field.",
          statusCode: null,
          name: "missing_required_field"
        }
      };
    return await this.resend.get(`/topics/${id}`);
  }
  async update(payload) {
    if (!payload.id)
      return {
        data: null,
        headers: null,
        error: {
          message: "Missing `id` field.",
          statusCode: null,
          name: "missing_required_field"
        }
      };
    return await this.resend.patch(`/topics/${payload.id}`, payload);
  }
  async remove(id) {
    if (!id)
      return {
        data: null,
        headers: null,
        error: {
          message: "Missing `id` field.",
          statusCode: null,
          name: "missing_required_field"
        }
      };
    return await this.resend.delete(`/topics/${id}`);
  }
};
var Webhooks = class {
  constructor(resend2) {
    this.resend = resend2;
  }
  async create(payload, options = {}) {
    return await this.resend.post("/webhooks", payload, options);
  }
  async get(id) {
    return await this.resend.get(`/webhooks/${id}`);
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/webhooks?${queryString}` : "/webhooks";
    return await this.resend.get(url);
  }
  async update(id, payload) {
    return await this.resend.patch(`/webhooks/${id}`, payload);
  }
  async remove(id) {
    return await this.resend.delete(`/webhooks/${id}`);
  }
  verify(payload) {
    return new import_svix.Webhook(payload.webhookSecret).verify(payload.payload, {
      "svix-id": payload.headers.id,
      "svix-timestamp": payload.headers.timestamp,
      "svix-signature": payload.headers.signature
    });
  }
};
var defaultBaseUrl = "https://api.resend.com";
var defaultUserAgent = `resend-node:${version2}`;
var baseUrl = typeof process !== "undefined" && process.env ? process.env.RESEND_BASE_URL || defaultBaseUrl : defaultBaseUrl;
var userAgent = typeof process !== "undefined" && process.env ? process.env.RESEND_USER_AGENT || defaultUserAgent : defaultUserAgent;
var Resend = class {
  constructor(key) {
    this.key = key;
    this.apiKeys = new ApiKeys(this);
    this.segments = new Segments(this);
    this.audiences = this.segments;
    this.batch = new Batch(this);
    this.broadcasts = new Broadcasts(this);
    this.contacts = new Contacts(this);
    this.contactProperties = new ContactProperties(this);
    this.domains = new Domains(this);
    this.emails = new Emails(this);
    this.logs = new Logs(this);
    this.webhooks = new Webhooks(this);
    this.templates = new Templates(this);
    this.topics = new Topics(this);
    if (!key) {
      if (typeof process !== "undefined" && process.env)
        this.key = process.env.RESEND_API_KEY;
      if (!this.key)
        throw new Error('Missing API key. Pass it to the constructor `new Resend("re_123")`');
    }
    this.headers = new Headers({
      Authorization: `Bearer ${this.key}`,
      "User-Agent": userAgent,
      "Content-Type": "application/json"
    });
  }
  async fetchRequest(path2, options = {}) {
    try {
      const response = await fetch(`${baseUrl}${path2}`, options);
      if (!response.ok)
        try {
          const rawError = await response.text();
          return {
            data: null,
            error: JSON.parse(rawError),
            headers: Object.fromEntries(response.headers.entries())
          };
        } catch (err) {
          if (err instanceof SyntaxError)
            return {
              data: null,
              error: {
                name: "application_error",
                statusCode: response.status,
                message: "Internal server error. We are unable to process your request right now, please try again later."
              },
              headers: Object.fromEntries(response.headers.entries())
            };
          const error = {
            message: response.statusText,
            statusCode: response.status,
            name: "application_error"
          };
          if (err instanceof Error)
            return {
              data: null,
              error: {
                ...error,
                message: err.message
              },
              headers: Object.fromEntries(response.headers.entries())
            };
          return {
            data: null,
            error,
            headers: Object.fromEntries(response.headers.entries())
          };
        }
      return {
        data: await response.json(),
        error: null,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch {
      return {
        data: null,
        error: {
          name: "application_error",
          statusCode: null,
          message: "Unable to fetch data. The request could not be resolved."
        },
        headers: null
      };
    }
  }
  async post(path2, entity, options = {}) {
    const headers = new Headers(this.headers);
    if (options.headers)
      for (const [key, value] of new Headers(options.headers).entries())
        headers.set(key, value);
    if (options.idempotencyKey)
      headers.set("Idempotency-Key", options.idempotencyKey);
    const requestOptions = {
      method: "POST",
      body: JSON.stringify(entity),
      ...options,
      headers
    };
    return this.fetchRequest(path2, requestOptions);
  }
  async get(path2, options = {}) {
    const headers = new Headers(this.headers);
    if (options.headers)
      for (const [key, value] of new Headers(options.headers).entries())
        headers.set(key, value);
    const requestOptions = {
      method: "GET",
      ...options,
      headers
    };
    return this.fetchRequest(path2, requestOptions);
  }
  async put(path2, entity, options = {}) {
    const headers = new Headers(this.headers);
    if (options.headers)
      for (const [key, value] of new Headers(options.headers).entries())
        headers.set(key, value);
    const requestOptions = {
      method: "PUT",
      body: JSON.stringify(entity),
      ...options,
      headers
    };
    return this.fetchRequest(path2, requestOptions);
  }
  async patch(path2, entity, options = {}) {
    const headers = new Headers(this.headers);
    if (options.headers)
      for (const [key, value] of new Headers(options.headers).entries())
        headers.set(key, value);
    const requestOptions = {
      method: "PATCH",
      body: JSON.stringify(entity),
      ...options,
      headers
    };
    return this.fetchRequest(path2, requestOptions);
  }
  async delete(path2, query) {
    const requestOptions = {
      method: "DELETE",
      body: JSON.stringify(query),
      headers: this.headers
    };
    return this.fetchRequest(path2, requestOptions);
  }
};

// services/email.ts
var resend = null;
var FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@phishphantasy.live";
var FROM_NAME = process.env.RESEND_FROM_NAME || "PhishDraft";
var FROM_ADDRESS = `${FROM_NAME} <${FROM_EMAIL}>`;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn("RESEND_API_KEY not set \u2014 email sending disabled");
}
async function sendPasswordResetEmail(email, resetToken, baseUrl2) {
  if (!resend) {
    console.warn("sendPasswordResetEmail: Resend not configured, skipping");
    return false;
  }
  const resetUrl = `${baseUrl2}/reset-password/${resetToken}`;
  console.log(`Sending password reset to ${email} from ${FROM_ADDRESS}`);
  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "PhishDraft \u2014 Password Reset",
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 32px; border-radius: 8px;">
  <h2 style="color: #22c55e; margin-top: 0;">Password Reset</h2>
  <p>You requested a password reset for your PhishDraft account.</p>
  <p style="margin: 24px 0;">
    <a href="${resetUrl}"
       style="background: #22c55e; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
      Reset My Password
    </a>
  </p>
  <p style="color: #aaa; font-size: 13px;">Or paste this link in your browser:<br>
    <a href="${resetUrl}" style="color: #22c55e;">${resetUrl}</a>
  </p>
  <p style="color: #666; font-size: 12px; margin-top: 24px; border-top: 1px solid #222; padding-top: 16px;">
    This link expires in 1 hour. If you didn't request a reset, ignore this email.
  </p>
</div>
      `
    });
    if (error) {
      console.error("Resend email error:", JSON.stringify(error));
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend email exception:", error?.message ?? error);
    return false;
  }
}

// routes.ts
var import_nanoid = require("nanoid");
var import_bcrypt3 = __toESM(require("bcrypt"));

// routes/admin.ts
var import_express = require("express");

// controllers/adminController.ts
init_storage_db();
var import_bcrypt2 = __toESM(require("bcrypt"));
var createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }
    const hashedPassword = await import_bcrypt2.default.hash(password, 10);
    const user = await storage.createUser({ username, email, password: hashedPassword, role: role || "user" });
    res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    console.error("Admin createUser error:", error);
    res.status(500).json({ message: error.message || "Failed to create user" });
  }
};
var getUsers = async (req, res) => {
  try {
    const users2 = await storage.getAllUsers();
    res.json(users2.map((u) => ({ id: u.id, username: u.username, email: u.email, role: u.role, totalPoints: u.totalPoints, createdAt: u.createdAt })));
  } catch (error) {
    console.error("Admin getUsers error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
var updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ message: "Role is required" });
    }
    const user = await storage.updateUserRole(userId, role);
    res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
  } catch (error) {
    console.error("Admin updateUser error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};
var deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    await storage.deleteUser(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Admin deleteUser error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// routes/admin.ts
init_storage_db();
init_phish_api();
init_cache_service();
init_db();
init_schema();
var import_drizzle_orm3 = require("drizzle-orm");

// middleware/admin.ts
init_storage_db();
var getSessionUserId = (req) => {
  return req.session?.user?.id || req.session?.userId || null;
};
var requireSuperAdmin = async (req, res, next) => {
  try {
    const userId = getSessionUserId(req);
    if (!userId)
      return res.status(401).json({ message: "Not authenticated" });
    const isSuperAdmin = await storage.isUserSuperAdmin(userId);
    if (!isSuperAdmin)
      return res.status(403).json({ message: "Super admin access required" });
    next();
  } catch (error) {
    console.error("Super admin middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
var requireLeagueAdmin = async (req, res, next) => {
  try {
    const userId = getSessionUserId(req);
    if (!userId)
      return res.status(401).json({ message: "Not authenticated" });
    if (await storage.isUserAdmin(userId))
      return next();
    const leagueId = req.params.leagueId || req.body.leagueId;
    if (!leagueId)
      return res.status(400).json({ message: "League ID required" });
    const isLeagueAdmin = await storage.isUserLeagueAdmin(userId, parseInt(leagueId));
    if (!isLeagueAdmin)
      return res.status(403).json({ message: "League admin access required" });
    next();
  } catch (error) {
    console.error("League admin middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// routes/admin.ts
var router = (0, import_express.Router)();
router.post("/users", createUser);
router.get("/users", getUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/concerts", async (_req, res) => {
  try {
    const shows = await storage.getCachedShows();
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const sorted = shows.filter((s) => {
      const d = s.showDate instanceof Date ? s.showDate : new Date(s.showDate);
      return d.toISOString().split("T")[0] < todayStr;
    }).sort((a, b) => new Date(b.showDate).getTime() - new Date(a.showDate).getTime());
    const seenDates = /* @__PURE__ */ new Set();
    const deduped = sorted.filter((s) => {
      const dateKey = (s.showDate instanceof Date ? s.showDate : new Date(s.showDate)).toISOString().split("T")[0];
      if (seenDates.has(dateKey))
        return false;
      seenDates.add(dateKey);
      return true;
    });
    res.json(deduped.map((s) => ({
      id: s.id,
      date: (s.showDate instanceof Date ? s.showDate : new Date(s.showDate)).toISOString().split("T")[0],
      venue: s.venue,
      city: s.city,
      state: s.state
    })));
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to fetch concerts" });
  }
});
router.post("/refresh-shows", async (_req, res) => {
  try {
    await cacheService.getCachedShows(true);
    res.json({ message: "Shows cache refreshed successfully" });
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to refresh shows cache" });
  }
});
router.get("/leagues", async (_req, res) => {
  try {
    const leagues2 = await storage.getAllLeagues();
    res.json(leagues2);
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to fetch leagues" });
  }
});
router.get("/shows/:concertId/league/:leagueId", async (req, res) => {
  try {
    const concertId = parseInt(req.params.concertId);
    const leagueId = parseInt(req.params.leagueId);
    const shows = await storage.getCachedShows();
    const show = shows.find((s) => s.id === concertId);
    if (!show)
      return res.status(404).json({ message: "Show not found" });
    const showDate = new Date(show.showDate).toISOString().split("T")[0];
    const tracks = await phishApi.getSetlist(showDate);
    if (!tracks || tracks.length === 0) {
      return res.json({ concert: { venue: show.venue, city: show.city, date: show.showDate }, songPerformances: [] });
    }
    const drafted = await db.select({ songId: draftedSongs.songId, userId: draftedSongs.userId }).from(draftedSongs).where((0, import_drizzle_orm3.eq)(draftedSongs.leagueId, leagueId));
    const songIds = [...new Set(drafted.map((d) => d.songId).filter(Boolean))];
    const userIds = [...new Set(drafted.map((d) => d.userId).filter(Boolean))];
    const [songRows, userRows] = await Promise.all([
      songIds.length ? db.select({ id: songs.id, title: songs.title }).from(songs).where((0, import_drizzle_orm3.inArray)(songs.id, songIds)) : [],
      userIds.length ? db.select({ id: users.id, username: users.username }).from(users).where((0, import_drizzle_orm3.inArray)(users.id, userIds)) : []
    ]);
    const songMap = new Map(songRows.map((s) => [s.id, s.title]));
    const userMap = new Map(userRows.map((u) => [u.id, u.username]));
    const draftersByTitle = {};
    const titleToSongId = {};
    for (const d of drafted) {
      if (!d.songId || !d.userId)
        continue;
      const title = songMap.get(d.songId);
      const username = userMap.get(d.userId);
      if (!title || !username)
        continue;
      const key = title.toLowerCase();
      if (!draftersByTitle[key])
        draftersByTitle[key] = [];
      draftersByTitle[key].push({ userId: d.userId, username });
      titleToSongId[key] = d.songId;
    }
    const firstPositionBySet = {};
    for (const track of tracks) {
      const setKey = track.set || "Set 1";
      const pos = track.position || 0;
      if (!(setKey in firstPositionBySet) || pos < firstPositionBySet[setKey]) {
        firstPositionBySet[setKey] = pos;
      }
    }
    const songPerformances2 = tracks.map((track, idx) => {
      const title = track.song || track.title || "";
      const draftedBy = draftersByTitle[title.toLowerCase()] || [];
      const setKey = track.set || "Set 1";
      const isEncore = track.isEncore || setKey.toLowerCase().includes("encore");
      const isSetOpener = !isEncore && track.position === firstPositionBySet[setKey];
      const durationSeconds = track.duration ? Math.round(track.duration / 1e3) : 0;
      return {
        id: idx,
        song: { title, id: titleToSongId[title.toLowerCase()] },
        setNumber: setKey,
        position: track.position || idx + 1,
        isSetOpener,
        isEncore,
        durationSeconds,
        draftedBy
      };
    });
    res.json({
      concert: { venue: show.venue, city: show.city, state: show.state, date: show.showDate },
      songPerformances: songPerformances2
    });
  } catch (e) {
    console.error("Error fetching admin show data:", e);
    res.status(500).json({ message: e.message || "Failed to fetch show data" });
  }
});
router.post("/adjustments", requireLeagueAdmin, async (req, res) => {
  try {
    const { leagueId, concertId, songId, userId, originalPoints, adjustedPoints, reason } = req.body;
    if (!leagueId || !concertId || !songId || !userId) {
      return res.status(400).json({ message: "leagueId, concertId, songId, userId are required" });
    }
    const adjustment = await storage.createPointAdjustment({
      leagueId,
      concertId,
      songId,
      userId,
      originalPoints: originalPoints ?? 0,
      adjustedPoints: adjustedPoints ?? 0,
      reason: reason || "",
      adjustedBy: req.session.userId
    });
    res.json(adjustment);
  } catch (e) {
    console.error("Error saving adjustment:", e);
    res.status(500).json({ message: e.message || "Failed to save adjustment" });
  }
});
router.get("/adjustments/league/:leagueId", async (req, res) => {
  try {
    const leagueId = parseInt(req.params.leagueId);
    const concertId = req.query.concertId ? parseInt(req.query.concertId) : void 0;
    const userId = req.session?.user?.id || req.session?.userId;
    if (!userId)
      return res.status(401).json({ message: "Not authenticated" });
    const canAccess = await storage.isUserAdmin(userId) || await storage.isUserLeagueAdmin(userId, leagueId);
    if (!canAccess)
      return res.status(403).json({ message: "Not authorized" });
    const adjustments = await storage.getPointAdjustments(leagueId, concertId);
    res.json(adjustments);
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to fetch adjustments" });
  }
});
router.delete("/adjustments/:id", requireLeagueAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ message: "Invalid id" });
    await db.delete(pointAdjustments).where((0, import_drizzle_orm3.eq)(pointAdjustments.id, id));
    res.json({ message: "Adjustment deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to delete adjustment" });
  }
});
router.get("/my-leagues", async (req, res) => {
  try {
    const userId = req.session?.user?.id || req.session?.userId;
    if (!userId)
      return res.status(401).json({ message: "Not authenticated" });
    const allLeagues = await storage.getAllLeagues();
    const accessible = await Promise.all(
      allLeagues.map(async (l) => {
        const canManage = await storage.isUserAdmin(userId) || await storage.isUserLeagueAdmin(userId, l.id);
        return canManage ? l : null;
      })
    );
    res.json(accessible.filter(Boolean));
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to fetch leagues" });
  }
});
router.get("/leagues/:id/members", async (req, res) => {
  try {
    const userId = req.session?.user?.id || req.session?.userId;
    if (!userId)
      return res.status(401).json({ message: "Not authenticated" });
    const leagueId = parseInt(req.params.id);
    const canAccess = await storage.isUserAdmin(userId) || await storage.isUserLeagueAdmin(userId, leagueId);
    if (!canAccess)
      return res.status(403).json({ message: "Not authorized" });
    const members = await storage.getLeagueMembers(leagueId);
    res.json(members.map((m) => ({
      id: m.id,
      userId: m.userId,
      username: m.user?.username,
      role: m.role,
      joinedAt: m.joinedAt,
      totalPoints: m.user?.totalPoints ?? 0
    })));
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to fetch members" });
  }
});
router.delete("/leagues/:id/members/:userId", async (req, res) => {
  try {
    const requestingUserId = req.session?.user?.id || req.session?.userId;
    if (!requestingUserId)
      return res.status(401).json({ message: "Not authenticated" });
    const leagueId = parseInt(req.params.id);
    const canAccess = await storage.isUserAdmin(requestingUserId) || await storage.isUserLeagueAdmin(requestingUserId, leagueId);
    if (!canAccess)
      return res.status(403).json({ message: "Not authorized" });
    const targetUserId = parseInt(req.params.userId);
    await db.delete(leagueMembers).where(
      (0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(leagueMembers.leagueId, leagueId), (0, import_drizzle_orm3.eq)(leagueMembers.userId, targetUserId))
    );
    res.json({ message: "Member removed from league" });
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to remove member" });
  }
});
router.post("/leagues/:id/members", async (req, res) => {
  try {
    const requestingUserId = req.session?.user?.id || req.session?.userId;
    if (!requestingUserId)
      return res.status(401).json({ message: "Not authenticated" });
    const leagueId = parseInt(req.params.id);
    const canAccess = await storage.isUserAdmin(requestingUserId) || await storage.isUserLeagueAdmin(requestingUserId, leagueId);
    if (!canAccess)
      return res.status(403).json({ message: "Not authorized" });
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ message: "userId required" });
    const user = await storage.getUser(parseInt(userId));
    if (!user)
      return res.status(404).json({ message: "User not found" });
    await storage.joinLeague(parseInt(userId), leagueId);
    res.json({ message: `${user.username} added to league`, username: user.username, userId: user.id });
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to add member" });
  }
});
router.put("/users/:id/role", requireSuperAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    if (!["user", "admin", "superadmin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const updated = await storage.updateUserRole(userId, role);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message || "Failed to update role" });
  }
});
router.get("/debug/player", async (req, res) => {
  try {
    const username = String(req.query.username || "");
    const leagueId = req.query.leagueId ? parseInt(req.query.leagueId) : null;
    if (!username)
      return res.status(400).json({ message: "username query param required" });
    const [u] = await db.select({ id: users.id, username: users.username, totalPoints: users.totalPoints }).from(users).where((0, import_drizzle_orm3.eq)(users.username, username)).limit(1);
    if (!u)
      return res.status(404).json({ message: `User '${username}' not found` });
    if (!leagueId) {
      return res.json({ user: u, note: "add &leagueId=XX to see drafted songs" });
    }
    const rows = await db.select({
      draftedSongId: draftedSongs.id,
      songId: draftedSongs.songId,
      points: draftedSongs.points,
      songTitle: songs.title
    }).from(draftedSongs).leftJoin(songs, (0, import_drizzle_orm3.eq)(draftedSongs.songId, songs.id)).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(draftedSongs.leagueId, leagueId), (0, import_drizzle_orm3.eq)(draftedSongs.userId, u.id)));
    res.json({
      user: u,
      leagueId,
      totalDraftedPoints: rows.reduce((s, r) => s + (r.points ?? 0), 0),
      songCount: rows.length,
      songs: rows.map((r) => ({
        draftedSongId: r.draftedSongId,
        songId: r.songId,
        songTitle: r.songTitle ?? "(NOT FOUND IN songs TABLE \u2014 wrong ID namespace)",
        points: r.points ?? 0
      }))
    });
  } catch (e) {
    res.status(500).json({ message: e.message || "Debug query failed" });
  }
});
var admin_default = router;

// routes.ts
init_cache_service();
init_db();
var import_drizzle_orm4 = require("drizzle-orm");
var serverAutoDraftEnabled = /* @__PURE__ */ new Set();
var serverAutoDraftRegistry = /* @__PURE__ */ new Map();
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/version", (_req, res) => res.json({ build: "2026-04-24-v3" }));
  app2.use("/api/admin", admin_default);
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, username: user.username, totalPoints: user.totalPoints });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/tours", async (req, res) => {
    try {
      const tours2 = await storage.getTours();
      res.json(tours2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tours" });
    }
  });
  app2.get("/api/tours/active", async (req, res) => {
    try {
      const activeTour = await storage.getActiveTour();
      if (!activeTour) {
        return res.status(404).json({ message: "No active tour found" });
      }
      res.json(activeTour);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active tour" });
    }
  });
  app2.get("/api/tours/:id", async (req, res) => {
    try {
      const tourId = parseInt(req.params.id);
      const tour = await storage.getTour(tourId);
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      res.json(tour);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tour" });
    }
  });
  app2.post("/api/tours", async (req, res) => {
    try {
      const tourData = insertTourSchema.parse(req.body);
      const tour = await storage.createTour(tourData);
      res.json(tour);
    } catch (error) {
      res.status(400).json({ message: "Invalid tour data" });
    }
  });
  app2.get("/api/leagues", requireAuth, async (req, res) => {
    try {
      const { tourId, public: isPublic } = req.query;
      if (isPublic === "true") {
        const leagueList = await storage.getPublicLeagues(tourId ? parseInt(tourId) : void 0);
        const withCounts = await Promise.all(leagueList.map(async (l) => {
          const members = await storage.getLeagueMembers(l.id);
          return { ...l, memberCount: members.length };
        }));
        res.json(withCounts);
      } else {
        const userId = req.userId;
        if (!userId) {
          return res.status(401).json({ message: "User not authenticated" });
        }
        const leagueList = await storage.getUserLeagues(userId);
        const withCounts = await Promise.all(leagueList.map(async (l) => {
          const members = await storage.getLeagueMembers(l.id);
          return { ...l, memberCount: members.length };
        }));
        res.json(withCounts);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leagues" });
    }
  });
  app2.post("/api/leagues", async (req, res) => {
    try {
      const body = { ...req.body };
      if (body.seasonStartDate)
        body.seasonStartDate = new Date(body.seasonStartDate);
      if (body.seasonEndDate)
        body.seasonEndDate = new Date(body.seasonEndDate);
      const leagueData = insertLeagueSchema.partial({ tourId: true, seasonStartDate: true, seasonEndDate: true }).parse(body);
      const { ownerId } = req.body;
      if (!ownerId) {
        return res.status(400).json({ message: "Owner ID required" });
      }
      const league = await storage.createLeague({ ...leagueData, ownerId });
      res.json(league);
    } catch (error) {
      console.error("League creation error:", JSON.stringify(error?.errors ?? error?.message ?? error));
      res.status(400).json({ message: "Invalid league data", detail: error?.errors ?? error?.message });
    }
  });
  app2.get("/api/leagues/:id", requireAuth, async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const league = await storage.getLeague(leagueId);
      if (!league) {
        return res.status(404).json({ message: "League not found" });
      }
      res.json(league);
    } catch (error) {
      console.error("Error fetching league:", error);
      res.status(500).json({ message: "Failed to fetch league" });
    }
  });
  app2.patch("/api/leagues/:id", requireAuth, async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const updates = { ...req.body };
      if (updates.seasonStartDate !== void 0) {
        updates.seasonStartDate = !updates.seasonStartDate || updates.seasonStartDate === "null" ? null : new Date(updates.seasonStartDate);
      }
      if (updates.seasonEndDate !== void 0) {
        updates.seasonEndDate = !updates.seasonEndDate || updates.seasonEndDate === "null" ? null : new Date(updates.seasonEndDate);
      }
      if (updates.draftDate !== void 0) {
        updates.draftDate = !updates.draftDate || updates.draftDate === "null" ? null : new Date(updates.draftDate);
      }
      const league = await storage.getLeague(leagueId);
      if (!league) {
        return res.status(404).json({ message: "League not found" });
      }
      const userId = req.userId;
      const user = await storage.getUser(userId);
      const userRole = user?.role;
      if (league.ownerId !== userId && userRole !== "admin") {
        return res.status(403).json({ message: "Not authorized to update this league" });
      }
      const updatedLeague = await storage.updateLeague(leagueId, updates);
      res.json(updatedLeague);
    } catch (error) {
      console.error("Error updating league:", error);
      res.status(500).json({ message: "Failed to update league" });
    }
  });
  app2.delete("/api/leagues/:id", requireAuth, async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const league = await storage.getLeague(leagueId);
      if (!league) {
        return res.status(404).json({ message: "League not found" });
      }
      const userId = req.userId;
      const user = await storage.getUser(userId);
      const userRole = user?.role;
      if (league.ownerId !== userId && userRole !== "admin" && userRole !== "superadmin") {
        return res.status(403).json({ message: "Not authorized to delete this league" });
      }
      await storage.deleteLeague(leagueId);
      res.json({ message: "League deleted successfully" });
    } catch (error) {
      console.error("Error deleting league:", error);
      res.status(500).json({ message: "Failed to delete league" });
    }
  });
  app2.post("/api/leagues/join/:inviteCode", requireAuth, async (req, res) => {
    try {
      const inviteCode = req.params.inviteCode;
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const success = await storage.joinLeagueByInvite(inviteCode, userId);
      if (success) {
        res.json({ message: "Successfully joined league" });
      } else {
        res.status(400).json({ message: "Invalid invite code or unable to join league" });
      }
    } catch (error) {
      console.error("Error joining league by invite:", error);
      res.status(500).json({ message: "Failed to join league" });
    }
  });
  app2.post("/api/leagues/:id/join", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      await storage.joinLeague(userId, leagueId);
      res.json({ message: "Successfully joined league" });
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to join league" });
    }
  });
  app2.post("/api/leagues/:id/invite", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const createdBy = req.session?.user?.id || req.session?.userId || req.body?.createdBy;
      if (!createdBy)
        return res.status(401).json({ message: "Not authenticated" });
      const inviteCode = (0, import_nanoid.nanoid)(10);
      const { leagueInvites: leagueInvites2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      await db.insert(leagueInvites2).values({
        leagueId,
        inviteCode,
        createdBy,
        maxUses: req.body?.maxUses ?? null,
        isActive: true
      });
      res.json({ inviteCode, joinUrl: `/join/${inviteCode}` });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to create invite" });
    }
  });
  app2.get("/api/leagues/:id", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const league = await storage.getLeague(leagueId);
      if (!league) {
        return res.status(404).json({ message: "League not found" });
      }
      res.json(league);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch league" });
    }
  });
  app2.get("/api/leagues/:id/members", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const members = await storage.getLeagueMembers(leagueId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch league members" });
    }
  });
  app2.get("/api/leagues/:id/standings", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const standings = await storage.getLeagueStandings(leagueId);
      res.json(standings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch standings" });
    }
  });
  app2.get("/api/leagues/:id/export-picks", requireAuth, async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const userId = req.userId;
      const league = await storage.getLeague(leagueId);
      if (!league) {
        return res.status(404).json({ message: "League not found" });
      }
      const members = await storage.getLeagueMembers(leagueId);
      const isMember = members.some((m) => m.userId === userId);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this league's data" });
      }
      const allPicks = [];
      for (const member of members) {
        if (!member.user || !member.user.id) {
          console.warn("Member missing user data:", member);
          continue;
        }
        const draftedSongs2 = await storage.getDraftedSongs(member.user.id, leagueId);
        for (const pick of draftedSongs2) {
          allPicks.push({
            username: member.user.username || "Unknown User",
            songTitle: pick.song?.title || "Unknown",
            category: pick.song?.category || "Unknown",
            plays24Months: pick.song?.plays24Months || 0,
            totalPlays: pick.song?.totalPlays || 0,
            points: pick.points || 0,
            draftedAt: pick.draftedAt ? new Date(pick.draftedAt).toLocaleString() : "N/A"
          });
        }
      }
      const escapeCSV = (value) => {
        let sanitized = value;
        sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");
        sanitized = sanitized.trim();
        const dangerousChars = /^[=+\-@]/;
        if (dangerousChars.test(sanitized)) {
          sanitized = "'" + sanitized;
        }
        sanitized = sanitized.replace(/"/g, '""');
        return `"${sanitized}"`;
      };
      const csvHeaders = "Username,Song Title,Category,Plays (24 months),Total Plays,Points,Drafted At\n";
      const csvRows = allPicks.length > 0 ? allPicks.map(
        (pick) => `${escapeCSV(pick.username)},${escapeCSV(pick.songTitle)},${escapeCSV(pick.category)},${pick.plays24Months},${pick.totalPlays},${pick.points},${escapeCSV(pick.draftedAt)}`
      ).join("\n") : "";
      const csv = csvHeaders + csvRows;
      let safeFilename = league.name.replace(/[^a-z0-9_-]/gi, "_");
      safeFilename = safeFilename.replace(/^_+|_+$/g, "") || "league";
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}_picks_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv"`);
      res.send(csv);
    } catch (error) {
      console.error("Error exporting picks:", error);
      res.status(500).json({ message: "Failed to export picks" });
    }
  });
  app2.get("/api/songs/debug", async (req, res) => {
    try {
      console.log("\u{1F527} DEBUG: Testing direct Phish.net API call...");
      const apiKey = process.env.PHISH_NET_API_KEY;
      if (!apiKey) {
        return res.json({ error: "API key not found" });
      }
      const response = await fetch(`https://api.phish.net/v5/songs.json?apikey=${apiKey}&limit=5`);
      const data = await response.json();
      res.json({
        status: response.status,
        ok: response.ok,
        data,
        dataLength: (data.data || []).length
      });
    } catch (error) {
      res.json({ error: error.message });
    }
  });
  app2.post("/api/cache/refresh", async (req, res) => {
    try {
      console.log("\u{1F504} Force refreshing all caches...");
      await storage.getCachedShows(true);
      await storage.getCachedSongs(true);
      res.json({ message: "Cache refreshed successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/cache/fetch-historical", async (req, res) => {
    console.log("\u{1F3B8} Historical fetch endpoint HIT!");
    try {
      console.log("\u{1F4C5} Fetching historical shows from 2023-2024...");
      const API_KEY = process.env.PHISH_NET_API_KEY || "6F27E04F96EAC8C2C21B";
      const years = [2023, 2024];
      let totalShows = 0;
      let totalSetlists = 0;
      for (const year of years) {
        console.log(`  Fetching ${year}...`);
        const response = await fetch(`https://api.phish.net/v5/shows/showyear/${year}.json?apikey=${API_KEY}`);
        const data = await response.json();
        const shows = data.data || [];
        console.log(`    Found ${shows.length} shows from ${year}`);
        for (const show of shows) {
          try {
            await db.insert(cachedShows).values({
              phishNetId: show.showid || show.showdate,
              showDate: new Date(show.showdate),
              venue: show.venue || "Unknown Venue",
              city: show.city || "Unknown City",
              state: show.state || null,
              country: show.country || "USA",
              tourid: show.tour_id || null,
              setlistdata: show.setlistdata || null,
              isCompleted: new Date(show.showdate) < /* @__PURE__ */ new Date()
            }).onConflictDoNothing();
            totalShows++;
          } catch (e) {
            console.error(`Error inserting show ${show.showdate}:`, e.message);
          }
        }
        const completedShows = shows.filter((s) => new Date(s.showdate) < /* @__PURE__ */ new Date()).slice(-30);
        for (const show of completedShows) {
          try {
            const setlistResponse = await fetch(`https://api.phish.net/v5/setlists/showdate/${show.showdate}.json?apikey=${API_KEY}`);
            const setlistData = await setlistResponse.json();
            const setlist = setlistData.data || [];
            if (setlist.length > 0) {
              const songs2 = setlist.map((s) => s.song || s.title || s.songname).filter(Boolean);
              await db.insert(cachedSetlists).values({
                showDate: show.showdate,
                setlistData: setlist,
                songs: songs2
              }).onConflictDoNothing();
              totalSetlists++;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (e) {
            console.error(`Error fetching setlist for ${show.showdate}`);
          }
        }
      }
      console.log(`\u2705 Cached ${totalShows} shows and ${totalSetlists} setlists`);
      console.log("\u{1F504} Recalculating 24-month play counts...");
      await storage.getCachedSongs(true);
      res.json({
        message: "Historical data cached successfully",
        shows: totalShows,
        setlists: totalSetlists
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/cache/fetch-missing-setlists", async (req, res) => {
    try {
      console.log("\u{1F3B5} Fetching missing setlists...");
      const API_KEY = process.env.PHISH_NET_API_KEY || "6F27E04F96EAC8C2C21B";
      const limit = parseInt(req.body.limit || "50");
      const showsWithoutSetlists = await db.execute(import_drizzle_orm4.sql`
        SELECT TO_CHAR(cs.show_date, 'YYYY-MM-DD') as show_date
        FROM cached_shows cs
        LEFT JOIN cached_setlists csl ON TO_CHAR(cs.show_date, 'YYYY-MM-DD') = csl.show_date
        WHERE cs.is_completed = true 
        AND csl.show_date IS NULL
        ORDER BY cs.show_date DESC
        LIMIT ${limit}
      `);
      console.log(`  Found ${showsWithoutSetlists.rows.length} shows without setlists (fetching up to ${limit})`);
      let fetchedCount = 0;
      for (const row of showsWithoutSetlists.rows) {
        const showDate = row.show_date;
        try {
          const response = await fetch(`https://api.phish.net/v5/setlists/showdate/${showDate}.json?apikey=${API_KEY}`);
          const data = await response.json();
          const setlist = data.data || [];
          if (setlist.length > 0) {
            const songs2 = setlist.map((s) => s.song || s.title || s.songname).filter(Boolean);
            await db.insert(cachedSetlists).values({
              showDate,
              setlistData: setlist,
              songs: songs2
            }).onConflictDoNothing();
            fetchedCount++;
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (e) {
          console.error(`Error fetching setlist for ${showDate}`);
        }
      }
      console.log(`\u2705 Fetched ${fetchedCount} new setlists`);
      console.log("\u{1F504} Recalculating 24-month play counts...");
      await storage.getCachedSongs(true);
      res.json({
        message: `Fetched ${fetchedCount} missing setlists`,
        fetched: fetchedCount,
        remaining: Math.max(0, showsWithoutSetlists.rows.length - fetchedCount)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/songs", async (req, res) => {
    try {
      const leagueId = req.query.leagueId ? parseInt(req.query.leagueId) : null;
      console.log(`\u{1F3B5} Songs API endpoint called with leagueId: ${leagueId}`);
      console.log("\u{1F504} Getting cached songs...");
      const cachedSongs2 = await storage.getCachedSongs();
      const allSongs = cachedSongs2.map((cached) => ({
        id: cached.id,
        title: cached.title,
        category: cached.category,
        rarityScore: cached.rarityScore,
        totalPlays: cached.timesPlayed,
        lastPlayed: cached.lastPlayed,
        plays24Months: cached.plays24Months || 0
      }));
      console.log(`\u{1F4CA} Cache returned ${allSongs.length} songs`);
      if (leagueId) {
        console.log(`\u{1F50D} Filtering for league ${leagueId}`);
        const draftedSongIds = await storage.getDraftedSongIdsForLeague(leagueId);
        const availableSongs = allSongs.filter((song) => !draftedSongIds.includes(song.id));
        console.log(`\u2705 Returning ${availableSongs.length} available songs for league`);
        res.json(availableSongs);
      } else {
        console.log(`\u2705 Returning all ${allSongs.length} songs from cache`);
        res.json(allSongs);
      }
    } catch (error) {
      console.error("\u274C Error fetching cached songs:", error);
      res.status(500).json({ message: "Failed to fetch songs" });
    }
  });
  app2.get("/api/songs/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Search query required" });
      }
      const cachedSongs2 = await storage.getCachedSongs();
      const allSongs = cachedSongs2.map((cached, index2) => ({
        id: index2 + 1,
        title: cached.title,
        category: cached.category,
        rarityScore: cached.rarityScore,
        totalPlays: cached.timesPlayed,
        lastPlayed: cached.lastPlayed,
        plays24Months: cached.plays24Months || 0
      }));
      const filtered = allSongs.filter(
        (song) => song.title.toLowerCase().includes(q.toLowerCase())
      );
      res.json(filtered);
    } catch (error) {
      res.status(500).json({ message: "Failed to search songs" });
    }
  });
  app2.post("/api/leagues/:id/schedule-draft", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const { draftDate, draftRounds, pickTimeLimit } = req.body;
      if (!draftDate) {
        return res.status(400).json({ message: "Draft date is required" });
      }
      await storage.scheduleDraft(
        leagueId,
        new Date(draftDate),
        draftRounds || 10,
        pickTimeLimit || 90
      );
      res.json({ message: "Draft scheduled successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to schedule draft" });
    }
  });
  app2.post("/api/leagues/:id/start-draft", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      await storage.startDraft(leagueId);
      res.json({ message: "Draft started successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to start draft" });
    }
  });
  app2.post("/api/leagues/:id/auto-pick", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const { userId, preferredSongIds } = req.body;
      const league = await storage.getDraftStatus(leagueId);
      if (!league || league.draftStatus !== "active") {
        return res.status(400).json({ message: "Draft is not active" });
      }
      if (league.currentPlayer !== userId) {
        return res.status(400).json({ message: "Not this player's turn" });
      }
      if (Array.isArray(preferredSongIds) && preferredSongIds.length > 0) {
        for (const songId of preferredSongIds) {
          const isDrafted = await storage.isSongDraftedInLeague(songId, leagueId);
          if (!isDrafted) {
            const song = await storage.getSong(songId);
            const pick2 = await storage.makeDraftPick(leagueId, userId, songId, league.pickTimeLimit ?? 90);
            return res.json({ ...pick2, autoPicked: true, fromQueue: true, songTitle: song?.title ?? `Song #${songId}` });
          }
        }
      }
      const available = await storage.getAvailableSongsPlayedLastYear(leagueId);
      if (available.length === 0) {
        return res.status(400).json({ message: "No available songs to auto-pick" });
      }
      const pick = await storage.makeDraftPick(leagueId, userId, available[0].id, league.pickTimeLimit ?? 90);
      res.json({ ...pick, autoPicked: true, fromQueue: false, songTitle: available[0].title });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to auto-pick" });
    }
  });
  app2.get("/api/leagues/:id/player/:userId/songs", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const userId = parseInt(req.params.userId);
      const drafts = await storage.getDraftedSongs(userId, leagueId);
      const sorted = drafts.map((d) => ({
        songTitle: d.song?.title || "Unknown",
        points: d.points ?? 0,
        draftRound: d.draftRound,
        draftPick: d.draftPick
      })).sort((a, b) => b.points - a.points);
      res.json(sorted);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch player songs" });
    }
  });
  app2.get("/api/leagues/:id/setlist", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const date = req.query.date;
      if (!date)
        return res.status(400).json({ message: "date query param required" });
      const tracks = await phishApi.getSetlist(date);
      if (!tracks || tracks.length === 0) {
        return res.json({ date, songPerformances: [] });
      }
      const drafted = await db.select({ songId: draftedSongs.songId, userId: draftedSongs.userId }).from(draftedSongs).where((0, import_drizzle_orm4.eq)(draftedSongs.leagueId, leagueId));
      const draftersByTitle = {};
      for (const d of drafted) {
        if (!d.songId)
          continue;
        const [song] = await db.select().from(songs).where((0, import_drizzle_orm4.eq)(songs.id, d.songId)).limit(1);
        if (!song)
          continue;
        const user = await storage.getUser(d.userId);
        if (!user)
          continue;
        const key = song.title.toLowerCase();
        if (!draftersByTitle[key])
          draftersByTitle[key] = [];
        draftersByTitle[key].push({ userId: user.id, username: user.username });
      }
      const firstPosBySet = {};
      for (const t of tracks) {
        const setKey = t.set || "Set 1";
        const pos = t.position || 0;
        if (!(setKey in firstPosBySet) || pos < firstPosBySet[setKey])
          firstPosBySet[setKey] = pos;
      }
      const songPerformances2 = tracks.map((track, idx) => {
        const title = track.song || track.title || "";
        const setKey = track.set || "Set 1";
        const isEncore = track.isEncore || setKey.toLowerCase().includes("encore");
        const isSetOpener = !isEncore && track.position === firstPosBySet[setKey];
        const durationSeconds = track.duration ? Math.round(track.duration / 1e3) : 0;
        const mins = durationSeconds / 60;
        let points = 1;
        if (isSetOpener)
          points += 1;
        if (isEncore)
          points += 1;
        if (mins >= 20)
          points += 1;
        if (mins >= 30)
          points += 1;
        if (mins >= 40)
          points += 1;
        const draftedBy = draftersByTitle[title.toLowerCase()] || [];
        return {
          id: idx,
          song: { title },
          setNumber: setKey,
          position: track.position || idx + 1,
          isSetOpener,
          isEncore,
          durationSeconds,
          points,
          draftedBy
        };
      });
      res.json({ date, songPerformances: songPerformances2 });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to fetch setlist" });
    }
  });
  app2.post("/api/leagues/:id/score", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      await cacheService.getCachedShows(true);
      const result = await storage.scoreLeague(leagueId);
      res.json({ message: "Scoring complete", shows: result.shows, points: result.points, perUser: result.perUser, unmappedSongIds: result.unmappedSongIds });
    } catch (error) {
      console.error("Score league error:", error);
      res.status(500).json({ message: error.message || "Failed to score league" });
    }
  });
  app2.get("/api/leagues/:id/draft-status", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const league = await storage.getDraftStatus(leagueId);
      if (league?.draftStatus === "active" && league?.currentPlayer) {
        const key = `${leagueId}:${league.currentPlayer}`;
        if (serverAutoDraftEnabled.has(key)) {
          const lastFiredPick = serverAutoDraftRegistry.get(key) ?? -1;
          if (lastFiredPick !== league.currentPick) {
            serverAutoDraftRegistry.set(key, league.currentPick);
            setTimeout(() => {
              storage.getAvailableSongsPlayedLastYear(leagueId).then(async (available) => {
                if (!available.length)
                  return;
                try {
                  const pick = await storage.makeDraftPick(leagueId, league.currentPlayer, available[0].id, league.pickTimeLimit ?? 90);
                  console.log(`[server-auto-draft] Picked "${available[0].title}" for user ${league.currentPlayer} (pick #${league.currentPick}) in league ${leagueId}`);
                } catch (e) {
                  console.warn(`[server-auto-draft] Pick failed for user ${league.currentPlayer}: ${e.message}`);
                }
              });
            }, 500);
          }
        }
      }
      res.json(league);
    } catch (error) {
      res.status(500).json({ message: "Failed to get draft status" });
    }
  });
  app2.get("/api/leagues/:id/draft-order", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const draftOrder = await storage.getDraftOrder(leagueId);
      res.json(draftOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to get draft order" });
    }
  });
  app2.post("/api/leagues/:id/draft-order", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const { userIds } = req.body;
      if (!Array.isArray(userIds)) {
        return res.status(400).json({ message: "userIds must be an array" });
      }
      await storage.setDraftOrder(leagueId, userIds);
      res.json({ message: "Draft order set successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to set draft order" });
    }
  });
  app2.post("/api/leagues/:id/randomize-draft-order", requireAuth, async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const userId = req.userId;
      const league = await storage.getLeague(leagueId);
      if (!league)
        return res.status(404).json({ message: "League not found" });
      const user = await storage.getUser(userId);
      if (league.ownerId !== userId && user?.role !== "admin" && user?.role !== "superadmin") {
        return res.status(403).json({ message: "Owner only" });
      }
      const members = await storage.getLeagueMembers(leagueId);
      const ids = members.map((m) => m.userId);
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      await storage.setDraftOrder(leagueId, ids);
      res.json({ orderedUserIds: ids });
    } catch (err) {
      res.status(500).json({ message: err.message || "Failed to randomize order" });
    }
  });
  app2.get("/api/leagues/:id/draft-picks", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const picks = await storage.getDraftPicks(leagueId);
      res.json(picks);
    } catch (error) {
      res.status(500).json({ message: "Failed to get draft picks" });
    }
  });
  app2.post("/api/admin/leagues/:id/reset-draft", requireAuth, async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const userId = req.userId;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin" && user.role !== "superadmin") {
        return res.status(403).json({ message: "Admin only" });
      }
      await db.delete(draftPicks).where((0, import_drizzle_orm4.eq)(draftPicks.leagueId, leagueId));
      await db.delete(draftedSongs).where((0, import_drizzle_orm4.eq)(draftedSongs.leagueId, leagueId));
      await storage.updateLeague(leagueId, {
        draftStatus: "scheduled",
        currentPick: 1,
        currentRound: 1,
        currentPlayer: null,
        pickDeadline: null
      });
      res.json({ message: `Draft reset for league ${leagueId}` });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to reset draft" });
    }
  });
  app2.post("/api/admin/leagues/:id/reassign-pick", requireAuth, async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const userId = req.userId;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin" && user.role !== "superadmin") {
        return res.status(403).json({ message: "Admin only" });
      }
      const { pickId, newUserId, newSongId } = req.body;
      const [existing] = await db.select().from(draftPicks).where((0, import_drizzle_orm4.eq)(draftPicks.id, pickId)).limit(1);
      if (!existing)
        return res.status(404).json({ message: "Pick not found" });
      await db.update(draftPicks).set({ userId: newUserId, songId: newSongId }).where((0, import_drizzle_orm4.eq)(draftPicks.id, pickId));
      await db.delete(draftedSongs).where(
        import_drizzle_orm4.sql`${draftedSongs.leagueId} = ${leagueId} AND ${draftedSongs.userId} = ${existing.userId} AND ${draftedSongs.songId} = ${existing.songId}`
      );
      await db.insert(draftedSongs).values({
        leagueId,
        userId: newUserId,
        songId: newSongId,
        draftRound: existing.draftRound ?? 1,
        draftPick: existing.pickNumber ?? 1
      }).onConflictDoNothing();
      res.json({ message: `Pick #${existing.pickNumber} reassigned`, pickId, newUserId, newSongId });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to reassign pick" });
    }
  });
  app2.post("/api/admin/leagues/:id/auto-draft/:userId", requireAuth, async (req, res) => {
    try {
      const requestingUserId = req.userId;
      const requester = await storage.getUser(requestingUserId);
      if (!requester || requester.role !== "admin" && requester.role !== "superadmin") {
        return res.status(403).json({ message: "Admin only" });
      }
      const leagueId = req.params.id;
      const targetUserId = req.params.userId;
      const key = `${leagueId}:${targetUserId}`;
      const enable = req.body.enable !== false;
      if (enable) {
        serverAutoDraftEnabled.add(key);
      } else {
        serverAutoDraftEnabled.delete(key);
        serverAutoDraftRegistry.delete(key);
      }
      console.log(`[server-auto-draft] ${enable ? "Enabled" : "Disabled"} for user ${targetUserId} in league ${leagueId}`);
      res.json({ autoDraft: serverAutoDraftEnabled.has(key), leagueId, userId: targetUserId });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to toggle auto-draft" });
    }
  });
  app2.delete("/api/admin/picks/:pickId", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      if (!user || user.role !== "admin" && user.role !== "superadmin") {
        return res.status(403).json({ message: "Admin only" });
      }
      const pickId = parseInt(req.params.pickId);
      const [existing] = await db.select().from(draftPicks).where((0, import_drizzle_orm4.eq)(draftPicks.id, pickId)).limit(1);
      if (!existing)
        return res.status(404).json({ message: "Pick not found" });
      await db.delete(draftPicks).where((0, import_drizzle_orm4.eq)(draftPicks.id, pickId));
      await db.delete(draftedSongs).where(
        import_drizzle_orm4.sql`${draftedSongs.leagueId} = ${existing.leagueId} AND ${draftedSongs.userId} = ${existing.userId} AND ${draftedSongs.songId} = ${existing.songId}`
      );
      res.json({ message: `Pick #${existing.pickNumber} deleted` });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to delete pick" });
    }
  });
  app2.post("/api/admin/leagues/:id/add-pick", requireAuth, async (req, res) => {
    try {
      const adminUserId = req.userId;
      const adminUser = await storage.getUser(adminUserId);
      if (!adminUser || adminUser.role !== "admin" && adminUser.role !== "superadmin") {
        return res.status(403).json({ message: "Admin only" });
      }
      const leagueId = parseInt(req.params.id);
      const { userId, songId } = req.body;
      const { cachedSongs: cachedSongsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { songs: songsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { inArray: inArr } = await import("drizzle-orm");
      const [cs] = await db.select().from(cachedSongsTable).where((0, import_drizzle_orm4.eq)(cachedSongsTable.id, songId)).limit(1);
      if (!cs)
        return res.status(404).json({ message: "Song not found" });
      await db.insert(songsTable).values({
        title: cs.title,
        category: cs.category,
        rarityScore: cs.rarityScore ?? 0,
        totalPlays: cs.timesPlayed ?? 0,
        plays24Months: cs.plays24Months ?? 0
      }).onConflictDoNothing();
      const [song] = await db.select().from(songsTable).where((0, import_drizzle_orm4.eq)(songsTable.title, cs.title)).limit(1);
      if (!song)
        return res.status(500).json({ message: "Failed to resolve song" });
      const league = await storage.getLeague(leagueId);
      const existingPicks = await db.select().from(draftPicks).where((0, import_drizzle_orm4.eq)(draftPicks.leagueId, leagueId));
      const nextPickNum = existingPicks.length > 0 ? Math.max(...existingPicks.map((p) => p.pickNumber ?? 0)) + 1 : 1;
      const [pick] = await db.insert(draftPicks).values({
        leagueId,
        userId,
        songId: song.id,
        pickNumber: nextPickNum,
        round: league?.currentRound ?? 1,
        timeUsed: 0
      }).returning();
      await db.insert(draftedSongs).values({
        leagueId,
        userId,
        songId: song.id,
        draftRound: league?.currentRound ?? 1,
        draftPick: nextPickNum
      }).onConflictDoNothing();
      res.json({ ...pick, songTitle: song.title });
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to add pick" });
    }
  });
  app2.post("/api/leagues/:id/draft-pick", async (req, res) => {
    try {
      const leagueId = parseInt(req.params.id);
      const { userId, songId, timeUsed } = req.body;
      if (!userId || !songId) {
        return res.status(400).json({ message: "userId and songId are required" });
      }
      const league = await storage.getDraftStatus(leagueId);
      if (league?.currentPlayer !== userId) {
        return res.status(400).json({ message: "It's not your turn to pick" });
      }
      const isTaken = await storage.isSongDraftedInLeague(songId, leagueId);
      if (isTaken) {
        return res.status(400).json({ message: "Song already drafted" });
      }
      const pick = await storage.makeDraftPick(leagueId, userId, songId, timeUsed || 0);
      res.json(pick);
    } catch (error) {
      res.status(500).json({ message: error.message || "Failed to make draft pick" });
    }
  });
  app2.get("/api/drafted-songs", async (req, res) => {
    try {
      const userIdStr = req.query.userId;
      const leagueIdStr = req.query.leagueId;
      if (!userIdStr || !leagueIdStr) {
        return res.status(400).json({ message: "User ID and League ID required" });
      }
      const userId = parseInt(userIdStr);
      const leagueId = parseInt(leagueIdStr);
      if (isNaN(userId) || isNaN(leagueId)) {
        return res.status(400).json({ message: "Invalid User ID or League ID" });
      }
      const draftedSongs2 = await storage.getDraftedSongs(userId, leagueId);
      res.json(draftedSongs2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drafted songs" });
    }
  });
  app2.post("/api/draft", async (req, res) => {
    try {
      const draftData = insertDraftedSongSchema.parse(req.body);
      const isSongTaken = await storage.isSongDraftedInLeague(draftData.songId, draftData.leagueId);
      if (isSongTaken) {
        return res.status(400).json({ message: "Song already drafted by another player in this league" });
      }
      const existingDrafts = await storage.getDraftedSongs(draftData.userId, draftData.leagueId);
      const alreadyDraftedByUser = existingDrafts.some((draft) => draft.songId === draftData.songId);
      if (alreadyDraftedByUser) {
        return res.status(400).json({ message: "You have already drafted this song" });
      }
      if (existingDrafts.length >= 10) {
        return res.status(400).json({ message: "Maximum of 10 songs can be drafted" });
      }
      const draftedSong = await storage.draftSong(draftData);
      const song = await storage.getSong(draftData.songId);
      if (song) {
        await storage.createActivity(
          draftData.userId,
          draftData.leagueId,
          "draft",
          `You drafted "${song.title}"`
        );
      }
      res.json(draftedSong);
    } catch (error) {
      console.error("Draft error:", error);
      res.status(400).json({ message: "Failed to draft song" });
    }
  });
  app2.get("/api/concerts", async (req, res) => {
    try {
      const { cacheService: cacheService2 } = await Promise.resolve().then(() => (init_cache_service(), cache_service_exports));
      const cachedShows2 = await cacheService2.getCachedShows();
      console.log(`Fetched ${cachedShows2.length} shows from cache`);
      const concerts2 = await Promise.all(cachedShows2.map(async (show) => {
        const isCompleted = new Date(show.showDate) < /* @__PURE__ */ new Date();
        let setlist = [];
        let setlistData = [];
        if (isCompleted) {
          try {
            const cachedSetlist = await cacheService2.getCachedSetlist(show.showDate.toISOString().split("T")[0]);
            if (cachedSetlist) {
              setlist = Array.isArray(cachedSetlist.songs) ? cachedSetlist.songs : [];
              setlistData = Array.isArray(cachedSetlist.setlistData) ? cachedSetlist.setlistData : [];
            }
          } catch (error) {
            console.error(`Error fetching setlist for ${show.showDate}:`, error);
          }
        }
        return {
          id: show.id,
          tourId: 1,
          date: new Date(show.showDate),
          venue: show.venue,
          city: show.city,
          state: show.state,
          country: show.country,
          setlist,
          setlistData,
          isCompleted
        };
      }));
      res.json(concerts2);
    } catch (error) {
      console.error("Error fetching concerts:", error);
      res.status(500).json({ message: "Failed to fetch concerts" });
    }
  });
  app2.get("/api/shows/:date/setlist", async (req, res) => {
    const { date } = req.params;
    try {
      const r = await fetch(`https://phish.in/api/v2/shows/${date}`, {
        headers: { Accept: "application/json" }
      });
      if (!r.ok)
        return res.status(r.status).json({ message: "Show not found on phish.in" });
      const data = await r.json();
      const rawTracks = data.tracks ?? [];
      const setMap = {};
      for (const t of rawTracks) {
        const key = t.set_name ?? "Set 1";
        if (!setMap[key])
          setMap[key] = [];
        setMap[key].push(t);
      }
      const sets = Object.entries(setMap).map(([setName, tracks]) => {
        const isEncore = setName.toLowerCase().includes("encore");
        const firstPos = Math.min(...tracks.map((t) => t.position ?? 99));
        return {
          setName,
          isEncore,
          songs: tracks.map((t) => ({
            title: t.title,
            position: t.position,
            durationSecs: t.duration ? Math.round(t.duration / 1e3) : 0,
            isOpener: !isEncore && t.position === firstPos,
            isEncore
          }))
        };
      });
      sets.sort((a, b) => {
        if (a.isEncore && !b.isEncore)
          return 1;
        if (!a.isEncore && b.isEncore)
          return -1;
        return a.setName.localeCompare(b.setName);
      });
      res.json({ date, sets });
    } catch (err) {
      console.error("phish.in setlist error:", err);
      res.status(500).json({ message: "Failed to fetch setlist" });
    }
  });
  app2.get("/api/concerts/upcoming", async (req, res) => {
    try {
      const upcomingShows = await phishApi.getUpcomingShows();
      const upcomingConcerts = upcomingShows.map((show) => ({
        id: parseInt(show.showid),
        tourId: 1,
        date: new Date(show.showdate),
        venue: show.venue,
        city: show.city,
        state: show.state,
        country: show.country,
        setlist: [],
        isCompleted: false
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);
      res.json(upcomingConcerts);
    } catch (error) {
      console.error("Error fetching upcoming concerts:", error);
      res.status(500).json({ message: "Failed to fetch upcoming concerts" });
    }
  });
  app2.get("/api/concerts/:id/setlist", async (req, res) => {
    try {
      const showId = req.params.id;
      const { cacheService: cacheService2 } = await Promise.resolve().then(() => (init_cache_service(), cache_service_exports));
      const cachedShows2 = await cacheService2.getCachedShows();
      const show = cachedShows2.find((s) => s.id.toString() === showId);
      if (!show) {
        return res.status(404).json({ message: "Show not found" });
      }
      const showDate = new Date(show.showDate).toISOString().split("T")[0];
      const cachedSetlist = await cacheService2.getCachedSetlist(showDate);
      if (!cachedSetlist) {
        return res.status(404).json({ message: "Setlist not found" });
      }
      res.json(cachedSetlist.setlistData);
    } catch (error) {
      console.error("Error fetching setlist:", error);
      res.status(500).json({ message: "Failed to fetch setlist" });
    }
  });
  app2.post("/api/admin/cache/refresh", async (req, res) => {
    try {
      const { cacheService: cacheService2 } = await Promise.resolve().then(() => (init_cache_service(), cache_service_exports));
      await cacheService2.refreshAllCaches();
      res.json({ message: "All caches refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing caches:", error);
      res.status(500).json({ message: "Failed to refresh caches" });
    }
  });
  app2.post("/api/admin/cache/refresh-songs", async (req, res) => {
    try {
      const { cacheService: cacheService2 } = await Promise.resolve().then(() => (init_cache_service(), cache_service_exports));
      await cacheService2.getCachedSongs(true);
      res.json({ message: "Songs cache refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing songs cache:", error);
      res.status(500).json({ message: "Failed to refresh songs cache" });
    }
  });
  app2.post("/api/admin/cache/refresh-shows", async (req, res) => {
    try {
      const { cacheService: cacheService2 } = await Promise.resolve().then(() => (init_cache_service(), cache_service_exports));
      await cacheService2.getCachedShows(true);
      res.json({ message: "Shows cache refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing shows cache:", error);
      res.status(500).json({ message: "Failed to refresh shows cache" });
    }
  });
  app2.get("/api/admin/cache/stats", async (req, res) => {
    try {
      const { cacheService: cacheService2 } = await Promise.resolve().then(() => (init_cache_service(), cache_service_exports));
      const stats = await cacheService2.getCacheStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting cache stats:", error);
      res.status(500).json({ message: "Failed to get cache stats" });
    }
  });
  app2.get("/api/activities", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId);
      const leagueId = req.query.leagueId ? parseInt(req.query.leagueId) : void 0;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      const activities2 = await storage.getUserActivities(userId, leagueId);
      res.json(activities2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });
  app2.post("/api/performances", async (req, res) => {
    try {
      const performanceData = insertSongPerformanceSchema.parse(req.body);
      const performance = await storage.createSongPerformance(performanceData);
      await storage.calculateAndUpdatePoints(performanceData.concertId);
      res.json(performance);
    } catch (error) {
      res.status(400).json({ message: "Failed to create song performance" });
    }
  });
  app2.get("/api/concerts/:id/performances", async (req, res) => {
    try {
      const concertIdStr = req.params.id;
      const concertId = parseInt(concertIdStr);
      if (isNaN(concertId)) {
        return res.status(400).json({ message: "Invalid concert ID" });
      }
      const performances = await storage.getConcertPerformances(concertId);
      res.json(performances);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch concert performances" });
    }
  });
  app2.get("/api/dashboard", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId);
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const activeTour = await storage.getActiveTour();
      const leagues2 = await storage.getUserLeagues(userId);
      const currentLeague = leagues2[0];
      if (!currentLeague) {
        return res.json({
          user: { id: user.id, username: user.username, totalPoints: user.totalPoints },
          tour: activeTour,
          league: null,
          draftedSongs: [],
          recentActivities: [],
          upcomingConcerts: [],
          leagueStandings: []
        });
      }
      const draftedSongs2 = await storage.getDraftedSongs(userId, currentLeague.id);
      const recentActivities = await storage.getUserActivities(userId, currentLeague.id);
      const recentShows = await phishApi.getRecentShows(20);
      const recentConcerts = recentShows.slice(0, 3).map((show) => ({
        id: parseInt(show.showid),
        tourId: 1,
        date: show.showdate,
        venue: show.venue,
        city: show.city,
        state: show.state,
        country: show.country,
        setlist: [],
        isCompleted: true
      }));
      const upcomingShows = await phishApi.getUpcomingShows();
      const upcomingConcerts = upcomingShows.map((show) => ({
        id: parseInt(show.showid),
        tourId: 1,
        date: show.showdate,
        venue: show.venue,
        city: show.city,
        state: show.state,
        country: show.country,
        setlist: [],
        isCompleted: false
      })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);
      const leagueStandings = await storage.getLeagueStandings(currentLeague.id);
      res.json({
        user: { id: user.id, username: user.username, totalPoints: user.totalPoints },
        tour: activeTour,
        league: currentLeague,
        draftedSongs: draftedSongs2.slice(0, 10),
        // Limit for display
        recentActivities: recentActivities.slice(0, 5),
        recentConcerts,
        // Last 3 completed shows
        upcomingConcerts,
        // Next 3 upcoming shows
        leagueStandings: leagueStandings.slice(0, 10)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      console.log(`forgot-password: user lookup for ${email}: ${user ? `found id=${user.id}` : "not found"}`);
      if (!user) {
        return res.json({ message: "If this email is registered, you will receive a password reset link." });
      }
      const resetToken = (0, import_nanoid.nanoid)(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
      console.log(`forgot-password: saving reset token for user ${user.id}`);
      await storage.createPasswordResetToken({ userId: user.id, token: resetToken, expiresAt });
      console.log(`forgot-password: token saved, calling sendPasswordResetEmail`);
      const baseUrl2 = "https://phishphantasy.live";
      const sent = await sendPasswordResetEmail(email, resetToken, baseUrl2);
      console.log(`forgot-password: sendPasswordResetEmail returned ${sent}`);
      if (!sent) {
        return res.status(500).json({ message: "Failed to send reset email \u2014 please contact support" });
      }
      res.json({ message: "If this email is registered, you will receive a password reset link." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken || resetToken.used || /* @__PURE__ */ new Date() > resetToken.expiresAt) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      const hashedPassword = await import_bcrypt3.default.hash(newPassword, 10);
      await storage.updateUserPassword(resetToken.userId, hashedPassword);
      await storage.markTokenAsUsed(resetToken.id);
      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  app2.use("/api/admin", admin_default);
  const httpServer2 = (0, import_http.createServer)(app2);
  return httpServer2;
}

// index.ts
import_serverless2.neonConfig.webSocketConstructor = import_ws2.default;
var pool2 = new import_serverless2.Pool({
  connectionString: process.env.DATABASE_URL
});
var app = (0, import_express2.default)();
app.set("trust proxy", 1);
app.use((0, import_express2.json)());
app.use((0, import_express2.urlencoded)({ extended: true }));
var PgSession = (0, import_connect_pg_simple2.default)(import_express_session2.default);
app.use(
  (0, import_express_session2.default)({
    store: new PgSession({
      pool: pool2,
      pruneSessionInterval: 0
    }),
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1e3 * 60 * 60 * 24,
      sameSite: "lax"
    }
  })
);
app.get("/health", (_req, res) => res.json({ status: "ok", build: "2026-04-24-v3" }));
app.get("/api/version", (_req, res) => res.json({ build: "2026-04-24-v3" }));
var clientDistPath = process.env.CLIENT_DIST || import_path.default.resolve(process.cwd(), "server/dist/client");
app.use(import_express2.default.static(clientDistPath));
async function runMigrations() {
  const client = await pool2.connect();
  try {
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number text UNIQUE;
      ALTER TABLE leagues ADD COLUMN IF NOT EXISTS pick_deadline timestamptz;
      CREATE TABLE IF NOT EXISTS point_adjustments (
        id serial PRIMARY KEY,
        league_id integer NOT NULL REFERENCES leagues(id),
        concert_id integer NOT NULL,
        song_id integer NOT NULL REFERENCES songs(id),
        user_id integer REFERENCES users(id),
        original_points integer DEFAULT 0,
        adjusted_points integer DEFAULT 0,
        reason text,
        adjusted_by integer NOT NULL REFERENCES users(id),
        created_at timestamptz DEFAULT now()
      );
      ALTER TABLE point_adjustments DROP CONSTRAINT IF EXISTS point_adjustments_concert_id_fkey;
      UPDATE users SET role = 'superadmin' WHERE username = 'mcrowner';
    `);
    console.log("Migrations complete");
  } finally {
    client.release();
  }
}
async function runDraftAutomation() {
  try {
    const { storage: storage2 } = await Promise.resolve().then(() => (init_storage_db(), storage_db_exports));
    const { db: db2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const { leagues: leagues2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { and: and5, eq: eq5, lte, isNotNull: isNotNull2 } = await import("drizzle-orm");
    const now = /* @__PURE__ */ new Date();
    const toStart = await db2.select().from(leagues2).where(
      and5(eq5(leagues2.draftStatus, "scheduled"), isNotNull2(leagues2.draftDate), lte(leagues2.draftDate, now))
    );
    for (const league of toStart) {
      try {
        await storage2.startDraft(league.id);
        console.log(`[DraftAuto] Auto-started draft for league ${league.id}`);
      } catch (e) {
        console.error(`[DraftAuto] Failed to start league ${league.id}:`, e);
      }
    }
    const timedOut = await db2.select().from(leagues2).where(
      and5(eq5(leagues2.draftStatus, "active"), isNotNull2(leagues2.pickDeadline), lte(leagues2.pickDeadline, now))
    );
    for (const league of timedOut) {
      if (!league.currentPlayer)
        continue;
      try {
        const songs2 = await storage2.getAvailableSongsPlayedLastYear(league.id);
        if (songs2.length > 0) {
          await storage2.makeDraftPick(league.id, league.currentPlayer, songs2[0].id, league.pickTimeLimit ?? 90);
          console.log(`[DraftAuto] Auto-picked for player ${league.currentPlayer} in league ${league.id}`);
        }
      } catch (e) {
        console.error(`[DraftAuto] Failed auto-pick for league ${league.id}:`, e);
      }
    }
  } catch (e) {
    console.error("[DraftAuto] Loop error:", e);
  }
}
var httpServer = (0, import_http2.createServer)(app);
runMigrations().then(() => registerRoutes(app)).then(() => {
  setInterval(runDraftAutomation, 3e4);
  app.get("*", (_req, res) => {
    res.sendFile(import_path.default.join(clientDistPath, "index.html"));
  });
  const PORT = process.env.PORT || 1e4;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
