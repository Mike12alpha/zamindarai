from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routers import auth, diagnoses, prices, contracts, council, impact, soil
from app.database import Base, engine
from core.cleanup import cleanup_old_uploads
import traceback
import os
import time
from collections import defaultdict

# Note: farmers router removed — models.Farmer does not exist.
# Re-add after creating the Farmer model in models.py + schemas.py.

app = FastAPI(
    title="ZamindarAI API",
    description="AI-powered agricultural protection system for Pakistani farmers",
    version="2.0.0"
)

# CORS must be added BEFORE routes so preflight OPTIONS are handled correctly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
    expose_headers=["*"],
    max_age=86400,
)

# Simple in-memory rate limiter per IP
_rate_limit_store = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 30  # requests per window
AI_RATE_LIMIT_MAX = 10  # AI endpoints are more expensive


def _is_rate_limited(client_ip: str, is_ai_endpoint: bool = False) -> bool:
    now = time.time()
    window = RATE_LIMIT_WINDOW
    max_req = AI_RATE_LIMIT_MAX if is_ai_endpoint else RATE_LIMIT_MAX_REQUESTS
    timestamps = _rate_limit_store[client_ip]
    # Filter to current window
    timestamps[:] = [t for t in timestamps if now - t < window]
    if len(timestamps) >= max_req:
        return True
    timestamps.append(now)
    return False


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    if isinstance(client_ip, str) and "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    path = request.url.path
    is_ai = path in ("/diagnoses/", "/prices/check", "/soil/advise", "/contracts/generate", "/council/chat")

    if _is_rate_limited(client_ip, is_ai_endpoint=is_ai):
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please slow down."}
        )

    response = await call_next(request)
    return response


@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
        print("[STARTUP] Database tables verified/created")
    except Exception as e:
        print(f"[STARTUP ERROR] Failed to create tables: {e}")
        traceback.print_exc()

    # Validate Google API key
    try:
        from app.config import get_settings, check_api_key
        settings = get_settings()
        ok, msg = check_api_key()
        if ok:
            print("[STARTUP] GOOGLE_API_KEY is configured")
        else:
            print(f"[STARTUP WARNING] {msg}")
    except Exception as e:
        print(f"[STARTUP WARNING] Could not validate GOOGLE_API_KEY: {e}")

    # Cleanup old uploads
    try:
        deleted = cleanup_old_uploads()
        if deleted:
            print(f"[STARTUP] Cleaned up {deleted} old upload files")
    except Exception as e:
        print(f"[STARTUP WARNING] Could not clean up uploads: {e}")

app.include_router(auth.router)
app.include_router(diagnoses.router)
app.include_router(prices.router)
app.include_router(contracts.router)
app.include_router(council.router)
app.include_router(impact.router)
app.include_router(soil.router)

try:
    from app.routers import whatsapp
    app.include_router(whatsapp.router)
    print("[STARTUP] WhatsApp router loaded")
except Exception as e:
    print(f"[STARTUP WARNING] WhatsApp router failed to load: {e}")
    traceback.print_exc()


@app.get("/")
def root():
    return {
        "service": "ZamindarAI API",
        "version": "2.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ZamindarAI", "version": "2.0.0"}


@app.get("/health/db")
def health_db():
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}


@app.get("/health/ai")
def health_ai():
    from app.config import check_api_key
    ok, msg = check_api_key()
    if ok:
        return {"status": "healthy", "ai_service": "configured"}
    return {"status": "unhealthy", "ai_service": "misconfigured", "detail": msg}


@app.get("/agents")
def list_agents():
    return {
        "available_agents": [
            {"id": "crop_doctor", "name": "Crop Doctor", "description": "AI crop disease diagnosis from photos"},
            {"id": "price_oracle", "name": "Price Oracle", "description": "Fair market price checking against aarti offers"},
            {"id": "soil_advisor", "name": "Soil Advisor", "description": "Fertilizer and soil management advice"},
            {"id": "deal_guardian", "name": "Deal Guardian", "description": "Contract generation and fraud detection"}
        ]
    }
