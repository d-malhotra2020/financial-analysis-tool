from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import os

router = APIRouter()

# Get templates directory path
templates_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
templates = Jinja2Templates(directory=templates_dir)

@router.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Serve the interactive stock dashboard UI"""
    return templates.TemplateResponse("dashboard.html", {"request": request})

@router.get("/", response_class=HTMLResponse, include_in_schema=False)
async def dashboard_root(request: Request):
    """Serve dashboard at root for easy access"""
    return templates.TemplateResponse("dashboard.html", {"request": request})