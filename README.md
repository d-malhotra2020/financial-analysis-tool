# Financial Data Analysis Tool

A market-data and analysis platform built around a single principle: every
model has a sibling backtest function, and the code that runs live is the
same code that runs in backtest. No notebook-only models, no marketing-only
accuracy claims.

## Features
- Real-time market data ingestion via yfinance
- Technical indicators (RSI, SMA, MACD, Bollinger, volatility, momentum)
- Direction-prediction model with a **first-class backtest harness**
- Calibration report served at `/api/v1/calibration/latest` and rendered in
  the dashboard
- FastAPI backend + Next.js frontend, served from one process in production

## Real accuracy (don't trust marketing copy — trust the harness)

The earlier version of this README claimed "94% accuracy" without any
backing. That number was aspirational. The current honest number, measured
by the backtest harness in `app/backtest/`, is:

**49.50%** next-day direction accuracy
(985 / 1990 predictions, 10 large-cap symbols, 2025-05-24 → 2026-05-24,
1-day horizon, no lookahead)

That's essentially coin-flip. The simple trend-extrapolation model has no
edge on next-day direction across this universe. The harness reports what
the harness reports; the README and the UI follow.

To reproduce:

```bash
python -m app.backtest.cli
```

Defaults: SPY, AAPL, NVDA, MSFT, GOOGL, AMZN, TSLA, META, JPM, BRK-B; the
trailing 12 months; 1-day horizon. The run writes
`data/calibration/<timestamp>.json` and updates `data/calibration/latest.json`,
which the dashboard fetches via `/api/v1/calibration/latest`.

## Tech Stack
- **Backend**: Python, FastAPI, yfinance, pandas
- **Frontend**: Next.js (static export), TypeScript
- **Data**: yfinance daily bars, cached under `data/backtest_cache/`
- **Deploy**: single Docker image (Next.js build + Python runtime)

## Project Structure
```
financial-analysis-tool/
├── app/
│   ├── main.py
│   ├── backtest/         # first-class harness — not a notebook
│   │   ├── harness.py    # walk-forward replay, no lookahead
│   │   ├── cli.py        # python -m app.backtest.cli
│   │   ├── data.py       # yfinance cache wrapper
│   │   └── models.py     # BacktestResult, PredictionRecord
│   ├── routers/
│   │   └── calibration.py  # GET /api/v1/calibration/{latest,history}
│   └── services/
│       └── simple_technical_analysis.py  # predict_direction() — shared
├── data/
│   ├── backtest_cache/   # local yfinance cache (gitignored)
│   └── calibration/      # committed; Railway has it at deploy time
├── frontend/
└── README.md
```

## Setup
1. Create a venv and install: `pip install -r requirements.txt`
2. Run the API: `python -m app.main`
3. Run the harness once: `python -m app.backtest.cli`
4. Open `http://localhost:8000/` for the dashboard or `/docs` for the API.

## Manifesto

> Backtest harness as a first-class feature, not a notebook script. Every
> model has a sibling backtest function that runs against historical data
> and emits a calibration report. The whole pipeline is "code that runs the
> same way live as it does in backtests."

If the harness says 49.5%, the UI says 49.5%. If a future model pushes the
number higher, the harness will say so and the UI will follow. The README
is no longer a place to make promises the harness can't back up.
