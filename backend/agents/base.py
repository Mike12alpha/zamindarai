from abc import ABC, abstractmethod
from typing import Any
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import get_settings, check_api_key

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
    def __init__(self, model: str = "gemini-1.5-flash", temperature: float = 0.3):
        self._model = model
        self._temperature = temperature
        self._llm = None

    @property
    def llm(self):
        if self._llm is None:
            settings = get_settings()
            self._llm = ChatGoogleGenerativeAI(
                model=self._model,
                temperature=self._temperature,
                convert_system_message_to_human=True,
                google_api_key=settings.GOOGLE_API_KEY or None,
            )
        return self._llm

    def _get_mock_response(self) -> str:
        raw_name = self.__class__.__name__.lower().replace("agent", "")
        name_map = {
            "cropdoctor": "crop_doctor",
            "priceoracle": "price_oracle",
            "soiladvisor": "soil_advisor",
            "dealguardian": "deal_guardian",
        }
        agent_name = name_map.get(raw_name, raw_name)
        mock = MOCK_RESPONSES.get(agent_name, "[DEMO MODE] No mock response configured for this agent.")
        try:
            return mock.format(
                farmer_name="Kisaan",
                buyer_name="Buyer",
                crop="wheat",
                quantity="500 kg",
                price="25"
            )
        except Exception:
            return mock

    def predict(self, prompt: str) -> str:
        settings = get_settings()

        # Demo mode: return mock responses without calling API
        if settings.DEMO_MODE:
            return self._get_mock_response()

        # Real mode: check API key before calling
        ok, msg = check_api_key()
        if not ok:
            return f"[CONFIG ERROR] {msg}\n\n[DEMO FALLBACK]:\n{self._get_mock_response()}"

        try:
            return self.llm.invoke(prompt).content
        except Exception as e:
            error_msg = str(e).lower()
            if any(x in error_msg for x in ["quota", "429", "insufficient_quota", "billing", "exhausted"]):
                return "Maaf kijiye, AI service filhal band hai. Admin se Google API billing check karwain."
            if "api key" in error_msg or "authentication" in error_msg:
                return f"[API KEY ERROR] {str(e)[:200]}\n\n[DEMO FALLBACK]:\n{self._get_mock_response()}"
            return f"[AI ERROR] {str(e)[:300]}\n\n[DEMO FALLBACK]:\n{self._get_mock_response()}"

    @abstractmethod
    def run(self, *args, **kwargs) -> dict[str, Any]:
        pass

    def format_sources(self, docs: list) -> str:
        return "\n\n".join([d.page_content for d in docs])
