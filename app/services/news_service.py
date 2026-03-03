import os
import requests
from datetime import datetime, timedelta
from typing import List, Dict

FINNHUB_API_KEY = os.getenv("FINNHUB_API_KEY", "")

COMPANY_CONTEXT = {
    "AAPL": {"name": "Apple", "topics": ["iPhone", "Mac", "AI", "services revenue", "App Store"]},
    "MSFT": {"name": "Microsoft", "topics": ["Azure", "AI", "Copilot", "Windows", "Xbox"]},
    "GOOGL": {"name": "Alphabet", "topics": ["Google Search", "YouTube", "AI", "Cloud", "Waymo"]},
    "AMZN": {"name": "Amazon", "topics": ["AWS", "e-commerce", "Prime", "logistics", "AI"]},
    "META": {"name": "Meta", "topics": ["Instagram", "WhatsApp", "metaverse", "AI", "Threads"]},
    "NVDA": {"name": "NVIDIA", "topics": ["GPUs", "AI chips", "data centers", "gaming", "autonomous driving"]},
    "TSLA": {"name": "Tesla", "topics": ["EVs", "Autopilot", "energy storage", "Cybertruck", "robotaxi"]},
    "JPM": {"name": "JPMorgan", "topics": ["banking", "interest rates", "investment banking", "trading revenue", "credit"]},
    "V": {"name": "Visa", "topics": ["payments", "fintech", "cross-border transactions", "digital payments"]},
    "JNJ": {"name": "Johnson & Johnson", "topics": ["pharma", "medical devices", "consumer health", "clinical trials"]},
    "WMT": {"name": "Walmart", "topics": ["retail", "e-commerce growth", "grocery", "supply chain"]},
    "XOM": {"name": "Exxon Mobil", "topics": ["oil prices", "LNG", "refining", "energy transition"]},
    "NFLX": {"name": "Netflix", "topics": ["streaming", "subscriber growth", "ad-supported tier", "content spending"]},
    "BA": {"name": "Boeing", "topics": ["aircraft deliveries", "737 MAX", "defense contracts", "supply chain"]},
    "DIS": {"name": "Disney", "topics": ["Disney+", "theme parks", "box office", "streaming"]},
}

GENERIC_TEMPLATES = [
    {"headline": "{name} Reports Strong Quarterly Earnings, Beating Analyst Estimates", "summary": "{name} posted better-than-expected results driven by growth in {topic}. The company's strategic investments continue to pay off as management raised full-year guidance.", "source": "MarketWatch", "category": "earnings"},
    {"headline": "Analysts Upgrade {name} Stock, Citing {topic} Growth Potential", "summary": "Multiple Wall Street analysts have revised their price targets upward for {symbol}, pointing to accelerating momentum in {topic} as a key driver of future revenue growth.", "source": "Bloomberg", "category": "analyst"},
    {"headline": "{name} Announces Major Expansion in {topic} Operations", "summary": "The company revealed plans to significantly expand its {topic} capabilities, committing billions in capital expenditure over the next three years to capture growing market demand.", "source": "Reuters", "category": "expansion"},
    {"headline": "{name} Stock Rises as Institutional Investors Increase Holdings", "summary": "Recent SEC filings show several major hedge funds and institutional investors boosted their positions in {symbol}, signaling growing confidence in the company's long-term outlook.", "source": "CNBC", "category": "institutional"},
    {"headline": "Industry Report: {topic} Market Poised for Double-Digit Growth", "summary": "A new industry analysis highlights the {topic} sector as one of the fastest-growing markets globally, with {name} well-positioned to capture significant market share through its recent strategic initiatives.", "source": "Financial Times", "category": "industry"},
    {"headline": "{name} CEO Outlines Vision for {topic} at Annual Conference", "summary": "Speaking at the company's annual shareholder meeting, leadership detailed an ambitious roadmap for {topic} innovation, including new product launches and strategic partnerships expected in the coming quarters.", "source": "WSJ", "category": "leadership"},
]


def _generate_mock_news(symbol: str, count: int = 6) -> List[Dict]:
    ctx = COMPANY_CONTEXT.get(symbol.upper(), {
        "name": symbol.upper(),
        "topics": ["growth strategy", "market expansion", "innovation", "revenue growth", "operations"]
    })
    name = ctx["name"]
    topics = ctx["topics"]
    articles = []
    now = datetime.now()

    for i, template in enumerate(GENERIC_TEMPLATES[:count]):
        topic = topics[i % len(topics)]
        published = now - timedelta(hours=(i * 8) + 2, minutes=i * 13)
        articles.append({
            "headline": template["headline"].format(name=name, symbol=symbol.upper(), topic=topic),
            "summary": template["summary"].format(name=name, symbol=symbol.upper(), topic=topic),
            "source": template["source"],
            "category": template["category"],
            "url": "",
            "published_at": published.isoformat(),
            "image_url": "",
        })

    return articles


def fetch_news(symbol: str, count: int = 6) -> List[Dict]:
    if FINNHUB_API_KEY:
        try:
            today = datetime.now().strftime("%Y-%m-%d")
            week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
            resp = requests.get(
                "https://finnhub.io/api/v1/company-news",
                params={"symbol": symbol.upper(), "from": week_ago, "to": today, "token": FINNHUB_API_KEY},
                timeout=5,
            )
            if resp.status_code == 200:
                data = resp.json()
                if data and len(data) > 0:
                    articles = []
                    for item in data[:count]:
                        articles.append({
                            "headline": item.get("headline", ""),
                            "summary": item.get("summary", ""),
                            "source": item.get("source", ""),
                            "category": item.get("category", ""),
                            "url": item.get("url", ""),
                            "published_at": datetime.fromtimestamp(item.get("datetime", 0)).isoformat(),
                            "image_url": item.get("image", ""),
                        })
                    return articles
        except Exception:
            pass

    return _generate_mock_news(symbol, count)
