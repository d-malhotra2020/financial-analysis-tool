"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Shuffle, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
        } finally {
          setLoading(false);
        }
      }, 300);
    }
  }, []);

  const handleSelect = useCallback(
    (symbol: string) => {
      setQuery(symbol);
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
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search any stock or company (e.g., AAPL, GameStop, Bitcoin)"
            className="w-full pl-12 pr-10 py-3.5 bg-zinc-900/50 border border-zinc-700/50 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); setOpen(false); setResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/20 active:scale-95"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => handleSelect(getRandomStock().symbol)}
          className="px-4 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all border border-zinc-700/50 active:scale-95 flex items-center gap-2"
        >
          <Shuffle className="h-4 w-4" />
          <span className="hidden sm:inline">Random</span>
        </button>
      </form>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-700/50 rounded-xl shadow-2xl shadow-black/40 overflow-hidden backdrop-blur-xl"
          >
            {loading && (
              <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 text-xs text-zinc-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                Searching all markets...
              </div>
            )}
            <div className="max-h-[400px] overflow-y-auto">
              {results.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleSelect(stock.symbol)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/80 transition-colors text-left"
                >
                  <div>
                    <span className="font-semibold text-zinc-100">{stock.symbol}</span>
                    <span className="ml-2 text-xs text-zinc-500">{stock.exchange}</span>
                    <div className="text-sm text-zinc-400">{stock.name}</div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                    {stock.sector}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
