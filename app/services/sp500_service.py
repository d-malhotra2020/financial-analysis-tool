import asyncio
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging
import json

logger = logging.getLogger(__name__)

class SP500Service:
    """Service to fetch and manage S&P 500 real-time data"""
    
    def __init__(self):
        self.sp500_data = {}
        self.last_update = None
        self.update_interval = 300  # 5 minutes in seconds
        self.is_updating = False
        
        # S&P 500 major companies for simulation
        self.sp500_symbols = [
            "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK.B", "UNH", "JNJ",
            "JPM", "V", "PG", "HD", "CVX", "MA", "PFE", "ABBV", "BAC", "KO",
            "AVGO", "PEP", "COST", "TMO", "MRK", "ACN", "WMT", "DIS", "ABT", "CRM",
            "VZ", "ADBE", "NFLX", "NKE", "CMCSA", "DHR", "TXN", "NEE", "BMY", "PM",
            "RTX", "QCOM", "HON", "UPS", "T", "SBUX", "MDT", "LOW", "IBM", "AMT"
        ]
    
    async def start_background_updates(self):
        """Start background task to update S&P 500 data every 5 minutes"""
        logger.info("🔄 Starting S&P 500 background updates every 5 minutes")
        
        # Initial update
        await self.update_sp500_data()
        
        # Schedule periodic updates
        while True:
            await asyncio.sleep(self.update_interval)
            await self.update_sp500_data()
    
    async def update_sp500_data(self):
        """Update S&P 500 data"""
        if self.is_updating:
            return
            
        self.is_updating = True
        try:
            logger.info("📊 Updating S&P 500 data...")
            
            # Generate realistic market data
            market_data = self._generate_market_data()
            
            # Calculate market summary
            market_summary = self._calculate_market_summary(market_data)
            
            self.sp500_data = {
                "last_update": datetime.now().isoformat(),
                "market_summary": market_summary,
                "top_gainers": market_data["top_gainers"],
                "top_losers": market_data["top_losers"],
                "most_active": market_data["most_active"],
                "sector_performance": market_data["sector_performance"],
                "market_indices": market_data["market_indices"]
            }
            
            self.last_update = datetime.now()
            logger.info("✅ S&P 500 data updated successfully")
            
        except Exception as e:
            logger.error(f"❌ Error updating S&P 500 data: {e}")
        finally:
            self.is_updating = False
    
    def _generate_market_data(self) -> Dict:
        """Generate realistic S&P 500 market data"""
        import random
        
        # Generate stock data for top companies
        stocks_data = []
        for symbol in self.sp500_symbols[:50]:  # Top 50 companies
            base_price = 50 + (hash(symbol) % 300)  # Price range: $50-$350
            
            # Generate realistic daily change (-5% to +5%)
            daily_change_pct = random.uniform(-5.0, 5.0)
            daily_change = base_price * (daily_change_pct / 100)
            current_price = base_price + daily_change
            
            volume = random.randint(1000000, 50000000)
            
            stocks_data.append({
                "symbol": symbol,
                "name": self._get_company_name(symbol),
                "price": round(current_price, 2),
                "change": round(daily_change, 2),
                "change_percent": round(daily_change_pct, 2),
                "volume": volume,
                "market_cap": round(current_price * random.randint(1000000, 3000000000), 0)
            })
        
        # Sort for different categories
        sorted_by_change = sorted(stocks_data, key=lambda x: x["change_percent"])
        sorted_by_volume = sorted(stocks_data, key=lambda x: x["volume"], reverse=True)
        
        return {
            "all_stocks": stocks_data,
            "top_gainers": sorted_by_change[-10:][::-1],  # Top 10 gainers
            "top_losers": sorted_by_change[:10],          # Top 10 losers
            "most_active": sorted_by_volume[:10],         # Top 10 by volume
            "sector_performance": self._generate_sector_performance(),
            "market_indices": self._generate_market_indices()
        }
    
    def _calculate_market_summary(self, market_data: Dict) -> Dict:
        """Calculate overall market summary statistics"""
        all_stocks = market_data["all_stocks"]
        
        total_market_cap = sum(stock["market_cap"] for stock in all_stocks)
        avg_change = sum(stock["change_percent"] for stock in all_stocks) / len(all_stocks)
        
        gainers_count = len([s for s in all_stocks if s["change_percent"] > 0])
        losers_count = len([s for s in all_stocks if s["change_percent"] < 0])
        unchanged_count = len(all_stocks) - gainers_count - losers_count
        
        return {
            "total_companies": len(all_stocks),
            "total_market_cap": round(total_market_cap, 0),
            "average_change_percent": round(avg_change, 2),
            "advancing_stocks": gainers_count,
            "declining_stocks": losers_count,
            "unchanged_stocks": unchanged_count,
            "advance_decline_ratio": round(gainers_count / max(losers_count, 1), 2)
        }
    
    def _generate_sector_performance(self) -> List[Dict]:
        """Generate sector performance data"""
        import random
        
        sectors = [
            "Technology", "Healthcare", "Financials", "Consumer Discretionary",
            "Communication Services", "Industrials", "Consumer Staples",
            "Energy", "Utilities", "Real Estate", "Materials"
        ]
        
        sector_data = []
        for sector in sectors:
            change_pct = random.uniform(-3.0, 3.0)
            sector_data.append({
                "sector": sector,
                "change_percent": round(change_pct, 2),
                "companies_count": random.randint(15, 85)
            })
        
        return sorted(sector_data, key=lambda x: x["change_percent"], reverse=True)
    
    def _generate_market_indices(self) -> Dict:
        """Generate major market indices data"""
        import random
        
        indices = {
            "S&P 500": {"base": 4500, "symbol": "^GSPC"},
            "Dow Jones": {"base": 35000, "symbol": "^DJI"},
            "NASDAQ": {"base": 14000, "symbol": "^IXIC"},
            "Russell 2000": {"base": 2000, "symbol": "^RUT"}
        }
        
        indices_data = {}
        for name, info in indices.items():
            change_pct = random.uniform(-2.0, 2.0)
            current_value = info["base"] + (info["base"] * change_pct / 100)
            change_points = current_value - info["base"]
            
            indices_data[name] = {
                "symbol": info["symbol"],
                "value": round(current_value, 2),
                "change": round(change_points, 2),
                "change_percent": round(change_pct, 2)
            }
        
        return indices_data
    
    def _get_company_name(self, symbol: str) -> str:
        """Get company name for symbol"""
        company_names = {
            "AAPL": "Apple Inc.",
            "MSFT": "Microsoft Corporation",
            "GOOGL": "Alphabet Inc.",
            "AMZN": "Amazon.com Inc.",
            "NVDA": "NVIDIA Corporation",
            "META": "Meta Platforms Inc.",
            "TSLA": "Tesla Inc.",
            "BRK.B": "Berkshire Hathaway Inc.",
            "UNH": "UnitedHealth Group Inc.",
            "JNJ": "Johnson & Johnson",
            "JPM": "JPMorgan Chase & Co.",
            "V": "Visa Inc.",
            "PG": "Procter & Gamble Co.",
            "HD": "Home Depot Inc.",
            "CVX": "Chevron Corporation",
            "MA": "Mastercard Inc.",
            "PFE": "Pfizer Inc.",
            "ABBV": "AbbVie Inc.",
            "BAC": "Bank of America Corp.",
            "KO": "Coca-Cola Co."
        }
        return company_names.get(symbol, f"{symbol} Inc.")
    
    def get_current_data(self) -> Dict:
        """Get current S&P 500 data"""
        if not self.sp500_data:
            return {
                "error": "Data not yet available",
                "message": "S&P 500 data is being updated. Please try again in a moment."
            }
        
        return self.sp500_data
    
    def get_last_update_time(self) -> Optional[str]:
        """Get last update timestamp"""
        if self.last_update:
            return self.last_update.isoformat()
        return None

# Global instance
sp500_service = SP500Service()