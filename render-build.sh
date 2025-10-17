#!/usr/bin/env bash
# Exit immediately on error
set -o errexit

echo "🚀 Starting Render build process..."

# 1️⃣ Install all root dependencies (both prod + dev)
echo "📦 Installing root dependencies..."
npm install --include=dev

# 2️⃣ Build the client app (if you have one)
if [ -d "client" ]; then
  echo "🧱 Building client..."
  cd client
  npm install --include=dev
  npm run build
  cd ..
else
  echo "⚠️ No /client directory found — skipping client build."
fi

# 3️⃣ Build the server using esbuild
echo "🧱 Building server..."
npm run build:server

echo "✅ Build complete! Artifacts are in /dist"
