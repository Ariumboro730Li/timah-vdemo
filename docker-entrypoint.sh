#!/bin/bash
set -euo pipefail

# Jalankan Snapshot JSON API secara internal di localhost:3001
PORT=3001 HOST=127.0.0.1 node /app/server.mjs &
NODE_PID=$!

# Jalankan Nginx di port 80
nginx -g "daemon off;" &
NGINX_PID=$!

terminate() {
  kill -TERM "$NGINX_PID" "$NODE_PID" 2>/dev/null || true
  wait "$NGINX_PID" 2>/dev/null || true
  wait "$NODE_PID" 2>/dev/null || true
}
trap terminate TERM INT

# Keluar bersih jika salah satu proses berhenti
wait -n "$NODE_PID" "$NGINX_PID"
terminate
