from abc import ABC, abstractmethod
from typing import Any
from langchain_openai import ChatOpenAI


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
        """Wrapper for LangChain 1.x compatibility."""
        return self.llm.invoke(prompt).content

    @abstractmethod
    def run(self, *args, **kwargs) -> dict[str, Any]:
        pass

    def format_sources(self, docs: list) -> str:
        return "\n\n".join([d.page_content for d in docs])
