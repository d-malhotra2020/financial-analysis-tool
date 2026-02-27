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
            # Technology
            "AAPL": {"name": "Apple Inc.", "sector": "Technology", "industry": "Consumer Electronics"},
            "GOOGL": {"name": "Alphabet Inc.", "sector": "Technology", "industry": "Internet"},
            "MSFT": {"name": "Microsoft Corp.", "sector": "Technology", "industry": "Software"},
            "META": {"name": "Meta Platforms Inc.", "sector": "Technology", "industry": "Social Media"},
            "NVDA": {"name": "NVIDIA Corporation", "sector": "Technology", "industry": "Semiconductors"},
            "AMD": {"name": "Advanced Micro Devices", "sector": "Technology", "industry": "Semiconductors"},
            "INTC": {"name": "Intel Corporation", "sector": "Technology", "industry": "Semiconductors"},
            "ORCL": {"name": "Oracle Corporation", "sector": "Technology", "industry": "Software"},
            "CRM": {"name": "Salesforce Inc.", "sector": "Technology", "industry": "Software"},
            "ADBE": {"name": "Adobe Inc.", "sector": "Technology", "industry": "Software"},
            "CSCO": {"name": "Cisco Systems Inc.", "sector": "Technology", "industry": "Networking"},
            "IBM": {"name": "International Business Machines", "sector": "Technology", "industry": "IT Services"},
            "AVGO": {"name": "Broadcom Inc.", "sector": "Technology", "industry": "Semiconductors"},
            "ACN": {"name": "Accenture PLC", "sector": "Technology", "industry": "IT Services"},
            "TXN": {"name": "Texas Instruments Inc.", "sector": "Technology", "industry": "Semiconductors"},
            "QCOM": {"name": "Qualcomm Inc.", "sector": "Technology", "industry": "Semiconductors"},
            
            # Consumer Discretionary
            "AMZN": {"name": "Amazon.com Inc.", "sector": "Consumer Discretionary", "industry": "E-commerce"},
            "TSLA": {"name": "Tesla Inc.", "sector": "Consumer Discretionary", "industry": "Electric Vehicles"},
            "HD": {"name": "Home Depot Inc.", "sector": "Consumer Discretionary", "industry": "Home Improvement"},
            "MCD": {"name": "McDonald's Corp.", "sector": "Consumer Discretionary", "industry": "Restaurants"},
            "NKE": {"name": "Nike Inc.", "sector": "Consumer Discretionary", "industry": "Apparel"},
            "SBUX": {"name": "Starbucks Corp.", "sector": "Consumer Discretionary", "industry": "Restaurants"},
            
            # Financials
            "JPM": {"name": "JPMorgan Chase & Co.", "sector": "Financials", "industry": "Banking"},
            "BAC": {"name": "Bank of America Corp.", "sector": "Financials", "industry": "Banking"},
            "WFC": {"name": "Wells Fargo & Co.", "sector": "Financials", "industry": "Banking"},
            "GS": {"name": "Goldman Sachs Group Inc.", "sector": "Financials", "industry": "Investment Banking"},
            "MS": {"name": "Morgan Stanley", "sector": "Financials", "industry": "Investment Banking"},
            "AXP": {"name": "American Express Co.", "sector": "Financials", "industry": "Credit Services"},
            "V": {"name": "Visa Inc.", "sector": "Financials", "industry": "Payment Systems"},
            "MA": {"name": "Mastercard Inc.", "sector": "Financials", "industry": "Payment Systems"},
            "PYPL": {"name": "PayPal Holdings Inc.", "sector": "Financials", "industry": "Payment Systems"},
            "BRK.A": {"name": "Berkshire Hathaway Inc. Class A", "sector": "Financials", "industry": "Diversified"},
            "BRK.B": {"name": "Berkshire Hathaway Inc. Class B", "sector": "Financials", "industry": "Diversified"},
            
            # Healthcare
            "JNJ": {"name": "Johnson & Johnson", "sector": "Healthcare", "industry": "Pharmaceuticals"},
            "PFE": {"name": "Pfizer Inc.", "sector": "Healthcare", "industry": "Pharmaceuticals"},
            "ABBV": {"name": "AbbVie Inc.", "sector": "Healthcare", "industry": "Pharmaceuticals"},
            "MRK": {"name": "Merck & Co. Inc.", "sector": "Healthcare", "industry": "Pharmaceuticals"},
            "UNH": {"name": "UnitedHealth Group Inc.", "sector": "Healthcare", "industry": "Health Insurance"},
            "TMO": {"name": "Thermo Fisher Scientific Inc.", "sector": "Healthcare", "industry": "Life Sciences"},
            "ABT": {"name": "Abbott Laboratories", "sector": "Healthcare", "industry": "Medical Devices"},
            "DHR": {"name": "Danaher Corp.", "sector": "Healthcare", "industry": "Life Sciences"},
            "BMY": {"name": "Bristol Myers Squibb Co.", "sector": "Healthcare", "industry": "Pharmaceuticals"},
            
            # Consumer Staples
            "KO": {"name": "Coca-Cola Co.", "sector": "Consumer Staples", "industry": "Beverages"},
            "PEP": {"name": "PepsiCo Inc.", "sector": "Consumer Staples", "industry": "Beverages"},
            "WMT": {"name": "Walmart Inc.", "sector": "Consumer Staples", "industry": "Retail"},
            "PG": {"name": "Procter & Gamble Co.", "sector": "Consumer Staples", "industry": "Personal Products"},
            "COST": {"name": "Costco Wholesale Corp.", "sector": "Consumer Staples", "industry": "Retail"},
            "PM": {"name": "Philip Morris International Inc.", "sector": "Consumer Staples", "industry": "Tobacco"},
            
            # Energy
            "XOM": {"name": "Exxon Mobil Corp.", "sector": "Energy", "industry": "Oil & Gas"},
            "CVX": {"name": "Chevron Corporation", "sector": "Energy", "industry": "Oil & Gas"},
            
            # Industrials
            "BA": {"name": "Boeing Co.", "sector": "Industrials", "industry": "Aerospace"},
            "CAT": {"name": "Caterpillar Inc.", "sector": "Industrials", "industry": "Construction Machinery"},
            "HON": {"name": "Honeywell International Inc.", "sector": "Industrials", "industry": "Diversified Industrials"},
            "MMM": {"name": "3M Co.", "sector": "Industrials", "industry": "Diversified Industrials"},
            "UPS": {"name": "United Parcel Service Inc.", "sector": "Industrials", "industry": "Logistics"},
            "RTX": {"name": "Raytheon Technologies Corp.", "sector": "Industrials", "industry": "Aerospace"},
            "DE": {"name": "Deere & Co.", "sector": "Industrials", "industry": "Agricultural Equipment"},
            
            # Communication Services
            "GOOGL": {"name": "Alphabet Inc.", "sector": "Communication Services", "industry": "Internet"},
            "META": {"name": "Meta Platforms Inc.", "sector": "Communication Services", "industry": "Social Media"},
            "NFLX": {"name": "Netflix Inc.", "sector": "Communication Services", "industry": "Entertainment"},
            "DIS": {"name": "Walt Disney Co.", "sector": "Communication Services", "industry": "Entertainment"},
            "T": {"name": "AT&T Inc.", "sector": "Communication Services", "industry": "Telecommunications"},
            "VZ": {"name": "Verizon Communications Inc.", "sector": "Communication Services", "industry": "Telecommunications"},
            "TMUS": {"name": "T-Mobile US Inc.", "sector": "Communication Services", "industry": "Telecommunications"},
            "CMCSA": {"name": "Comcast Corp.", "sector": "Communication Services", "industry": "Media"},
            
            # Utilities
            "NEE": {"name": "NextEra Energy Inc.", "sector": "Utilities", "industry": "Electric Utilities"},
            
            # Materials
            "DOW": {"name": "Dow Inc.", "sector": "Materials", "industry": "Chemicals"}
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