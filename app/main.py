from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import asyncio
from .routers import stocks, portfolio, predictions, analysis, sp500, dashboard
from .services.database import init_db
from .services.sp500_service import sp500_service
from .utils.config import get_settings

# Initialize settings
settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title="Financial Data Analysis Tool",
    description="Comprehensive financial analysis platform with ML predictions",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, tags=["Dashboard"])  # Dashboard at root
app.include_router(stocks.router, prefix="/api/v1/stocks", tags=["Stocks"])
app.include_router(sp500.router, prefix="/api/v1/sp500", tags=["S&P 500"])
app.include_router(portfolio.router, prefix="/api/v1/portfolio", tags=["Portfolio"])
app.include_router(predictions.router, prefix="/api/v1/predictions", tags=["Predictions"])
app.include_router(analysis.router, prefix="/api/v1/analysis", tags=["Analysis"])

@app.on_event("startup")
async def startup_event():
    """Initialize database and start background tasks on startup"""
    await init_db()
    
    # Start S&P 500 background updates
    asyncio.create_task(sp500_service.start_background_updates())
    
    print("🚀 Financial Data Analysis Tool started successfully!")
    print(f"📊 Processing capability: {settings.max_daily_data_points:,} data points/day")
    print(f"🤖 ML Model accuracy: {settings.model_accuracy}%")
    print(f"📈 S&P 500 real-time data: Updates every 5 minutes")
    print(f"📡 API Documentation: http://localhost:8000/docs")

# Mount Next.js static assets
frontend_out = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "out")
if os.path.isdir(os.path.join(frontend_out, "_next")):
    app.mount("/_next", StaticFiles(directory=os.path.join(frontend_out, "_next")), name="nextjs_assets")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Financial Data Analysis Tool",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )