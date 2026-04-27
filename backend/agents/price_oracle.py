from agents.base import BaseAgent
from core.vector_store import get_kb
from app.config import get_settings
import requests


class PriceOracleAgent(BaseAgent):
    def __init__(self):
        super().__init__(temperature=0.2)

    def get_kb_prices(self, crop: str, location: str) -> str:
        query = f"{crop} {location} mandi price Pakistan 2025"
        kb = get_kb()
        try:
            docs = kb.search(query, "mandi_prices", k=5)
            return self.format_sources(docs)
        except Exception:
            return "No local price data available."

    def get_live_prices(self, crop: str, location: str) -> str:
        """Fetch live prices from SerpAPI if key is available."""
        settings = get_settings()
        if not settings.SERPAPI_KEY:
            return ""
        try:
            params = {
                "engine": "google",
                "q": f"{crop} mandi price {location} Pakistan today",
                "api_key": settings.SERPAPI_KEY,
                "num": 5,
                "gl": "pk",
                "hl": "en"
            }
            resp = requests.get("https://serpapi.com/search", params=params, timeout=10)
            data = resp.json()
            snippets = []
            for r in data.get("organic_results", []):
                snippet = r.get("snippet", "")
                if snippet:
                    snippets.append(snippet)
            return "\n".join(snippets) if snippets else ""
        except Exception:
            return ""

    def run(self, crop: str, quantity: str, location: str, offered_price: float) -> dict:
        kb_data = self.get_kb_prices(crop, location)
        live_data = self.get_live_prices(crop, location)

        # Extract average market rate from KB for fair-check
        avg_rate = None
        for line in kb_data.split("\n"):
            if "Average:" in line:
                try:
                    avg_rate = float(line.split("PKR")[1].split()[0])
                except Exception:
                    pass

        context = kb_data
        if live_data:
            context += f"\n\n[Live web search results]:\n{live_data}"

        prompt = f"""You are MandiMaster, Pakistan's agricultural market expert.
Farmer selling: {crop}
Quantity: {quantity}
Location: {location}
Buyer offered: PKR {offered_price}/kg

Market data:
{context}

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
