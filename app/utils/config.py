from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://user:password@localhost:5432/financial_db"
    redis_url: str = "redis://localhost:6379/0"
    
    # API Keys (set as environment variables)
    alpha_vantage_api_key: str = "demo"
    
    # Application settings
    max_daily_data_points: int = 1_000_000
    model_accuracy: float = 94.0
    cache_ttl: int = 300  # 5 minutes
    
    # ML Model settings
    model_retrain_interval: int = 86400  # 24 hours in seconds
    prediction_horizon_days: int = 30
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()