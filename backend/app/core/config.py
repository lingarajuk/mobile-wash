import os
from typing import List, Union
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AquaGo Mobile Water Wash API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    PORT: int = 5000
    NODE_ENV: str = "production"
    
    # Database
    DATABASE_URL: str = ""
    DB_HOST: str = "mysql"
    DB_PORT: int = 3306
    DB_NAME: str = "mobile_wash"
    DB_USER: str = "root"
    DB_PASSWORD: str = "password"
    
    # JWT Auth
    JWT_SECRET_KEY: str = "aquago_super_secret_jwt_key_2026_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440 # 24 hours
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:5175,http://127.0.0.1:5175,http://localhost:5000,http://127.0.0.1:5000,https://aquago.in,https://worker.aquago.in,https://admin.aquago.in,https://api.aquago.in"
    FRONTEND_URL: str = ""
    
    # Cloudinary Cloud Object Storage (optional for production uploads)
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    CLOUDINARY_URL: str = ""
    
    # Razorpay Payment Gateway Mock/Production credentials
    RAZORPAY_KEY_ID: str = "rzp_test_mockkey123"
    RAZORPAY_KEY_SECRET: str = "rzp_secret_mocksecret456"
    
    # Google Maps API
    GOOGLE_MAPS_API_KEY: str = ""
    
    # Uploads
    UPLOAD_DIRECTORY: str = "backend/uploads"

    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def database_connection_url(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL.strip()
            # Convert standard mysql:// (provided by Render/Railway/Aiven) to mysql+pymysql://
            if url.startswith("mysql://"):
                url = url.replace("mysql://", "mysql+pymysql://", 1)
            return url
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    @property
    def cors_origins_list(self) -> List[str]:
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        if self.FRONTEND_URL:
            for url in self.FRONTEND_URL.split(","):
                if url.strip() and url.strip() not in origins:
                    origins.append(url.strip())
        return origins

settings = Settings()
