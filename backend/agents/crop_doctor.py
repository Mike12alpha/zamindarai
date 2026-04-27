from agents.base import BaseAgent
from core.vector_store import kb
from PIL import Image
import io


class CropDoctorAgent(BaseAgent):
    def __init__(self):
        super().__init__()
        self._vision = None

    @property
    def vision(self):
        if self._vision is None:
            from transformers import pipeline
            self._vision = pipeline(
                "image-classification",
                model="microsoft/swinv2-base-patch4-window8-256",
                device=-1  # CPU; use 0 if you have GPU
            )
        return self._vision

    def analyze_image(self, image_bytes: bytes):
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        results = self.vision(image, top_k=3)
        return ", ".join([f"{r['label']} ({r['score']:.1%})" for r in results])

    def run(self, image_bytes: bytes, crop_type: str) -> dict:
        vision_result = self.analyze_image(image_bytes)

        query = f"{crop_type} disease symptoms treatment pesticide Pakistan"
        docs = kb.search(query, "crop_diseases", k=3)
        context = self.format_sources(docs)

        prompt = f"""You are Dr. Zarai, Pakistan's crop disease specialist.
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
