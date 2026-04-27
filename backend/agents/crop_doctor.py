import io
import os
import tempfile
from PIL import Image
from agents.base import BaseAgent
from core.vector_store import get_kb
from app.config import get_settings


class CropDoctorAgent(BaseAgent):
    """AI crop disease diagnosis using Gemini Vision + Knowledge Base."""

    def __init__(self):
        super().__init__()

    def analyze_image(self, image_bytes: bytes) -> str:
        """Use Gemini 1.5 Flash vision to describe crop image."""
        settings = get_settings()
        if not settings.GOOGLE_API_KEY:
            return "[No API key] Gemini Vision unavailable. Please set GOOGLE_API_KEY."

        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GOOGLE_API_KEY)
            model = genai.GenerativeModel('gemini-1.5-flash')

            # Open image with PIL
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

    def run(self, image_bytes: bytes, crop_type: str) -> dict:
        # Step 1: Gemini Vision analysis
        vision_result = self.analyze_image(image_bytes) if image_bytes else "No image provided."

        # Step 2: Search knowledge base for relevant disease info
        query = f"{crop_type} disease symptoms treatment pesticide Pakistan"
        kb = get_kb()
        try:
            docs = kb.search(query, "crop_diseases", k=3)
            context = self.format_sources(docs)
        except Exception:
            docs = []
            context = "Knowledge base not yet populated."

        # Step 3: Gemini LLM generates treatment advice
        prompt = f"""You are Dr. Zarai, Pakistan's top crop disease specialist.

Image analysis: {vision_result}

Agricultural database context:
{context}

Respond in Roman Urdu. Structure:
1. Bimari ka naam (simple words)
2. Wajah
3. Fori ilaj (exact pesticide + dosage per acre)
4. Organic alternative
5. Agle season ki hifazat
6. Behtari ka waqt

Be concise. Farmers don't have time for long paragraphs."""

        treatment = self.predict(prompt)

        return {
            "vision_analysis": vision_result,
            "treatment": treatment,
            "sources": [d.metadata for d in docs]
        }
