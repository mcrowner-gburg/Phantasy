import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "./", // Make assets load relative to index.html
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "dist"), // Build into client/dist
    assetsDir: "assets",
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
});
