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


@router.get("/recent")
def recent_activity(
    user: models.User = Depends(require_user),
    db: Session = Depends(get_db),
    limit: int = 10
):
    """Return the user's recent activity across all features."""
    from sqlalchemy import union_all, literal_column, text

    # Get recent diagnoses
    diagnoses = db.query(models.Diagnosis).filter(
        models.Diagnosis.user_id == user.id
    ).order_by(models.Diagnosis.created_at.desc()).limit(limit).all()

    # Get recent price checks
    price_checks = db.query(models.PriceCheck).filter(
        models.PriceCheck.user_id == user.id
    ).order_by(models.PriceCheck.created_at.desc()).limit(limit).all()

    # Get recent contracts
    contracts = db.query(models.Contract).filter(
        models.Contract.user_id == user.id
    ).order_by(models.Contract.created_at.desc()).limit(limit).all()

    # Merge and sort by created_at
    activities = []
    for d in diagnoses:
        activities.append({
            "type": "diagnosis",
            "title": d.crop_type or "Unknown crop",
            "detail": d.vision_analysis[:80] + "..." if d.vision_analysis and len(d.vision_analysis) > 80 else (d.vision_analysis or ""),
            "created_at": d.created_at.isoformat() if d.created_at else None,
        })
    for p in price_checks:
        activities.append({
            "type": "price_check",
            "title": f"{p.crop} @ PKR {p.offered_price}/kg",
            "detail": f"Market rate: PKR {p.market_rate}/kg" if p.market_rate else "No market data",
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })
    for c in contracts:
        activities.append({
            "type": "contract",
            "title": f"Contract with {c.buyer_name}",
            "detail": f"{c.crop} — {c.quantity}",
            "created_at": c.created_at.isoformat() if c.created_at else None,
        })

    activities.sort(key=lambda x: x["created_at"] or "", reverse=True)
    return {"activities": activities[:limit]}
