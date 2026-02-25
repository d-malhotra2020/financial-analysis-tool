from datetime import datetime
from typing import Optional, List

# Simple data classes to replace pydantic models for deployment
class StockBase:
    def __init__(self, symbol: str, name: str, exchange: str, sector: str = None, industry: str = None, market_cap: float = None):
        self.symbol = symbol
        self.name = name
        self.exchange = exchange
        self.sector = sector
        self.industry = industry
        self.market_cap = market_cap

class StockCreate(StockBase):
    pass

class StockResponse(StockBase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.id = 1
        self.created_at = datetime.now()
        self.updated_at = datetime.now()

class StockPriceResponse:
    def __init__(self, timestamp: datetime, open_price: float, high_price: float, low_price: float, 
                 close_price: float, volume: int, adjusted_close: float = None):
        self.timestamp = timestamp
        self.open_price = open_price
        self.high_price = high_price
        self.low_price = low_price
        self.close_price = close_price
        self.volume = volume
        self.adjusted_close = adjusted_close

class StockAnalysisResponse:
    def __init__(self, analysis_date: datetime = None, **kwargs):
        self.analysis_date = analysis_date or datetime.now()
        for key, value in kwargs.items():
            setattr(self, key, value)

class StockDetailResponse(StockResponse):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.latest_price = None
        self.latest_analysis = None
        self.price_history = []