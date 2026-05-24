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

function rsiInterpretation(rsi: number | null): {
  label: string;
  color: string;
} {
  if (rsi === null || rsi === undefined)
    return { label: "—", color: "var(--text-muted)" };
  if (rsi >= 70) return { label: "Overbought", color: "var(--down)" };
  if (rsi <= 30) return { label: "Oversold", color: "var(--up)" };
  return { label: "Neutral", color: "var(--text-soft)" };
}

function macdInterpretation(macd: number | null): {
  label: string;
  color: string;
} {
  if (macd === null || macd === undefined)
    return { label: "—", color: "var(--text-muted)" };
  if (macd > 0) return { label: "Bullish crossover", color: "var(--up)" };
  if (macd < 0) return { label: "Bearish crossover", color: "var(--down)" };
  return { label: "Neutral", color: "var(--text-soft)" };
}

export default function StockDetail({ data, loading }: Props) {
  if (loading) {
    return (
      <div style={{ padding: "32px 0" }}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div
            style={{
              height: "32px",
              background: "var(--surface-2)",
              width: "30%",
            }}
          />
          <div
            style={{
              height: "56px",
              background: "var(--surface-2)",
              width: "45%",
            }}
          />
          <div style={{ height: "120px", background: "var(--surface-2)" }} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: "48px 0" }}>
        <p style={{ color: "var(--text-soft)", fontSize: "15px" }}>
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
  const rsi = rsiInterpretation(analysis.rsi);
  const macd = macdInterpretation(analysis.macd);

  return (
    <div>
      {/* Header panel */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          padding: "28px 32px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "32px",
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p className="smallcaps-mono" style={{ marginBottom: "6px" }}>
              // ISSUE
            </p>
            <h2
              style={{
                fontFamily: "var(--font-sans), sans-serif",
                fontSize: "28px",
                fontWeight: 600,
                lineHeight: 1.1,
                color: "var(--text)",
                margin: 0,
              }}
            >
              {data.symbol}
            </h2>
            <p
              style={{
                marginTop: "6px",
                color: "var(--text-soft)",
                fontSize: "14px",
              }}
            >
              {data.name} · {data.exchange} · {data.sector}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p className="smallcaps-mono" style={{ marginBottom: "6px" }}>
              // LAST
            </p>
            <p
              className="font-mono tabular"
              style={{
                fontSize: "64px",
                fontWeight: 600,
                lineHeight: 1,
                color: "var(--text)",
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              ${price.close_price.toFixed(2)}
            </p>
            <p
              className="font-mono tabular"
              style={{
                marginTop: "10px",
                fontSize: "14px",
                color: deltaColor,
              }}
            >
              {isPositive ? "▲" : "▼"} {isPositive ? "+" : ""}
              {dailyChange.toFixed(2)} ({isPositive ? "+" : ""}
              {dailyChangePercent.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      {/* Session stats panel */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          padding: "20px 24px",
          marginBottom: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "20px 32px",
        }}
      >
        <SessionStat label="// OPEN" value={`$${price.open_price.toFixed(2)}`} />
        <SessionStat label="// HIGH" value={`$${price.high_price.toFixed(2)}`} />
        <SessionStat label="// LOW" value={`$${price.low_price.toFixed(2)}`} />
        <SessionStat label="// VOLUME" value={formatVolume(price.volume)} />
        <SessionStat
          label="// MARKET CAP"
          value={formatMarketCap(data.market_cap)}
        />
      </div>

      {/* Technical indicators */}
      <p className="smallcaps-mono" style={{ marginBottom: "12px" }}>
        // TECHNICAL INDICATORS
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <IndicatorPanel
          label="// RSI (14)"
          value={analysis.rsi !== null ? analysis.rsi.toFixed(1) : "—"}
          valueColor={rsi.color}
          caption={rsi.label}
        />
        <IndicatorPanel
          label="// MACD"
          value={analysis.macd !== null ? analysis.macd.toFixed(3) : "—"}
          valueColor={macd.color}
          caption={macd.label}
        />
        <IndicatorPanel
          label="// BOLLINGER (σ)"
          value={
            analysis.volatility !== null
              ? `${(analysis.volatility * 100).toFixed(2)}%`
              : "—"
          }
          valueColor="var(--text)"
          caption="Trailing 30d, annualized"
        />
      </div>

      {/* Model output */}
      <p className="smallcaps-mono" style={{ marginBottom: "12px" }}>
        // MODEL OUTPUT · CURRENT
      </p>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          padding: "20px 24px",
          marginBottom: "32px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "20px 32px",
        }}
      >
        <SessionStat
          label="// 1D FORECAST"
          value={
            analysis.predicted_price_1d
              ? `$${analysis.predicted_price_1d.toFixed(2)}`
              : "—"
          }
        />
        <SessionStat
          label="// 7D FORECAST"
          value={
            analysis.predicted_price_7d
              ? `$${analysis.predicted_price_7d.toFixed(2)}`
              : "—"
          }
        />
        <SessionStat
          label="// 30D FORECAST"
          value={
            analysis.predicted_price_30d
              ? `$${analysis.predicted_price_30d.toFixed(2)}`
              : "—"
          }
        />
        <SessionStat
          label="// SIGNAL"
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
          <p className="smallcaps-mono" style={{ marginBottom: "10px" }}>
            // ABOUT THIS COMPANY
          </p>
          <p
            style={{
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "14px",
              lineHeight: 1.6,
              color: "var(--text-soft)",
              maxWidth: "720px",
              margin: 0,
            }}
          >
            <strong style={{ color: "var(--text)" }}>{data.name}</strong>{" "}
            trades on {data.exchange} under{" "}
            <span className="font-mono" style={{ color: "var(--text)" }}>
              {data.symbol}
            </span>
            . It operates in the {data.industry} industry within the{" "}
            {data.sector} sector, with a market capitalization of{" "}
            <span className="font-mono" style={{ color: "var(--text)" }}>
              {formatMarketCap(data.market_cap)}
            </span>
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
      <p className="smallcaps-mono" style={{ marginBottom: "4px" }}>
        {label}
      </p>
      <p
        className="font-mono tabular"
        style={{
          fontSize: "16px",
          color: accent ?? "var(--text)",
          fontWeight: 500,
        }}
      >
        {value}
      </p>
    </div>
  );
}

function IndicatorPanel({
  label,
  value,
  valueColor,
  caption,
}: {
  label: string;
  value: string;
  valueColor: string;
  caption: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        padding: "16px",
      }}
    >
      <p className="smallcaps-mono" style={{ marginBottom: "10px" }}>
        {label}
      </p>
      <p
        className="font-mono tabular"
        style={{
          fontSize: "28px",
          lineHeight: 1.05,
          fontWeight: 600,
          color: valueColor,
          margin: 0,
        }}
      >
        {value}
      </p>
      <p
        style={{
          marginTop: "6px",
          fontSize: "12px",
          color: "var(--text-muted)",
        }}
      >
        {caption}
      </p>
    </div>
  );
}
