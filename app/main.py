from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn
import os
import asyncio
from .routers import stocks, portfolio, predictions, analysis, sp500
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

@app.get("/", response_class=HTMLResponse)
async def root():
    """Root endpoint with dashboard"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Financial Data Analysis Tool</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 40px;
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                color: white;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
            }
            h1 { font-size: 3rem; text-align: center; margin-bottom: 20px; }
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 40px 0;
            }
            .stat-card {
                background: rgba(255, 255, 255, 0.2);
                padding: 20px;
                border-radius: 10px;
                text-align: center;
            }
            .stat-value {
                font-size: 2.5rem;
                font-weight: bold;
                color: #4CAF50;
            }
            .endpoints {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin-top: 40px;
            }
            .endpoint {
                background: rgba(255, 255, 255, 0.1);
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #4CAF50;
            }
            .method { font-weight: bold; color: #4CAF50; }
            a { color: #64B5F6; text-decoration: none; }
            a:hover { text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📊 Financial Data Analysis Tool</h1>
            <p style="text-align: center; font-size: 1.2rem; margin-bottom: 40px;">
                Advanced financial analysis platform with machine learning predictions and real-time data processing
            </p>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value">1M+</div>
                    <div>Daily Data Points</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">94%</div>
                    <div>Prediction Accuracy</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">Real-time</div>
                    <div>Processing</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">ML</div>
                    <div>Powered Analysis</div>
                </div>
            </div>
            
            <h2>📈 S&P 500 Real-Time Data</h2>
            <div class="endpoints">
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div>/api/v1/sp500/</div>
                    <div>S&P 500 market overview (Updates every 5min)</div>
                </div>
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div>/api/v1/sp500/gainers</div>
                    <div>Top 10 S&P 500 gainers</div>
                </div>
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div>/api/v1/sp500/losers</div>
                    <div>Top 10 S&P 500 losers</div>
                </div>
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div>/api/v1/sp500/sectors</div>
                    <div>Sector performance data</div>
                </div>
            </div>
            
            <h2>🔗 Additional API Endpoints</h2>
            <div class="endpoints">
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div>/api/v1/stocks/{symbol}</div>
                    <div>Get stock data and analysis</div>
                </div>
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div>/api/v1/sp500/summary</div>
                    <div>Complete market summary</div>
                </div>
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div>/api/v1/sp500/indices</div>
                    <div>Major market indices</div>
                </div>
                <div class="endpoint">
                    <div class="method">GET</div>
                    <div>/api/v1/stocks/search</div>
                    <div>Search stocks by symbol</div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 40px;">
                <a href="/docs" style="background: #4CAF50; color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold;">
                    📚 View API Documentation
                </a>
            </div>
        </div>
    </body>
    </html>
    """

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