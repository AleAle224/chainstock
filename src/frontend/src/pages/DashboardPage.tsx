import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import type { NewsItem, QuoteResult } from "@/types";
import { useQueries, useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink,
  Loader2,
  Minus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ── TradingView Market Heatmap ──────────────────────────────────────────────
function MarketHeatmapWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Clear any previous injection
    container.innerHTML = `
      <div class="tradingview-widget-container__widget"></div>
      <div class="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener noreferrer" target="_blank">
          <span class="text-xs text-muted-foreground hover:text-primary transition-colors">Track all markets on TradingView</span>
        </a>
      </div>`;
    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-market-heatmap.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      exchanges: [],
      dataSource: "SPX500",
      grouping: "sector",
      blockSize: "market_cap_basic",
      blockColor: "change",
      locale: "en",
      symbolUrl: "",
      colorTheme: "dark",
      hasTopBar: false,
      isDataSetEnabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: "100%",
      height: 500,
    });
    container.appendChild(script);
    return () => {
      if (container) container.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full"
      data-ocid="dashboard.heatmap_widget"
    />
  );
}

// ── Quick Stats ─────────────────────────────────────────────────────────────
const QUICK_SYMBOLS = ["AAPL", "MSFT", "GOOGL"] as const;

function QuoteCard({
  symbol,
  quote,
  isLoading,
}: {
  symbol: string;
  quote: QuoteResult | null | undefined;
  isLoading: boolean;
}) {
  const isPositive = (quote?.change ?? 0) >= 0;
  const isNeutral = quote?.change === 0;

  return (
    <Link
      to="/stocks/$symbol"
      params={{ symbol }}
      data-ocid={`dashboard.quote_card.${symbol.toLowerCase()}`}
    >
      <Card className="bg-card border-border hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-display font-bold text-foreground text-base">
                {symbol}
              </p>
              {isLoading ? (
                <>
                  <Skeleton className="h-6 w-20 mt-1" />
                  <Skeleton className="h-4 w-16 mt-1" />
                </>
              ) : quote ? (
                <>
                  <p className="text-xl font-semibold font-mono text-foreground mt-0.5">
                    ${quote.price.toFixed(2)}
                  </p>
                  <p
                    className={`text-sm font-medium flex items-center gap-0.5 mt-0.5 ${
                      isNeutral
                        ? "text-muted-foreground"
                        : isPositive
                          ? "text-emerald-400"
                          : "text-red-400"
                    }`}
                  >
                    {isNeutral ? (
                      <Minus className="w-3 h-3" />
                    ) : isPositive ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {isPositive && "+"}
                    {quote.change.toFixed(2)} ({isPositive && "+"}
                    {quote.changePercent.toFixed(2)}%)
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  Unavailable
                </p>
              )}
            </div>
            <div
              className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                isNeutral
                  ? "bg-muted/50"
                  : isPositive
                    ? "bg-emerald-500/10"
                    : "bg-red-500/10"
              }`}
            >
              {isNeutral ? (
                <Minus className="w-4 h-4 text-muted-foreground" />
              ) : isPositive ? (
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function QuickStatsRow({
  backend,
}: { backend: ReturnType<typeof useBackend>["backend"] }) {
  const queries = useQueries({
    queries: QUICK_SYMBOLS.map((symbol) => ({
      queryKey: ["quote", symbol] as const,
      queryFn: () =>
        backend
          ? backend.getQuote(symbol)
          : Promise.resolve({ price: 0, change: 0, changePercent: 0 }),
      enabled: !!backend,
      staleTime: 60_000,
    })),
  });

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      data-ocid="dashboard.quick_stats"
    >
      {QUICK_SYMBOLS.map((symbol, i) => (
        <QuoteCard
          key={symbol}
          symbol={symbol}
          quote={queries[i].data}
          isLoading={queries[i].isLoading}
        />
      ))}
    </div>
  );
}

// ── News Card ───────────────────────────────────────────────────────────────
function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const categoryColor: Record<string, string> = {
    top: "bg-primary/15 text-primary",
    business: "bg-blue-500/15 text-blue-400",
    technology: "bg-violet-500/15 text-violet-400",
    forex: "bg-amber-500/15 text-amber-400",
    crypto: "bg-orange-500/15 text-orange-400",
  };
  const badgeClass =
    categoryColor[item.category.toLowerCase()] ??
    "bg-muted text-muted-foreground";

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors"
      data-ocid={`dashboard.news_item.${index + 1}`}
    >
      {item.image && (
        <div className="shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted">
          <img
            src={item.image}
            alt=""
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge
            className={`text-xs px-1.5 py-0 font-medium border-0 ${badgeClass}`}
          >
            {item.category}
          </Badge>
          <span className="text-xs text-muted-foreground truncate">
            {item.source}
          </span>
        </div>
        <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {item.headline}
        </p>
      </div>
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

function NewsSection({
  backend,
}: { backend: ReturnType<typeof useBackend>["backend"] }) {
  const today = new Date();
  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - 7);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const from = fmt(fromDate);
  const to = fmt(today);

  const appleNews = useQuery<NewsItem[]>({
    queryKey: ["news", "AAPL", from, to],
    queryFn: () =>
      backend ? backend.getCompanyNews("AAPL", from, to) : Promise.resolve([]),
    enabled: !!backend,
    staleTime: 300_000,
  });

  const msftNews = useQuery<NewsItem[]>({
    queryKey: ["news", "MSFT", from, to],
    queryFn: () =>
      backend ? backend.getCompanyNews("MSFT", from, to) : Promise.resolve([]),
    enabled: !!backend,
    staleTime: 300_000,
  });

  const isLoading = appleNews.isLoading || msftNews.isLoading;

  const merged = [...(appleNews.data ?? []), ...(msftNews.data ?? [])]
    .filter((n) => n.headline && n.url)
    .sort(() => Math.random() - 0.5) // distribute sources
    .slice(0, 10);

  return (
    <section data-ocid="dashboard.news_section">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            Top Market News
            {isLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {isLoading ? (
            <div className="flex flex-col gap-1 px-4 pb-2">
              {["a", "b", "c", "d", "e"].map((id) => (
                <div key={`news-loading-${id}`} className="flex gap-3 py-2">
                  <Skeleton className="w-16 h-16 rounded-md shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : merged.length === 0 ? (
            <div
              className="px-4 py-8 text-center text-muted-foreground text-sm"
              data-ocid="dashboard.news_section.empty_state"
            >
              No recent news available.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {merged.map((item, i) => (
                <NewsCard key={`${item.url}-${i}`} item={item} index={i} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

// ── Onboarding Banner ───────────────────────────────────────────────────────
function OnboardingBanner({
  backend,
}: { backend: ReturnType<typeof useBackend>["backend"] }) {
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("onboarding_banner_dismissed") === "true",
  );

  const { data: completed, isLoading } = useQuery<boolean>({
    queryKey: ["hasCompletedOnboarding"],
    queryFn: () =>
      backend ? backend.hasCompletedOnboarding() : Promise.resolve(true),
    enabled: !!backend,
    staleTime: 60_000,
  });

  const handleDismiss = () => {
    sessionStorage.setItem("onboarding_banner_dismissed", "true");
    setDismissed(true);
  };

  if (isLoading || dismissed || completed === true || completed === undefined)
    return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300"
      role="alert"
      data-ocid="dashboard.onboarding_banner"
    >
      <span className="flex-1 text-sm">
        <strong className="font-semibold">Complete your profile</strong> to get
        personalized insights and tailored recommendations.
      </span>
      <Link
        to="/profile"
        className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 transition-colors border border-amber-500/40"
        data-ocid="dashboard.onboarding_banner.complete_button"
      >
        Complete now
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 w-6 h-6 text-amber-300 hover:text-amber-100 hover:bg-amber-500/20"
        onClick={handleDismiss}
        aria-label="Dismiss onboarding banner"
        data-ocid="dashboard.onboarding_banner.dismiss_button"
      >
        <X className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

// ── Search Bar Hero ─────────────────────────────────────────────────────────
function SearchBarHero() {
  const triggerCmdK = () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
    );
  };

  return (
    <button
      type="button"
      onClick={triggerCmdK}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-all text-left shadow-sm group"
      data-ocid="dashboard.search_bar"
      aria-label="Open stock search"
    >
      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary"
          aria-hidden="true"
        >
          <title>Search</title>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <span className="flex-1 text-muted-foreground text-sm">
        Search stocks, ETFs, indices...
      </span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded-md border border-border bg-muted/50 text-xs font-mono text-muted-foreground">
        ⌘K
      </kbd>
    </button>
  );
}

// ── Dashboard Page ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { backend, isLoading: backendLoading } = useBackend();

  return (
    <div
      className="max-w-6xl mx-auto px-4 py-6 space-y-6"
      data-ocid="dashboard.page"
    >
      {/* Onboarding banner */}
      {!backendLoading && <OnboardingBanner backend={backend} />}

      {/* Hero search bar */}
      <section data-ocid="dashboard.search_section">
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Market Overview
          </h1>
          <p className="text-muted-foreground text-sm">
            Real-time market data, price alerts, and your watchlist — all
            onchain.
          </p>
        </div>
        <div className="mt-4">
          <SearchBarHero />
        </div>
      </section>

      {/* Quick stats */}
      <section data-ocid="dashboard.quick_stats_section">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Quick Quotes
        </h2>
        <QuickStatsRow backend={backend} />
      </section>

      {/* Market heatmap */}
      <section data-ocid="dashboard.heatmap_section">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          S&amp;P 500 Sector Heatmap
        </h2>
        <Card className="bg-card border-border overflow-hidden">
          <CardContent className="p-0">
            <MarketHeatmapWidget />
          </CardContent>
        </Card>
      </section>

      {/* Top news */}
      <NewsSection backend={backend} />
    </div>
  );
}
