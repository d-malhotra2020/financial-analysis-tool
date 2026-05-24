# Polish Notes — Operator-Terminal Restyle (v0.2)

## What changed (this pass)

The editorial-quant cream-paper direction was retired. The frontend now
commits to an **operator-terminal** aesthetic — dark, tech-forward,
trading-platform energy. Same hand as drewmalhotra.com (dark + Geist Sans
+ JetBrains Mono + green pip indicators).

- **Type system**: Source Serif 4 dropped. Geist Sans is the display + body
  face (14px / 1.5 base). JetBrains Mono remains for tickers, numerics,
  deltas, labels — everywhere a number or terminal idiom appears.
- **Palette**: `--bg #0a0a0c` (deeper than zinc-950), `--surface #111114`,
  `--surface-2 #18181c`, hairline `--border #1f1f23` / `--border-strong
  #2a2a30`, `--text #e7e7ea` / `--text-soft #a1a1a6` / `--text-muted
  #6b6b70`. Bloomberg `--up #22c55e`, `--down #ef4444`, electric blue
  `--accent #3b82f6`. No shadows, ≤4px radii, subtle blue radial glow at
  the top of the page (`.page-glow`).
- **New chrome**: `StatusBar` at the very top — live ET clock ticking every
  second, pip-pulse green dot, market open/closed, ticker count,
  next-refresh countdown, v0.2 marker. `TickerTape` strip below it — RTL
  scrolling at 60s loop, pauses on hover, respects
  `prefers-reduced-motion`, clickable symbols → `onStockSelect`, refreshes
  every 5 minutes. `TopNav` now sits below them with a tight `D` accent
  glyph + Geist Sans lockup.
- **MarketOverview**: Hero panel with 56px JetBrains Mono S&P 500 numeral +
  Dow / NASDAQ side stack; three hairline-bordered surface panels for top
  gainers / losers / most active with mono `// HEADER` small-caps. Click
  contract preserved.
- **StockDetail**: Header panel with symbol (Geist Sans 28/600) + company
  name in `--text-soft` below; hero last price 64px JetBrains Mono with
  arrow + colored delta. Three indicator panels (RSI / MACD / Bollinger) —
  RSI flips to `--down` ≥70 or `--up` ≤30, MACD flips on sign.
- **StockChart**: lightweight-charts palette rebuilt against the dark
  tokens (`#0a0a0c` BG, `#111114` surface, grid `#1f1f23`, up `#22c55e`,
  down `#ef4444`, dashed crosshair `#3b82f6`). Segmented controls flip to
  `--accent` background when active. Caption below chart uses commented
  mono small-caps (`// PRICE · DAILY · LAST 1Y · SOURCE: YFINANCE`).
- **StockSearch**: Live yfinance dropdown preserved verbatim (debounce,
  local-then-remote merge). New chrome — surface input bar, hairline
  border flips to `--accent` on focus, leading `/` glyph, inline `random`
  button, kbd `/` hint pill. Global `/` keypress focuses the input
  (developer-tool affordance, classic).
- **StockNews**: Surface cards with `// SOURCE · TIME-AGO · SYMBOL` mono
  datelines, Geist Sans 14/500 headlines, soft excerpts. Hover lifts to
  `--surface-2`.
- **CalibrationCard**: Honest "94% un-backtested" copy retained. New
  surface panel with `// CALIBRATION REPORT` header, dashed-border `// NEXT:
  PUBLISHED CALIBRATION TABLE` placeholder in `--accent`, and a four-step
  badge strip connected by mono `──→` arrows (01 active in `--accent`, 02–04
  muted).
- **Footer**: Three links as mono small-caps with `// ` prefix, `·`
  separators, muted-to-soft hover, hairline top border.
- **Page**: `.page-glow` wrapper hosts the StatusBar → TickerTape → TopNav
  → RecruiterIntro → (search + MarketOverview | search + StockDetail +
  StockChart + StockNews) → CalibrationCard → Footer stack.

## Deferred (not in this pass)

- **Backtest harness**: still doesn't exist — `CalibrationCard` is the
  honest placeholder. Building it remains a separate backend phase.
- **Light mode**: skipped per brief; dark is the win.
- **Repo reconciliation**: `~/projects/financial-analysis-tool/` (Railway
  source-of-truth copy) is still diverged. Not touched.
- **Railway redeploy verification**: a Drew-action after `git push`.
- **framer-motion**: used (for `useReducedMotion` in TickerTape). lucide-
  react still in `package.json` but no longer imported. Cleanup deferred.

## Build

`npm run build` exits 0 from `frontend/`. Static export at `frontend/out/`
is 1.4M. Fingerprints in the generated bundle:

- `Source Serif`: 0 occurrences anywhere in `out/` (cleanly removed).
- `Geist`: present in the CSS chunk linked from `index.html`
  (`out/_next/static/chunks/fe424c90f3eef778.css`).
- `Drew Malhotra`: 1 in `out/index.html`.
- Palette tokens (`#0a0a0c`, `#22c55e`, `#3b82f6`) all present in the
  bundle.

Note on the fingerprint check: `next/font/google` self-hosts and rolls
the font-family declarations into the linked CSS chunk rather than
inlining them into `index.html`, so `grep Geist out/index.html` returns 0
even though Geist is loading. Search the chunks dir instead.
