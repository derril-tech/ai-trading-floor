from pydantic_settings import BaseSettings
from typing import List
import os

# Created automatically by Cursor AI (2024-01-XX)

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Trading Floor Orchestrator"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/trading_floor"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # NATS
    NATS_URL: str = "nats://localhost:4222"
    
    # External APIs
    OPENAI_API_KEY: str = ""
    
    # CrewAI Settings
    CREW_VERBOSE: bool = True
    CREW_MEMORY: bool = True
    
    # Worker Settings
    WORKER_CONCURRENCY: int = 4
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
