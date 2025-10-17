// client/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src'), // source code location
  base: './', // ensures relative paths work for static serving
  build: {
    outDir: path.resolve(__dirname, 'dist'), // output folder
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src', 'main.tsx'), // your main entry point
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
