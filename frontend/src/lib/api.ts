import type {
  StockDetail,
  StockInfo,
  ChartData,
  MarketOverview,
  GainersResponse,
  LosersResponse,
  NewsResponse,
} from "./types";

const BASE = "";

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
  return res.json();
}

export async function getStockDetail(symbol: string): Promise<StockDetail> {
  return fetchJSON(`/api/v1/stocks/${symbol}?include_history=true&history_days=252`);
}

export async function getChartData(symbol: string, period: string): Promise<ChartData> {
  return fetchJSON(`/api/v1/stocks/${symbol}/chart?period=${period}`);
}

export async function getMarketOverview(): Promise<MarketOverview> {
  return fetchJSON("/api/v1/sp500/");
}

export async function getTopGainers(): Promise<GainersResponse> {
  return fetchJSON("/api/v1/sp500/gainers");
}

export async function getTopLosers(): Promise<LosersResponse> {
  return fetchJSON("/api/v1/sp500/losers");
}

export async function getStockNews(symbol: string): Promise<NewsResponse> {
  return fetchJSON(`/api/v1/stocks/${symbol}/news`);
}

export async function searchStocksAPI(query: string): Promise<StockInfo[]> {
  const data = await fetchJSON<{ results: StockInfo[] }>(
    `/api/v1/stocks/search?query=${encodeURIComponent(query)}&limit=10`
  );
  return data.results;
}
