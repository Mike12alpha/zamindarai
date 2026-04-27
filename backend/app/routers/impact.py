from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models

router = APIRouter(prefix="/impact", tags=["Impact Analytics"])


@router.get("/summary")
def impact_summary(db: Session = Depends(get_db)):
    total_farmers = db.query(models.Farmer).count()

    # Fairness index by district (filter out invalid records to prevent div/0)
    fairness_query = db.query(
        models.Farmer.district,
        func.avg(models.PriceCheck.market_rate / models.PriceCheck.offered_price).label("fairness_index")
    ).join(models.PriceCheck).filter(
        models.PriceCheck.offered_price > 0,
        models.PriceCheck.market_rate != None
    ).group_by(models.Farmer.district).all()

    district_fairness = [
        {"district": d[0], "fairness_index": float(d[1]) if d[1] else 1.0}
        for d in fairness_query
    ]

    # Outbreaks
    outbreaks = db.query(models.OutbreakAlert).all()

    # Money saved estimate
    money_saved = db.query(
        func.sum((models.PriceCheck.market_rate - models.PriceCheck.offered_price) * 1000)
    ).scalar() or 0

    return {
        "total_farmers": total_farmers,
        "fairness_index": sum(d["fairness_index"] for d in district_fairness) / len(district_fairness) if district_fairness else 1.0,
        "active_outbreaks": len(outbreaks),
        "money_saved": int(money_saved),
        "district_fairness": district_fairness,
        "outbreaks": [
            {"district": o.district, "crop_type": o.crop_type,
             "disease": o.disease_signature, "case_count": o.case_count,
             "lat": 31.5, "lon": 74.3}  # Add real lat/lon later
            for o in outbreaks
        ]
    }
