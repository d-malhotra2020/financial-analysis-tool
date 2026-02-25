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
            base_price = 100 + (hash(symbol) % 400)  # Deterministic base price per symbol
            prices = []
            current_price = base_price
            
            if period == "1d":
                # Generate intraday data (hourly intervals for 1 day)
                now = datetime.now()
                start_time = now.replace(hour=9, minute=30, second=0, microsecond=0)  # Market open
                
                for i in range(13):  # 9:30 AM to 4:00 PM (6.5 hours * 2 = 13 intervals)
                    timestamp = start_time + timedelta(minutes=30 * i)
                    change = random.uniform(-0.02, 0.02)
                    current_price = current_price * (1 + change)
                    
                    prices.append({
                        "date": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                        "open": round(current_price * 0.998, 2),
                        "high": round(current_price * 1.005, 2),
                        "low": round(current_price * 0.995, 2),
                        "close": round(current_price, 2),
                        "volume": random.randint(500000, 2000000)
                    })
            else:
                # Map period to days for daily data
                period_map = {
                    "5d": 5, 
                    "1w": 7,
                    "1mo": 30,
                    "3mo": 90,
                    "6mo": 180,
                    "1y": 252,
                    "2y": 504,
                    "5y": 1260,
                    "max": 2520
                }
                
                days = period_map.get(period, 30)  # Default to 30 days if period not found
                
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