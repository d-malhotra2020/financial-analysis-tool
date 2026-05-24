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
      // "Most active" is a derived list — sort gainers + losers by absolute change.
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
      <section className="page-frame section">
        <p className="font-serif text-[var(--ink-soft)]">
          Unable to load market data.{" "}
          <button onClick={load} className="editorial-link">
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
    <section className="page-frame section">
      <p className="smallcaps mb-6">The market · today</p>
      <hr className="rule mb-10" />

      {/* Hero: S&P 500 */}
      <div className="flex flex-col md:flex-row md:items-end md:gap-16 gap-6 mb-16">
        <div className="flex-1">
          <p className="smallcaps mb-3">S&amp;P 500</p>
          {loading ? (
            <div className="hero-numeral tabular text-[var(--muted)]">—</div>
          ) : (
            <div className="hero-numeral tabular">
              {sp?.value?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) ?? "—"}
            </div>
          )}
          {sp && (
            <p
              className="font-mono tabular mt-4 text-[15px]"
              style={{ color: isUp ? "var(--up)" : "var(--down)" }}
            >
              {isUp ? "+" : ""}
              {sp.change?.toFixed(2)} ({isUp ? "+" : ""}
              {sp.change_percent?.toFixed(2)}%)
            </p>
          )}
        </div>

        <div className="flex gap-12">
          <SecondaryIndex
            label="Dow Jones"
            value={dow?.value}
            changePct={dow?.change_percent}
            loading={loading}
          />
          <SecondaryIndex
            label="NASDAQ"
            value={nasdaq?.value}
            changePct={nasdaq?.change_percent}
            loading={loading}
          />
        </div>
      </div>

      <hr className="rule mb-10" />

      {/* Movers grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-10">
        <MoverColumn
          label="Top gainers"
          movers={gainers}
          type="gain"
          loading={loading}
          onSelect={onStockSelect}
        />
        <MoverColumn
          label="Top losers"
          movers={losers}
          type="loss"
          loading={loading}
          onSelect={onStockSelect}
        />
        <MoverColumn
          label="Most active"
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
      <p className="smallcaps mb-2">{label}</p>
      <p
        className="font-serif tabular"
        style={{ fontSize: "1.75rem", lineHeight: 1.1, fontWeight: 400 }}
      >
        {loading || value === undefined
          ? "—"
          : value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
      </p>
      {changePct !== undefined && !loading && (
        <p
          className="font-mono tabular mt-2 text-[13px]"
          style={{ color: isUp ? "var(--up)" : "var(--down)" }}
        >
          {isUp ? "+" : ""}
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
    <div>
      <p className="smallcaps mb-4">{label}</p>
      <hr className="rule mb-4" />
      {loading ? (
        <ul className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-6 bg-[var(--paper-soft)]" />
          ))}
        </ul>
      ) : (
        <ul>
          {movers.map((m, idx) => {
            const pct = m.change_percent ?? 0;
            const colorStyle =
              type === "loss" || (type === "active" && pct < 0)
                ? { color: "var(--down)" }
                : { color: "var(--up)" };
            return (
              <li key={`${m.symbol}-${idx}`}>
                <button
                  onClick={() => onSelect(m.symbol)}
                  className="w-full flex items-baseline justify-between py-2 text-left hover:bg-[var(--paper-soft)] transition-colors"
                >
                  <span className="font-mono tabular text-[14px] text-[var(--ink)] w-20 shrink-0">
                    {m.symbol}
                  </span>
                  <span className="font-mono tabular text-[14px] text-[var(--ink-soft)] flex-1 text-right pr-4">
                    {typeof m.price === "number" ? m.price.toFixed(2) : "—"}
                  </span>
                  <span
                    className="font-mono tabular text-[14px] w-20 text-right"
                    style={colorStyle}
                  >
                    {pct >= 0 ? "+" : ""}
                    {pct.toFixed(2)}%
                  </span>
                </button>
                {idx < movers.length - 1 && <hr className="rule" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
