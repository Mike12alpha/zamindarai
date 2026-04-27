from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from agents import get_agent

router = APIRouter(prefix="/prices", tags=["Price Oracle"])


@router.post("/check", response_model=schemas.PriceCheckResponse)
def check_price(request: schemas.PriceCheckRequest, db: Session = Depends(get_db)):
    agent = get_agent("price_oracle")
    result = agent.run(
        crop=request.crop,
        quantity=request.quantity,
        location=request.location,
        offered_price=request.offered_price
    )

    # Save
    db_check = models.PriceCheck(
        farmer_id=request.farmer_id,
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
