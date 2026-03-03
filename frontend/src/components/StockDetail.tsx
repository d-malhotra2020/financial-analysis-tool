"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, BarChart3, DollarSign, Building2, Gauge, Target } from "lucide-react";
import type { StockDetail as StockDetailType } from "@/lib/types";

interface Props {
  data: StockDetailType | null;
  loading: boolean;
}

export default function StockDetail({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded-lg w-1/3" />
          <div className="h-12 bg-zinc-800 rounded-lg w-1/2" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 bg-zinc-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-8 backdrop-blur-sm flex flex-col items-center justify-center min-h-[300px]">
        <BarChart3 className="h-12 w-12 text-zinc-600 mb-4" />
        <p className="text-zinc-400 text-lg font-medium">Search for a stock to view details</p>
        <p className="text-zinc-600 text-sm mt-1">150+ NYSE, NASDAQ, S&P 500 & DOW companies</p>
      </div>
    );
  }

  const price = data.latest_price;
  const analysis = data.latest_analysis;
  const dailyChange = price.close_price - price.open_price;
  const dailyChangePercent = (dailyChange / price.open_price) * 100;
  const isPositive = dailyChange >= 0;

  const details = [
    { label: "Open", value: `$${price.open_price.toFixed(2)}`, icon: DollarSign },
    { label: "High", value: `$${price.high_price.toFixed(2)}`, icon: TrendingUp },
    { label: "Low", value: `$${price.low_price.toFixed(2)}`, icon: TrendingDown },
    { label: "Volume", value: price.volume.toLocaleString(), icon: Activity },
    { label: "Market Cap", value: `$${(data.market_cap / 1e9).toFixed(1)}B`, icon: Building2 },
    { label: "Sector", value: data.sector, icon: BarChart3 },
    { label: "RSI", value: analysis.rsi?.toFixed(1) ?? "N/A", icon: Gauge },
    {
      label: "Signal",
      value: analysis.recommendation,
      icon: Target,
      color:
        analysis.recommendation === "BUY"
          ? "text-emerald-400"
          : analysis.recommendation === "SELL"
          ? "text-red-400"
          : "text-amber-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-zinc-800/50">
        <div>
          <h2 className="text-2xl font-bold text-zinc-100">{data.symbol}</h2>
          <p className="text-sm text-zinc-400 mt-0.5">{data.name}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-zinc-100 tabular-nums">
            ${price.close_price.toFixed(2)}
          </div>
          <div
            className={`flex items-center justify-end gap-1 text-sm font-semibold mt-1 ${
              isPositive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>
              {isPositive ? "+" : ""}
              {dailyChange.toFixed(2)} ({isPositive ? "+" : ""}
              {dailyChangePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {details.map((d) => (
          <div
            key={d.label}
            className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/30"
          >
            <div className="flex items-center gap-2">
              <d.icon className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-400">{d.label}</span>
            </div>
            <span className={`text-sm font-semibold tabular-nums ${d.color ?? "text-zinc-200"}`}>
              {d.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
