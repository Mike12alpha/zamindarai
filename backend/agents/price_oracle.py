from agents.base import BaseAgent
from core.vector_store import get_kb
from core.scraper import MandiScraper
from core.i18n import get_system_prompt, get_message


class PriceOracleAgent(BaseAgent):
    def __init__(self):
        super().__init__(temperature=0.2)
        self.scraper = MandiScraper()

    def get_kb_prices(self, crop: str, location: str, language: str = "en") -> str:
        query = f"{crop} {location} mandi price Pakistan 2025"
        kb = get_kb()
        try:
            docs = kb.search(query, "mandi_prices", k=5)
            return self.format_sources(docs)
        except Exception:
            return get_message("price_no_data", language)

    def get_live_prices(self, crop: str, location: str) -> str:
        prices = self.scraper.get_live_prices(crop, location)
        if not prices:
            return ""
        lines = []
        for p in prices:
            line = f"{p['crop']} - {p['market']}: PKR {p['price']}/{p.get('unit', '40kg')} ({p['date']})"
            if 'min_price' in p and 'max_price' in p:
                line += f" [Range: {p['min_price']}-{p['max_price']}]"
            lines.append(line)
        return "\n".join(lines)

    def run(self, crop: str, quantity: str, location: str, offered_price: float, language: str = "en") -> dict:
        kb_data = self.get_kb_prices(crop, location, language)
        live_data = self.get_live_prices(crop, location)

        # Calculate avg from live data
        avg_rate = None
        if live_data:
            prices = []
            for line in live_data.split("\n"):
                if "PKR " in line:
                    try:
                        price_part = line.split("PKR ")[1].split("/")[0]
                        prices.append(float(price_part))
                    except Exception:
                        pass
            if prices:
                avg_rate = sum(prices) / len(prices)

        context = kb_data
        if live_data:
            context += f"\n\n[Live market prices]:\n{live_data}"

        prompt = get_system_prompt(
            "price_oracle",
            language=language,
            crop=crop,
            quantity=quantity,
            location=location,
            offered_price=offered_price,
            context=context
        )

        analysis = self.predict(prompt, language=language)

        is_fair = True
        if avg_rate and offered_price < avg_rate * 0.8:
            is_fair = False

        # Convert avg rate to per kg if it's per 40kg
        displayed_rate = avg_rate
        if displayed_rate and displayed_rate > 100:
            displayed_rate = displayed_rate / 40

        return {
            "analysis": analysis,
            "market_rate": round(displayed_rate, 2) if displayed_rate else None,
            "is_fair": is_fair,
            "offered_vs_market": offered_price / displayed_rate if displayed_rate else None
        }
