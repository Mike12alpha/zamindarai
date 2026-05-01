#!/bin/sh
set -e

# Parse DATABASE_URL for connection details
# Expected format: postgresql://USER:PASS@HOST:PORT/DBNAME
DATABASE_URL="${DATABASE_URL:-sqlite:///./zamindarai.db}"

echo "[STARTUP] DATABASE_URL=$DATABASE_URL"

# Extract components from DATABASE_URL using Python
_eval_url=$(python -c "
import urllib.parse
url = urllib.parse.urlparse('$DATABASE_URL')
print(f'DB_HOST={url.hostname}')
print(f'DB_PORT={url.port or 5432}')
print(f'DB_USER={url.username or \"zamindarai\"}')
print(f'DB_PASS={url.password or \"zamindarai\"}')
print(f'DB_NAME={url.path.lstrip(\"/\") or \"zamindarai\"}')
" 2>/dev/null || true)

eval "$_eval_url"

wait_for_postgres() {
    for i in $(seq 1 30); do
        if python -c "
import psycopg2
try:
    conn = psycopg2.connect(host='$DB_HOST', port='$DB_PORT', user='$DB_USER', password='$DB_PASS', dbname='postgres', connect_timeout=3)
    conn.close()
    exit(0)
except psycopg2.OperationalError as e:
    msg = str(e)
    if 'database \"postgres\" does not exist' in msg or 'database \"template1\" does not exist' in msg:
        # Cluster may be partially initialized — skip postgres check
        exit(0)
    try:
        conn = psycopg2.connect(host='$DB_HOST', port='$DB_PORT', user='$DB_USER', password='$DB_PASS', dbname='template1', connect_timeout=3)
        conn.close()
        exit(0)
    except:
        pass
    exit(1)
" 2>/dev/null; then
            echo "[STARTUP] PostgreSQL is reachable"
            return 0
        fi
        echo "[STARTUP] Waiting for PostgreSQL... ($i/30)"
        sleep 2
    done
    return 1
}

create_db_if_missing() {
    python -c "
import psycopg2
import sys

for db in ['postgres', 'template1']:
    try:
        conn = psycopg2.connect(host='$DB_HOST', port='$DB_PORT', user='$DB_USER', password='$DB_PASS', dbname=db)
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(\"SELECT 1 FROM pg_database WHERE datname = '%s'\" % '$DB_NAME')
        if not cur.fetchone():
            cur.execute(\"CREATE DATABASE %s\" % '$DB_NAME')
            print('[STARTUP] Created database: $DB_NAME')
        else:
            print('[STARTUP] Database already exists: $DB_NAME')
        cur.close()
        conn.close()
        sys.exit(0)
    except Exception as e:
        continue

print('[STARTUP] Could not create/verify database via postgres/template1')
sys.exit(1)
" 2>/dev/null
}

# Main logic
if echo "$DATABASE_URL" | grep -q "^postgresql"; then
    if wait_for_postgres; then
        if create_db_if_missing; then
            echo "[STARTUP] PostgreSQL ready. Running document ingestion..."
            python scripts/ingest_documents.py || echo "[STARTUP] Ingestion warning (non-fatal)"
        else
            echo "[STARTUP] WARNING: Could not verify/create database. Switching to SQLite..."
            export DATABASE_URL="sqlite:///./zamindarai.db"
        fi
    else
        echo "[STARTUP] WARNING: PostgreSQL unreachable after 60s. Switching to SQLite..."
        export DATABASE_URL="sqlite:///./zamindarai.db"
    fi
fi

echo "[STARTUP] Using database: $DATABASE_URL"

# Safety patch: ensure old hardcoded model names are updated inside the container
# This is a no-op if the source files are already correct
if command -v sed >/dev/null 2>&1; then
    sed -i 's/gemini-1\.5-flash-latest/gemini-flash-latest/g' /app/agents/base.py 2>/dev/null || true
    sed -i 's/gemini-1\.5-flash-latest/gemini-flash-latest/g' /app/agents/orchestrator.py 2>/dev/null || true
    sed -i 's/gemini-1\.5-flash-latest/gemini-flash-latest/g' /app/agents/crop_doctor.py 2>/dev/null || true
    sed -i 's/gemini-1\.5-pro-latest/gemini-pro-latest/g' /app/agents/deal_guardian.py 2>/dev/null || true
fi

echo "[STARTUP] Starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
