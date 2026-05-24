"use client";

import { useEffect, useState, useCallback } from "react";
import { getStockNews } from "@/lib/api";
import type { NewsArticle } from "@/lib/types";

interface Props {
  symbol: string | null;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "JUST NOW";
  if (diff < 3600) return `${Math.floor(diff / 60)}M AGO`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}H AGO`;
  return `${Math.floor(diff / 86400)}D AGO`;
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
    <section>
      <p className="smallcaps mb-4">Selected coverage · {symbol}</p>
      <hr className="rule mb-2" />

      {loading ? (
        <div className="py-6 space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 bg-[var(--paper-soft)] w-3/4" />
              <div className="h-3 bg-[var(--paper-soft)] w-1/3" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <p className="font-serif italic text-[var(--ink-soft)] py-6">
          No coverage available for {symbol}.
        </p>
      ) : (
        <ul>
          {articles.map((article, i) => (
            <li key={i}>
              <article className="py-5">
                <p
                  className="smallcaps-mono mb-2"
                  style={{ letterSpacing: "0.1em" }}
                >
                  {(article.source ?? "Wire").toUpperCase()} ·{" "}
                  {timeAgo(article.published_at)} ·{" "}
                  {(article.category ?? "general").toUpperCase()}
                </p>
                {article.url ? (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="editorial-link"
                  >
                    <h3
                      className="font-serif text-[var(--ink)]"
                      style={{
                        fontSize: "1.25rem",
                        lineHeight: 1.25,
                        fontWeight: 500,
                      }}
                    >
                      {article.headline}
                    </h3>
                  </a>
                ) : (
                  <h3
                    className="font-serif text-[var(--ink)]"
                    style={{
                      fontSize: "1.25rem",
                      lineHeight: 1.25,
                      fontWeight: 500,
                    }}
                  >
                    {article.headline}
                  </h3>
                )}
                <p
                  className="font-serif text-[var(--ink-soft)] mt-2"
                  style={{ fontSize: "16px", lineHeight: 1.55 }}
                >
                  {article.summary}
                </p>
              </article>
              {i < articles.length - 1 && <hr className="rule" />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
