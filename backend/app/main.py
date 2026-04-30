from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, diagnoses, prices, contracts, council, impact, soil
from app.database import Base, engine
import traceback
import os

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


@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
        print("[STARTUP] Database tables verified/created")
    except Exception as e:
        print(f"[STARTUP ERROR] Failed to create tables: {e}")
        traceback.print_exc()

app.include_router(auth.router)
app.include_router(diagnoses.router)
app.include_router(prices.router)
app.include_router(contracts.router)
app.include_router(council.router)
app.include_router(impact.router)
app.include_router(soil.router)


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
