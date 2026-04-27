from fastapi import APIRouter, Form
from twilio.twiml.messaging_response import MessagingResponse
import requests

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp"])

WHATSAPP_API_BASE = "http://backend:8000"  # Docker service name


@router.post("/webhook")
def whatsapp_webhook(
    Body: str = Form(...),
    From: str = Form(...),
    MediaUrl0: str = Form(None)
):
    """Twilio WhatsApp Business webhook."""

    # Identify or create farmer by phone
    # For hackathon, use a simple mapping
    farmer_id = 1  # Lookup by From number in DB

    # Determine if image or text
    if MediaUrl0:
        # Download image from Twilio
        # Call /council/chat with image
        msg = "Photo received. Analyzing..."
    else:
        # Text to council
        try:
            res = requests.post(f"{WHATSAPP_API_BASE}/council/chat", data={
                "farmer_id": farmer_id,
                "message": Body
            })
            msg = res.json()["response"]
        except Exception as e:
            msg = f"Sorry, server error. Please try again. ({e})"

    # Twilio response
    twilio_resp = MessagingResponse()
    twilio_resp.message(msg[:1500])  # Twilio limit

    return str(twilio_resp)
