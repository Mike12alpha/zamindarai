from agents.base import BaseAgent
from core.vector_store import kb
import os


class PriceOracleAgent(BaseAgent):
    def __init__(self):
        super().__init__(temperature=0.2)
        self.serp_key = os.getenv("SERPAPI_KEY", "")

    def get_kb_prices(self, crop: str, location: str) -> str:
        query = f"{crop} {location} mandi price Pakistan 2025"
        docs = kb.search(query, "mandi_prices", k=5)
        return self.format_sources(docs)

    def run(self, crop: str, quantity: str, location: str, offered_price: float) -> dict:
        kb_data = self.get_kb_prices(crop, location)

        # Extract average market rate from KB for fair-check
        avg_rate = None
        for line in kb_data.split("\n"):
            if "Average:" in line:
                try:
                    avg_rate = float(line.split("PKR")[1].split()[0])
                except:
                    pass

        prompt = f"""You are MandiMaster, Pakistan's agricultural market expert.
Farmer selling: {crop}
Quantity: {quantity}
Location: {location}
Buyer offered: PKR {offered_price}/kg

Market data:
{kb_data}

Respond in Roman Urdu:
1. Aaj ki mandi rate (Lahore, Faisalabad, {location})
2. Kya diya giya rate theek hai?
3. Agar kam hai to kitna nuksaan ho raha hai (percentage)
4. Aarti qeemat aur retail qeemat mein farq
5. Mashwara: Kaise behtar qeemat paain

Format as bullet points."""

        analysis = self.predict(prompt)

        is_fair = True
        if avg_rate and offered_price < avg_rate * 0.8:
            is_fair = False

        return {
            "analysis": analysis,
            "market_rate": avg_rate,
            "is_fair": is_fair,
            "offered_vs_market": offered_price / avg_rate if avg_rate else None
        }
