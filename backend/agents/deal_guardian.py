from agents.base import BaseAgent


class DealGuardianAgent(BaseAgent):
    def __init__(self):
        super().__init__(model="gemini-1.5-pro", temperature=0.2)

    def run(self, farmer_name: str, buyer_name: str, crop: str,
            quantity: str, price_per_kg: float, market_rate: float = None) -> dict:

        is_fair = True
        warnings = []

        if market_rate and price_per_kg < market_rate * 0.85:
            is_fair = False
            warnings.append(f"Rate {price_per_kg} is {((market_rate - price_per_kg)/market_rate)*100:.0f}% below market!")

        prompt = f"""Generate a simple sale agreement in Roman Urdu.

Seller (Kisaan): {farmer_name}
Buyer (Kharidaar): {buyer_name}
Crop: {crop}
Quantity: {quantity}
Rate: PKR {price_per_kg} per kg
Market reference rate: PKR {market_rate if market_rate else 'unknown'}

Include:
- Date and CNIC blanks
- Quality grade blank
- Payment within 3 days clause
- Transparent deductions section
- Dispute resolution
- Signature lines

Keep it simple. A farmer should read it aloud to the buyer."""

        contract = self.predict(prompt)

        return {
            "contract_text": contract,
            "is_fair": is_fair,
            "warnings": warnings
        }
