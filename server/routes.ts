import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import adminRoutes from "./routes/admin";
import leagueRoutes from "./routes/leagues";
import draftRoutes from "./routes/draft";
import songRoutes from "./routes/songs";
import concertRoutes from "./routes/concerts";
import cacheRoutes from "./routes/cache";
import miscRoutes from "./routes/misc";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication middleware + /api/auth routes
  setupAuth(app);

  // Version probe — used to confirm Railway deployed the latest build
  app.get("/api/version", (_req, res) => res.json({ build: "2026-04-24-v3" }));

  app.use("/api/admin", adminRoutes);
  app.use(leagueRoutes);
  app.use(draftRoutes);
  app.use(songRoutes);
  app.use(concertRoutes);
  app.use(cacheRoutes);
  app.use(miscRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
