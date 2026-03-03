"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion } from "framer-motion";
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
  { value: "candlestick", label: "Candlestick" },
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
  { value: "volume", label: "Volume" },
];

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
    const chart = lwc.createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight,
      layout: {
        background: { color: "transparent" },
        textColor: "#a1a1aa",
        fontFamily: "'Inter', sans-serif",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "rgba(63, 63, 70, 0.3)" },
        horzLines: { color: "rgba(63, 63, 70, 0.3)" },
      },
      crosshair: {
        mode: lwc.CrosshairMode.Normal,
        vertLine: { color: "rgba(59, 130, 246, 0.3)", width: 1, style: lwc.LineStyle.Dashed },
        horzLine: { color: "rgba(59, 130, 246, 0.3)", width: 1, style: lwc.LineStyle.Dashed },
      },
      rightPriceScale: {
        borderColor: "rgba(63, 63, 70, 0.3)",
      },
      timeScale: {
        borderColor: "rgba(63, 63, 70, 0.3)",
        timeVisible: timeframe === "1d",
      },
    });

    chartRef.current = chart;

    const mapData = data.data.map((d) => ({
      time: d.timestamp as string,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      value: chartType === "volume" ? d.volume : d.close,
    }));

    const uniqueData = mapData.filter(
      (item, index, self) => index === self.findIndex((t) => t.time === item.time)
    );

    uniqueData.sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));

    if (chartType === "candlestick") {
      const series = chart.addSeries(lwc.CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderDownColor: "#ef4444",
        borderUpColor: "#22c55e",
        wickDownColor: "#ef4444",
        wickUpColor: "#22c55e",
      });
      series.setData(uniqueData);
    } else if (chartType === "line") {
      const series = chart.addSeries(lwc.LineSeries, {
        color: "#3b82f6",
        lineWidth: 2,
        crosshairMarkerRadius: 5,
        crosshairMarkerBorderColor: "#3b82f6",
        crosshairMarkerBackgroundColor: "#1e3a5f",
      });
      series.setData(uniqueData.map((d) => ({ time: d.time, value: d.close })));
    } else if (chartType === "area") {
      const firstClose = uniqueData[0]?.close ?? 0;
      const lastClose = uniqueData[uniqueData.length - 1]?.close ?? 0;
      const isUp = lastClose >= firstClose;

      const series = chart.addSeries(lwc.AreaSeries, {
        topColor: isUp ? "rgba(34, 197, 94, 0.35)" : "rgba(239, 68, 68, 0.35)",
        bottomColor: isUp ? "rgba(34, 197, 94, 0.02)" : "rgba(239, 68, 68, 0.02)",
        lineColor: isUp ? "#22c55e" : "#ef4444",
        lineWidth: 2,
      });
      series.setData(uniqueData.map((d) => ({ time: d.time, value: d.close })));

      const smaLength = Math.min(20, Math.floor(uniqueData.length / 3));
      if (smaLength >= 2) {
        const smaData: { time: string; value: number }[] = [];
        for (let i = smaLength - 1; i < uniqueData.length; i++) {
          let sum = 0;
          for (let j = 0; j < smaLength; j++) sum += uniqueData[i - j].close;
          smaData.push({ time: uniqueData[i].time, value: sum / smaLength });
        }
        const smaSeries = chart.addSeries(lwc.LineSeries, {
          color: "rgba(250, 204, 21, 0.7)",
          lineWidth: 1,
          crosshairMarkerVisible: false,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        smaSeries.setData(smaData);
      }

      const volumeSeries = chart.addSeries(lwc.HistogramSeries, {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
      });
      chart.priceScale("volume").applyOptions({
        scaleMargins: { top: 0.85, bottom: 0 },
      });
      volumeSeries.setData(
        uniqueData.map((d) => ({
          time: d.time,
          value: d.value,
          color: d.close >= d.open ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
        }))
      );
    } else if (chartType === "volume") {
      const priceSeries = chart.addSeries(lwc.LineSeries, {
        color: "rgba(99, 102, 241, 0.6)",
        lineWidth: 2,
        crosshairMarkerRadius: 5,
        crosshairMarkerBorderColor: "#6366f1",
        crosshairMarkerBackgroundColor: "#312e81",
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
              ? isUp ? "rgba(34, 197, 94, 0.7)" : "rgba(239, 68, 68, 0.7)"
              : isUp ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)",
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {CHART_TYPES.map((ct) => (
            <button
              key={ct.value}
              onClick={() => onChartTypeChange(ct.value)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
                chartType === ct.value
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-200 border border-zinc-700/30"
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => onTimeframeChange(tf.value)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                timeframe === tf.value
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-200 border border-zinc-700/30"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[400px] rounded-xl overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 z-10">
            <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </motion.div>
  );
}
