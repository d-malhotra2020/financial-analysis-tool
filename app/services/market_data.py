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
                    
                    # Use previous close as next open
                    open_price = current_price
                    
                    # Random 30-minute change
                    change = random.uniform(-0.03, 0.03)  # -3% to +3%
                    close_price = open_price * (1 + change)
                    
                    # Generate realistic high and low
                    min_price = min(open_price, close_price)
                    max_price = max(open_price, close_price)
                    
                    high_extension = random.uniform(0.002, 0.01)  # 0.2% to 1%
                    low_extension = random.uniform(0.002, 0.01)
                    
                    high_price = max_price * (1 + high_extension)
                    low_price = min_price * (1 - low_extension)
                    
                    prices.append({
                        "date": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                        "open": round(open_price, 2),
                        "high": round(high_price, 2),
                        "low": round(low_price, 2),
                        "close": round(close_price, 2),
                        "volume": random.randint(500000, 2000000)
                    })
                    
                    # Update current price for next iteration
                    current_price = close_price
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
                    # Use previous close as next open for realistic data
                    open_price = current_price
                    
                    # Random daily change
                    daily_change = random.uniform(-0.08, 0.10)  # -8% to +10%
                    close_price = open_price * (1 + daily_change)
                    
                    # Generate high and low based on open/close range
                    min_price = min(open_price, close_price)
                    max_price = max(open_price, close_price)
                    
                    # Extend high/low beyond open/close range
                    high_extension = random.uniform(0.005, 0.025)  # 0.5% to 2.5%
                    low_extension = random.uniform(0.005, 0.025)
                    
                    high_price = max_price * (1 + high_extension)
                    low_price = min_price * (1 - low_extension)
                    
                    prices.append({
                        "date": (datetime.now() - timedelta(days=days-i)).strftime("%Y-%m-%d"),
                        "open": round(open_price, 2),
                        "high": round(high_price, 2), 
                        "low": round(low_price, 2),
                        "close": round(close_price, 2),
                        "volume": random.randint(1000000, 10000000)
                    })
                    
                    # Update current price for next iteration
                    current_price = close_price
            
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