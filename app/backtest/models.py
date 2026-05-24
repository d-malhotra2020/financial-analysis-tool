"""Dataclasses for backtest results and individual prediction records.

Plain stdlib dataclasses — Pydantic isn't needed here, the FastAPI route serves
the already-serialized JSON file straight from disk.
"""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional


@dataclass
class PredictionRecord:
    """One model prediction at a single bar, plus the realized outcome."""
    symbol: str
    as_of_date: str           # ISO date of the bar the prediction was made on
    target_date: str          # ISO date of the bar the prediction targets
    current_price: float
    predicted_price: float
    predicted_direction: str  # "up" | "down" | "flat"
    actual_price: float
    actual_direction: str     # "up" | "down" | "flat"
    correct: bool

    def to_dict(self) -> Dict:
        return asdict(self)


@dataclass
class OutcomeStats:
    """Precision/recall for a single predicted class."""
    predicted: int            # times we predicted this class
    actual: int               # times this class actually occurred
    true_positive: int        # times we predicted AND it occurred
    precision: float          # TP / predicted
    recall: float             # TP / actual

    def to_dict(self) -> Dict:
        return asdict(self)


@dataclass
class RunMetadata:
    harness_version: str
    model_version: str
    data_source: str
    run_at: str               # ISO UTC timestamp
    symbols: List[str]
    start_date: str
    end_date: str
    horizon_days: int

    def to_dict(self) -> Dict:
        return asdict(self)


@dataclass
class BacktestResult:
    predictions_total: int
    predictions_correct: int
    accuracy: float
    by_symbol: Dict[str, Dict[str, float]] = field(default_factory=dict)
    by_window: Dict[str, Dict[str, float]] = field(default_factory=dict)
    by_outcome: Dict[str, Dict[str, float]] = field(default_factory=dict)
    samples: List[Dict] = field(default_factory=list)
    run_metadata: Optional[Dict] = None

    def to_dict(self) -> Dict:
        return asdict(self)
