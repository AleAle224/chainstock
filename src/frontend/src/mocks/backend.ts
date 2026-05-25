import type { backendInterface } from "../backend";
import { AlertCondition } from "../backend";

const now = BigInt(Date.now()) * BigInt(1_000_000);
const ninetyDays = BigInt(90 * 24 * 60 * 60 * 1_000_000_000);

export const mockBackend: backendInterface = {
  addToWatchlist: async () => undefined,
  createAlert: async (symbol, targetPrice, condition) => ({
    id: BigInt(3),
    active: true,
    expiresAt: now + ninetyDays,
    createdAt: now,
    seen: false,
    targetPrice,
    triggered: false,
    symbol,
    condition,
  }),
  deleteAlert: async () => undefined,
  finnhubTransform: async (args) => ({
    status: BigInt(200),
    body: args.response.body,
    headers: args.response.headers,
  }),
  getCompanyNews: async () => [
    {
      url: "https://example.com/news/1",
      source: "Reuters",
      headline: "Apple hits record high amid strong iPhone demand",
      summary:
        "Apple Inc shares climbed to an all-time high on Monday after analysts raised price targets citing robust iPhone 15 demand.",
      category: "technology",
      image: "https://placehold.co/600x300/1a1a2e/20c997?text=News",
    },
    {
      url: "https://example.com/news/2",
      source: "Bloomberg",
      headline: "Tech sector rally continues as AI spending accelerates",
      summary:
        "Technology stocks extended gains for a third consecutive session as enterprise AI investment continues to grow.",
      category: "technology",
      image: "https://placehold.co/600x300/1a1a2e/20c997?text=News",
    },
  ],
  getCompanyProfile: async () => ({
    marketCap: 2_890_000_000_000,
    logo: "https://placehold.co/64x64/1a1a2e/20c997?text=AAPL",
    name: "Apple Inc.",
    currency: "USD",
    exchange: "NASDAQ",
  }),
  getMyAlerts: async () => [
    {
      id: BigInt(1),
      active: true,
      expiresAt: now + ninetyDays,
      createdAt: now,
      seen: false,
      targetPrice: 200.0,
      triggered: false,
      symbol: "AAPL",
      condition: AlertCondition.Above,
    },
    {
      id: BigInt(2),
      active: false,
      expiresAt: now + ninetyDays,
      createdAt: now,
      seen: true,
      targetPrice: 150.0,
      triggered: true,
      symbol: "TSLA",
      condition: AlertCondition.Below,
    },
  ],
  getMyProfile: async () => ({
    country: "United States",
    riskTolerance: "Moderate",
    createdAt: now,
    preferredIndustry: "Technology",
    investmentGoals: "Long-term growth",
    hasCompletedOnboarding: true,
  }),
  getMyTriggeredAlerts: async () => [
    {
      id: BigInt(2),
      active: false,
      expiresAt: now + ninetyDays,
      createdAt: now,
      seen: false,
      targetPrice: 150.0,
      triggered: true,
      symbol: "TSLA",
      condition: AlertCondition.Below,
    },
  ],
  getMyWatchlist: async () => [
    {
      company: "Apple Inc.",
      addedAt: now,
      symbol: "AAPL",
    },
    {
      company: "Tesla, Inc.",
      addedAt: now,
      symbol: "TSLA",
    },
    {
      company: "Microsoft Corporation",
      addedAt: now,
      symbol: "MSFT",
    },
    {
      company: "NVIDIA Corporation",
      addedAt: now,
      symbol: "NVDA",
    },
  ],
  getQuote: async (symbol) => ({
    change: symbol === "AAPL" ? 2.34 : symbol === "TSLA" ? -5.12 : 1.87,
    price: symbol === "AAPL" ? 189.84 : symbol === "TSLA" ? 248.5 : 415.3,
    changePercent:
      symbol === "AAPL" ? 1.25 : symbol === "TSLA" ? -2.02 : 0.45,
  }),
  hasCompletedOnboarding: async () => true,
  isInWatchlist: async () => false,
  markAlertSeen: async () => undefined,
  removeFromWatchlist: async () => undefined,
  saveProfile: async () => undefined,
  searchStocks: async () => [
    {
      type: "Common Stock",
      description: "Apple Inc.",
      displaySymbol: "AAPL",
      symbol: "AAPL",
    },
    {
      type: "Common Stock",
      description: "Tesla, Inc.",
      displaySymbol: "TSLA",
      symbol: "TSLA",
    },
    {
      type: "Common Stock",
      description: "Microsoft Corporation",
      displaySymbol: "MSFT",
      symbol: "MSFT",
    },
  ],
  setFinnhubKey: async () => undefined,
  toggleAlert: async () => undefined,
};
