"""CLI: `python -m app.backtest.cli` — run the harness with sensible defaults
and write the result to data/calibration/<timestamp>.json + latest.json.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .harness import run_backtest

DEFAULT_SYMBOLS = [
    "SPY", "AAPL", "NVDA", "MSFT", "GOOGL",
    "AMZN", "TSLA", "META", "JPM", "BRK-B",
]

CALIBRATION_DIR = Path(__file__).resolve().parents[2] / "data" / "calibration"


def _default_window() -> tuple[str, str]:
    end = datetime.now(timezone.utc).date()
    start = end - timedelta(days=365)
    return start.isoformat(), end.isoformat()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run the backtest harness.")
    default_start, default_end = _default_window()
    parser.add_argument("--symbols", nargs="+", default=DEFAULT_SYMBOLS,
                        help="Ticker symbols (default: 10 large caps).")
    parser.add_argument("--start", default=default_start,
                        help="Start date YYYY-MM-DD (default: 12 months ago).")
    parser.add_argument("--end", default=default_end,
                        help="End date YYYY-MM-DD exclusive (default: today).")
    parser.add_argument("--horizon", type=int, default=1,
                        help="Prediction horizon in trading days (default: 1).")
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(asctime)s %(levelname)s %(name)s :: %(message)s",
    )

    print(f"[harness] symbols={args.symbols}")
    print(f"[harness] window={args.start} .. {args.end}  horizon={args.horizon}d")

    try:
        result = run_backtest(
            symbols=args.symbols,
            start_date=args.start,
            end_date=args.end,
            horizon_days=args.horizon,
        )
    except RuntimeError as e:
        print(f"[harness] FAIL: {e}", file=sys.stderr)
        return 2

    CALIBRATION_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out_path = CALIBRATION_DIR / f"{stamp}.json"
    latest_path = CALIBRATION_DIR / "latest.json"

    payload = result.to_dict()
    with out_path.open("w") as f:
        json.dump(payload, f, indent=2)
    with latest_path.open("w") as f:
        json.dump(payload, f, indent=2)

    print(
        f"[harness] OK accuracy={result.accuracy:.4f} "
        f"({result.predictions_correct}/{result.predictions_total}) "
        f"-> {out_path.relative_to(CALIBRATION_DIR.parents[1])}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
