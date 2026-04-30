from agents.base import BaseAgent
from core.vector_store import get_kb
from core.i18n import get_system_prompt


class SoilAdvisorAgent(BaseAgent):
    def __init__(self):
        super().__init__(temperature=0.3)

    def run(self, location: str, current_crop: str, previous_crop: str,
            soil_type: str, question: str, language: str = "en") -> dict:

        query = f"{location} {soil_type} {current_crop} {previous_crop} fertilizer Pakistan"
        kb = get_kb()
        try:
            docs = kb.search(query, "soil_guides", k=4)
            context = self.format_sources(docs)
        except Exception:
            context = "Knowledge base not yet populated."

        prompt = get_system_prompt(
            "soil_advisor",
            language=language,
            location=location,
            current_crop=current_crop,
            previous_crop=previous_crop,
            soil_type=soil_type,
            question=question,
            context=context
        )

        return {"advice": self.predict(prompt, language=language)}
