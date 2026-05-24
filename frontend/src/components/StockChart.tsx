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

// Editorial-quant palette in actual CSS color values (must be concrete for the
// chart library, which doesn't read CSS variables).
const PAPER = "#f4f1ea";
const INK = "#1f2937";
const INK_SOFT = "#4a5260";
const RULE = "#d9d2c2";
const UP = "#0f4c2c";
const DOWN = "#7a2d1d";
const ACCENT = "#a6883c";

function timeframeCaption(tf: Timeframe): string {
  switch (tf) {
    case "1d":
      return "Price · 5-min · last session";
    case "1w":
      return "Price · 30-min · last week";
    case "1mo":
      return "Price · daily · last month";
    case "3mo":
      return "Price · daily · last 3 months";
    case "1y":
      return "Price · daily · last 1 year";
    case "5y":
      return "Price · weekly · last 5 years";
    case "max":
      return "Price · monthly · full history";
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
        background: { color: PAPER },
        textColor: INK_SOFT,
        fontFamily: "var(--font-mono), ui-monospace, monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(217, 210, 194, 0.4)" },
        horzLines: { color: "rgba(217, 210, 194, 0.4)" },
      },
      crosshair: {
        mode: lwc.CrosshairMode.Normal,
        vertLine: { color: ACCENT, width: 1, style: lwc.LineStyle.Dashed },
        horzLine: { color: ACCENT, width: 1, style: lwc.LineStyle.Dashed },
      },
      rightPriceScale: {
        borderColor: RULE,
      },
      timeScale: {
        borderColor: RULE,
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
        color: INK,
        lineWidth: 1,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: INK,
        crosshairMarkerBackgroundColor: PAPER,
      });
      series.setData(uniqueData.map((d) => ({ time: d.time, value: d.close })));
    } else if (chartType === "area") {
      const firstClose = uniqueData[0]?.close ?? 0;
      const lastClose = uniqueData[uniqueData.length - 1]?.close ?? 0;
      const isUp = lastClose >= firstClose;
      const tone = isUp ? UP : DOWN;

      const series = chart.addSeries(lwc.AreaSeries, {
        topColor: isUp ? "rgba(15, 76, 44, 0.18)" : "rgba(122, 45, 29, 0.18)",
        bottomColor: isUp ? "rgba(15, 76, 44, 0.01)" : "rgba(122, 45, 29, 0.01)",
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
        color: INK,
        lineWidth: 1,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: INK,
        crosshairMarkerBackgroundColor: PAPER,
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
                ? "rgba(15, 76, 44, 0.7)"
                : "rgba(122, 45, 29, 0.7)"
              : isUp
              ? "rgba(15, 76, 44, 0.35)"
              : "rgba(122, 45, 29, 0.35)",
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

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
        <div className="flex flex-wrap gap-0 border border-[var(--rule)]">
          {CHART_TYPES.map((ct, i) => (
            <button
              key={ct.value}
              onClick={() => onChartTypeChange(ct.value)}
              className={`smallcaps-mono px-3 py-2 transition-colors ${
                i > 0 ? "border-l border-[var(--rule)]" : ""
              }`}
              style={{
                background:
                  chartType === ct.value ? "var(--ink)" : "transparent",
                color:
                  chartType === ct.value
                    ? "var(--paper)"
                    : "var(--ink-soft)",
              }}
            >
              {ct.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-0 border border-[var(--rule)]">
          {TIMEFRAMES.map((tf, i) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`smallcaps-mono px-3 py-2 transition-colors ${
                i > 0 ? "border-l border-[var(--rule)]" : ""
              }`}
              style={{
                background:
                  timeframe === tf.value ? "var(--ink)" : "transparent",
                color:
                  timeframe === tf.value
                    ? "var(--paper)"
                    : "var(--ink-soft)",
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[420px] border-t border-b border-[var(--rule)]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--paper)]/80 z-10">
            <p className="smallcaps-mono">Loading…</p>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>

      <p className="smallcaps mt-3">
        {timeframeCaption(timeframe)} · source: yfinance
      </p>
    </div>
  );
}
