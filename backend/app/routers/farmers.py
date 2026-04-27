from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/farmers", tags=["Farmers"])


@router.post("/", response_model=schemas.FarmerResponse)
def create_farmer(farmer: schemas.FarmerCreate, db: Session = Depends(get_db)):
    db_farmer = models.Farmer(**farmer.model_dump())
    db.add(db_farmer)
    db.commit()
    db.refresh(db_farmer)
    return db_farmer


@router.get("/{farmer_id}", response_model=schemas.FarmerResponse)
def get_farmer(farmer_id: int, db: Session = Depends(get_db)):
    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return farmer
