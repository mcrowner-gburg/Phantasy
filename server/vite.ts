import path from "path";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import express, { type Express } from "express";
import fs from "fs";

let vite: ViteDevServer | null = null;

/**
 * Setup Vite dev server for HMR during development
 */
export async function setupVite(app: Express, server: any) {
  vite = await createViteServer({
    root: path.resolve(__dirname, "../client"),
    server: { middlewareMode: "ssr" },
  });

  app.use(vite.middlewares);
  console.log("Vite dev server running...");
}

/**
 * Serve static assets in production
 */
export function serveStatic(app: Express) {
  const clientDist = path.resolve(__dirname, "../client/dist");

  if (!fs.existsSync(clientDist)) {
    throw new Error("Client build not found. Run `vite build` in client folder first.");
  }

  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });

  console.log("Serving static client from:", clientDist);
}

/**
 * Simple logger utility
 */
export function log(message: string) {
  console.log(`[server] ${message}`);
}
