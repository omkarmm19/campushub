from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS / Deployment
    ALLOWED_ORIGINS: str = ""
    ENVIRONMENT: str = "development"

    # Cloudinary (Optional - has demo fallback)
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    # Email (Optional - for OTP password reset)
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@campushub.edu"
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_PORT: int = 587

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


# Single instance used across the entire app
settings = Settings()
