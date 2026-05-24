"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { ChartData, Timeframe, ChartType } from "@/lib/types";

interface Props {
  data: ChartData | null;
  loading: boolean;
  timeframe: Timeframe;
  chartType: ChartType;
  onTimeframeChange: (tf: Timeframe) => void;
  onChartTypeChange: (ct: ChartType) => void;
}

const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: "1d", label: "1D" },
  { value: "1w", label: "1W" },
  { value: "1mo", label: "1M" },
  { value: "3mo", label: "3M" },
  { value: "1y", label: "1Y" },
  { value: "5y", label: "5Y" },
  { value: "max", label: "Max" },
];

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "candlestick", label: "Candle" },
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
  { value: "volume", label: "Volume" },
];

// keep in sync with globals.css — lightweight-charts needs literal hex values
// since it can't read CSS variables.
const BG = "#0a0a0c";
const SURFACE = "#111114";
const GRID = "#1f1f23";
const TEXT = "#e7e7ea";
const TEXT_SOFT = "#a1a1a6";
const UP = "#22c55e";
const DOWN = "#ef4444";
const ACCENT = "#3b82f6";

function timeframeCaption(tf: Timeframe): string {
  switch (tf) {
    case "1d":
      return "// PRICE · 5-MIN · LAST SESSION";
    case "1w":
      return "// PRICE · 30-MIN · LAST WEEK";
    case "1mo":
      return "// PRICE · DAILY · LAST MONTH";
    case "3mo":
      return "// PRICE · DAILY · LAST 3 MONTHS";
    case "1y":
      return "// PRICE · DAILY · LAST 1Y";
    case "5y":
      return "// PRICE · WEEKLY · LAST 5Y";
    case "max":
      return "// PRICE · MONTHLY · FULL HISTORY";
  }
}

