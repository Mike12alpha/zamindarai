from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.auth import require_user
from agents.crop_doctor import CropDoctorAgent
import shutil
import os
from PIL import Image
import io

router = APIRouter(prefix="/diagnoses", tags=["Crop Doctor"])
agent = CropDoctorAgent()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_IMAGE_DIMENSION = 1024


def _validate_image(image: UploadFile) -> None:
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {image.content_type}. Only JPEG and PNG images are allowed."
        )


def _resize_image(image_path: str) -> None:
    """Resize image in-place if any dimension exceeds MAX_IMAGE_DIMENSION."""
    try:
        with Image.open(image_path) as img:
            img = img.convert("RGB")
            if max(img.size) > MAX_IMAGE_DIMENSION:
                img.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION), Image.LANCZOS)
                img.save(image_path, "JPEG", quality=85)
    except Exception:
        pass  # If resize fails, continue with original


@router.post("/")
async def diagnose(
    crop_type: str = Form(...),
    image: UploadFile = File(...),
    language: str = Form("en"),
    user: models.User = Depends(require_user),
    db: Session = Depends(get_db)
):
    _validate_image(image)

    os.makedirs("uploads", exist_ok=True)
    image_path = f"uploads/diag_{user.id}_{image.filename}"
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    # Validate file size after write
    file_size = os.path.getsize(image_path)
    if file_size > MAX_IMAGE_SIZE:
        os.remove(image_path)
        raise HTTPException(status_code=400, detail=f"Image too large. Max size is 5MB.")

    _resize_image(image_path)

    with open(image_path, "rb") as f:
        image_bytes = f.read()
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
