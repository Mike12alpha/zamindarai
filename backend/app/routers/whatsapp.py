from fastapi import APIRouter, Form
from twilio.twiml.messaging_response import MessagingResponse
from agents.orchestrator import KisanCouncilOrchestrator
from app import models
from app.database import SessionLocal
import re
import requests

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])
orchestrator = KisanCouncilOrchestrator()


def detect_language(text: str) -> str:
    """Detect if text is primarily Urdu based on Unicode range."""
    if not text:
        return "en"
    urdu_chars = len(re.findall(r'[\u0600-\u06FF\u0750-\u077F]', text))
    total_chars = len(re.sub(r'\s', '', text))
    if total_chars == 0:
        return "en"
    ratio = urdu_chars / total_chars
    return "ur" if ratio > 0.3 else "en"


def get_or_create_user_by_phone(phone: str):
    """Lookup or create a placeholder user for WhatsApp interactions."""
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.phone == phone).first()
        if not user:
            # Create a minimal placeholder user
            user = models.User(
                email=f"{phone}@whatsapp.zamindarai",
                name="WhatsApp Farmer",
                phone=phone,
                district="Lahore",
                primary_crop="Wheat",
                hashed_password="whatsapp"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user
    finally:
        db.close()


@router.post("/webhook")
def whatsapp_webhook(
    Body: str = Form(...),
    From: str = Form(...),
    MediaUrl0: str = Form(None)
):
    """Twilio WhatsApp Business webhook."""

    language = detect_language(Body)

    # Determine if image or text
    if MediaUrl0:
        msg = "تصویر موصول ہوئی۔ تجزیہ ہو رہا ہے..." if language == "ur" else "Photo received. Analyzing..."
    else:
        try:
            user = get_or_create_user_by_phone(From)
            plan = orchestrator.plan(Body, has_image=False, language=language)
            results = orchestrator.execute(
                plan=plan,
                user_id=user.id,
                image_bytes=None,
                db_user=user,
                user_message=Body,
                language=language
            )
            msg = orchestrator.synthesize(Body, plan, results, language=language)
        except Exception as e:
            print(f"[WHATSAPP ERROR] {e}")
            if language == "ur":
                msg = "معاف کیجئے، سرور میں خرابی ہے۔ براہ کرم دوبارہ کوشش کریں۔"
            else:
                msg = f"Sorry, server error. Please try again."

    # Twilio response
    twilio_resp = MessagingResponse()
    twilio_resp.message(msg[:1500])  # Twilio limit

    return str(twilio_resp)
