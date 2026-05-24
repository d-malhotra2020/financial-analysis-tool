"""Backtest harness — first-class, not a notebook script.

Every model has a sibling backtest function that replays it against historical
data without lookahead and emits a calibration report. The harness shares its
prediction code path with the live API (see app/services/simple_technical_analysis.py
:: SimpleTechnicalAnalysisService.predict_direction).
"""

HARNESS_VERSION = "1.0.0"

from .harness import run_backtest  # noqa: E402
from .models import BacktestResult, PredictionRecord  # noqa: E402

__all__ = ["run_backtest", "BacktestResult", "PredictionRecord", "HARNESS_VERSION"]
