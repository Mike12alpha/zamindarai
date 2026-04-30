from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.auth import require_user
from agents.orchestrator import KisanCouncilOrchestrator
import shutil
import os

router = APIRouter(prefix="/council", tags=["Kisan Council"])
orchestrator = KisanCouncilOrchestrator()


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
        os.makedirs("uploads", exist_ok=True)
        image_path = f"uploads/council_{user.id}_{image.filename}"
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_bytes = open(image_path, "rb").read()

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
