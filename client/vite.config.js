import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'client'), // point Vite to the client folder
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'), // allows "@/..." imports
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'client/dist'), // build output
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    open: true,
  },
});
