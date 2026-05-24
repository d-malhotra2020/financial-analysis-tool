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
      <p className="smallcaps-mono" style={{ marginBottom: "12px" }}>
        // SELECTED COVERAGE · {symbol}
      </p>

      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  height: "12px",
                  background: "var(--surface-2)",
                  width: "30%",
                  marginBottom: "10px",
                }}
              />
              <div
                style={{
                  height: "18px",
                  background: "var(--surface-2)",
                  width: "75%",
                }}
              />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            padding: "20px",
            color: "var(--text-soft)",
            fontSize: "14px",
          }}
        >
          No coverage available for {symbol}.
        </div>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {articles.map((article, i) => {
            const headlineEl = (
              <h3
                style={{
                  fontFamily: "var(--font-sans), sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--text)",
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {article.headline}
              </h3>
            );
            return (
              <li
                key={i}
                style={{
                  marginBottom: i < articles.length - 1 ? "10px" : 0,
                }}
              >
                <article
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    padding: "14px",
                    transition: "background 0.12s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--surface-2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--surface)")
                  }
                >
                  <p
                    className="smallcaps-mono"
                    style={{ marginBottom: "8px" }}
                  >
                    {(article.source ?? "WIRE").toUpperCase()} ·{" "}
                    {timeAgo(article.published_at)} · {symbol}
                  </p>
                  {article.url ? (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      {headlineEl}
                    </a>
                  ) : (
                    headlineEl
                  )}
                  {article.summary && (
                    <p
                      style={{
                        fontFamily: "var(--font-sans), sans-serif",
                        fontSize: "13px",
                        lineHeight: 1.55,
                        color: "var(--text-soft)",
                        marginTop: "8px",
                      }}
                    >
                      {article.summary}
                    </p>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
