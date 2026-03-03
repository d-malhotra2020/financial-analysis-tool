from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, FileResponse
import os

router = APIRouter()

TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend", "out")


@router.get("/dashboard", response_class=HTMLResponse, include_in_schema=False)
async def dashboard(request: Request):
    frontend_index = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.isfile(frontend_index):
        return FileResponse(frontend_index, media_type="text/html")
    return FileResponse(os.path.join(TEMPLATE_DIR, "dashboard.html"), media_type="text/html")


@router.get("/", response_class=HTMLResponse, include_in_schema=False)
async def dashboard_root(request: Request):
    frontend_index = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.isfile(frontend_index):
        return FileResponse(frontend_index, media_type="text/html")
    return FileResponse(os.path.join(TEMPLATE_DIR, "dashboard.html"), media_type="text/html")
