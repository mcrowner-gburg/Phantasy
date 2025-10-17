// server/index.ts
import express from "express";
import session from "express-session";
import { Pool } from "@neondatabase/serverless"; // external
import connectPgSimple from "connect-pg-simple"; // external
import { json } from "express";

// Mark your DB pool as external; esbuild won't bundle it
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
app.use(json());

// Example session setup
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({ pool }),
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Example route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
