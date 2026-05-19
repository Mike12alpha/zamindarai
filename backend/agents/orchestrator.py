import json
import os
from typing import Optional, Dict, Any
from agents import get_agent
from agents.base import BaseAgent
from core.i18n import get_system_prompt, get_message


class KisanCouncilOrchestrator(BaseAgent):
    def __init__(self):
        super().__init__(temperature=0)

    def run(self, *args, **kwargs) -> dict[str, Any]:
        """Orchestrator entry-point required by BaseAgent ABC."""
        user_message = kwargs.get("user_message", "")
        language = kwargs.get("language", "en")
        has_image = kwargs.get("has_image", False)
        plan = self.plan(user_message, has_image=has_image, language=language)
        results = self.execute(plan, **kwargs)
        return {
            "response": self.synthesize(user_message, plan, results, language=language),
            "plan": plan,
            "agent_results": results,
        }

    def plan(self, user_message: str, has_image: bool = False, language: str = "en") -> Dict[str, Any]:
        prompt = get_system_prompt(
            "orchestrator_plan",
            language=language,
            message=user_message,
            has_image="Yes" if has_image else "No"
        )

        raw = self.predict(prompt, language=language)
        raw = raw.replace("```json", "").replace("```", "").strip()
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {
                "agents_needed": ["CropDoctor"] if has_image else ["PriceOracle"],
                "reasoning": get_message("fallback_plan_reason", language),
                "entities": {},
                "urgency": "medium"
            }

    def execute(self, plan: Dict, user_id: int, image_bytes: Optional[bytes] = None,
                db_user=None, user_message: str = "", language: str = "en") -> Dict[str, Any]:
        results = {}
        entities = plan.get("entities", {})

        if "CropDoctor" in plan["agents_needed"]:
            agent = get_agent("crop_doctor")
            crop = entities.get("crop", "unknown")
            res = agent.run(image_bytes, crop, language=language) if image_bytes else {
                "treatment": "No image provided. Please upload a photo of your crop." if language == "en" else "کوئی تصویر نہیں بھیجی گئی۔ براہ کرم اپنی فصل کی تصویر اپ لوڈ کریں۔",
                "vision_analysis": "N/A",
                "sources": []
            }
            results["crop_doctor"] = res

        if "PriceOracle" in plan["agents_needed"]:
            agent = get_agent("price_oracle")
            res = agent.run(
                crop=entities.get("crop", "wheat"),
                quantity=entities.get("quantity", "1000 kg"),
                location=entities.get("district", db_user.district if db_user else "Lahore"),
                offered_price=entities.get("offered_price", 0),
                language=language
            )
            results["price_oracle"] = res

        if "SoilAdvisor" in plan["agents_needed"]:
            agent = get_agent("soil_advisor")
            res = agent.run(
                location=entities.get("district", "Lahore"),
                current_crop=entities.get("crop", "wheat"),
                previous_crop="unknown",
                soil_type="unknown",
                question=entities.get("question", user_message),
                language=language
            )
            results["soil_advisor"] = res

        if "DealGuardian" in plan["agents_needed"]:
            agent = get_agent("deal_guardian")
            market_rate = None
            if "price_oracle" in results:
                market_rate = results["price_oracle"].get("market_rate")

            res = agent.run(
                farmer_name=db_user.name if db_user else "Kisaan",
                buyer_name=entities.get("buyer_name", "Buyer"),
                crop=entities.get("crop", "wheat"),
                quantity=entities.get("quantity", "500 kg"),
                price_per_kg=entities.get("offered_price", 0),
                market_rate=market_rate,
                language=language
            )
            results["deal_guardian"] = res

        return results

    def synthesize(self, user_message: str, plan: Dict, results: Dict, language: str = "en") -> str:
        prompt = get_system_prompt(
            "orchestrator_synthesize",
            language=language,
            message=user_message,
            results=json.dumps(results, indent=2, ensure_ascii=False)
        )
        return self.predict(prompt, language=language)
