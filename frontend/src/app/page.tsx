"use client";

import { useState, useCallback } from "react";
import StatusBar from "@/components/StatusBar";
import TickerTape from "@/components/TickerTape";
import TopNav from "@/components/TopNav";
import StockSearch from "@/components/StockSearch";
import StockDetail from "@/components/StockDetail";
import StockChart from "@/components/StockChart";
import StockNews from "@/components/StockNews";
import MarketOverview from "@/components/MarketOverview";
import RecruiterIntro from "@/components/RecruiterIntro";
import CalibrationCard from "@/components/CalibrationCard";
import Footer from "@/components/Footer";
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
    <div className="page-glow">
      <StatusBar />
      <TickerTape onStockSelect={loadStock} />
      <TopNav />

      <main>
        <RecruiterIntro />

        {currentSymbol ? (
          <>
            <section
              className="page-frame"
              style={{ paddingTop: "8px", paddingBottom: "16px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  gap: "16px",
                }}
              >
                <p className="smallcaps-mono">// ISSUE LOOKUP</p>
                <button
                  onClick={clearSelection}
                  className="smallcaps-mono"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--border)",
                    borderRadius: "3px",
                    padding: "6px 10px",
                    cursor: "pointer",
                    color: "var(--text-soft)",
                    transition: "color 0.12s ease, border-color 0.12s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--text)";
                    e.currentTarget.style.borderColor =
                      "var(--border-strong)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-soft)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  ← BACK TO MARKET OVERVIEW
                </button>
              </div>
              <StockSearch onSelect={loadStock} />
            </section>

            <section
              className="page-frame"
              style={{ paddingTop: "8px", paddingBottom: "24px" }}
            >
              <StockDetail data={stockData} loading={stockLoading} />
            </section>

            <section
              className="page-frame"
              style={{ paddingBottom: "32px" }}
            >
              <StockChart
                data={chartData}
                loading={chartLoading}
                timeframe={timeframe}
                chartType={chartType}
                onTimeframeChange={handleTimeframeChange}
                onChartTypeChange={setChartType}
              />
            </section>

            <section
              className="page-frame"
              style={{ paddingBottom: "32px" }}
            >
              <StockNews symbol={currentSymbol} />
            </section>

            <CalibrationCard />
          </>
        ) : (
          <>
            <section
              className="page-frame"
              style={{ paddingTop: "8px", paddingBottom: "16px" }}
            >
              <p
                className="smallcaps-mono"
                style={{ marginBottom: "10px" }}
              >
                // ISSUE LOOKUP
              </p>
              <StockSearch onSelect={loadStock} />
            </section>

            <MarketOverview onStockSelect={loadStock} />

            <CalibrationCard />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
