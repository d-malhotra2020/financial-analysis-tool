from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
import asyncio

from ..services.market_data import MarketDataService
from ..services.simple_technical_analysis import SimpleTechnicalAnalysisService

router = APIRouter()

@router.get("/search")
async def search_stocks(
    query: str = Query(..., min_length=1, description="Stock symbol or company name"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results")
):
    """Search for stocks by symbol or company name"""
    
    # Simulate stock search results
    mock_results = [
        {"symbol": "AAPL", "name": "Apple Inc.", "exchange": "NASDAQ", "sector": "Technology"},
        {"symbol": "GOOGL", "name": "Alphabet Inc.", "exchange": "NASDAQ", "sector": "Technology"},
        {"symbol": "MSFT", "name": "Microsoft Corp.", "exchange": "NASDAQ", "sector": "Technology"},
        {"symbol": "AMZN", "name": "Amazon.com Inc.", "exchange": "NASDAQ", "sector": "Consumer Discretionary"},
        {"symbol": "TSLA", "name": "Tesla Inc.", "exchange": "NASDAQ", "sector": "Consumer Discretionary"},
    ]
    
    # Filter results based on query
    filtered_results = [
        stock for stock in mock_results 
        if query.upper() in stock["symbol"] or query.lower() in stock["name"].lower()
    ]
    
    return {
        "query": query,
        "results": filtered_results[:limit],
        "total_found": len(filtered_results)
    }

@router.get("/{symbol}")
async def get_stock_detail(
    symbol: str,
    include_history: bool = Query(False, description="Include price history"),
    history_days: int = Query(30, ge=1, le=365, description="Number of days of history")
):
    """Get detailed stock information including latest price and analysis"""
    
    try:
        # Use mock data services
        market_service = MarketDataService()
        technical_service = SimpleTechnicalAnalysisService()
        
        # Get stock data and info
        stock_data = market_service.get_stock_data(symbol, "1y")
        stock_info = market_service.get_stock_info(symbol)
        
        if not stock_data or not stock_info:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
        
        # Extract prices for technical analysis
        prices = [day["close"] for day in stock_data["data"][-history_days:]]
        
        # Get latest price data
        latest_data = stock_data["data"][-1]
        latest_price = {
            "timestamp": datetime.now(),
            "open_price": latest_data["open"],
            "high_price": latest_data["high"],
            "low_price": latest_data["low"],
            "close_price": latest_data["close"],
            "volume": latest_data["volume"],
            "adjusted_close": latest_data["close"]
        }
        
        # Calculate technical indicators
        analysis = technical_service.calculate_basic_indicators(prices)
        predicted_prices = technical_service.generate_simple_predictions(prices)
        
        # Build response
        stock_detail = {
            "id": 1,
            "symbol": symbol.upper(),
            "name": stock_info["name"],
            "exchange": "NASDAQ",
            "sector": stock_info["sector"],
            "industry": stock_info["industry"],
            "market_cap": stock_info["market_cap"],
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "latest_price": latest_price,
            "latest_analysis": {
                "analysis_date": datetime.now(),
                "rsi": analysis.get('rsi'),
                "macd": None,
                "volatility": analysis.get('volatility'),
                "beta": 1.2,
                "sharpe_ratio": None,
                "predicted_price_1d": predicted_prices.get('1d'),
                "predicted_price_7d": predicted_prices.get('7d'),
                "predicted_price_30d": predicted_prices.get('30d'),
                "confidence_score": 0.94,
                "recommendation": analysis.get('recommendation'),
                "analysis_notes": f"Technical analysis for {symbol.upper()} shows {analysis.get('trend', 'neutral')} trend."
            }
        }
        
        # Add price history if requested
        if include_history:
            price_history = []
            for day in stock_data["data"][-history_days:]:
                price_history.append({
                    "timestamp": datetime.strptime(day["date"], "%Y-%m-%d"),
                    "open_price": day["open"],
                    "high_price": day["high"],
                    "low_price": day["low"],
                    "close_price": day["close"],
                    "volume": day["volume"],
                    "adjusted_close": day["close"]
                })
            stock_detail["price_history"] = price_history
        
        return stock_detail
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching stock data: {str(e)}")

@router.get("/{symbol}/chart")
async def get_stock_chart_data(
    symbol: str,
    period: str = Query("1mo", regex="^(1d|5d|1mo|3mo|6mo|1y|2y|5y|10y|ytd|max)$"),
    interval: str = Query("1d", regex="^(1m|2m|5m|15m|30m|60m|90m|1h|1d|5d|1wk|1mo|3mo)$")
):
    """Get stock chart data for visualization"""
    
    try:
        market_service = MarketDataService()
        stock_data = market_service.get_stock_data(symbol, period)
        
        if not stock_data:
            raise HTTPException(status_code=404, detail=f"No chart data found for {symbol}")
        
        chart_data = {
            "symbol": symbol.upper(),
            "period": period,
            "interval": interval,
            "data": []
        }
        
        for day in stock_data["data"]:
            chart_data["data"].append({
                "timestamp": day["date"],
                "open": day["open"],
                "high": day["high"],
                "low": day["low"],
                "close": day["close"],
                "volume": day["volume"]
            })
        
        return chart_data
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching chart data: {str(e)}")

@router.get("/{symbol}/analysis")
async def get_technical_analysis(symbol: str):
    """Get comprehensive technical analysis for a stock"""
    
    try:
        market_service = MarketDataService()
        technical_service = SimpleTechnicalAnalysisService()
        
        # Get 1 year of data for comprehensive analysis
        stock_data = market_service.get_stock_data(symbol, "1y")
        
        if not stock_data:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
        
        # Extract prices for analysis
        prices = [day["close"] for day in stock_data["data"]]
        
        # Calculate basic technical indicators
        indicators = technical_service.calculate_basic_indicators(prices)
        
        # Generate predictions
        predictions = technical_service.generate_simple_predictions(prices)
        
        return {
            "symbol": symbol.upper(),
            "analysis_date": datetime.now().isoformat(),
            "technical_indicators": indicators,
            "predictions": predictions,
            "risk_metrics": {
                "volatility_annual": indicators.get('volatility', 0),
                "risk_score": 25.0
            },
            "summary": {
                "trend": indicators.get('trend', 'neutral'),
                "strength": "moderate",
                "recommendation": indicators.get('recommendation', 'HOLD'),
                "confidence": 0.94
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error performing technical analysis: {str(e)}")

@router.post("/{symbol}/watchlist")
async def add_to_watchlist(symbol: str):
    """Add stock to user's watchlist"""
    
    # Simulate adding to watchlist
    await asyncio.sleep(0.1)
    
    return {
        "message": f"Added {symbol.upper()} to watchlist",
        "symbol": symbol.upper(),
        "added_at": datetime.now().isoformat()
    }