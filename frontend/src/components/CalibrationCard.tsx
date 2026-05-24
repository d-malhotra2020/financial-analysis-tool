"use client";

import { useEffect, useState } from "react";
import { getCalibrationLatest } from "@/lib/api";
import type { CalibrationReport, CalibrationSymbolStats } from "@/lib/types";

type SymbolRow = { symbol: string } & CalibrationSymbolStats;

function rankSymbols(report: CalibrationReport): {
  top: SymbolRow[];
  bottom: SymbolRow[];
} {
  const rows: SymbolRow[] = Object.entries(report.by_symbol).map(
    ([symbol, stats]) => ({ symbol, ...stats })
  );
  rows.sort((a, b) => b.accuracy - a.accuracy);
  return {
    top: rows.slice(0, 3),
    bottom: rows.slice(-3).reverse(),
  };
}

function pct(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export default function CalibrationCard() {
  const [report, setReport] = useState<CalibrationReport | null>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await getCalibrationLatest();
        if (!cancelled) setReport(r);
      } catch {
        if (!cancelled) setErrored(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fallback: harness has never run OR endpoint missing in dev. Show the
  // honest placeholder so devs aren't lied to.
  if (errored || !report) {
    return <PlaceholderCard />;
  }

  const { top, bottom } = rankSymbols(report);
  const meta = report.run_metadata;
  const symbolCount = meta?.symbols?.length ?? 0;

  return (
    <section
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        padding: "20px",
      }}
    >
      <p className="smallcaps-mono" style={{ marginBottom: "12px" }}>
        // CALIBRATION REPORT
      </p>

      <div style={{ marginBottom: "14px" }}>
        <p
          className="smallcaps-mono"
          style={{
            color: "var(--text-muted)",
            fontSize: "10px",
            marginBottom: "4px",
          }}
        >
          // REAL ACCURACY
        </p>
        <p
          className="font-mono tabular"
          style={{
            color: "var(--accent)",
            fontSize: "28px",
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          {pct(report.accuracy)}
        </p>
        <p
          className="font-mono tabular"
          style={{
            color: "var(--text-muted)",
            fontSize: "11px",
            margin: "4px 0 0",
          }}
        >
          {report.predictions_correct}/{report.predictions_total} predictions
        </p>
      </div>

      <p
        style={{
          fontFamily: "var(--font-sans), sans-serif",
          fontSize: "12px",
          lineHeight: 1.5,
          color: "var(--text-soft)",
          margin: "0 0 14px",
        }}
      >
        {meta.start_date} → {meta.end_date} · {symbolCount} symbols · daily
        direction predictions. Same code path live and backtest.
      </p>

      <SymbolTable label="// TOP 3" rows={top} />
      <div style={{ height: "8px" }} />
      <SymbolTable label="// BOTTOM 3" rows={bottom} />

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          aria-hidden
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "999px",
            background: "var(--pip)",
            display: "inline-block",
          }}
        />
        <span
          className="smallcaps-mono"
          style={{
            padding: "4px 8px",
            border: "1px solid var(--accent)",
            borderRadius: "3px",
            color: "var(--accent)",
            background: "var(--accent-soft)",
            fontSize: "10px",
          }}
        >
          // HARNESS COMPLETE
        </span>
      </div>

      <p
        className="font-mono"
        style={{
          fontSize: "10px",
          color: "var(--text-muted)",
          marginTop: "10px",
          marginBottom: 0,
        }}
      >
        harness {meta.harness_version} · model {meta.model_version}
      </p>
    </section>
  );
}

function SymbolTable({ label, rows }: { label: string; rows: SymbolRow[] }) {
  return (
    <div>
      <p
        className="smallcaps-mono"
        style={{
          color: "var(--text-muted)",
          fontSize: "10px",
          marginBottom: "6px",
        }}
      >
        {label}
      </p>
      <table
        className="font-mono tabular"
        style={{
          width: "100%",
          fontSize: "11px",
          color: "var(--text-soft)",
          borderCollapse: "collapse",
        }}
      >
        <tbody>
          {rows.map((r) => (
            <tr key={r.symbol}>
              <td style={{ padding: "2px 0" }}>{r.symbol}</td>
              <td style={{ padding: "2px 0", textAlign: "right" }}>
                {pct(r.accuracy)}
              </td>
              <td
                style={{
                  padding: "2px 0",
                  textAlign: "right",
                  color: "var(--text-muted)",
                }}
              >
                {r.correct}/{r.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Honest placeholder for when the harness hasn't run yet or the API is
 * unreachable (dev environments, missing artifact). Keeps the editorial
 * voice — never claims a number we haven't measured.
 */
function PlaceholderCard() {
  return (
    <section
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        padding: "20px",
      }}
    >
      <p className="smallcaps-mono" style={{ marginBottom: "12px" }}>
        // CALIBRATION REPORT
      </p>
      <p
        style={{
          fontFamily: "var(--font-sans), sans-serif",
          fontSize: "12px",
          lineHeight: 1.5,
          color: "var(--text-soft)",
          margin: 0,
        }}
      >
        Backtest artifact not loaded. Run{" "}
        <span className="font-mono">python -m app.backtest.cli</span> to
        generate <span className="font-mono">data/calibration/latest.json</span>
        , then refresh.
      </p>
    </section>
  );
}