export default function StockChart({
  data,
  loading,
  timeframe,
  chartType,
  onTimeframeChange,
  onChartTypeChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof import("lightweight-charts").createChart> | null>(null);
  const [lwc, setLwc] = useState<typeof import("lightweight-charts") | null>(null);

  useEffect(() => {
    import("lightweight-charts").then(setLwc);
  }, []);

  const renderChart = useCallback(() => {
    if (!containerRef.current || !data || !lwc) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = containerRef.current;
    const isIntraday = timeframe === "1d" || timeframe === "1w";
    const chart = lwc.createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { color: SURFACE },
        textColor: TEXT_SOFT,
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: GRID },
        horzLines: { color: GRID },
      },
      crosshair: {
        mode: lwc.CrosshairMode.Normal,
        vertLine: { color: ACCENT, width: 1, style: lwc.LineStyle.Dashed },
        horzLine: { color: ACCENT, width: 1, style: lwc.LineStyle.Dashed },
      },
      rightPriceScale: {
        borderColor: GRID,
      },
      timeScale: {
        borderColor: GRID,
        timeVisible: isIntraday,
      },
    });

    chartRef.current = chart;

    const mapData = data.data.map((d) => ({
      time: isIntraday
        ? (Math.floor(new Date(d.timestamp).getTime() / 1000) as import("lightweight-charts").UTCTimestamp)
        : (d.timestamp.split(" ")[0] as string),
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      value: chartType === "volume" ? d.volume : d.close,
    }));

    const uniqueData = mapData.filter(
      (item, index, self) => index === self.findIndex((t) => t.time === item.time)
    );

    uniqueData.sort((a, b) => {
      const ta = typeof a.time === "number" ? a.time : a.time;
      const tb = typeof b.time === "number" ? b.time : b.time;
      return ta < tb ? -1 : ta > tb ? 1 : 0;
    });

    if (chartType === "candlestick") {
      const series = chart.addSeries(lwc.CandlestickSeries, {
        upColor: UP,
        downColor: DOWN,
        borderDownColor: DOWN,
        borderUpColor: UP,
        wickDownColor: DOWN,
        wickUpColor: UP,
      });
      series.setData(uniqueData);
    } else if (chartType === "line") {
      const series = chart.addSeries(lwc.LineSeries, {
        color: TEXT,
        lineWidth: 1,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: TEXT,
        crosshairMarkerBackgroundColor: SURFACE,
      });
      series.setData(uniqueData.map((d) => ({ time: d.time, value: d.close })));
    } else if (chartType === "area") {
      const firstClose = uniqueData[0]?.close ?? 0;
      const lastClose = uniqueData[uniqueData.length - 1]?.close ?? 0;
      const isUp = lastClose >= firstClose;
      const tone = isUp ? UP : DOWN;

      const series = chart.addSeries(lwc.AreaSeries, {
        topColor: isUp ? "rgba(34, 197, 94, 0.22)" : "rgba(239, 68, 68, 0.22)",
        bottomColor: isUp ? "rgba(34, 197, 94, 0.01)" : "rgba(239, 68, 68, 0.01)",
        lineColor: tone,
        lineWidth: 1,
      });
      series.setData(uniqueData.map((d) => ({ time: d.time, value: d.close })));

      const smaLength = Math.min(20, Math.floor(uniqueData.length / 3));
      if (smaLength >= 2) {
        const smaData: { time: string | import("lightweight-charts").UTCTimestamp; value: number }[] = [];
        for (let i = smaLength - 1; i < uniqueData.length; i++) {
          let sum = 0;
          for (let j = 0; j < smaLength; j++) sum += uniqueData[i - j].close;
          smaData.push({ time: uniqueData[i].time, value: sum / smaLength });
        }
        const smaSeries = chart.addSeries(lwc.LineSeries, {
          color: ACCENT,
          lineWidth: 1,
          crosshairMarkerVisible: false,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        smaSeries.setData(smaData);
      }
    } else if (chartType === "volume") {
      const priceSeries = chart.addSeries(lwc.LineSeries, {
        color: TEXT,
        lineWidth: 1,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: TEXT,
        crosshairMarkerBackgroundColor: SURFACE,
        crosshairMarkerVisible: true,
        lastValueVisible: true,
        priceLineVisible: true,
      });
      chart.priceScale("right").applyOptions({
        scaleMargins: { top: 0.05, bottom: 0.45 },
      });
      priceSeries.setData(uniqueData.map((d) => ({ time: d.time, value: d.close })));

      const volumes = uniqueData.map((d) => d.value);
      const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;

      const volumeSeries = chart.addSeries(lwc.HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "vol",
      });
      chart.priceScale("vol").applyOptions({
        scaleMargins: { top: 0.6, bottom: 0 },
      });
      volumeSeries.setData(
        uniqueData.map((d) => {
          const isUp = d.close >= d.open;
          const isHigh = d.value > avgVolume * 1.5;
          return {
            time: d.time,
            value: d.value,
            color: isHigh
              ? isUp
                ? "rgba(34, 197, 94, 0.75)"
                : "rgba(239, 68, 68, 0.75)"
              : isUp
              ? "rgba(34, 197, 94, 0.35)"
              : "rgba(239, 68, 68, 0.35)",
          };
        })
      );
    }

    chart.timeScale().fitContent();

    const ro = new ResizeObserver(() => {
      if (container.clientWidth > 0) {
        chart.applyOptions({ width: container.clientWidth });
      }
    });
    ro.observe(container);

    return () => ro.disconnect();
  }, [data, chartType, timeframe, lwc]);

  useEffect(() => {
    const cleanup = renderChart();
    return () => {
      cleanup?.();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [renderChart]);

  const segmentBtn = (
    isActive: boolean,
    isFirst: boolean
  ): React.CSSProperties => ({
    fontFamily: "var(--font-mono), monospace",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    fontWeight: 500,
    padding: "8px 12px",
    background: isActive ? "var(--accent)" : "transparent",
    color: isActive ? "var(--text)" : "var(--text-soft)",
    border: 0,
    borderLeft: isFirst ? 0 : "1px solid var(--border)",
    cursor: "pointer",
    transition: "background 0.12s ease",
  });

  return (
    <div>
      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          {CHART_TYPES.map((ct, i) => (
            <button
              key={ct.value}
              onClick={() => onChartTypeChange(ct.value)}
              style={segmentBtn(chartType === ct.value, i === 0)}
            >
              {ct.label}
            </button>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          {TIMEFRAMES.map((tf, i) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              style={segmentBtn(timeframe === tf.value, i === 0)}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          height: "420px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(10, 10, 12, 0.75)",
              zIndex: 10,
            }}
          >
            <p className="smallcaps-mono">// LOADING…</p>
          </div>
        )}
        <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      </div>

      <p className="smallcaps-mono" style={{ marginTop: "10px" }}>
        {timeframeCaption(timeframe)} · SOURCE: YFINANCE
      </p>
    </div>
  );
}
