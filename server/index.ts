import express, { json, urlencoded } from "express";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import path from "path";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { ensureDraftAutomation } from "./draft-scheduler";

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

// Session middleware is installed by setupAuth() inside registerRoutes —
// do not add a second express-session here, the two stores conflict.

// ---------- HEALTH / VERSION ----------
app.get("/health", (_req, res) => res.json({ status: "ok", build: "2026-06-12-refactor" }));
app.get("/api/version", (_req, res) => res.json({ build: "2026-06-12-refactor" }));

// ---------- SERVE FRONTEND ----------
// Try server/dist/client first, fall back to client/dist (in case build phase
// files aren't preserved to the runtime container by Nixpacks)
import fs from "fs";
const preferredPath = process.env.CLIENT_DIST || path.resolve(process.cwd(), "server/dist/client");
const fallbackPath = path.resolve(process.cwd(), "client/dist");
const clientDistPath = fs.existsSync(path.join(preferredPath, "index.html"))
  ? preferredPath
  : fallbackPath;
console.log(`[startup] clientDistPath=${clientDistPath} exists=${fs.existsSync(clientDistPath)}`);
if (fs.existsSync(clientDistPath)) {
  const files = fs.readdirSync(clientDistPath);
  console.log(`[startup] client files: ${files.join(", ")}`);
}

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
      ALTER TABLE point_adjustments DROP CONSTRAINT IF EXISTS point_adjustments_concert_id_fkey;
      ALTER TABLE point_adjustments ADD COLUMN IF NOT EXISTS occurrence integer NOT NULL DEFAULT 1;
      UPDATE users SET role = 'superadmin' WHERE username = 'mcrowner';
      DELETE FROM point_adjustments
        WHERE concert_id NOT IN (SELECT id FROM cached_shows);
    `);
    console.log("Migrations complete");
  } finally {
    client.release();
  }
}

// ---------- AUTO-SCORE LOOP ----------
// Runs every 2 hours: refreshes shows cache from phish.net, then rescores all
// completed leagues so the leaderboard stays current without manual admin steps.
async function runAutoScore() {
  try {
    const { cacheService } = await import("./services/cache-service");
    const { scoreLeague } = await import("./services/scoring");
    const { db } = await import("./db");
    const { leagues } = await import("../shared/schema");
    const { eq } = await import("drizzle-orm");

    await cacheService.refreshShowsCache();

    const activeLeagues = await db.select().from(leagues).where(eq(leagues.draftStatus, "completed"));
    for (const league of activeLeagues) {
      try {
        await scoreLeague(league.id);
        console.log(`[AutoScore] Scored league ${league.id} (${league.name})`);
      } catch (e) {
        console.error(`[AutoScore] Failed to score league ${league.id}:`, e);
      }
    }
  } catch (e) {
    console.error("[AutoScore] Loop error:", e);
  }
}

// ---------- REGISTER ALL API ROUTES ----------
const httpServer = createServer(app);
runMigrations().then(() => registerRoutes(app)).then(async () => {
  await ensureDraftAutomation();
  // Auto-refresh shows + rescore all completed leagues every 2 hours
  setInterval(runAutoScore, 2 * 60 * 60 * 1000);
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