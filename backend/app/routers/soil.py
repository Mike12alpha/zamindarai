from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import require_user
from agents.soil_advisor import SoilAdvisorAgent

router = APIRouter(prefix="/soil", tags=["Soil Advisor"])
agent = SoilAdvisorAgent()


@router.post("/advise")
def advise(
    request: dict,
    user = Depends(require_user),
    db: Session = Depends(get_db)
):
    result = agent.run(
        location=request.get("location", user.district or "Lahore"),
        current_crop=request.get("current_crop", "Wheat"),
        previous_crop=request.get("previous_crop", "None"),
        soil_type=request.get("soil_type", "Loamy"),
        question=request.get("question", ""),
        language="en"
    )
    return result
