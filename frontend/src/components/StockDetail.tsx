"use client";

import type { StockDetail as StockDetailType } from "@/lib/types";

interface Props {
  data: StockDetailType | null;
  loading: boolean;
}

function formatVolume(vol: number): string {
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
  return vol.toLocaleString();
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
  return `$${cap.toLocaleString()}`;
}

function rsiInterpretation(rsi: number | null): string {
  if (rsi === null || rsi === undefined) return "—";
  if (rsi >= 70) return "Overbought";
  if (rsi <= 30) return "Oversold";
  return "Neutral";
}

function macdInterpretation(macd: number | null): string {
  if (macd === null || macd === undefined) return "—";
  if (macd > 0) return "Bullish crossover";
  if (macd < 0) return "Bearish crossover";
  return "Neutral";
}

export default function StockDetail({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="py-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-[var(--paper-soft)] w-1/3" />
          <div className="h-14 bg-[var(--paper-soft)] w-1/2" />
          <div className="h-24 bg-[var(--paper-soft)]" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-12">
        <p className="font-serif text-[18px] text-[var(--ink-soft)] italic">
          Select a ticker to view details, technical indicators, and the
          published prediction.
        </p>
      </div>
    );
  }

  const price = data.latest_price;
  const analysis = data.latest_analysis;
  const dailyChange = price.close_price - price.open_price;
  const dailyChangePercent = (dailyChange / price.open_price) * 100;
  const isPositive = dailyChange >= 0;
  const deltaColor = isPositive ? "var(--up)" : "var(--down)";

  return (
    <div>
      {/* Header: symbol + name + price */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div className="min-w-0">
          <p className="smallcaps mb-2">Issue</p>
          <h2
            className="font-serif text-[var(--ink)]"
            style={{ fontSize: "2.25rem", lineHeight: 1.05, fontWeight: 500 }}
          >
            {data.name}
          </h2>
          <p className="font-mono tabular mt-2 text-[15px] text-[var(--ink-soft)]">
            {data.symbol} · {data.exchange} · {data.sector}
          </p>
        </div>
        <div className="md:text-right">
          <p className="smallcaps mb-2">Last price</p>
          <p
            className="font-mono tabular"
            style={{
              fontSize: "3.75rem",
              lineHeight: 1,
              fontWeight: 500,
              color: "var(--ink)",
            }}
          >
            ${price.close_price.toFixed(2)}
          </p>
          <p
            className="font-mono tabular mt-3 text-[15px]"
            style={{ color: deltaColor }}
          >
            {isPositive ? "+" : ""}
            {dailyChange.toFixed(2)} ({isPositive ? "+" : ""}
            {dailyChangePercent.toFixed(2)}%) today
          </p>
        </div>
      </div>

      <hr className="rule mb-10" />

      {/* Day session row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-6 mb-10">
        <SessionStat label="Open" value={`$${price.open_price.toFixed(2)}`} />
        <SessionStat label="Day high" value={`$${price.high_price.toFixed(2)}`} />
        <SessionStat label="Day low" value={`$${price.low_price.toFixed(2)}`} />
        <SessionStat label="Volume" value={formatVolume(price.volume)} />
        <SessionStat label="Market cap" value={formatMarketCap(data.market_cap)} />
      </div>

      <hr className="rule mb-10" />

      {/* Technical indicators — small multiples */}
      <p className="smallcaps mb-4">Technical indicators</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-b border-[var(--rule)]">
        <IndicatorPanel
          label="RSI (14)"
          value={analysis.rsi !== null ? analysis.rsi.toFixed(1) : "—"}
          caption={rsiInterpretation(analysis.rsi)}
          divider
        />
        <IndicatorPanel
          label="MACD"
          value={analysis.macd !== null ? analysis.macd.toFixed(3) : "—"}
          caption={macdInterpretation(analysis.macd)}
          divider
        />
        <IndicatorPanel
          label="Volatility (σ)"
          value={
            analysis.volatility !== null
              ? `${(analysis.volatility * 100).toFixed(2)}%`
              : "—"
          }
          caption="Trailing 30d, annualized"
        />
      </div>

      {/* Model output */}
      <p className="smallcaps mt-12 mb-4">Model output — current</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-4">
        <SessionStat
          label="1D forecast"
          value={
            analysis.predicted_price_1d
              ? `$${analysis.predicted_price_1d.toFixed(2)}`
              : "—"
          }
        />
        <SessionStat
          label="7D forecast"
          value={
            analysis.predicted_price_7d
              ? `$${analysis.predicted_price_7d.toFixed(2)}`
              : "—"
          }
        />
        <SessionStat
          label="30D forecast"
          value={
            analysis.predicted_price_30d
              ? `$${analysis.predicted_price_30d.toFixed(2)}`
              : "—"
          }
        />
        <SessionStat
          label="Signal"
          value={analysis.recommendation ?? "—"}
          accent={
            analysis.recommendation === "BUY"
              ? "var(--up)"
              : analysis.recommendation === "SELL"
              ? "var(--down)"
              : undefined
          }
        />
      </div>

      {data.industry && (
        <>
          <hr className="rule mt-12 mb-6" />
          <p className="smallcaps mb-3">About this company</p>
          <p
            className="font-serif text-[var(--ink)]"
            style={{ fontSize: "17px", lineHeight: 1.55, maxWidth: "720px" }}
          >
            <strong>{data.name}</strong> trades on {data.exchange} under{" "}
            <span className="font-mono">{data.symbol}</span>. It operates in the{" "}
            <em>{data.industry}</em> industry within the{" "}
            <em>{data.sector}</em> sector, with a market capitalization of{" "}
            <span className="font-mono">{formatMarketCap(data.market_cap)}</span>
            .
          </p>
        </>
      )}
    </div>
  );
}

function SessionStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <p className="smallcaps mb-1">{label}</p>
      <p
        className="font-mono tabular text-[18px]"
        style={{ color: accent ?? "var(--ink)" }}
      >
        {value}
      </p>
    </div>
  );
}

function IndicatorPanel({
  label,
  value,
  caption,
  divider,
}: {
  label: string;
  value: string;
  caption: string;
  divider?: boolean;
}) {
  return (
    <div
      className={`py-6 px-6 ${divider ? "md:border-r md:border-[var(--rule)]" : ""}`}
    >
      <p className="smallcaps mb-3">{label}</p>
      <p
        className="font-mono tabular"
        style={{ fontSize: "2rem", lineHeight: 1.05, fontWeight: 500 }}
      >
        {value}
      </p>
      <p className="font-serif italic text-[14px] text-[var(--ink-soft)] mt-2">
        {caption}
      </p>
    </div>
  );
}
