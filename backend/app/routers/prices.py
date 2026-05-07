from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import require_user
from agents.price_oracle import PriceOracleAgent
import traceback

router = APIRouter(prefix="/prices", tags=["Price Oracle"])
agent = PriceOracleAgent()


@router.post("/check", response_model=schemas.PriceCheckResponse)
def check_price(
    request: schemas.PriceCheckRequest,
    user: models.User = Depends(require_user),
    db: Session = Depends(get_db)
):
    try:
        result = agent.run(
            crop=request.crop,
            quantity=request.quantity,
            location=request.location,
            offered_price=request.offered_price,
            language=request.language
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="Price check failed. Please try again in a moment."
        )

    try:
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
    except Exception as e:
        traceback.print_exc()
        # Don't fail the request just because DB logging failed
        db.rollback()

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
