from agents.base import BaseAgent
from core.vector_store import get_kb


class SoilAdvisorAgent(BaseAgent):
    def __init__(self):
        super().__init__(temperature=0.3)

    def run(self, location: str, current_crop: str, previous_crop: str,
            soil_type: str, question: str) -> dict:

        query = f"{location} {soil_type} {current_crop} {previous_crop} fertilizer Pakistan"
        kb = get_kb()
        docs = kb.search(query, "soil_guides", k=4)
        context = self.format_sources(docs)

        prompt = f"""You are ZaminExpert, Pakistan's soil scientist.
Location: {location}
Current crop: {current_crop}
Previous crop: {previous_crop}
Soil type: {soil_type}
Farmer's question: {question}

Knowledge base:
{context}

Provide in Roman Urdu:
1. Soil test recommendations (N, P, K, micronutrients)
2. Exact fertilizer names available in Pakistan (Sona Urea, Engro DAP, etc.)
3. Application timing and method
4. Water requirements
5. Cost-effective alternatives

Use local terms like 'kaddu', 'gandum', 'dhan'."""

        return {"advice": self.predict(prompt)}
