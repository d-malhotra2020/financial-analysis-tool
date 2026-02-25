import yfinance as yf
import pandas as pd
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class MarketDataService:
    """Service for fetching real-time market data"""
    
    def __init__(self):
        self.cache = {}
        self.cache_duration = 300  # 5 minutes
    
    def get_stock_data(self, symbol: str, period: str = "1y") -> Optional[pd.DataFrame]:
        """Fetch stock data from Yahoo Finance"""
        try:
            stock = yf.Ticker(symbol)
            data = stock.history(period=period)
            return data
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {e}")
            return None
    
    def get_stock_info(self, symbol: str) -> Optional[Dict]:
        """Get basic stock information"""
        try:
            stock = yf.Ticker(symbol)
            return stock.info
        except Exception as e:
            logger.error(f"Error fetching info for {symbol}: {e}")
            return None