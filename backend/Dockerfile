FROM python:3.11-slim

WORKDIR /app

# System deps: build tools, PostgreSQL client libs + psql CLI, curl
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc libpq-dev python3-dev pkg-config curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Upgrade pip and install packages in steps for better error visibility
RUN pip install --upgrade pip setuptools wheel

# Install torch CPU wheel first (large package, prone to OOM on small builders)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install remaining requirements (exclude torch to avoid CUDA version overwrite)
RUN sed '/^torch/d' requirements.txt > requirements_no_torch.txt && \
    pip install --no-cache-dir -r requirements_no_torch.txt && \
    rm requirements_no_torch.txt

# Copy application (includes data/ and scripts/ subdirs)
COPY . .

# Make startup script executable
RUN chmod +x startup.sh

# Create directories for uploads and outputs
RUN mkdir -p uploads uploads/audio contracts qr_codes chroma_db

# Expose FastAPI port
EXPOSE 8000

# Startup: check/create DB, ingest docs, start server
CMD ["./startup.sh"]
