#!/usr/bin/env bash
#
# Start the Writing for Me web-app development server.
#
# Runs `npm run dev` (Vite on port 3030), waits until the server is reachable,
# opens the default browser, and keeps the server in the foreground. Stop with
# Ctrl+C — the dev server is cleaned up automatically.
#
# Usage:
#   ./scripts/dev.sh                 # default port 3030
#   PORT=3040 ./scripts/dev.sh       # override port (also picked up by Vite)
#
set -euo pipefail

# Resolve the web-app directory regardless of where the script is invoked from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

PORT="${PORT:-3030}"

cd "$APP_DIR"

# Ensure dependencies are installed (idempotent: skipped if node_modules exists).
if [ ! -d node_modules ]; then
  echo "→ node_modules not found, running npm install ..."
  npm install
fi

echo "→ Starting Vite dev server on port $PORT ..."
# Run in background so we can poll the port, then bring it back to the foreground.
npm run dev &
SERVER_PID=$!

# Clean up the dev server when the script exits (Ctrl+C / kill / terminal close).
cleanup() {
  echo
  echo "→ Stopping dev server (PID $SERVER_PID) ..."
  kill "$SERVER_PID" 2>/dev/null || true
  wait "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Wait until the port accepts connections (max ~15s), then open the browser.
echo "→ Waiting for http://localhost:$PORT to become reachable ..."
for i in $(seq 1 15); do
  if (exec 3<>"/dev/tcp/localhost/$PORT") 2>/dev/null; then
    exec 3>&- 3<&- 2>/dev/null || true
    echo "→ Server is up. Opening browser ..."
    xdg-open "http://localhost:$PORT" >/dev/null 2>&1 || true
    break
  fi
  # Last attempt failed and we've waited the full window — warn but don't crash.
  if [ "$i" -eq 15 ]; then
    echo "→ Port $PORT not reachable after 15s. Open http://localhost:$PORT manually."
  fi
  sleep 1
done

# Keep the dev server in the foreground until interrupted.
wait "$SERVER_PID"
