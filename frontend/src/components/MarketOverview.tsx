"use client";

import { useEffect, useState, useCallback } from "react";
import { getMarketOverview, getTopGainers, getTopLosers } from "@/lib/api";
import type { MarketOverview as MarketOverviewType, MarketMover } from "@/lib/types";

interface Props {
  onStockSelect: (symbol: string) => void;
}

export default function MarketOverview({ onStockSelect }: Props) {
  const [overview, setOverview] = useState<MarketOverviewType | null>(null);
  const [gainers, setGainers] = useState<MarketMover[]>([]);
  const [losers, setLosers] = useState<MarketMover[]>([]);
  const [active, setActive] = useState<MarketMover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const [ov, g, l] = await Promise.all([
        getMarketOverview(),
        getTopGainers(),
        getTopLosers(),
      ]);
      setOverview(ov);
      const gainerList = g.gainers?.slice(0, 6) ?? [];
      const loserList = l.losers?.slice(0, 6) ?? [];
      setGainers(gainerList);
      setLosers(loserList);
      const combined = [...gainerList, ...loserList]
        .slice()
        .sort(
          (a, b) =>
            Math.abs(b.change_percent ?? 0) - Math.abs(a.change_percent ?? 0)
        )
        .slice(0, 6);
      setActive(combined);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 300000);
    return () => clearInterval(interval);
  }, [load]);

  if (error) {
    return (
      <section className="page-frame" style={{ padding: "48px 24px" }}>
        <p style={{ color: "var(--text-soft)" }}>
          Unable to load market data.{" "}
          <button
            onClick={load}
            style={{
              color: "var(--accent)",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Retry
          </button>
          .
        </p>
      </section>
    );
  }

  const sp = overview?.market_indices?.["S&P 500"];
  const dow = overview?.market_indices?.["Dow Jones"];
  const nasdaq = overview?.market_indices?.["NASDAQ"];
  const isUp = (sp?.change_percent ?? 0) >= 0;

  return (
    <section
      className="page-frame"
      style={{ paddingTop: "16px", paddingBottom: "48px" }}
    >
      {/* Hero panel */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          padding: "32px",
          marginBottom: "24px",
        }}
      >
        <p className="smallcaps-mono" style={{ marginBottom: "12px" }}>
          // S&P 500 · LIVE
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "48px",
            flexWrap: "wrap",
          }}
        >
          <div>
            {loading ? (
              <div
                className="font-mono tabular"
                style={{
                  fontSize: "56px",
                  fontWeight: 600,
                  lineHeight: 1,
                  color: "var(--text-muted)",
                }}
              >
                ——
              </div>
            ) : (
              <div
                className="font-mono tabular"
                style={{
                  fontSize: "56px",
                  fontWeight: 600,
                  lineHeight: 1,
                  color: "var(--text)",
                  letterSpacing: "-0.02em",
                }}
              >
                {sp?.value?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) ?? "—"}
              </div>
            )}
            {sp && (
              <p
                className="font-mono tabular"
                style={{
                  marginTop: "12px",
                  fontSize: "14px",
                  color: isUp ? "var(--up)" : "var(--down)",
                }}
              >
                {isUp ? "▲" : "▼"} {isUp ? "+" : ""}
                {sp.change?.toFixed(2)} ({isUp ? "+" : ""}
                {sp.change_percent?.toFixed(2)}%)
              </p>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: "32px",
              borderLeft: "1px solid var(--border)",
              paddingLeft: "32px",
              flex: "0 0 auto",
            }}
          >
            <SecondaryIndex
              label="// DOW"
              value={dow?.value}
              changePct={dow?.change_percent}
              loading={loading}
            />
            <SecondaryIndex
              label="// NASDAQ"
              value={nasdaq?.value}
              changePct={nasdaq?.change_percent}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Movers grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
        }}
      >
        <MoverColumn
          label="// TOP GAINERS"
          movers={gainers}
          type="gain"
          loading={loading}
          onSelect={onStockSelect}
        />
        <MoverColumn
          label="// TOP LOSERS"
          movers={losers}
          type="loss"
          loading={loading}
          onSelect={onStockSelect}
        />
        <MoverColumn
          label="// MOST ACTIVE"
          movers={active}
          type="active"
          loading={loading}
          onSelect={onStockSelect}
        />
      </div>
    </section>
  );
}

function SecondaryIndex({
  label,
  value,
  changePct,
  loading,
}: {
  label: string;
  value: number | undefined;
  changePct: number | undefined;
  loading: boolean;
}) {
  const isUp = (changePct ?? 0) >= 0;
  return (
    <div>
      <p className="smallcaps-mono" style={{ marginBottom: "6px" }}>
        {label}
      </p>
      <p
        className="font-mono tabular"
        style={{
          fontSize: "22px",
          fontWeight: 500,
          lineHeight: 1.1,
          color: "var(--text)",
        }}
      >
        {loading || value === undefined
          ? "—"
          : value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
      {changePct !== undefined && !loading && (
        <p
          className="font-mono tabular"
          style={{
            marginTop: "4px",
            fontSize: "12px",
            color: isUp ? "var(--up)" : "var(--down)",
          }}
        >
          {isUp ? "▲" : "▼"} {isUp ? "+" : ""}
          {changePct.toFixed(2)}%
        </p>
      )}
    </div>
  );
}

function MoverColumn({
  label,
  movers,
  type,
  loading,
  onSelect,
}: {
  label: string;
  movers: MarketMover[];
  type: "gain" | "loss" | "active";
  loading: boolean;
  onSelect: (symbol: string) => void;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        padding: "20px",
      }}
    >
      <p className="smallcaps-mono" style={{ marginBottom: "12px" }}>
        {label}
      </p>
      {loading ? (
        <ul style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <li
              key={i}
              style={{ height: "22px", background: "var(--surface-2)" }}
            />
          ))}
        </ul>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {movers.map((m, idx) => {
            const pct = m.change_percent ?? 0;
            const color =
              type === "loss" || (type === "active" && pct < 0)
                ? "var(--down)"
                : "var(--up)";
            const arrow = pct >= 0 ? "▲" : "▼";
            return (
              <li key={`${m.symbol}-${idx}`}>
                <button
                  onClick={() => onSelect(m.symbol)}
                  className="font-mono tabular"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    padding: "10px 8px",
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "13px",
                    color: "var(--text)",
                    transition: "background 0.12s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--surface-2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span
                    style={{
                      fontWeight: 500,
                      width: "76px",
                      flexShrink: 0,
                    }}
                  >
                    {m.symbol}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      textAlign: "right",
                      color: "var(--text-soft)",
                      paddingRight: "12px",
                    }}
                  >
                    {typeof m.price === "number" ? m.price.toFixed(2) : "—"}
                  </span>
                  <span
                    style={{
                      width: "80px",
                      textAlign: "right",
                      color,
                    }}
                  >
                    {arrow} {pct >= 0 ? "+" : ""}
                    {pct.toFixed(2)}%
                  </span>
                </button>
                {idx < movers.length - 1 && (
                  <hr
                    style={{
                      border: 0,
                      borderTop: "1px solid var(--border)",
                      margin: 0,
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
