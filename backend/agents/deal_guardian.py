from agents.base import BaseAgent
from core.i18n import get_system_prompt


class DealGuardianAgent(BaseAgent):
    def __init__(self):
        import os
        super().__init__(model=os.getenv("GEMINI_PRO_MODEL", "gemini-pro-latest"), temperature=0.2)

    def run(self, farmer_name: str, buyer_name: str, crop: str,
            quantity: str, price_per_kg: float, market_rate: float = None, language: str = "en") -> dict:

        is_fair = True
        warnings = []

        if market_rate and price_per_kg < market_rate * 0.85:
            is_fair = False
            warnings.append(f"Rate {price_per_kg} is {((market_rate - price_per_kg)/market_rate)*100:.0f}% below market!")

        prompt = get_system_prompt(
            "deal_guardian",
            language=language,
            farmer_name=farmer_name,
            buyer_name=buyer_name,
            crop=crop,
            quantity=quantity,
            price_per_kg=price_per_kg,
            market_rate=market_rate if market_rate else "unknown"
        )

        contract = self.predict(prompt, language=language)

        return {
            "contract_text": contract,
            "is_fair": is_fair,
            "warnings": warnings
        }
