import json
import os
from typing import Optional, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from agents import get_agent
from core.urdu_utils import RomanUrduProcessor

DEMO_MODE = os.getenv("DEMO_MODE", "").lower() in ("1", "true", "yes")


class KisanCouncilOrchestrator:
    def __init__(self):
        self._model = "gemini-1.5-flash"
        self._temperature = 0
        self._llm = None

    @property
    def llm(self):
        if self._llm is None:
            self._llm = ChatGoogleGenerativeAI(
                model=self._model,
                temperature=self._temperature,
                convert_system_message_to_human=True
            )
        return self._llm

    def predict(self, prompt: str) -> str:
        if DEMO_MODE:
            if "Secretary" in prompt:
                return json.dumps({
                    "agents_needed": ["CropDoctor", "PriceOracle"],
                    "reasoning": "Demo: Farmer mentioned crop disease and price concern",
                    "entities": {"crop": "wheat", "offered_price": 25, "quantity": "1000 kg", "district": "Lahore"},
                    "urgency": "high"
                })
            if "Chairman" in prompt:
                return "Bhai jaan, aapki fasal mein zard dhabbay hain. Ye Yellow Rust hai. Bayleton 400g per acre spray karein. Aarti ka rate PKR 25/kg theek hai, mandi rate PKR 24/kg hai. Koi nuksaan nahi."
            return "Demo mode response."
        try:
            return self.llm.invoke(prompt).content
        except Exception as e:
            error_msg = str(e).lower()
            if "quota" in error_msg or "429" in error_msg or "insufficient_quota" in error_msg:
                return "Maaf kijiye, AI service filhal band hai. Admin se Google API billing check karwain."
            return f"AI error: {str(e)[:200]}"

    def plan(self, user_message: str, has_image: bool = False) -> Dict[str, Any]:
        normalized = RomanUrduProcessor.normalize(user_message)
        prompt = f"""You are the Kisan Council Secretary. Analyze this farmer message and decide which experts to summon.

Farmer Message: "{normalized}"
Image attached: {"Yes" if has_image else "No"}

Available Experts:
- CropDoctor: crop disease, spots, color change, wilting, pest, fungus
- PriceOracle: selling price, aarti, mandi rate, buyer offer, qeemat
- SoilAdvisor: khad, fertilizer, soil type, water, irrigation, mitti
- DealGuardian: contract, bechnama, agreement, buyer protection, signature

Return ONLY valid JSON:
{{
  "agents_needed": ["PriceOracle", "DealGuardian"],
  "reasoning": "Farmer mentioned selling wheat and wants protection from low aarti price",
  "entities": {{
    "crop": "wheat",
    "offered_price": 25,
    "quantity": "1000 kg",
    "buyer_name": "Local Aarti",
    "district": "Gujranwala",
    "question": "What fertilizer for next season?"
  }},
  "urgency": "high"
}}"""

        raw = self.predict(prompt)
        raw = raw.replace("```json", "").replace("```", "").strip()
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {
                "agents_needed": ["CropDoctor"] if has_image else ["PriceOracle"],
                "reasoning": "Fallback plan due to parsing error",
                "entities": {},
                "urgency": "medium"
            }

    def execute(self, plan: Dict, farmer_id: int, image_bytes: Optional[bytes] = None,
                db_farmer=None, user_message: str = "") -> Dict[str, Any]:
        results = {}
        entities = plan.get("entities", {})

        if "CropDoctor" in plan["agents_needed"]:
            agent = get_agent("crop_doctor")
            crop = entities.get("crop", "unknown")
            res = agent.run(image_bytes, crop) if image_bytes else {
                "treatment": "No image provided. Please upload a photo."
            }
            results["crop_doctor"] = res

        if "PriceOracle" in plan["agents_needed"]:
            agent = get_agent("price_oracle")
            res = agent.run(
                crop=entities.get("crop", "wheat"),
                quantity=entities.get("quantity", "1000 kg"),
                location=entities.get("district", db_farmer.district if db_farmer else "Lahore"),
                offered_price=entities.get("offered_price", 0)
            )
            results["price_oracle"] = res

        if "SoilAdvisor" in plan["agents_needed"]:
            agent = get_agent("soil_advisor")
            res = agent.run(
                location=entities.get("district", "Lahore"),
                current_crop=entities.get("crop", "wheat"),
                previous_crop="unknown",
                soil_type="unknown",
                question=entities.get("question", user_message)
            )
            results["soil_advisor"] = res

        if "DealGuardian" in plan["agents_needed"]:
            agent = get_agent("deal_guardian")
            market_rate = None
            if "price_oracle" in results:
                market_rate = results["price_oracle"].get("market_rate")

            res = agent.run(
                farmer_name=db_farmer.name if db_farmer else "Kisaan",
                buyer_name=entities.get("buyer_name", "Buyer"),
                crop=entities.get("crop", "wheat"),
                quantity=entities.get("quantity", "500 kg"),
                price_per_kg=entities.get("offered_price", 0),
                market_rate=market_rate
            )
            results["deal_guardian"] = res

        return results

    def synthesize(self, user_message: str, plan: Dict, results: Dict) -> str:
        prompt = f"""You are the Kisan Council Chairman. A farmer asked: "{user_message}"

You summoned these experts and got their reports:
{json.dumps(results, indent=2, ensure_ascii=False)}

Write ONE unified response in Roman Urdu that:
1. Greets the farmer respectfully
2. Answers all parts of their question in order of urgency
3. Uses simple farming language
4. Gives clear next steps (exact actions, not just advice)
5. Warns clearly if they are being exploited

Response:"""

        return self.predict(prompt)
