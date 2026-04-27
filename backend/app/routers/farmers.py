from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy import text
from app.database import get_db
from app import models, schemas
import traceback

router = APIRouter(prefix="/farmers", tags=["Farmers"])


@router.post("/", response_model=schemas.FarmerResponse)
def create_farmer(farmer: schemas.FarmerCreate, db: Session = Depends(get_db)):
    try:
        existing = db.query(models.Farmer).filter(models.Farmer.phone == farmer.phone).first()
        if existing:
            return existing
        db_farmer = models.Farmer(**farmer.model_dump())
        db.add(db_farmer)
        db.commit()
        db.refresh(db_farmer)
        return db_farmer
    except IntegrityError:
        db.rollback()
        existing = db.query(models.Farmer).filter(models.Farmer.phone == farmer.phone).first()
        if existing:
            return existing
        raise HTTPException(status_code=400, detail="Database integrity error")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"DB Error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")


@router.get("/", response_model=list[schemas.FarmerResponse])
def list_farmers(db: Session = Depends(get_db)):
    return db.query(models.Farmer).all()


@router.get("/{farmer_id}", response_model=schemas.FarmerResponse)
def get_farmer(farmer_id: int, db: Session = Depends(get_db)):
    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer


@router.get("/debug/tables")
def debug_tables(db: Session = Depends(get_db)):
    """Debug endpoint to verify database connectivity and table existence."""
    try:
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        tables = [r[0] for r in result]
    except Exception:
        result = db.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public'"))
        tables = [r[0] for r in result]
    return {"tables": tables}
