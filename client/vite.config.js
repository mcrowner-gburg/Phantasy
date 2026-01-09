import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",        // makes JS/CSS paths relative
  build: {
    outDir: "dist",   // output folder for production build
    assetsDir: "assets", // place JS/CSS in dist/assets
  },
});
