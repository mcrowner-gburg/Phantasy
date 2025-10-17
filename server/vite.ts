import { createServer as createViteServer } from "vite";
import path from "path";
import express from "express";

export async function setupVite(app: express.Express, server: any) {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    root: path.resolve(__dirname, "../client")
  });

  app.use(vite.middlewares);
  console.log("Vite middleware set up for development");
}

export function serveStatic(app: express.Express) {
  app.use(express.static(path.resolve(__dirname, "../client/dist")));
}
