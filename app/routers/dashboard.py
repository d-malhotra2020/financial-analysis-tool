from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, FileResponse
import os

router = APIRouter()

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "out")


@router.get("/dashboard", response_class=HTMLResponse, include_in_schema=False)
async def dashboard(request: Request):
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"), media_type="text/html")


@router.get("/", response_class=HTMLResponse, include_in_schema=False)
async def dashboard_root(request: Request):
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"), media_type="text/html")
