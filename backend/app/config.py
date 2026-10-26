from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import model_validator
from typing import Literal
from urllib.parse import urlsplit


class Settings(BaseSettings):
    deployment_mode: Literal["development", "preview", "production"] = "development"
    public_url: str = ""
    public_indexing: bool = False
    database_url: str = "sqlite:///./gyrna.db"
    allowed_origins: str = (
        "http://localhost:5173,http://localhost:4173,"
        "http://127.0.0.1:5173,http://127.0.0.1:4173"
    )
    cookie_secure: bool = False
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

    @model_validator(mode="after")
    def production_configuration(self):
        if self.public_url:
            url = urlsplit(self.public_url)
            if url.scheme not in {"http", "https"} or not url.netloc or url.path not in {"", "/"}:
                raise ValueError("PUBLIC_URL must be an origin, without a path.")
            if url.username or url.password or url.query or url.fragment:
                raise ValueError("PUBLIC_URL cannot contain credentials, query or fragment.")
            self.public_url = self.public_url.rstrip("/")
        if self.deployment_mode != "development" and not self.public_url:
            raise ValueError("Public hosting requires PUBLIC_URL.")
        if self.public_indexing and not self.public_url:
            raise ValueError("Indexing requires PUBLIC_URL for canonical URLs and sitemap.")
        if self.deployment_mode == "production":
            if not self.public_url.startswith("https://") or not self.cookie_secure:
                raise ValueError("Production requires HTTPS PUBLIC_URL and COOKIE_SECURE=true.")
            if self.allowed_origins != self.public_url:
                raise ValueError("Production ALLOWED_ORIGINS must equal PUBLIC_URL.")
            if not self.database_url.startswith("sqlite:////"):
                raise ValueError(
                    "Production requires an absolute SQLite path on a persistent volume."
                )
        return self


settings = Settings()
