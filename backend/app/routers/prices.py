from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import require_user
from agents.price_oracle import PriceOracleAgent

router = APIRouter(prefix="/prices", tags=["Price Oracle"])
agent = PriceOracleAgent()


@router.post("/check", response_model=schemas.PriceCheckResponse)
def check_price(
    request: schemas.PriceCheckRequest,
    user: models.User = Depends(require_user),
    db: Session = Depends(get_db)
):
    result = agent.run(
        crop=request.crop,
        quantity=request.quantity,
        location=request.location,
        offered_price=request.offered_price,
        language="en"
    )

    db_check = models.PriceCheck(
        user_id=user.id,
        crop=request.crop,
        quantity=request.quantity,
        offered_price=request.offered_price,
        market_rate=result.get("market_rate"),
        analysis=result["analysis"]
    )
    db.add(db_check)
    db.commit()

    return {
        "analysis": result["analysis"],
        "market_rate": result.get("market_rate"),
        "is_fair": result["is_fair"]
    }


@router.get("/live")
def live_prices(crop: str, location: str = "Lahore"):
    from core.scraper import MandiScraper
    scraper = MandiScraper()
    prices = scraper.get_live_prices(crop, location)
    return {"prices": prices, "source": "real_time_scraper"}
