import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
    // Use relative paths so assets work when served from Express
    base: "./",
  },
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
});
