"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { searchStocks, getRandomStock } from "@/lib/stocks";
import { searchStocksAPI } from "@/lib/api";
import type { StockInfo } from "@/lib/types";

interface Props {
  onSelect: (symbol: string) => void;
}

export default function StockSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockInfo[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Slash-to-focus keyboard shortcut.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== "/") return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      const isEditable =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement | null)?.isContentEditable;
      if (isEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length === 0) {
      setOpen(false);
      setResults([]);
      setLoading(false);
      return;
    }

    const localResults = searchStocks(value);
    setResults(localResults);
    setOpen(true);

    if (value.trim().length >= 2) {
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const apiResults = await searchStocksAPI(value.trim());
          const seen = new Set(localResults.map((s) => s.symbol));
          const merged = [...localResults];
          for (const r of apiResults) {
            if (!seen.has(r.symbol)) {
              seen.add(r.symbol);
              merged.push(r);
            }
          }
          setResults(merged.slice(0, 12));
          setOpen(true);
        } catch {
          // silent — fall back to local results
        } finally {
          setLoading(false);
        }
      }, 300);
    }
  }, []);

  const handleSelect = useCallback(
    (symbol: string) => {
      setQuery(symbol.toUpperCase());
      setOpen(false);
      onSelect(symbol);
    },
    [onSelect]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        onSelect(query.trim().toUpperCase());
        setOpen(false);
      }
    },
    [query, onSelect]
  );

  const borderColor = focused ? "var(--accent)" : "var(--border)";

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            background: "var(--surface)",
            border: `1px solid ${borderColor}`,
            borderRadius: "4px",
            transition: "border-color 0.12s ease",
          }}
        >
          {/* Slash icon */}
          <span
            aria-hidden
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 14px",
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono), monospace",
              fontSize: "14px",
            }}
          >
            /
          </span>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search any ticker (try AAPL, NVDA, TSLA)…"
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1,
              minWidth: 0,
              background: "transparent",
              border: 0,
              outline: "none",
              padding: "12px 0",
              color: "var(--text)",
              fontFamily: "var(--font-sans), sans-serif",
              fontSize: "14px",
            }}
          />

          {/* Random button */}
          <button
            type="button"
            onClick={() => handleSelect(getRandomStock().symbol)}
            className="smallcaps-mono"
            style={{
              padding: "0 14px",
              background: "transparent",
              border: 0,
              borderLeft: "1px solid var(--border)",
              color: "var(--text-soft)",
              cursor: "pointer",
            }}
          >
            random
          </button>

          {/* Keyboard hint */}
          <span
            aria-hidden
            className="font-mono tabular"
            style={{
              alignSelf: "center",
              marginRight: "10px",
              marginLeft: "10px",
              padding: "2px 8px",
              border: "1px solid var(--border)",
              borderRadius: "3px",
              fontSize: "11px",
              color: "var(--text-muted)",
            }}
          >
            /
          </span>
        </div>
      </form>

      {open && (results.length > 0 || loading) && (
        <div
          style={{
            position: "absolute",
            zIndex: 50,
            width: "100%",
            marginTop: "4px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          {loading && (
            <p
              className="smallcaps-mono"
              style={{
                padding: "10px 14px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              // searching markets…
            </p>
          )}
          <ul
            style={{
              maxHeight: "420px",
              overflowY: "auto",
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {results.map((stock, idx) => (
              <li key={stock.symbol}>
                <button
                  onClick={() => handleSelect(stock.symbol)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.1s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--surface-2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "12px",
                      minWidth: 0,
                    }}
                  >
                    <span
                      className="font-mono tabular"
                      style={{
                        fontSize: "13px",
                        color: "var(--text)",
                        fontWeight: 500,
                        width: "80px",
                        flexShrink: 0,
                      }}
                    >
                      {stock.symbol}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--text-soft)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {stock.name}
                    </span>
                  </span>
                  <span
                    className="smallcaps-mono"
                    style={{ flexShrink: 0, marginLeft: "12px" }}
                  >
                    {stock.exchange} · {stock.sector}
                  </span>
                </button>
                {idx < results.length - 1 && (
                  <hr
                    style={{
                      border: 0,
                      borderTop: "1px solid var(--border)",
                      margin: 0,
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
