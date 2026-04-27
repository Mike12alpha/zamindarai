from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./zamindarai.db"
    GOOGLE_API_KEY: str = ""
    HF_TOKEN: str = ""
    SERPAPI_KEY: str = ""
    APP_SECRET_KEY: str = "dev-secret-key"
    DEMO_MODE: bool = False

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings():
    return Settings()


def check_api_key() -> tuple[bool, str]:
    """Returns (ok, message) for GOOGLE_API_KEY status."""
    settings = get_settings()
    if not settings.GOOGLE_API_KEY:
        return False, "GOOGLE_API_KEY is not set. Add it to your .env or Coolify environment variables."
    if len(settings.GOOGLE_API_KEY) < 10:
        return False, "GOOGLE_API_KEY looks invalid (too short)."
    return True, ""
