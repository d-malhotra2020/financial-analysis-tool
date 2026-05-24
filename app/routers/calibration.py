"""Calibration endpoints — serve the backtest harness's output verbatim.

The harness writes data/calibration/<timestamp>.json + latest.json. These
routes read those files at request time and return them. No model logic here;
this is purely a static-asset shim that lets the frontend show real accuracy
numbers instead of marketing copy.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

router = APIRouter()
logger = logging.getLogger(__name__)

CALIBRATION_DIR = Path(__file__).resolve().parents[2] / "data" / "calibration"


def _load_json(path: Path) -> Dict[str, Any]:
    with path.open() as f:
        return json.load(f)


@router.get("/latest")
async def get_latest_calibration() -> Dict[str, Any]:
    """Return the most recent calibration report.

    Source of truth: data/calibration/latest.json, written by
    `python -m app.backtest.cli`. If the file is missing the harness
    has never been run, so the frontend should render its honest
    placeholder.
    """
    path = CALIBRATION_DIR / "latest.json"
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="No calibration report found. Run `python -m app.backtest.cli`.",
        )
    try:
        return _load_json(path)
    except Exception as e:
        logger.exception("Failed reading latest.json: %s", e)
        raise HTTPException(status_code=500, detail="Calibration report unreadable.")


@router.get("/history")
async def list_calibration_history() -> Dict[str, Any]:
    """List timestamped calibration runs (filename + run_at + accuracy)."""
    if not CALIBRATION_DIR.exists():
        return {"runs": []}

    runs: List[Dict[str, Any]] = []
    for path in sorted(CALIBRATION_DIR.glob("*.json")):
        if path.name == "latest.json":
            continue
        try:
            data = _load_json(path)
        except Exception as e:
            logger.warning("Skipping unreadable %s: %s", path, e)
            continue
        meta = data.get("run_metadata") or {}
        runs.append({
            "filename": path.name,
            "run_at": meta.get("run_at"),
            "accuracy": data.get("accuracy"),
            "predictions_total": data.get("predictions_total"),
            "symbols": meta.get("symbols", []),
            "start_date": meta.get("start_date"),
            "end_date": meta.get("end_date"),
            "horizon_days": meta.get("horizon_days"),
        })
    runs.sort(key=lambda r: r.get("run_at") or "", reverse=True)
    return {"runs": runs}
