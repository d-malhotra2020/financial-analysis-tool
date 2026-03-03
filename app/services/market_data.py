import yfinance as yf
from typing import Dict, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

PERIOD_MAP = {
    "1d": "1d",
    "5d": "5d",
    "1w": "5d",
    "1mo": "1mo",
    "3mo": "3mo",
    "6mo": "6mo",
    "1y": "1y",
    "2y": "2y",
    "5y": "5y",
    "10y": "10y",
    "ytd": "ytd",
    "max": "max",
}

INTERVAL_MAP = {
    "1d": "5m",
    "5d": "30m",
    "1w": "30m",
    "1mo": "1d",
    "3mo": "1d",
    "6mo": "1d",
    "1y": "1d",
    "2y": "1wk",
    "5y": "1wk",
    "10y": "1mo",
    "ytd": "1d",
    "max": "1mo",
}


class MarketDataService:
    def __init__(self):
        self.cache: Dict[str, Dict] = {}

    def get_stock_data(self, symbol: str, period: str = "1y") -> Optional[Dict]:
        try:
            ticker = yf.Ticker(symbol)
            yf_period = PERIOD_MAP.get(period, "1mo")
            yf_interval = INTERVAL_MAP.get(period, "1d")

            hist = ticker.history(period=yf_period, interval=yf_interval)

            if hist.empty:
                return None

            prices = []
            for idx, row in hist.iterrows():
                ts = idx
                if hasattr(ts, "strftime"):
                    if yf_interval in ("5m", "15m", "30m", "60m", "1h"):
                        date_str = ts.strftime("%Y-%m-%d %H:%M:%S")
                    else:
                        date_str = ts.strftime("%Y-%m-%d")
                else:
                    date_str = str(ts)

                prices.append({
                    "date": date_str,
                    "open": round(float(row["Open"]), 2),
                    "high": round(float(row["High"]), 2),
                    "low": round(float(row["Low"]), 2),
                    "close": round(float(row["Close"]), 2),
                    "volume": int(row["Volume"]),
                })

            current_price = prices[-1]["close"] if prices else 0

            return {
                "symbol": symbol.upper(),
                "data": prices,
                "current_price": current_price,
            }
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {e}")
            return None

    def get_stock_info(self, symbol: str) -> Optional[Dict]:
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info

            return {
                "symbol": symbol.upper(),
                "name": info.get("longName") or info.get("shortName") or f"{symbol.upper()}",
                "sector": info.get("sector", "N/A"),
                "industry": info.get("industry", "N/A"),
                "market_cap": info.get("marketCap", 0),
                "pe_ratio": info.get("trailingPE", 0),
                "dividend_yield": info.get("dividendYield", 0),
                "exchange": info.get("exchange", ""),
                "currency": info.get("currency", "USD"),
                "52_week_high": info.get("fiftyTwoWeekHigh", 0),
                "52_week_low": info.get("fiftyTwoWeekLow", 0),
                "avg_volume": info.get("averageVolume", 0),
            }
        except Exception as e:
            logger.error(f"Error fetching info for {symbol}: {e}")
            return {
                "symbol": symbol.upper(),
                "name": f"{symbol.upper()}",
                "sector": "N/A",
                "industry": "N/A",
                "market_cap": 0,
                "pe_ratio": 0,
                "dividend_yield": 0,
            }
