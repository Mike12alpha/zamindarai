from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models
from app.config import get_settings
from agents.orchestrator import KisanCouncilOrchestrator
import shutil
import os
import openai

router = APIRouter(prefix="/council", tags=["Kisan Council"])
orchestrator = KisanCouncilOrchestrator()


@router.post("/chat")
async def council_chat(
    farmer_id: int = Form(...),
    message: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """The single endpoint that rules them all."""

    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()

    # Handle image
    image_bytes = None
    image_path = None
    if image:
        os.makedirs("uploads", exist_ok=True)
        image_path = f"uploads/council_{farmer_id}_{image.filename}"
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_bytes = open(image_path, "rb").read()

    # PLAN
    plan = orchestrator.plan(message, has_image=(image is not None))

    # EXECUTE
    results = orchestrator.execute(
        plan=plan,
        farmer_id=farmer_id,
        image_bytes=image_bytes,
        db_farmer=farmer,
        user_message=message
    )

    # SYNTHESIZE
    response_text = orchestrator.synthesize(message, plan, results)

    # SAVE SESSION
    session = models.ChatSession(
        farmer_id=farmer_id,
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


@router.post("/voice")
async def voice_chat(
    farmer_id: int = Form(...),
    audio: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Farmer speaks in Urdu/Punjabi. AI understands."""

    # Save audio
    os.makedirs("uploads/audio", exist_ok=True)
    audio_path = f"uploads/audio/{farmer_id}_{audio.filename}"
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    # Whisper transcribe (OpenAI v2 API)
    settings = get_settings()
    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    with open(audio_path, "rb") as f:
        transcript = client.audio.transcriptions.create(model="whisper-1", file=f)

    urdu_text = transcript.text

    # Now send transcribed text to council
    farmer = db.query(models.Farmer).filter(models.Farmer.id == farmer_id).first()
    plan = orchestrator.plan(urdu_text, has_image=False)
    results = orchestrator.execute(
        plan=plan,
        farmer_id=farmer_id,
        db_farmer=farmer,
        user_message=urdu_text
    )
    response = orchestrator.synthesize(urdu_text, plan, results)

    return {
        "transcription": urdu_text,
        "response": response,
        "detected_language": getattr(transcript, 'language', 'ur'),
        "plan": plan,
        "agent_results": results
    }
