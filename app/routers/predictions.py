from fastapi import APIRouter

router = APIRouter()

@router.get("/{symbol}")
async def get_predictions(symbol: str):
    """Get ML price predictions"""
    return {"message": "ML predictions coming soon", "symbol": symbol}