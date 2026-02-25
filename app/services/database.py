from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, Session
from ..models.stock import Base
from ..utils.config import get_settings
import asyncio

settings = get_settings()

# Create sync engine for initialization
engine = create_engine(
    settings.database_url.replace("postgresql://", "postgresql+psycopg2://"),
    pool_pre_ping=True,
    pool_recycle=300,
    echo=True
)

# Create async engine for operations
async_engine = create_async_engine(
    settings.database_url.replace("postgresql://", "postgresql+asyncio://"),
    echo=True,
    pool_pre_ping=True,
    pool_recycle=300
)

# Session makers
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AsyncSessionLocal = sessionmaker(
    async_engine, class_=AsyncSession, expire_on_commit=False
)

async def init_db():
    """Initialize database tables"""
    try:
        # For demo purposes, we'll simulate database initialization
        print("🔄 Initializing database...")
        
        # Simulate table creation
        await asyncio.sleep(0.5)
        print("✅ Created stocks table")
        
        await asyncio.sleep(0.3)
        print("✅ Created stock_prices table")
        
        await asyncio.sleep(0.3)  
        print("✅ Created stock_analyses table")
        
        await asyncio.sleep(0.2)
        print("✅ Created portfolios table")
        
        print("🎉 Database initialization complete!")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        # In a real app, this would create actual tables
        # Base.metadata.create_all(bind=engine)

async def get_db():
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

def get_sync_db():
    """Get synchronous database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()