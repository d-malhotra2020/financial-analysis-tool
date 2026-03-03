"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { getMarketOverview, getTopGainers, getTopLosers } from "@/lib/api";
import type { MarketOverview as MarketOverviewType, MarketMover } from "@/lib/types";

interface Props {
  onStockSelect: (symbol: string) => void;
}

export default function MarketOverview({ onStockSelect }: Props) {
  const [overview, setOverview] = useState<MarketOverviewType | null>(null);
  const [gainers, setGainers] = useState<MarketMover[]>([]);
  const [losers, setLosers] = useState<MarketMover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const [ov, g, l] = await Promise.all([getMarketOverview(), getTopGainers(), getTopLosers()]);
      setOverview(ov);
      setGainers(g.gainers?.slice(0, 5) ?? []);
      setLosers(l.losers?.slice(0, 5) ?? []);
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
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-8 text-center">
        <p className="text-zinc-400">Unable to load market data</p>
        <button
          onClick={load}
          className="mt-3 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const indices = overview?.market_indices
    ? [
        { name: "S&P 500", data: overview.market_indices["S&P 500"] },
        { name: "Dow Jones", data: overview.market_indices["Dow Jones"] },
        { name: "NASDAQ", data: overview.market_indices["NASDAQ"] },
      ]
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-100">Market Overview</h2>
        {overview?.last_update && (
          <span className="text-xs text-zinc-500">
            Updated {new Date(overview.last_update).toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-zinc-800 rounded w-20 mb-3" />
                <div className="h-8 bg-zinc-800 rounded w-28" />
              </div>
            ))
          : indices.map((idx) => {
              const isUp = (idx.data?.change_percent ?? 0) >= 0;
              return (
                <div
                  key={idx.name}
                  className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 backdrop-blur-sm"
                >
                  <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{idx.name}</p>
                  <p className="text-2xl font-bold text-zinc-100 mt-1 tabular-nums">
                    {idx.data?.value?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? "—"}
                  </p>
                  {idx.data && (
                    <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                      {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      <span>{isUp ? "+" : ""}{idx.data.change_percent?.toFixed(2)}%</span>
                    </div>
                  )}
                </div>
              );
            })}
      </div>

      {overview?.market_summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Advancing" value={overview.market_summary.advancing_stocks} color="text-emerald-400" />
          <StatCard label="Declining" value={overview.market_summary.declining_stocks} color="text-red-400" />
          <StatCard
            label="Total Volume"
            value={`${(overview.market_summary.total_volume / 1e9).toFixed(1)}B`}
            color="text-blue-400"
          />
          <StatCard
            label="A/D Ratio"
            value={(overview.market_summary.advancing_stocks / Math.max(1, overview.market_summary.declining_stocks)).toFixed(2)}
            color="text-amber-400"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MoverList
          title="Top Gainers"
          icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
          movers={gainers}
          type="gain"
          loading={loading}
          onSelect={onStockSelect}
        />
        <MoverList
          title="Top Losers"
          icon={<TrendingDown className="h-4 w-4 text-red-400" />}
          movers={losers}
          type="loss"
          loading={loading}
          onSelect={onStockSelect}
        />
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 text-center backdrop-blur-sm">
      <p className={`text-lg font-bold tabular-nums ${color}`}>{value}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}

function MoverList({
  title,
  icon,
  movers,
  type,
  loading,
  onSelect,
}: {
  title: string;
  icon: React.ReactNode;
  movers: MarketMover[];
  type: "gain" | "loss";
  loading: boolean;
  onSelect: (symbol: string) => void;
}) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold text-zinc-200">{title}</h3>
      </div>
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {movers.map((m) => (
            <button
              key={m.symbol}
              onClick={() => onSelect(m.symbol)}
              className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-zinc-800/60 transition-colors"
            >
              <div className="text-left">
                <span className="font-semibold text-sm text-zinc-200">{m.symbol}</span>
                <span className="ml-2 text-xs text-zinc-500 hidden sm:inline">{m.name}</span>
              </div>
              <span
                className={`text-sm font-semibold tabular-nums ${
                  type === "gain" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {type === "gain" ? "+" : ""}
                {m.change_percent}%
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
