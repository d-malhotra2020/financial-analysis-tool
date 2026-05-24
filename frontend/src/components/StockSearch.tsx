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
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
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

  return (
    <div ref={ref} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex items-end gap-6">
        <div className="flex-1">
          <label className="smallcaps block mb-2" htmlFor="ticker-input">
            Lookup ticker
          </label>
          <input
            id="ticker-input"
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="e.g. AAPL, NVDA, ^GSPC"
            autoComplete="off"
            spellCheck={false}
            className="w-full font-mono tabular bg-transparent border-0 border-b border-[var(--ink)] focus:outline-none focus:border-[var(--accent)] py-2 text-[20px] uppercase placeholder:normal-case placeholder:text-[var(--muted)] placeholder:lowercase"
            style={{ letterSpacing: "0.04em" }}
          />
        </div>
        <button
          type="submit"
          className="smallcaps-mono px-4 py-3 border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
        >
          Go
        </button>
        <button
          type="button"
          onClick={() => handleSelect(getRandomStock().symbol)}
          className="smallcaps-mono px-4 py-3 border border-[var(--rule)] text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-colors"
        >
          Random
        </button>
      </form>

      {open && (results.length > 0 || loading) && (
        <div className="absolute z-50 w-full mt-1 bg-[var(--paper)] border border-[var(--rule)] shadow-none">
          {loading && (
            <p className="smallcaps-mono px-4 py-2 border-b border-[var(--rule)]">
              Searching all markets…
            </p>
          )}
          <ul className="max-h-[420px] overflow-y-auto">
            {results.map((stock, idx) => (
              <li key={stock.symbol}>
                <button
                  onClick={() => handleSelect(stock.symbol)}
                  className="w-full flex items-baseline justify-between px-4 py-3 hover:bg-[var(--paper-soft)] transition-colors text-left"
                >
                  <span className="flex items-baseline gap-3 min-w-0">
                    <span className="font-mono tabular text-[15px] text-[var(--ink)] w-24 shrink-0">
                      {stock.symbol}
                    </span>
                    <span className="font-serif text-[15px] text-[var(--ink-soft)] truncate">
                      {stock.name}
                    </span>
                  </span>
                  <span className="smallcaps shrink-0">
                    {stock.exchange} · {stock.sector}
                  </span>
                </button>
                {idx < results.length - 1 && <hr className="rule" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
