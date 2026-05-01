from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.auth import require_user
from agents.crop_doctor import CropDoctorAgent
import shutil
import os

router = APIRouter(prefix="/diagnoses", tags=["Crop Doctor"])
agent = CropDoctorAgent()


@router.post("/")
async def diagnose(
    crop_type: str = Form(...),
    image: UploadFile = File(...),
    language: str = Form("en"),
    user: models.User = Depends(require_user),
    db: Session = Depends(get_db)
):
    os.makedirs("uploads", exist_ok=True)
    image_path = f"uploads/diag_{user.id}_{image.filename}"
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    image_bytes = open(image_path, "rb").read()
    result = agent.run(image_bytes, crop_type, language=language)

    diag = models.Diagnosis(
        user_id=user.id,
        crop_type=crop_type,
        image_path=image_path,
        vision_analysis=result.get("vision_analysis", ""),
        treatment=result.get("treatment", ""),
    )
    db.add(diag)
    db.commit()

    return result
