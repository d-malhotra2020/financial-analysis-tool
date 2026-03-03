"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Activity } from "lucide-react";
import StockSearch from "@/components/StockSearch";
import StockDetail from "@/components/StockDetail";
import StockChart from "@/components/StockChart";
import StockNews from "@/components/StockNews";
import MarketOverview from "@/components/MarketOverview";
import { getStockDetail, getChartData } from "@/lib/api";
import { getRandomStock } from "@/lib/stocks";
import type { StockDetail as StockDetailType, ChartData, Timeframe, ChartType } from "@/lib/types";

export default function Dashboard() {
  const [stockData, setStockData] = useState<StockDetailType | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>("1y");
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [currentSymbol, setCurrentSymbol] = useState<string | null>(null);

  const loadStock = useCallback(
    async (symbol: string) => {
      setCurrentSymbol(symbol);
      setStockLoading(true);
      setChartLoading(true);
      try {
        const [detail, chart] = await Promise.all([
          getStockDetail(symbol),
          getChartData(symbol, timeframe),
        ]);
        setStockData(detail);
        setChartData(chart);
      } catch (err) {
        console.error("Failed to load stock:", err);
      } finally {
        setStockLoading(false);
        setChartLoading(false);
      }
    },
    [timeframe]
  );

  const handleTimeframeChange = useCallback(
    async (tf: Timeframe) => {
      setTimeframe(tf);
      if (currentSymbol) {
        setChartLoading(true);
        try {
          const chart = await getChartData(currentSymbol, tf);
          setChartData(chart);
        } catch (err) {
          console.error("Failed to load chart:", err);
        } finally {
          setChartLoading(false);
        }
      }
    },
    [currentSymbol]
  );

  useEffect(() => {
    loadStock(getRandomStock().symbol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-zinc-950 to-zinc-950 pointer-events-none" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 rounded-xl">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-100">Financial Analysis Dashboard</h1>
              <p className="text-xs text-zinc-500">NYSE · NASDAQ · S&P 500 · DOW</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Activity className="h-3 w-3 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-400">Live</span>
            </div>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <StockSearch onSelect={loadStock} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 mb-8 lg:items-start">
          <StockDetail data={stockData} loading={stockLoading} />
          <StockChart
            data={chartData}
            loading={chartLoading}
            timeframe={timeframe}
            chartType={chartType}
            onTimeframeChange={handleTimeframeChange}
            onChartTypeChange={setChartType}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StockNews symbol={currentSymbol} />
          <MarketOverview onStockSelect={loadStock} />
        </div>

        <footer className="mt-12 pb-6 text-center">
          <p className="text-xs text-zinc-600">
            Financial Analysis Dashboard · Data refreshes every 5 minutes
          </p>
        </footer>
      </div>
    </div>
  );
}
