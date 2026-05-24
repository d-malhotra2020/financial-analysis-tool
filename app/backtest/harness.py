"""Backtest harness — walk-forward historical replay with no lookahead.

At bar T the harness shows the model only `close[:T+1]` (closes through T,
inclusive). It calls the same `predict_direction` function the live API uses,
records the prediction, then compares it to the realized close at T+horizon.

The harness does not invent a different model for backtest; if the live code
path changes, the harness automatically reflects that change. That is the
whole point.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional

import pandas as pd

from ..services.simple_technical_analysis import SimpleTechnicalAnalysisService
from . import HARNESS_VERSION
from .data import fetch_history
from .models import BacktestResult, PredictionRecord, RunMetadata

logger = logging.getLogger(__name__)

# Minimum lookback required by the model. `generate_simple_predictions`
# refuses fewer than 10 closes, and `calculate_basic_indicators` (called via
# the live API) wants 20+. We standardize on 50 so SMA-50 is also meaningful.
MIN_HISTORY_BARS = 50

MODEL_VERSION = "simple_technical_analysis@trend-extrapolation-v1"
DATA_SOURCE = "yfinance"


def _direction(delta: float) -> str:
    if delta > 0:
        return "up"
    if delta < 0:
        return "down"
    return "flat"


def _window_key(iso_date: str) -> str:
    """Bucket an ISO date into YYYY-Qn."""
    try:
        d = datetime.strptime(iso_date, "%Y-%m-%d")
    except ValueError:
        # Some yfinance index strings carry tz suffixes; trim.
        d = datetime.strptime(iso_date[:10], "%Y-%m-%d")
    q = (d.month - 1) // 3 + 1
    return f"{d.year}-Q{q}"


def _backtest_symbol(
    symbol: str,
    df: pd.DataFrame,
    horizon_days: int,
    service: SimpleTechnicalAnalysisService,
) -> List[PredictionRecord]:
    """Walk-forward replay for a single symbol."""
    if "Close" not in df.columns:
        logger.warning("%s: no Close column, skipping", symbol)
        return []

    closes_full = df["Close"].astype(float).tolist()
    dates = list(df.index)
    n = len(closes_full)
    records: List[PredictionRecord] = []

    # Walk forward. At index t we use closes[:t+1] (inclusive of t). The
    # realized outcome is at t + horizon_days, which must exist.
    last_t = n - horizon_days - 1
    if last_t < MIN_HISTORY_BARS:
        logger.warning(
            "%s: not enough history (%d bars, need >= %d + %d horizon)",
            symbol, n, MIN_HISTORY_BARS, horizon_days,
        )
        return []

    for t in range(MIN_HISTORY_BARS, last_t + 1):
        history_slice = closes_full[: t + 1]  # closes through and including t
        prediction = service.predict_direction(history_slice)
        if "error" in prediction:
            continue

        current_price = float(closes_full[t])
        actual_price = float(closes_full[t + horizon_days])
        predicted_direction = prediction["direction"]
        actual_direction = _direction(actual_price - current_price)

        records.append(
            PredictionRecord(
                symbol=symbol,
                as_of_date=str(dates[t])[:10],
                target_date=str(dates[t + horizon_days])[:10],
                current_price=round(current_price, 4),
                predicted_price=round(float(prediction["predicted_price_1d"]), 4),
                predicted_direction=predicted_direction,
                actual_price=round(actual_price, 4),
                actual_direction=actual_direction,
                correct=(predicted_direction == actual_direction),
            )
        )

    return records


def _aggregate(records: List[PredictionRecord]) -> Dict:
    """Per-symbol, per-window, per-class aggregates."""
    by_symbol: Dict[str, Dict[str, float]] = {}
    by_window: Dict[str, Dict[str, float]] = {}

    for r in records:
        sym = by_symbol.setdefault(
            r.symbol, {"total": 0, "correct": 0, "accuracy": 0.0}
        )
        sym["total"] += 1
        sym["correct"] += int(r.correct)

        win = by_window.setdefault(
            _window_key(r.as_of_date),
            {"total": 0, "correct": 0, "accuracy": 0.0},
        )
        win["total"] += 1
        win["correct"] += int(r.correct)

    for v in by_symbol.values():
        v["accuracy"] = round(v["correct"] / v["total"], 4) if v["total"] else 0.0
    for v in by_window.values():
        v["accuracy"] = round(v["correct"] / v["total"], 4) if v["total"] else 0.0

    # Precision/recall per predicted class (up/down). Flat omitted unless seen.
    classes = ("up", "down", "flat")
    by_outcome: Dict[str, Dict[str, float]] = {}
    for cls in classes:
        predicted = sum(1 for r in records if r.predicted_direction == cls)
        actual = sum(1 for r in records if r.actual_direction == cls)
        tp = sum(
            1
            for r in records
            if r.predicted_direction == cls and r.actual_direction == cls
        )
        if predicted == 0 and actual == 0:
            continue
        by_outcome[cls] = {
            "predicted": predicted,
            "actual": actual,
            "true_positive": tp,
            "precision": round(tp / predicted, 4) if predicted else 0.0,
            "recall": round(tp / actual, 4) if actual else 0.0,
        }

    return {
        "by_symbol": by_symbol,
        "by_window": dict(sorted(by_window.items())),
        "by_outcome": by_outcome,
    }


def run_backtest(
    symbols: List[str],
    start_date: str,
    end_date: str,
    horizon_days: int = 1,
) -> BacktestResult:
    """Run the harness across a symbol universe and date range.

    Args:
        symbols: list of ticker symbols to backtest.
        start_date: ISO date (YYYY-MM-DD), inclusive.
        end_date:   ISO date (YYYY-MM-DD), exclusive (yfinance semantics).
        horizon_days: number of bars between prediction time and realized
            outcome. Default 1 (next-day direction).

    Returns a BacktestResult — never raises on per-symbol failures; logs and
    moves on. Raises only if no symbols produced any data.
    """
    service = SimpleTechnicalAnalysisService()
    all_records: List[PredictionRecord] = []

    for symbol in symbols:
        df = fetch_history(symbol, start_date, end_date)
        if df is None or df.empty:
            logger.warning("Skipping %s: no data", symbol)
            continue
        recs = _backtest_symbol(symbol, df, horizon_days, service)
        logger.info("%s: %d predictions", symbol, len(recs))
        all_records.extend(recs)

    if not all_records:
        raise RuntimeError(
            "No predictions generated — check symbol list, date range, and "
            "yfinance connectivity."
        )

    total = len(all_records)
    correct = sum(int(r.correct) for r in all_records)
    accuracy = round(correct / total, 4)
    aggregates = _aggregate(all_records)

    samples = [r.to_dict() for r in all_records[-100:]]

    meta = RunMetadata(
        harness_version=HARNESS_VERSION,
        model_version=MODEL_VERSION,
        data_source=DATA_SOURCE,
        run_at=datetime.now(timezone.utc).isoformat(timespec="seconds"),
        symbols=list(symbols),
        start_date=start_date,
        end_date=end_date,
        horizon_days=horizon_days,
    )

    return BacktestResult(
        predictions_total=total,
        predictions_correct=correct,
        accuracy=accuracy,
        by_symbol=aggregates["by_symbol"],
        by_window=aggregates["by_window"],
        by_outcome=aggregates["by_outcome"],
        samples=samples,
        run_metadata=meta.to_dict(),
    )
