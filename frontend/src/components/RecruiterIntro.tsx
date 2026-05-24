"use client";

import { useEffect, useState } from "react";
import { getMarketOverview } from "@/lib/api";

function formatETTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function minutesUntilNextRefresh(lastUpdateISO: string | null): number {
  if (!lastUpdateISO) return 5;
  const last = new Date(lastUpdateISO).getTime();
  const next = last + 5 * 60 * 1000;
  const diff = Math.max(0, next - Date.now());
  return Math.max(1, Math.ceil(diff / 60000));
}

export default function RecruiterIntro() {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [tickerCount, setTickerCount] = useState<number>(503);
  const [, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const ov = await getMarketOverview();
        if (cancelled) return;
        setLastUpdate(ov.last_update ?? null);
        const advancing = ov.market_summary?.advancing_stocks ?? 0;
        const declining = ov.market_summary?.declining_stocks ?? 0;
        const total = advancing + declining;
        if (total > 0) setTickerCount(total);
      } catch {
        // fall back to defaults
      }
    }
    load();
    const refresh = setInterval(load, 300000);
    const tick = setInterval(() => setTick((n) => n + 1), 30000);
    return () => {
      cancelled = true;
      clearInterval(refresh);
      clearInterval(tick);
    };
  }, []);

  const displayedTime = lastUpdate
    ? formatETTime(new Date(lastUpdate))
    : formatETTime(new Date());
  const nextRefresh = minutesUntilNextRefresh(lastUpdate);

  return (
    <section className="page-frame pt-14 pb-12">
      <p
        className="font-serif text-[var(--ink)] max-w-[760px]"
        style={{ fontSize: "20px", lineHeight: 1.55, fontWeight: 400 }}
      >
        <em>
          A real-time market analysis tool by Drew Malhotra. Live data via
          yfinance, S&amp;P 500 polled every 5 minutes, technical indicators
          (RSI · MACD · Bollinger), and an ML prediction layer with a published
          calibration report.
        </em>
      </p>
      <p
        className="smallcaps-mono tabular mt-8"
        style={{ letterSpacing: "0.12em" }}
      >
        Updated {displayedTime} ET · {tickerCount} tickers tracked · next
        refresh in {nextRefresh}m
      </p>
    </section>
  );
}
