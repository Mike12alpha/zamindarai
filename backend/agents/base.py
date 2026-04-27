from abc import ABC, abstractmethod
from typing import Any
from langchain_openai import ChatOpenAI
import os

DEMO_MODE = os.getenv("DEMO_MODE", "").lower() in ("1", "true", "yes")

MOCK_RESPONSES = {
    "crop_doctor": """1. Bimari: Yellow Rust (Puccinia striiformis)
2. Wajah: Thandi aur nami wala mausam
3. Fori ilaj: Bayleton 10WP 500g/100L paani per acre spray karein
4. Organic: Neem oil 3% concentration se spray
5. Agle season: NARC-2021 ya PBW-343 resistant varieties boyain
6. Behtari: December mein boee se bachain""",

    "price_oracle": """1. Aaj ki mandi rate: Lahore PKR 2400/40kg, Faisalabad PKR 2350/40kg
2. Aapko PKR 25/kg offer diya gaya — yeh theek hai
3. Koi nuksaan nahi ho raha
4. Aarti rate: PKR 24/kg, Retail: PKR 32/kg
5. Mashwara: Mandi mein direct bechain ya online portal use karein""",

    "soil_advisor": """1. Soil test: N-90, P-60, K-40 kg/acre ki zaroorat
2. Khad: Sona Urea 2 bags, Engro DAP 1.5 bags, SOP 1 bag
3. Timing: Boee ke waqt DAP + half SOP, pehli sairai pe half urea
4. Paani: 3-4 sairai gandum ke liye
5. Budget option: FAUji Fertilizer ya local brand""",

    "deal_guardian": """BECHNAAMA — SALE AGREEMENT

Seller: {farmer_name}
Buyer: {buyer_name}
Crop: {crop} | Quantity: {quantity}
Rate: PKR {price}/kg

Terms:
- Payment within 3 days of delivery
- Quality grade: A/B/C (to be filled)
- Deductions: transport + commission max 5%
- Dispute: local union jirga
- Signatures: _______________ _______________

[ZamindarAI Verified]""",
}


class BaseAgent(ABC):
    def __init__(self, model: str = "gpt-3.5-turbo", temperature: float = 0.3):
        self._model = model
        self._temperature = temperature
        self._llm = None

    @property
    def llm(self):
        if self._llm is None:
            self._llm = ChatOpenAI(model=self._model, temperature=self._temperature)
        return self._llm

    def predict(self, prompt: str) -> str:
        if DEMO_MODE:
            agent_name = self.__class__.__name__.lower().replace("agent", "")
            mock = MOCK_RESPONSES.get(agent_name, "Demo mode: AI service unavailable.")
            # Simple template substitution for deal_guardian
            try:
                return mock.format(
                    farmer_name="Kisaan",
                    buyer_name="Buyer",
                    crop="wheat",
                    quantity="500 kg",
                    price="25"
                )
            except:
                return mock
        try:
            return self.llm.invoke(prompt).content
        except Exception as e:
            error_msg = str(e).lower()
            if "quota" in error_msg or "429" in error_msg or "insufficient_quota" in error_msg:
                return "Maaf kijiye, AI service filhal band hai. Admin se OpenAI billing check karwain."
            return f"AI error: {str(e)[:200]}"

    @abstractmethod
    def run(self, *args, **kwargs) -> dict[str, Any]:
        pass

    def format_sources(self, docs: list) -> str:
        return "\n\n".join([d.page_content for d in docs])
