"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, Clock, ExternalLink, Tag } from "lucide-react";
import { getStockNews } from "@/lib/api";
import type { NewsArticle } from "@/lib/types";

interface Props {
  symbol: string | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  earnings: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  analyst: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  expansion: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  institutional: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  industry: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  leadership: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  general: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function StockNews({ symbol }: Props) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [prevSymbol, setPrevSymbol] = useState<string | null>(null);

  const load = useCallback(async (sym: string) => {
    setLoading(true);
    try {
      const res = await getStockNews(sym);
      setArticles(res.articles ?? []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (symbol && symbol !== prevSymbol) {
      setPrevSymbol(symbol);
      load(symbol);
    }
  }, [symbol, prevSymbol, load]);

  if (!symbol) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2.5 mb-5">
        <Newspaper className="h-5 w-5 text-blue-400" />
        <h2 className="text-lg font-bold text-zinc-100">
          {symbol} News
        </h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse space-y-2 p-4 bg-zinc-800/30 rounded-xl">
              <div className="h-4 bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-zinc-800 rounded w-full" />
              <div className="h-3 bg-zinc-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={symbol}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {articles.map((article, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group p-4 rounded-xl bg-zinc-800/30 border border-zinc-700/20 hover:bg-zinc-800/50 hover:border-zinc-600/30 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS.general
                        }`}
                      >
                        <Tag className="h-2.5 w-2.5 inline mr-1" />
                        {article.category}
                      </span>
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(article.published_at)}
                      </span>
                      <span className="text-[11px] text-zinc-600">{article.source}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-200 leading-snug mb-1.5 group-hover:text-zinc-100 transition-colors">
                      {article.headline}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {article.summary}
                    </p>
                  </div>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 rounded-lg text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}

            {articles.length === 0 && (
              <div className="text-center py-8 text-zinc-500 text-sm">
                No news available for {symbol}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
