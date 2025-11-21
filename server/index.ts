import express, { json, urlencoded } from "express";
import session from "express-session";
import { Pool } from "@neondatabase/serverless";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import { fileURLToPath } from "url";

// ---------- ESM __dirname ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- DATABASE POOL ----------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Node 20+ has native fetch; no need for node-fetch
});

// ---------- EXPRESS APP ----------
const app = express();
app.use(json());
app.use(urlencoded({ extended: true }));

// ---------- SESSION SETUP ----------
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({ pool }),
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

// ---------- API ROUTES ----------
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ---------- SERVE FRONTEND ----------
const PORT = process.env.PORT || 10000;

// Serve static files from the built client
app.use(express.static(path.join(__dirname, "../../client/dist")));

// Fallback to index.html for SPA routing
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
