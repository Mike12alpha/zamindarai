import io
import os
from PIL import Image
from agents.base import BaseAgent
from core.vector_store import get_kb
from core.i18n import get_system_prompt, get_message
from app.config import get_settings


class CropDoctorAgent(BaseAgent):
    def __init__(self):
        super().__init__()

    def analyze_image(self, image_bytes: bytes, language: str = "en") -> str:
        settings = get_settings()
        if not settings.GOOGLE_API_KEY:
            return "[No API key] Gemini Vision unavailable."
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            model = genai.GenerativeModel(os.getenv('GEMINI_MODEL', 'gemini-flash-latest'))
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            response = model.generate_content([
                get_message("vision_prompt", language),
                image
            ])
            return response.text
        except Exception as e:
            return f"[Vision Error] {str(e)[:200]}"

    def run(self, image_bytes: bytes, crop_type: str, language: str = "en") -> dict:
        vision_result = self.analyze_image(image_bytes, language) if image_bytes else get_message("no_image", language)

        query = f"{crop_type} disease symptoms treatment pesticide Pakistan"
        kb = get_kb()
        try:
            docs = kb.search(query, "crop_diseases", k=3)
            context = self.format_sources(docs)
        except Exception:
            docs = []
            context = get_message("kb_empty", language)

        prompt = get_system_prompt(
            "crop_doctor",
            language=language,
            vision=vision_result,
            context=context
        )

        treatment = self.predict(prompt, language=language)

        return {
            "vision_analysis": vision_result,
            "treatment": treatment,
            "sources": [d.metadata for d in docs]
        }
