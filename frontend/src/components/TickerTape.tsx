"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { getMarketOverview, getTopGainers, getTopLosers } from "@/lib/api";

interface TickerItem {
  symbol: string;
  price: number;
  changePct: number;
}

interface Props {
  onStockSelect: (symbol: string) => void;
}

export default function TickerTape({ onStockSelect }: Props) {
  const [items, setItems] = useState<TickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [overview, gainers, losers] = await Promise.all([
          getMarketOverview().catch(() => null),
          getTopGainers().catch(() => null),
          getTopLosers().catch(() => null),
        ]);
        if (cancelled) return;

        const collected: TickerItem[] = [];
        const seen = new Set<string>();

        const pushMover = (m: {
          symbol: string;
          price: number;
          change_percent: number;
        }) => {
          if (!m?.symbol || seen.has(m.symbol)) return;
          seen.add(m.symbol);
          collected.push({
            symbol: m.symbol,
            price: m.price,
            changePct: m.change_percent ?? 0,
          });
        };

        gainers?.gainers?.forEach(pushMover);
        losers?.losers?.forEach(pushMover);

        // Top of book — index pseudo-tickers from market_indices.
        if (overview?.market_indices) {
          for (const [name, idx] of Object.entries(overview.market_indices)) {
            const symbol =
              name === "S&P 500"
                ? "SPX"
                : name === "Dow Jones"
                ? "DJI"
                : name === "NASDAQ"
                ? "IXIC"
                : name;
            if (seen.has(symbol)) continue;
            seen.add(symbol);
            collected.unshift({
              symbol,
              price: idx.value,
              changePct: idx.change_percent ?? 0,
            });
          }
        }

        if (collected.length === 0) {
          setItems([]);
        } else {
          setItems(collected.slice(0, 25));
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const id = setInterval(load, 300000); // 5 min
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const stripStyle: React.CSSProperties = {
    height: "32px",
    borderTop: "1px solid var(--border)",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg)",
    position: "relative",
    overflow: "hidden",
  };

  const fadeLeft: React.CSSProperties = {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    width: "8%",
    background:
      "linear-gradient(to right, var(--bg) 0%, rgba(10,10,12,0.7) 50%, transparent 100%)",
    pointerEvents: "none",
    zIndex: 2,
  };

  const fadeRight: React.CSSProperties = {
    ...fadeLeft,
    left: "auto",
    right: 0,
    background:
      "linear-gradient(to left, var(--bg) 0%, rgba(10,10,12,0.7) 50%, transparent 100%)",
  };

  if (loading) {
    return (
      <div style={stripStyle}>
        <div
          className="font-mono"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            paddingLeft: "1.5rem",
            color: "var(--text-muted)",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          loading market data…
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={stripStyle}>
        <div
          className="font-mono"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            paddingLeft: "1.5rem",
            color: "var(--text-muted)",
            fontSize: "11px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          market data offline
        </div>
      </div>
    );
  }

  // Duplicate the list for seamless looping when scrolling.
  const looped = [...items, ...items];

  return (
    <div className="ticker-strip" style={stripStyle}>
      <div style={fadeLeft} />
      <div style={fadeRight} />
      <div
        className={prefersReducedMotion ? "" : "ticker-scroll"}
        style={{
          display: "flex",
          alignItems: "center",
          height: "100%",
          width: prefersReducedMotion ? "100%" : "max-content",
          willChange: "transform",
          overflowX: prefersReducedMotion ? "auto" : "visible",
        }}
      >
        {looped.map((item, i) => {
          const up = item.changePct >= 0;
          const arrow = up ? "▲" : "▼";
          const color = up ? "var(--up)" : "var(--down)";
          return (
            <button
              key={`${item.symbol}-${i}`}
              onClick={() => onStockSelect(item.symbol)}
              className="font-mono tabular"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0 1.25rem",
                height: "100%",
                fontSize: "12px",
                background: "transparent",
                border: 0,
                cursor: "pointer",
                whiteSpace: "nowrap",
                color: "var(--text-soft)",
              }}
            >
              <span style={{ color: "var(--text)", fontWeight: 500 }}>
                {item.symbol}
              </span>
              <span style={{ color: "var(--text-soft)" }}>
                {item.price?.toFixed(2) ?? "—"}
              </span>
              <span style={{ color }}>
                {arrow} {up ? "+" : ""}
                {item.changePct.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
