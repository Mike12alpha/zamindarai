from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from app.database import get_db
from app import models, schemas
from agents import get_agent
import shutil
import os

router = APIRouter(prefix="/diagnoses", tags=["Crop Doctor"])


@router.post("/", response_model=schemas.DiagnosisResponse)
async def create_diagnosis(
    farmer_id: int = Form(...),
    crop_type: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Get farmer for district info
    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()

    # Save image
    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{farmer_id}_{image.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Run agent
    agent = get_agent("crop_doctor")
    image_bytes = open(file_path, "rb").read()
    result = agent.run(image_bytes, crop_type)

    # Save to DB
    db_diag = models.Diagnosis(
        farmer_id=farmer_id,
        crop_type=crop_type,
        image_path=file_path,
        vision_analysis=result["vision_analysis"],
        treatment=result["treatment"]
    )
    db.add(db_diag)
    db.commit()
    db.refresh(db_diag)

    # --- OUTBREAK DETECTION ---
    if farmer:
        outbreak_sql = text("""
            SELECT f.district, d.crop_type, d.vision_analysis, COUNT(*) as cases
            FROM diagnoses d
            JOIN farmers f ON d.farmer_id = f.id
            WHERE d.created_at > NOW() - INTERVAL '7 days'
            AND f.district = :district AND d.crop_type = :crop
            GROUP BY f.district, d.crop_type, d.vision_analysis
            HAVING COUNT(*) >= 2
        """)

        outbreaks = db.execute(outbreak_sql, {
            "district": farmer.district,
            "crop": crop_type
        }).fetchall()

        for ob in outbreaks:
            # Upsert outbreak alert
            existing = db.query(models.OutbreakAlert).filter(
                models.OutbreakAlert.district == ob.district,
                models.OutbreakAlert.crop_type == ob.crop_type,
                models.OutbreakAlert.disease_signature == ob.vision_analysis
            ).first()

            if not existing:
                alert = models.OutbreakAlert(
                    district=ob.district,
                    crop_type=ob.crop_type,
                    disease_signature=ob.vision_analysis,
                    case_count=ob.cases,
                    first_reported=func.now()
                )
                db.add(alert)
        db.commit()

    return {
        "id": db_diag.id,
        "vision_analysis": result["vision_analysis"],
        "treatment": result["treatment"],
        "created_at": db_diag.created_at
    }
