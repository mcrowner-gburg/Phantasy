import express, { json, urlencoded } from "express";
import session from "express-session";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import { createServer } from "http";
import { registerRoutes } from "./routes";

// ---------- NEON WEBSOCKET CONFIG ----------
neonConfig.webSocketConstructor = ws;

// ---------- DATABASE POOL ----------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ---------- EXPRESS APP ----------
const app = express();
app.set("trust proxy", 1);
app.use(json());
app.use(urlencoded({ extended: true }));

// ---------- SESSION SETUP ----------
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      pool,
      pruneSessionInterval: 0,
    }),
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: "lax",
    },
  })
);

// ---------- HEALTH CHECK ----------
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ---------- SERVE FRONTEND ----------
const clientDistPath =
  process.env.CLIENT_DIST || path.resolve(process.cwd(), "server/dist/client");

app.use(express.static(clientDistPath));

// ---------- STARTUP MIGRATIONS ----------
async function runMigrations() {
  const client = await pool.connect();
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
      UPDATE users SET role = 'superadmin' WHERE username = 'mcrowner';
    `);
    console.log("Migrations complete");
  } finally {
    client.release();
  }
}

// ---------- DRAFT AUTOMATION LOOP ----------
// Runs every 30s: auto-starts scheduled drafts and auto-picks for timed-out players
async function runDraftAutomation() {
  try {
    const { storage } = await import("./storage-db");
    const { db } = await import("./db");
    const { leagues } = await import("../shared/schema");
    const { and, eq, lte, isNotNull } = await import("drizzle-orm");
    const now = new Date();

    // Auto-start drafts whose scheduled time has arrived
    const toStart = await db.select().from(leagues).where(
      and(eq(leagues.draftStatus, "scheduled"), isNotNull(leagues.draftDate), lte(leagues.draftDate, now))
    );
    for (const league of toStart) {
      try {
        await storage.startDraft(league.id);
        console.log(`[DraftAuto] Auto-started draft for league ${league.id}`);
      } catch (e) {
        console.error(`[DraftAuto] Failed to start league ${league.id}:`, e);
      }
    }

    // Auto-pick for active drafts where current player's deadline has passed
    const timedOut = await db.select().from(leagues).where(
      and(eq(leagues.draftStatus, "active"), isNotNull(leagues.pickDeadline), lte(leagues.pickDeadline, now))
    );
    for (const league of timedOut) {
      if (!league.currentPlayer) continue;
      try {
        const songs = await storage.getAvailableSongsPlayedLastYear(league.id);
        if (songs.length > 0) {
          await storage.makeDraftPick(league.id, league.currentPlayer, songs[0].id, league.pickTimeLimit ?? 90);
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

// ---------- REGISTER ALL API ROUTES ----------
const httpServer = createServer(app);
runMigrations().then(() => registerRoutes(app)).then(() => {
  // Start draft automation loop every 30 seconds
  setInterval(runDraftAutomation, 30_000);
  // ---------- SPA FALLBACK ----------
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });

  // ---------- START SERVER ----------
  const PORT = process.env.PORT || 10000;
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});