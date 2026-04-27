from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./zamindarai.db"
    OPENAI_API_KEY: str = ""
    HF_TOKEN: str = ""
    SERPAPI_KEY: str = ""
    APP_SECRET_KEY: str = "dev-secret-key"

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()
