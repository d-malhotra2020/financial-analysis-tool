from fastapi import APIRouter
from datetime import datetime
from ..services.sp500_service import sp500_service

router = APIRouter()

@router.get("/")
async def get_sp500_overview():
    """Get S&P 500 market overview with real-time data"""
    
    data = sp500_service.get_current_data()
    
    if "error" in data:
        return data
    
    return {
        "title": "S&P 500 Market Overview",
        "last_update": data["last_update"],
        "next_update": "Updates every 5 minutes",
        "market_summary": data["market_summary"],
        "market_indices": data["market_indices"]
    }

@router.get("/gainers")
async def get_top_gainers():
    """Get top 10 S&P 500 gainers"""
    
    data = sp500_service.get_current_data()
    
    if "error" in data:
        return data
    
    return {
        "title": "Top S&P 500 Gainers",
        "last_update": data["last_update"],
        "gainers": data["top_gainers"]
    }

@router.get("/losers")
async def get_top_losers():
    """Get top 10 S&P 500 losers"""
    
    data = sp500_service.get_current_data()
    
    if "error" in data:
        return data
    
    return {
        "title": "Top S&P 500 Losers", 
        "last_update": data["last_update"],
        "losers": data["top_losers"]
    }

@router.get("/active")
async def get_most_active():
    """Get most active S&P 500 stocks by volume"""
    
    data = sp500_service.get_current_data()
    
    if "error" in data:
        return data
    
    return {
        "title": "Most Active S&P 500 Stocks",
        "last_update": data["last_update"], 
        "most_active": data["most_active"]
    }

@router.get("/sectors")
async def get_sector_performance():
    """Get S&P 500 sector performance"""
    
    data = sp500_service.get_current_data()
    
    if "error" in data:
        return data
    
    return {
        "title": "S&P 500 Sector Performance",
        "last_update": data["last_update"],
        "sectors": data["sector_performance"]
    }

@router.get("/indices")
async def get_market_indices():
    """Get major market indices including S&P 500"""
    
    data = sp500_service.get_current_data()
    
    if "error" in data:
        return data
    
    return {
        "title": "Major Market Indices",
        "last_update": data["last_update"],
        "indices": data["market_indices"]
    }

@router.get("/summary")
async def get_market_summary():
    """Get comprehensive S&P 500 market summary"""
    
    data = sp500_service.get_current_data()
    
    if "error" in data:
        return data
    
    return {
        "title": "S&P 500 Market Summary",
        "last_update": data["last_update"],
        "update_frequency": "Every 5 minutes",
        "market_summary": data["market_summary"],
        "top_gainers_preview": data["top_gainers"][:5],
        "top_losers_preview": data["top_losers"][:5],
        "sector_performance": data["sector_performance"][:5],
        "major_indices": data["market_indices"]
    }