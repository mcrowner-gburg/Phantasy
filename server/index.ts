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

// ---------- REGISTER ALL API ROUTES ----------
const httpServer = createServer(app);
registerRoutes(app).then(() => {
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