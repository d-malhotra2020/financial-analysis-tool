"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, BarChart3, DollarSign, Building2, Gauge, Target } from "lucide-react";
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

  const signalColor =
    analysis.recommendation === "BUY"
      ? "text-emerald-400"
      : analysis.recommendation === "SELL"
      ? "text-red-400"
      : "text-amber-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-6 pb-5 border-b border-zinc-800/50">
        <div className="min-w-0 mr-4">
          <h2 className="text-2xl font-bold text-zinc-100">{data.symbol}</h2>
          <p className="text-sm text-zinc-400 mt-0.5 truncate">{data.name}</p>
        </div>
        <div className="text-right shrink-0">
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

      <div className="grid grid-cols-2 gap-3">
        <DetailCard icon={DollarSign} label="Open" value={`$${price.open_price.toFixed(2)}`} />
        <DetailCard icon={TrendingUp} label="High" value={`$${price.high_price.toFixed(2)}`} />
        <DetailCard icon={TrendingDown} label="Low" value={`$${price.low_price.toFixed(2)}`} />
        <DetailCard icon={Activity} label="Volume" value={formatVolume(price.volume)} />
        <DetailCard icon={Building2} label="Market Cap" value={formatMarketCap(data.market_cap)} />
        <DetailCard icon={BarChart3} label="Sector" value={data.sector} />
        <DetailCard icon={Gauge} label="RSI" value={analysis.rsi?.toFixed(1) ?? "N/A"} />
        <DetailCard icon={Target} label="Signal" value={analysis.recommendation} valueColor={signalColor} />
      </div>
    </motion.div>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-700/30">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
        <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">{label}</span>
      </div>
      <span
        className={`text-sm font-semibold tabular-nums leading-tight truncate ${valueColor ?? "text-zinc-100"}`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
