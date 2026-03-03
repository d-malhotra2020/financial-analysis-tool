export interface StockInfo {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
}

export interface StockPrice {
  timestamp: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  volume: number;
  adjusted_close: number;
}

export interface StockAnalysis {
  analysis_date: string;
  rsi: number | null;
  macd: number | null;
  volatility: number | null;
  beta: number;
  sharpe_ratio: number | null;
  predicted_price_1d: number | null;
  predicted_price_7d: number | null;
  predicted_price_30d: number | null;
  confidence_score: number;
  recommendation: string;
  analysis_notes: string;
}

export interface StockDetail {
  id: number;
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  market_cap: number;
  latest_price: StockPrice;
  latest_analysis: StockAnalysis;
}

export interface ChartDataPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartData {
  symbol: string;
  period: string;
  interval: string;
  data: ChartDataPoint[];
}

export interface MarketIndex {
  value: number;
  change: number;
  change_percent: number;
}

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
}

export interface MarketOverview {
  title: string;
  last_update: string;
  market_summary: {
    advancing_stocks: number;
    declining_stocks: number;
    total_volume: number;
  };
  market_indices: Record<string, MarketIndex>;
}

export interface GainersResponse {
  title: string;
  last_update: string;
  gainers: MarketMover[];
}

export interface LosersResponse {
  title: string;
  last_update: string;
  losers: MarketMover[];
}

export interface NewsArticle {
  headline: string;
  summary: string;
  source: string;
  category: string;
  url: string;
  published_at: string;
  image_url: string;
}

export interface NewsResponse {
  symbol: string;
  count: number;
  articles: NewsArticle[];
}

export type Timeframe = "1d" | "1w" | "1mo" | "3mo" | "1y" | "5y" | "max";
export type ChartType = "candlestick" | "line" | "area" | "volume";
