"use client";

import { useState, useCallback, useEffect } from "react";
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

const DEFAULT_SYMBOL = "SPY";

export default function Dashboard() {
  const [stockData, setStockData] = useState<StockDetailType | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [stockLoading, setStockLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>("1y");
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [currentSymbol, setCurrentSymbol] =
    useState<string | null>(DEFAULT_SYMBOL);

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

  // Fire the default ticker fetch once on mount so the chart is populated
  // immediately on first paint instead of waiting for a click.
  useEffect(() => {
    loadStock(DEFAULT_SYMBOL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="page-glow">
      <StatusBar />
      <TickerTape onStockSelect={loadStock} />
      <TopNav />

      <main>
        <RecruiterIntro />

        {/* Search row — switch tickers in place */}
        <section
          className="page-frame"
          style={{ paddingTop: "8px", paddingBottom: "16px" }}
        >
          <StockSearch onSelect={loadStock} />
        </section>

        {/* Main grid: chart column + market overview sidebar */}
        <section
          className="page-frame"
          style={{ paddingBottom: "24px" }}
        >
          <div
            className="dashboard-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 320px",
              gap: "20px",
              alignItems: "start",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                minWidth: 0,
              }}
            >
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
            <aside style={{ minWidth: 0 }}>
              <MarketOverview onStockSelect={loadStock} />
            </aside>
          </div>
        </section>

        {/* News + calibration row */}
        <section
          className="page-frame"
          style={{ paddingBottom: "32px" }}
        >
          <div
            className="dashboard-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 320px",
              gap: "20px",
              alignItems: "start",
            }}
          >
            <div style={{ minWidth: 0 }}>
              {currentSymbol && <StockNews symbol={currentSymbol} />}
            </div>
            <aside style={{ minWidth: 0 }}>
              <CalibrationCard />
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
