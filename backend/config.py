from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./data/cronflow.db"
    SCHEDULER_ENABLED: bool = True
    APP_ENV: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
