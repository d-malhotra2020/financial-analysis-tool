import requests
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random
import logging

logger = logging.getLogger(__name__)

class MarketDataService:
    """Simple market data service with mock data"""
    
    def __init__(self):
        self.cache = {}
    
    def get_stock_data(self, symbol: str, period: str = "1y") -> Optional[Dict]:
        """Get mock stock data"""
        try:
            # Generate mock historical data
            days = 252 if period == "1y" else 30
            base_price = 100 + (hash(symbol) % 400)  # Deterministic base price per symbol
            
            prices = []
            current_price = base_price
            
            for i in range(days):
                # Random walk with slight upward bias
                change = random.uniform(-0.05, 0.06)
                current_price = current_price * (1 + change)
                prices.append({
                    "date": (datetime.now() - timedelta(days=days-i)).strftime("%Y-%m-%d"),
                    "open": round(current_price * 0.99, 2),
                    "high": round(current_price * 1.02, 2),
                    "low": round(current_price * 0.98, 2),
                    "close": round(current_price, 2),
                    "volume": random.randint(1000000, 10000000)
                })
            
            return {
                "symbol": symbol,
                "data": prices,
                "current_price": round(current_price, 2)
            }
        except Exception as e:
            logger.error(f"Error generating data for {symbol}: {e}")
            return None
    
    def get_stock_info(self, symbol: str) -> Optional[Dict]:
        """Get mock stock information"""
        companies = {
            "AAPL": {"name": "Apple Inc.", "sector": "Technology", "industry": "Consumer Electronics"},
            "GOOGL": {"name": "Alphabet Inc.", "sector": "Technology", "industry": "Internet"},
            "MSFT": {"name": "Microsoft Corp.", "sector": "Technology", "industry": "Software"},
            "AMZN": {"name": "Amazon.com Inc.", "sector": "Consumer Discretionary", "industry": "E-commerce"},
            "TSLA": {"name": "Tesla Inc.", "sector": "Consumer Discretionary", "industry": "Electric Vehicles"}
        }
        
        if symbol.upper() in companies:
            info = companies[symbol.upper()]
        else:
            info = {"name": f"{symbol.upper()} Inc.", "sector": "Technology", "industry": "Software"}
        
        info.update({
            "symbol": symbol.upper(),
            "market_cap": random.randint(1000000000, 3000000000000),
            "pe_ratio": round(random.uniform(15, 35), 2),
            "dividend_yield": round(random.uniform(0, 0.04), 4)
        })
        
        return info