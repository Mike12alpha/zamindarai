FROM python:3.11-slim

WORKDIR /app

# System deps: build tools, curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev python3-dev pkg-config curl netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Upgrade pip first
RUN pip install --upgrade pip setuptools wheel

# Install torch CPU wheel separately (large package, prone to OOM on small builders)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install remaining Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application (includes data/ and scripts/ subdirs)
# Cache-bust to force pickup of updated agent code
ARG CACHE_BUST=2026-05-18-v3
COPY . .

# Make startup script executable
RUN chmod +x startup.sh

# Pre-download embedding model so first-start ingestion doesn't timeout
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')"

# Create directories for uploads and outputs
RUN mkdir -p uploads uploads/audio contracts qr_codes chroma_db

# Expose FastAPI port
EXPOSE 8000

# Startup: check/create DB, ingest docs, start server
CMD ["./startup.sh"]
