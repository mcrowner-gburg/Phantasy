import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Inline the service worker registration — no separate sw.js file to maintain
      injectRegister: "auto",
      // Let the plugin generate the service worker via Workbox
      strategies: "generateSW",
      manifest: {
        name: "Phish Phantasy",
        short_name: "Phantasy",
        description: "Phantasy Phish league — draft songs, score points, win bragging rights",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Don't precache everything — just the shell
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // API calls always go to the network
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: "NetworkOnly",
          },
          {
            // HTML navigation — network first, fall back to cached index.html
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Static assets from CDN / fonts
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp|ico|woff|woff2)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "static-assets",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      devOptions: {
        // Enable SW in dev so you can test it locally
        enabled: false,
      },
    }),
  ],
  base: "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
