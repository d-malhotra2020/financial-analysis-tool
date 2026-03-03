import type { StockInfo } from "./types";

export const stockDatabase: StockInfo[] = [
  // Global Indices — Americas
  { symbol: "^GSPC", name: "S&P 500", sector: "Index", exchange: "US" },
  { symbol: "^DJI", name: "Dow Jones Industrial Average", sector: "Index", exchange: "US" },
  { symbol: "^IXIC", name: "NASDAQ Composite", sector: "Index", exchange: "US" },
  { symbol: "^RUT", name: "Russell 2000", sector: "Index", exchange: "US" },
  { symbol: "^GSPTSE", name: "S&P/TSX Composite", sector: "Index", exchange: "Canada" },
  { symbol: "^BVSP", name: "Bovespa", sector: "Index", exchange: "Brazil" },
  { symbol: "^MXX", name: "IPC Mexico", sector: "Index", exchange: "Mexico" },
  // Global Indices — Europe
  { symbol: "^FTSE", name: "FTSE 100", sector: "Index", exchange: "UK" },
  { symbol: "^GDAXI", name: "DAX 40", sector: "Index", exchange: "Germany" },
  { symbol: "^FCHI", name: "CAC 40", sector: "Index", exchange: "France" },
  { symbol: "^STOXX50E", name: "Euro Stoxx 50", sector: "Index", exchange: "EU" },
  { symbol: "^AEX", name: "AEX", sector: "Index", exchange: "Netherlands" },
  { symbol: "^IBEX", name: "IBEX 35", sector: "Index", exchange: "Spain" },
  { symbol: "FTSEMIB.MI", name: "FTSE MIB", sector: "Index", exchange: "Italy" },
  { symbol: "^SSMI", name: "SMI", sector: "Index", exchange: "Switzerland" },
  { symbol: "^OMX", name: "OMX Stockholm 30", sector: "Index", exchange: "Sweden" },
  // Global Indices — Asia-Pacific
  { symbol: "^N225", name: "Nikkei 225", sector: "Index", exchange: "Japan" },
  { symbol: "^HSI", name: "Hang Seng", sector: "Index", exchange: "Hong Kong" },
  { symbol: "000001.SS", name: "Shanghai Composite", sector: "Index", exchange: "China" },
  { symbol: "399001.SZ", name: "Shenzhen Component", sector: "Index", exchange: "China" },
  { symbol: "^KS11", name: "KOSPI", sector: "Index", exchange: "South Korea" },
  { symbol: "^TWII", name: "TAIEX", sector: "Index", exchange: "Taiwan" },
  { symbol: "^AXJO", name: "ASX 200", sector: "Index", exchange: "Australia" },
  { symbol: "^BSESN", name: "BSE Sensex", sector: "Index", exchange: "India" },
  { symbol: "^NSEI", name: "Nifty 50", sector: "Index", exchange: "India" },
  { symbol: "^STI", name: "Straits Times", sector: "Index", exchange: "Singapore" },
  { symbol: "^NZ50", name: "NZX 50", sector: "Index", exchange: "New Zealand" },
  { symbol: "^JKSE", name: "Jakarta Composite", sector: "Index", exchange: "Indonesia" },
  // Global Indices — Middle East & Africa
  { symbol: "^TA125.TA", name: "TA-125", sector: "Index", exchange: "Israel" },
  { symbol: "^J203.JO", name: "JSE Top 40", sector: "Index", exchange: "South Africa" },
  // Stocks
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Discretionary", exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms Inc.", sector: "Technology", exchange: "NASDAQ" },
  { symbol: "NFLX", name: "Netflix Inc.", sector: "Communication Services", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology", exchange: "NASDAQ" },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Technology", exchange: "NASDAQ" },
  { symbol: "INTC", name: "Intel Corporation", sector: "Technology", exchange: "NASDAQ" },
  { symbol: "ORCL", name: "Oracle Corporation", sector: "Technology", exchange: "NYSE" },
  { symbol: "CRM", name: "Salesforce Inc.", sector: "Technology", exchange: "NYSE" },
  { symbol: "ADBE", name: "Adobe Inc.", sector: "Technology", exchange: "NASDAQ" },
  { symbol: "PYPL", name: "PayPal Holdings Inc.", sector: "Financials", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer Discretionary", exchange: "NASDAQ" },
  { symbol: "BRK.B", name: "Berkshire Hathaway Inc.", sector: "Financials", exchange: "NYSE" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financials", exchange: "NYSE" },
  { symbol: "V", name: "Visa Inc.", sector: "Financials", exchange: "NYSE" },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Financials", exchange: "NYSE" },
  { symbol: "GS", name: "Goldman Sachs Group Inc.", sector: "Financials", exchange: "NYSE" },
  { symbol: "BAC", name: "Bank of America Corp.", sector: "Financials", exchange: "NYSE" },
  { symbol: "WFC", name: "Wells Fargo & Co.", sector: "Financials", exchange: "NYSE" },
  { symbol: "MS", name: "Morgan Stanley", sector: "Financials", exchange: "NYSE" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", exchange: "NYSE" },
  { symbol: "UNH", name: "UnitedHealth Group Inc.", sector: "Healthcare", exchange: "NYSE" },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare", exchange: "NYSE" },
  { symbol: "ABBV", name: "AbbVie Inc.", sector: "Healthcare", exchange: "NYSE" },
  { symbol: "LLY", name: "Eli Lilly and Co.", sector: "Healthcare", exchange: "NYSE" },
  { symbol: "MRK", name: "Merck & Co Inc.", sector: "Healthcare", exchange: "NYSE" },
  { symbol: "XOM", name: "Exxon Mobil Corp.", sector: "Energy", exchange: "NYSE" },
  { symbol: "CVX", name: "Chevron Corporation", sector: "Energy", exchange: "NYSE" },
  { symbol: "COP", name: "ConocoPhillips", sector: "Energy", exchange: "NYSE" },
  { symbol: "KO", name: "Coca-Cola Co.", sector: "Consumer Staples", exchange: "NYSE" },
  { symbol: "PEP", name: "PepsiCo Inc.", sector: "Consumer Staples", exchange: "NASDAQ" },
  { symbol: "PG", name: "Procter & Gamble Co.", sector: "Consumer Staples", exchange: "NYSE" },
  { symbol: "WMT", name: "Walmart Inc.", sector: "Consumer Staples", exchange: "NYSE" },
  { symbol: "COST", name: "Costco Wholesale Corp.", sector: "Consumer Staples", exchange: "NASDAQ" },
  { symbol: "HD", name: "Home Depot Inc.", sector: "Consumer Discretionary", exchange: "NYSE" },
  { symbol: "MCD", name: "McDonald's Corp.", sector: "Consumer Discretionary", exchange: "NYSE" },
  { symbol: "NKE", name: "Nike Inc.", sector: "Consumer Discretionary", exchange: "NYSE" },
  { symbol: "DIS", name: "Walt Disney Co.", sector: "Communication Services", exchange: "NYSE" },
  { symbol: "BA", name: "Boeing Co.", sector: "Industrials", exchange: "NYSE" },
  { symbol: "CAT", name: "Caterpillar Inc.", sector: "Industrials", exchange: "NYSE" },
  { symbol: "GE", name: "General Electric Co.", sector: "Industrials", exchange: "NYSE" },
  { symbol: "LMT", name: "Lockheed Martin Corp.", sector: "Industrials", exchange: "NYSE" },
  { symbol: "UPS", name: "United Parcel Service Inc.", sector: "Industrials", exchange: "NYSE" },
  { symbol: "AVGO", name: "Broadcom Inc.", sector: "Technology", exchange: "NASDAQ" },
  { symbol: "QCOM", name: "Qualcomm Inc.", sector: "Technology", exchange: "NASDAQ" },
  { symbol: "TXN", name: "Texas Instruments Inc.", sector: "Technology", exchange: "NASDAQ" },
  { symbol: "NOW", name: "ServiceNow Inc.", sector: "Technology", exchange: "NYSE" },
  { symbol: "UBER", name: "Uber Technologies Inc.", sector: "Technology", exchange: "NYSE" },
  { symbol: "PLTR", name: "Palantir Technologies Inc.", sector: "Technology", exchange: "NYSE" },
  { symbol: "SHOP", name: "Shopify Inc.", sector: "Technology", exchange: "NYSE" },
  { symbol: "SBUX", name: "Starbucks Corp.", sector: "Consumer Discretionary", exchange: "NASDAQ" },
  { symbol: "F", name: "Ford Motor Co.", sector: "Consumer Discretionary", exchange: "NYSE" },
  { symbol: "GM", name: "General Motors Co.", sector: "Consumer Discretionary", exchange: "NYSE" },
  { symbol: "T", name: "AT&T Inc.", sector: "Communication Services", exchange: "NYSE" },
  { symbol: "VZ", name: "Verizon Communications Inc.", sector: "Communication Services", exchange: "NYSE" },
  { symbol: "NEE", name: "NextEra Energy Inc.", sector: "Utilities", exchange: "NYSE" },
  { symbol: "SO", name: "Southern Co.", sector: "Utilities", exchange: "NYSE" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", sector: "Fund", exchange: "NYSE" },
  { symbol: "QQQ", name: "Invesco QQQ Trust", sector: "Fund", exchange: "NASDAQ" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", sector: "Fund", exchange: "NYSE" },
];

export function searchStocks(query: string): StockInfo[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return stockDatabase
    .filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q)
    )
    .slice(0, 8);
}

export function getRandomStock(): StockInfo {
  const stocks = stockDatabase.filter((s) => s.sector !== "Index");
  return stocks[Math.floor(Math.random() * stocks.length)];
}
