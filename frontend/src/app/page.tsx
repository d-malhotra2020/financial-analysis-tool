"use client";

import { useState, useCallback } from "react";
import StockSearch from "@/components/StockSearch";
import StockDetail from "@/components/StockDetail";
import StockChart from "@/components/StockChart";
import StockNews from "@/components/StockNews";
import MarketOverview from "@/components/MarketOverview";
import RecruiterIntro from "@/components/RecruiterIntro";
import CalibrationCard from "@/components/CalibrationCard";
import { getStockDetail, getChartData } from "@/lib/api";
import type {
  StockDetail as StockDetailType,
  ChartData,
  Timeframe,
  ChartType,
} from "@/lib/types";

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

  const clearSelection = useCallback(() => {
    setCurrentSymbol(null);
    setStockData(null);
    setChartData(null);
  }, []);

  return (
    <main>
      <RecruiterIntro />

      {currentSymbol ? (
        <>
          <section className="page-frame pb-6">
            <div className="flex items-baseline justify-between mb-6">
              <p className="smallcaps">Issue lookup</p>
              <button
                onClick={clearSelection}
                className="smallcaps-mono hover:text-[var(--ink)] transition-colors"
              >
                ← Back to market overview
              </button>
            </div>
            <StockSearch onSelect={loadStock} />
          </section>

          <hr className="rule" />

          <section className="page-frame section">
            <StockDetail data={stockData} loading={stockLoading} />
          </section>

          <hr className="rule" />

          <section className="page-frame section">
            <p className="smallcaps mb-6">Price history</p>
            <StockChart
              data={chartData}
              loading={chartLoading}
              timeframe={timeframe}
              chartType={chartType}
              onTimeframeChange={handleTimeframeChange}
              onChartTypeChange={setChartType}
            />
          </section>

          <hr className="rule" />

          <section className="page-frame section">
            <StockNews symbol={currentSymbol} />
          </section>

          <CalibrationCard />
        </>
      ) : (
        <>
          <section className="page-frame pb-6">
            <p className="smallcaps mb-3">Issue lookup</p>
            <StockSearch onSelect={loadStock} />
          </section>

          <MarketOverview onStockSelect={loadStock} />

          <CalibrationCard />
        </>
      )}
    </main>
  );
}
