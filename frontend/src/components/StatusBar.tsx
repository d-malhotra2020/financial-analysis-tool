"use client";

import { useEffect, useState } from "react";
import { getMarketOverview } from "@/lib/api";

function formatETClock(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function isMarketOpen(date: Date): boolean {
  // ET trading hours, 9:30 - 16:00, Mon-Fri.
  const et = new Date(
    date.toLocaleString("en-US", { timeZone: "America/New_York" })
  );
  const day = et.getDay();
  if (day === 0 || day === 6) return false;
  const minutes = et.getHours() * 60 + et.getMinutes();
  return minutes >= 9 * 60 + 30 && minutes < 16 * 60;
}

function minutesUntilNextRefresh(lastUpdateISO: string | null): number {
  if (!lastUpdateISO) return 5;
  const last = new Date(lastUpdateISO).getTime();
  const next = last + 5 * 60 * 1000;
  const diff = Math.max(0, next - Date.now());
  return Math.max(1, Math.ceil(diff / 60000));
}

export default function StatusBar() {
  const [clock, setClock] = useState<string>("--:--:--");
  const [marketOpen, setMarketOpen] = useState<boolean>(false);
  const [tickerCount, setTickerCount] = useState<number>(503);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [refreshMin, setRefreshMin] = useState<number>(5);

  // Live clock + market-open recompute every second.
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(formatETClock(now));
      setMarketOpen(isMarketOpen(now));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Refresh countdown every minute.
  useEffect(() => {
    const recompute = () =>
      setRefreshMin(minutesUntilNextRefresh(lastUpdate));
    recompute();
    const id = setInterval(recompute, 60000);
    return () => clearInterval(id);
  }, [lastUpdate]);

  // Pull live overview (ticker count + last_update).
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
        /* keep defaults */
      }
    }
    load();
    const id = setInterval(load, 300000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}
    >
      <div
        className="page-frame font-mono tabular"
        style={{
          padding: "6px 24px",
          fontSize: "11px",
          color: "var(--text-muted)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "1.25rem",
          letterSpacing: "0.02em",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            aria-hidden
            className="pip-pulse"
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "999px",
              background: "var(--pip)",
              boxShadow: "0 0 6px rgba(34, 197, 94, 0.6)",
              display: "inline-block",
            }}
          />
          system:{" "}
          <span style={{ color: "var(--text-soft)" }}>online</span>
        </span>

        <span>
          market:{" "}
          <span style={{ color: "var(--text-soft)" }}>
            {marketOpen ? "open" : "closed"} · NY
          </span>
        </span>

        <span style={{ color: "var(--text-soft)" }}>{clock} ET</span>

        <span>
          <span style={{ color: "var(--text-soft)" }}>{tickerCount}</span>{" "}
          tickers
        </span>

        <span>
          next refresh{" "}
          <span style={{ color: "var(--text-soft)" }}>{refreshMin}m</span>
        </span>

        <span style={{ marginLeft: "auto", color: "var(--text-muted)" }}>
          v0.2
        </span>
      </div>
    </div>
  );
}
