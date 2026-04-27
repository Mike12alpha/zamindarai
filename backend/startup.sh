#!/bin/sh
set -e

echo "[STARTUP] Running document ingestion..."
python scripts/ingest_documents.py || echo "[STARTUP] Ingestion warning (non-fatal)"

echo "[STARTUP] Starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
