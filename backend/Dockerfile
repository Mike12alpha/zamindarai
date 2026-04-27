FROM python:3.10-slim

WORKDIR /app

# System deps for Pillow and builds
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create directories for uploads and outputs
RUN mkdir -p uploads uploads/audio contracts qr_codes chroma_db

# Expose FastAPI port
EXPOSE 8000

# Startup: create tables, ingest docs if needed, start server
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
