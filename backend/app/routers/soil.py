from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import require_user
from app import schemas
from agents.soil_advisor import SoilAdvisorAgent

router = APIRouter(prefix="/soil", tags=["Soil Advisor"])
agent = SoilAdvisorAgent()


@router.post("/advise")
def advise(
    request: schemas.SoilAdviseRequest,
    user = Depends(require_user),
    db: Session = Depends(get_db)
):
    result = agent.run(
        location=request.location or user.district or "Lahore",
        current_crop=request.current_crop or "Wheat",
        previous_crop=request.previous_crop or "None",
        soil_type=request.soil_type or "Loamy",
        question=request.question or "",
        language=request.language
    )
    return result
