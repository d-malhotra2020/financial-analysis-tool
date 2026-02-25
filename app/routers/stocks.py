from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import asyncio

from ..services.database import get_db
from ..models.stock import StockResponse, StockDetailResponse, StockPriceResponse
from ..services.market_data import MarketDataService
from ..services.technical_analysis import TechnicalAnalysisService

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
        # Get stock info from Yahoo Finance
        stock = yf.Ticker(symbol.upper())
        info = stock.info
        
        # Get recent price data
        end_date = datetime.now()
        start_date = end_date - timedelta(days=history_days)
        hist = stock.history(start=start_date, end=end_date)
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
        
        # Get latest price
        latest_price = {
            "timestamp": hist.index[-1],
            "open_price": float(hist['Open'].iloc[-1]),
            "high_price": float(hist['High'].iloc[-1]),
            "low_price": float(hist['Low'].iloc[-1]),
            "close_price": float(hist['Close'].iloc[-1]),
            "volume": int(hist['Volume'].iloc[-1]),
            "adjusted_close": float(hist['Close'].iloc[-1])
        }
        
        # Calculate technical indicators
        technical_service = TechnicalAnalysisService()
        analysis = technical_service.calculate_indicators(hist)
        
        # Generate ML prediction (simulated)
        predicted_prices = technical_service.generate_predictions(hist)
        
        # Build response
        stock_detail = {
            "id": 1,
            "symbol": symbol.upper(),
            "name": info.get('longName', f"{symbol.upper()} Inc."),
            "exchange": info.get('exchange', 'NASDAQ'),
            "sector": info.get('sector', 'Technology'),
            "industry": info.get('industry', 'Software'),
            "market_cap": info.get('marketCap'),
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "latest_price": latest_price,
            "latest_analysis": {
                "analysis_date": datetime.now(),
                "rsi": analysis.get('rsi'),
                "macd": analysis.get('macd'),
                "volatility": analysis.get('volatility'),
                "beta": info.get('beta'),
                "sharpe_ratio": analysis.get('sharpe_ratio'),
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
            for idx, row in hist.iterrows():
                price_history.append({
                    "timestamp": idx,
                    "open_price": float(row['Open']),
                    "high_price": float(row['High']),
                    "low_price": float(row['Low']),
                    "close_price": float(row['Close']),
                    "volume": int(row['Volume']),
                    "adjusted_close": float(row['Close'])
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
        stock = yf.Ticker(symbol.upper())
        hist = stock.history(period=period, interval=interval)
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"No chart data found for {symbol}")
        
        chart_data = {
            "symbol": symbol.upper(),
            "period": period,
            "interval": interval,
            "data": []
        }
        
        for idx, row in hist.iterrows():
            chart_data["data"].append({
                "timestamp": idx.isoformat(),
                "open": float(row['Open']),
                "high": float(row['High']),
                "low": float(row['Low']),
                "close": float(row['Close']),
                "volume": int(row['Volume'])
            })
        
        return chart_data
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching chart data: {str(e)}")

@router.get("/{symbol}/analysis")
async def get_technical_analysis(symbol: str):
    """Get comprehensive technical analysis for a stock"""
    
    try:
        stock = yf.Ticker(symbol.upper())
        
        # Get 1 year of data for comprehensive analysis
        hist = stock.history(period="1y")
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
        
        technical_service = TechnicalAnalysisService()
        
        # Calculate all technical indicators
        indicators = technical_service.calculate_comprehensive_analysis(hist)
        
        # Generate predictions
        predictions = technical_service.generate_predictions(hist)
        
        # Risk analysis
        risk_metrics = technical_service.calculate_risk_metrics(hist)
        
        return {
            "symbol": symbol.upper(),
            "analysis_date": datetime.now().isoformat(),
            "technical_indicators": indicators,
            "predictions": predictions,
            "risk_metrics": risk_metrics,
            "summary": {
                "trend": indicators.get('trend', 'neutral'),
                "strength": indicators.get('strength', 'moderate'),
                "recommendation": indicators.get('recommendation', 'HOLD'),
                "confidence": 0.94
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error performing technical analysis: {str(e)}")

@router.post("/{symbol}/watchlist")
async def add_to_watchlist(symbol: str, db: AsyncSession = Depends(get_db)):
    """Add stock to user's watchlist"""
    
    # Simulate adding to watchlist
    await asyncio.sleep(0.1)
    
    return {
        "message": f"Added {symbol.upper()} to watchlist",
        "symbol": symbol.upper(),
        "added_at": datetime.now().isoformat()
    }