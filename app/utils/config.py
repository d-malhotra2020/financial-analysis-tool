from functools import lru_cache
import os

class Settings:
    def __init__(self):
        # Application settings
        self.max_daily_data_points = 1_000_000
        self.model_accuracy = 94.0
        self.cache_ttl = 300  # 5 minutes
        
        # ML Model settings
        self.model_retrain_interval = 86400  # 24 hours in seconds
        self.prediction_horizon_days = 30

@lru_cache()
def get_settings():
    return Settings()