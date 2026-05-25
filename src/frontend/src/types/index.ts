import type { AlertCondition } from "@/backend";

export type { AlertCondition } from "@/backend";

export interface WatchlistEntry {
  symbol: string;
  company: string;
  addedAt: bigint;
}

export interface Alert {
  id: bigint;
  symbol: string;
  targetPrice: number;
  condition: AlertCondition;
  active: boolean;
  triggered: boolean;
  seen: boolean;
  createdAt: bigint;
  expiresAt: bigint;
}

export interface UserProfile {
  country: string;
  investmentGoals: string;
  riskTolerance: string;
  preferredIndustry: string;
  createdAt: bigint;
  hasCompletedOnboarding: boolean;
}

export interface QuoteResult {
  price: number;
  change: number;
  changePercent: number;
}

export interface CompanyProfileResult {
  name: string;
  logo: string;
  currency: string;
  marketCap: number;
  exchange: string;
}

export interface SearchResult {
  symbol: string;
  description: string;
  displaySymbol: string;
  type_: string;
}

export interface NewsItem {
  category: string;
  headline: string;
  image: string;
  source: string;
  summary: string;
  url: string;
}
