from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./gyrna.db"
    allowed_origins: str = "http://localhost:5173,http://localhost:4173"
    cookie_secure: bool = False
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")


settings = Settings()
