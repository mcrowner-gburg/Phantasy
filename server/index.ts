import express from "express";
import path from "path";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";
import { json } from "body-parser";
import { router as adminRouter } from "./controllers/adminController"; // example import

// --- PostgreSQL session store ---
const PgSession = connectPgSimple(session);
const pool = new Pool(); // reads from DATABASE_URL by default

// --- Express App ---
const app = express();
const PORT = process.env.PORT || 3000;

app.use(json());
app.use(
  session({
    store: new PgSession({ pool }),
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set true if using HTTPS
  })
);

// --- API routes ---
app.use("/api/admin", adminRouter);

// --- Serve Vite client build ---
const clientDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientDistPath));

// Send index.html for any other route (SPA support)
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
