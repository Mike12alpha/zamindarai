import io
from PIL import Image
from agents.base import BaseAgent
from core.vector_store import get_kb
from core.i18n import get_system_prompt
from app.config import get_settings


class CropDoctorAgent(BaseAgent):
    def __init__(self):
        super().__init__()

    def analyze_image(self, image_bytes: bytes) -> str:
        settings = get_settings()
        if not settings.GOOGLE_API_KEY:
            return "[No API key] Gemini Vision unavailable."
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            model = genai.GenerativeModel('gemini-1.5-flash')
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            response = model.generate_content([
                "You are a crop disease expert. Describe what you see in this plant/crop image. "
                "Identify any visible diseases, pests, nutrient deficiencies, or abnormalities. "
                "Be concise but specific. Mention the crop type if identifiable.",
                image
            ])
            return response.text
        except Exception as e:
            return f"[Vision Error] {str(e)[:200]}"

    def run(self, image_bytes: bytes, crop_type: str, language: str = "en") -> dict:
        vision_result = self.analyze_image(image_bytes) if image_bytes else "No image provided."

        query = f"{crop_type} disease symptoms treatment pesticide Pakistan"
        kb = get_kb()
        try:
            docs = kb.search(query, "crop_diseases", k=3)
            context = self.format_sources(docs)
        except Exception:
            docs = []
            context = "Knowledge base not yet populated."

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
