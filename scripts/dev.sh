#!/usr/bin/env bash
set -euo pipefail

# Start the local data server with CORS in the background
echo "📡 Starting data server on :3001..."
python3 scripts/serve-data.py &
DATA_PID=$!

# Ensure the data server is killed when this script exits
cleanup() {
  echo ""
  echo "🛑 Stopping data server..."
  kill "$DATA_PID" 2>/dev/null || true
  wait "$DATA_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Give the data server a moment to start
sleep 1

# Start Next.js dev server
echo "🚀 Starting Next.js dev server..."
exec next dev
