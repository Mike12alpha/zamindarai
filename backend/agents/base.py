from abc import ABC, abstractmethod
from typing import Any
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import get_settings, check_api_key
from core.i18n import get_system_prompt


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

    def predict(self, prompt: str, language: str = "en") -> str:
        settings = get_settings()
        ok, msg = check_api_key()
        if not ok:
            if language == "ur":
                return f"[ترتیبی خرابی] {msg}\n\nبراہ کرم ایڈمن سے رابطہ کریں۔"
            return f"[CONFIG ERROR] {msg}\n\nPlease contact admin."

        try:
            return self.llm.invoke(prompt).content
        except Exception as e:
            error_msg = str(e).lower()
            if any(x in error_msg for x in ["quota", "429", "insufficient_quota", "billing", "exhausted"]):
                if language == "ur":
                    return "معاف کیجئے، AI سروس فی الحال بند ہے۔ ایڈمن سے Google API billing چیک کروائیں۔"
                return "Sorry, the AI service is temporarily unavailable. Please ask admin to check Google API billing."
            if "api key" in error_msg or "authentication" in error_msg:
                if language == "ur":
                    return f"[API کلید کی خرابی] براہ کرم ایڈمن سے رابطہ کریں۔"
                return f"[API KEY ERROR] Please contact admin."
            if language == "ur":
                return f"[AI خرابی] براہ کرم دوبارہ کوشش کریں۔"
            return f"[AI ERROR] Please try again."

    @abstractmethod
    def run(self, *args, **kwargs) -> dict[str, Any]:
        pass

    def format_sources(self, docs: list) -> str:
        return "\n\n".join([d.page_content for d in docs])
