# Polish Notes — Editorial-Quant Restyle (v0.2)

## What changed

- **Type system**: Inter (sans + dark) replaced by Source Serif 4 + JetBrains
  Mono via `next/font/google`. Body is 17px serif at 1.55 leading. Hero
  numerals are 5rem serif tabular; all tickers / prices / percentages are mono
  tabular.
- **Palette**: Dark zinc tokens replaced by a "Financial Times meets Mathematica"
  paper system — `--paper #f4f1ea`, `--ink #1f2937`, deep forest `--up #0f4c2c`,
  oxblood `--down #7a2d1d`, gold accent `--accent #a6883c`. No shadows, no
  gradients, no rounded corners >4px. Hairline (0.5px) rules in place of card
  borders.
- **New shell**: `TopNav` (serif lockup + mono v0.2 pill), `RecruiterIntro`
  (verbatim brief copy + live signal line pulled from `getMarketOverview()`),
  `Footer` (GitHub / portfolio / deep-dive links).
- **MarketOverview**: S&P 500 as a 5rem serif hero with Dow + NASDAQ as side
  stacks; three hairline-divided columns (Top gainers, Top losers, Most
  active). Click contract preserved.
- **StockDetail**: Issue name in 2.25rem serif, last price in 3.75rem mono.
  RSI / MACD / Volatility rendered as three small-multiple panels with serif
  italic captions. 1D / 7D / 30D forecasts as a strip.
- **StockChart**: `lightweight-charts` palette overridden to paper + ink +
  forest/oxblood candles; gold dashed crosshair; hairline-bordered segmented
  controls in mono small-caps; small-caps caption below ("Price · daily ·
  last 1Y · source: yfinance").
- **StockSearch**: Hairline-underlined mono uppercase input with serif label,
  hairline-bordered Go/Random buttons, hairline-divided suggestion rows.
- **StockNews**: Editorial cards — mono dateline, serif headline, serif
  excerpt, hairline rule between items. No images, no category pills.
- **CalibrationCard**: Honest "94% claim is un-backtested" copy plus a
  hairline-bordered "Next: published calibration table" placeholder in muted
  gold, and a four-step milestone strip.
- **Homepage**: Default view shows RecruiterIntro → search → MarketOverview →
  CalibrationCard (real data above the fold for a recruiter). Selecting a
  ticker swaps to a serialized read: detail → chart → news → calibration.

## Deferred (not in this pass)

- **Backtest harness**: doesn't exist yet — the CalibrationCard is the honest
  placeholder. Building it is a separate backend phase.
- **Dark mode**: skipped per brief; light theme is the win.
- **Repo reconciliation**: `~/projects/financial-analysis-tool/` (Railway copy)
  is still diverged. Not touched.
- **Railway redeploy verification**: a Drew-action after `git push`.
- **framer-motion & lucide-react**: still in `package.json` but no longer
  imported. Leaving them in until a dependency cleanup pass; tree-shaking
  removes them from the static export.

## Build

`npm run build` exits 0 from `frontend/`. Static export at `frontend/out/`
is 1.6M. Editorial palette tokens (`f4f1ea`, `0f4c2c`, `7a2d1d`, `a6883c`,
`--font-serif`, `Source Serif`, `JetBrains Mono`) all present in the
generated CSS bundle.
