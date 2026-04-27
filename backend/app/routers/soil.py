from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from agents import get_agent

router = APIRouter(prefix="/soil", tags=["Soil Advisor"])


@router.post("/advise")
def soil_advise(
    farmer_id: int,
    location: str,
    current_crop: str,
    previous_crop: str = "unknown",
    soil_type: str = "unknown",
    question: str = "",
    db: Session = Depends(get_db)
):
    """Get soil and fertilizer advice from ZaminExpert."""

    agent = get_agent("soil_advisor")
    result = agent.run(
        location=location,
        current_crop=current_crop,
        previous_crop=previous_crop,
        soil_type=soil_type,
        question=question
    )

    return {
        "advice": result["advice"],
        "location": location,
        "crop": current_crop
    }
