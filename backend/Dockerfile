FROM python:3.11-slim

WORKDIR /app

# System deps: build tools, PostgreSQL client libs, curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev python3-dev pkg-config curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install CPU-only PyTorch first to avoid OOM on small builders,
# then remaining packages.
RUN pip install --no-cache-dir \
    torch==2.11.0 --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# Copy application (includes data/ and scripts/ subdirs)
COPY . .

# Make startup script executable
RUN chmod +x startup.sh

# Create directories for uploads and outputs
RUN mkdir -p uploads uploads/audio contracts qr_codes chroma_db

# Expose FastAPI port
EXPOSE 8000

# Startup: ingest docs, create tables, start server
CMD ["./startup.sh"]
