from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.auth import require_user
from agents.orchestrator import KisanCouncilOrchestrator
import shutil
import os

router = APIRouter(prefix="/council", tags=["Kisan Council"])
orchestrator = KisanCouncilOrchestrator()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB


def _validate_image(image: UploadFile) -> None:
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {image.content_type}. Only JPEG and PNG images are allowed."
        )


@router.post("/chat")
async def council_chat(
    message: str = Form(...),
    language: str = Form("en"),
    image: UploadFile = File(None),
    user: models.User = Depends(require_user),
    db: Session = Depends(get_db)
):
    image_bytes = None
    image_path = None
    if image:
        _validate_image(image)
        os.makedirs("uploads", exist_ok=True)
        image_path = f"uploads/council_{user.id}_{image.filename}"
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        file_size = os.path.getsize(image_path)
        if file_size > MAX_IMAGE_SIZE:
            os.remove(image_path)
            raise HTTPException(status_code=400, detail=f"Image too large. Max size is 5MB.")
        with open(image_path, "rb") as f:
            image_bytes = f.read()

    plan = orchestrator.plan(message, has_image=(image is not None), language=language)
    results = orchestrator.execute(
        plan=plan,
        user_id=user.id,
        image_bytes=image_bytes,
        db_user=user,
        user_message=message,
        language=language
    )
    response_text = orchestrator.synthesize(message, plan, results, language=language)

    session = models.ChatSession(
        user_id=user.id,
        message=message,
        agent_plan="+".join(plan["agents_needed"]),
        response=response_text,
        image_path=image_path
    )
    db.add(session)
    db.commit()

    return {
        "response": response_text,
        "plan": plan,
        "agent_results": results,
        "session_id": session.id
    }
