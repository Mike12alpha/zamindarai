#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "[DEPLOY] Pulling latest code..."
git pull origin main

echo "[DEPLOY] Stopping existing containers..."
docker-compose down

echo "[DEPLOY] Building and starting containers..."
docker-compose up --build -d

echo "[DEPLOY] Waiting for backend to become healthy..."
for i in $(seq 1 30); do
    if curl -sf http://localhost:18000/health > /dev/null 2>&1; then
        echo "[DEPLOY] Backend is healthy!"
        break
    fi
    echo "[DEPLOY] Waiting for backend... ($i/30)"
    sleep 2
done

echo "[DEPLOY] Deployment complete."
echo "[DEPLOY] Frontend: http://<your-server>:13000"
echo "[DEPLOY] Backend API: http://<your-server>:18000"
echo ""
echo "[DEPLOY] Recent backend logs:"
docker-compose logs --tail=20 backend
