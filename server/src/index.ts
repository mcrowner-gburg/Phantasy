import express, { json, urlencoded } from "express";
import session from "express-session";
import { Pool } from "@neondatabase/serverless";
import connectPgSimple from "connect-pg-simple";
import path from "path";

// ---------- DATABASE POOL ----------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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

// Add your additional API routes here
// Example:
// app.use("/api/users", usersRouter);

// ---------- SERVE FRONTEND ----------
const PORT = process.env.PORT || 10000;

// Path to the client build (copied during root build)
const clientDistPath = path.resolve(__dirname, "client");

// Serve static files (JS, CSS, images)
app.use(express.static(clientDistPath));

// SPA fallback: serve index.html for all unmatched routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
