import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SearchResult {
    type: string;
    description: string;
    displaySymbol: string;
    symbol: string;
}
export interface CompanyProfileResult {
    marketCap: number;
    logo: string;
    name: string;
    currency: string;
    exchange: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface QuoteResult {
    change: number;
    price: number;
    changePercent: number;
}
export interface Alert {
    id: bigint;
    active: boolean;
    expiresAt: Time;
    createdAt: Time;
    seen: boolean;
    targetPrice: number;
    triggered: boolean;
    symbol: string;
    condition: AlertCondition;
}
export interface WatchlistEntry {
    company: string;
    addedAt: Time;
    symbol: string;
}
export interface NewsItem {
    url: string;
    source: string;
    headline: string;
    summary: string;
    category: string;
    image: string;
}
export interface UserProfile {
    country: string;
    riskTolerance: string;
    createdAt: Time;
    preferredIndustry: string;
    investmentGoals: string;
    hasCompletedOnboarding: boolean;
}
export interface http_header {
    value: string;
    name: string;
}
export enum AlertCondition {
    Below = "Below",
    Above = "Above"
}
export interface backendInterface {
    addToWatchlist(symbol: string, company: string): Promise<void>;
    createAlert(symbol: string, targetPrice: number, condition: AlertCondition): Promise<Alert>;
    deleteAlert(alertId: bigint): Promise<void>;
    finnhubTransform(args: TransformationInput): Promise<TransformationOutput>;
    getCompanyNews(symbol: string, fromDate: string, toDate: string): Promise<Array<NewsItem>>;
    getCompanyProfile(symbol: string): Promise<CompanyProfileResult>;
    getMyAlerts(): Promise<Array<Alert>>;
    getMyProfile(): Promise<UserProfile | null>;
    getMyTriggeredAlerts(): Promise<Array<Alert>>;
    getMyWatchlist(): Promise<Array<WatchlistEntry>>;
    getQuote(symbol: string): Promise<QuoteResult>;
    hasCompletedOnboarding(): Promise<boolean>;
    isInWatchlist(symbol: string): Promise<boolean>;
    markAlertSeen(alertId: bigint): Promise<void>;
    removeFromWatchlist(symbol: string): Promise<void>;
    saveProfile(profile: UserProfile): Promise<void>;
    searchStocks(searchQuery: string): Promise<Array<SearchResult>>;
    setFinnhubKey(key: string): Promise<void>;
    toggleAlert(alertId: bigint, active: boolean): Promise<void>;
}
