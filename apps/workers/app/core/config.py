from pydantic_settings import BaseSettings
from typing import List
import os

# Created automatically by Cursor AI (2024-01-XX)

class Settings(BaseSettings):
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # NATS
    NATS_URL: str = "nats://localhost:4222"
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/trading_floor"
    
    # External APIs
    OPENAI_API_KEY: str = ""
    
    # Worker Settings
    WORKER_CONCURRENCY: int = 4
    MAX_TASKS_PER_CHILD: int = 1000
    
    # Task Timeouts
    TASK_TIME_LIMIT: int = 30 * 60  # 30 minutes
    TASK_SOFT_TIME_LIMIT: int = 25 * 60  # 25 minutes
    
    # Data Processing
    CHUNK_SIZE: int = 1000
    MAX_WORKERS: int = 4
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
