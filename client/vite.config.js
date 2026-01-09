import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",       // relative paths for JS/CSS assets
  build: {
    outDir: "dist", // already your default
  },
});
