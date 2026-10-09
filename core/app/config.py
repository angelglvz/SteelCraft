"""SteelCraft - Configuración de la aplicación mediante Pydantic Settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SteelCraft API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Base de datos
    DATABASE_URL: str

    # Criptografía y JWT
    SECRET_KEY: str = "super_secret_key_change_me_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 días

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()