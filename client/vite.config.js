import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // IMPORTANT: makes CSS/JS references relative
  build: {
    outDir: "dist",
  },
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  server: {
    port: 5173,
  },
});
