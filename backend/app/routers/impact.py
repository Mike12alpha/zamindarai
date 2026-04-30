from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models
from app.auth import require_user

router = APIRouter(prefix="/impact", tags=["Impact Dashboard"])


@router.get("/summary")
def impact_summary(
    user: models.User = Depends(require_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(models.User).count()
    total_diagnoses = db.query(models.Diagnosis).count()
    total_price_checks = db.query(models.PriceCheck).count()
    total_contracts = db.query(models.Contract).count()

    avg_farm_size = db.query(func.avg(models.User.farm_size_acres)).scalar() or 0

    recent_outbreaks = db.query(models.OutbreakAlert).order_by(
        models.OutbreakAlert.last_updated.desc()
    ).limit(5).all()

    return {
        "total_users": total_users,
        "total_diagnoses": total_diagnoses,
        "total_price_checks": total_price_checks,
        "total_contracts": total_contracts,
        "avg_farm_size_acres": round(float(avg_farm_size), 2),
        "recent_outbreaks": [
            {"district": o.district, "crop": o.crop_type, "cases": o.case_count}
            for o in recent_outbreaks
        ]
    }
