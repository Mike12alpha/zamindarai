from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import farmers, diagnoses, prices, contracts, council, impact, whatsapp
from app.database import Base, engine
from app.scheduler import scheduler

app = FastAPI(
    title="ZamindarAI API",
    description="AI-powered agricultural protection system for Pakistani farmers",
    version="1.0.0"
)


@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        print(f"[STARTUP] DB init warning: {e}")
    scheduler.start()


@app.on_event("shutdown")
def on_shutdown():
    scheduler.shutdown()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(farmers.router)
app.include_router(diagnoses.router)
app.include_router(prices.router)
app.include_router(contracts.router)
app.include_router(council.router)
app.include_router(impact.router)
app.include_router(whatsapp.router)


@app.get("/")
def root():
    return {
        "service": "ZamindarAI API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ZamindarAI", "version": "1.0.0"}


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
