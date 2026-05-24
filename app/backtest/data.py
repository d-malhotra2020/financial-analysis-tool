"""Historical-data fetcher with on-disk cache.

Wraps yfinance. Caches CSV per (symbol, start, end) under data/backtest_cache/
so repeated harness runs don't hammer the upstream API. Returns a pandas
DataFrame indexed by ISO date with at minimum a `Close` column.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Optional

import pandas as pd
import yfinance as yf

logger = logging.getLogger(__name__)

_CACHE_DIR = Path(__file__).resolve().parents[2] / "data" / "backtest_cache"


def _cache_path(symbol: str, start: str, end: str) -> Path:
    safe = symbol.replace("/", "_").replace(":", "_")
    return _CACHE_DIR / f"{safe}__{start}__{end}.csv"


def fetch_history(
    symbol: str,
    start: str,
    end: str,
    use_cache: bool = True,
) -> Optional[pd.DataFrame]:
    """Fetch daily OHLCV history for `symbol` from yfinance, with caching.

    Returns a DataFrame indexed by ISO date string with columns including
    `Close`. Returns None on hard failure (network, unknown symbol).
    """
    _CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path = _cache_path(symbol, start, end)

    if use_cache and path.exists():
        try:
            df = pd.read_csv(path, index_col=0)
            if not df.empty:
                return df
        except Exception as e:
            logger.warning("Cache read failed for %s: %s", path, e)

    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(start=start, end=end, interval="1d", auto_adjust=False)
    except Exception as e:
        logger.error("yfinance fetch failed for %s: %s", symbol, e)
        return None

    if hist is None or hist.empty:
        logger.warning("No data returned for %s [%s..%s]", symbol, start, end)
        return None

    # Normalize index to plain ISO date strings so cache CSV is portable.
    hist = hist.copy()
    hist.index = [
        ts.strftime("%Y-%m-%d") if hasattr(ts, "strftime") else str(ts)
        for ts in hist.index
    ]
    hist.index.name = "date"

    try:
        hist.to_csv(path)
    except Exception as e:
        logger.warning("Cache write failed for %s: %s", path, e)

    return hist
