from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List

Base = declarative_base()

class Stock(Base):
    __tablename__ = "stocks"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(10), unique=True, index=True, nullable=False)
    name = Column(String(200), nullable=False)
    exchange = Column(String(50), nullable=False)
    sector = Column(String(100))
    industry = Column(String(100))
    market_cap = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    prices = relationship("StockPrice", back_populates="stock")
    analyses = relationship("StockAnalysis", back_populates="stock")

class StockPrice(Base):
    __tablename__ = "stock_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    open_price = Column(Float, nullable=False)
    high_price = Column(Float, nullable=False)
    low_price = Column(Float, nullable=False)
    close_price = Column(Float, nullable=False)
    volume = Column(Integer, nullable=False)
    adjusted_close = Column(Float)
    
    # Relationships
    stock = relationship("Stock", back_populates="prices")

class StockAnalysis(Base):
    __tablename__ = "stock_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    stock_id = Column(Integer, ForeignKey("stocks.id"), nullable=False)
    analysis_date = Column(DateTime, default=datetime.utcnow)
    
    # Technical indicators
    rsi = Column(Float)  # Relative Strength Index
    macd = Column(Float)  # Moving Average Convergence Divergence
    bollinger_upper = Column(Float)
    bollinger_lower = Column(Float)
    sma_20 = Column(Float)  # 20-day Simple Moving Average
    sma_50 = Column(Float)  # 50-day Simple Moving Average
    
    # Risk metrics
    volatility = Column(Float)
    beta = Column(Float)
    sharpe_ratio = Column(Float)
    
    # ML prediction
    predicted_price_1d = Column(Float)
    predicted_price_7d = Column(Float)
    predicted_price_30d = Column(Float)
    confidence_score = Column(Float)
    
    # Analysis summary
    recommendation = Column(String(20))  # BUY, SELL, HOLD
    analysis_notes = Column(Text)
    
    # Relationships
    stock = relationship("Stock", back_populates="analyses")

# Pydantic models for API
class StockBase(BaseModel):
    symbol: str
    name: str
    exchange: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    market_cap: Optional[float] = None

class StockCreate(StockBase):
    pass

class StockResponse(StockBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class StockPriceResponse(BaseModel):
    timestamp: datetime
    open_price: float
    high_price: float
    low_price: float
    close_price: float
    volume: int
    adjusted_close: Optional[float] = None
    
    class Config:
        from_attributes = True

class StockAnalysisResponse(BaseModel):
    analysis_date: datetime
    rsi: Optional[float] = None
    macd: Optional[float] = None
    volatility: Optional[float] = None
    beta: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    predicted_price_1d: Optional[float] = None
    predicted_price_7d: Optional[float] = None
    predicted_price_30d: Optional[float] = None
    confidence_score: Optional[float] = None
    recommendation: Optional[str] = None
    analysis_notes: Optional[str] = None
    
    class Config:
        from_attributes = True

class StockDetailResponse(StockResponse):
    latest_price: Optional[StockPriceResponse] = None
    latest_analysis: Optional[StockAnalysisResponse] = None
    price_history: List[StockPriceResponse] = []