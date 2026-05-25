import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import type { CompanyProfileResult, NewsItem, QuoteResult } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  BookmarkPlus,
  Check,
  ExternalLink,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Exchange prefix map for TradingView
const EXCHANGE_MAP: Record<string, string> = {
  NASDAQ: "NASDAQ",
  NYSE: "NYSE",
  AMEX: "AMEX",
  OTC: "OTC",
  TSX: "TSX",
  LSE: "LSE",
};

function getTvSymbol(symbol: string, exchange?: string): string {
  if (exchange && EXCHANGE_MAP[exchange.toUpperCase()]) {
    return `${EXCHANGE_MAP[exchange.toUpperCase()]}:${symbol}`;
  }
  return `NASDAQ:${symbol}`;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// ─── TradingView Widget Components ──────────────────────────────────────────

function TradingViewChart({ tvSymbol }: { tvSymbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!widgetRef.current) return;
    widgetRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      const win = window as unknown as Record<string, unknown>;
      if (widgetRef.current && win.TradingView) {
        const TV = win.TradingView as {
          widget: new (config: Record<string, unknown>) => undefined;
        };
        new TV.widget({
          width: "100%",
          height: 500,
          symbol: tvSymbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0d1117",
          enable_publishing: false,
          hide_top_toolbar: false,
          save_image: false,
          container_id: "tradingview_chart",
        });
      }
    };
    widgetRef.current.appendChild(script);

    return () => {
      if (widgetRef.current) widgetRef.current.innerHTML = "";
    };
  }, [tvSymbol]);

  return (
    <div ref={containerRef} className="tradingview-widget-container w-full">
      <div id="tradingview_chart" ref={widgetRef} className="w-full" />
    </div>
  );
}

function TradingViewSymbolInfo({ tvSymbol }: { tvSymbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container";
    const inner = document.createElement("div");
    inner.className = "tradingview-widget-container__widget";
    wrapper.appendChild(inner);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js";
    script.async = true;
    script.textContent = JSON.stringify({
      symbol: tvSymbol,
      width: "100%",
      locale: "en",
      colorTheme: "dark",
      isTransparent: false,
    });
    wrapper.appendChild(script);
    containerRef.current.appendChild(wrapper);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [tvSymbol]);

  return <div ref={containerRef} className="w-full" />;
}

function TradingViewFinancials({ tvSymbol }: { tvSymbol: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container";
    const inner = document.createElement("div");
    inner.className = "tradingview-widget-container__widget";
    wrapper.appendChild(inner);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-financials.js";
    script.async = true;
    script.textContent = JSON.stringify({
      symbol: tvSymbol,
      colorTheme: "dark",
      isTransparent: false,
      largeChartUrl: "",
      displayMode: "adaptive",
      width: "100%",
      height: 830,
      locale: "en",
    });
    wrapper.appendChild(script);
    containerRef.current.appendChild(wrapper);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, [tvSymbol]);

  return <div ref={containerRef} className="w-full" />;
}

// ─── News Card ───────────────────────────────────────────────────────────────

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const snippet =
    item.summary.length > 150 ? `${item.summary.slice(0, 150)}…` : item.summary;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      data-ocid={`news.item.${index + 1}`}
      className="block group"
    >
      <Card className="bg-card border-border hover:border-primary/50 transition-colors duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge
                  variant="secondary"
                  className="text-xs shrink-0 capitalize"
                >
                  {item.category || "News"}
                </Badge>
                <span className="text-xs text-muted-foreground truncate">
                  {item.source}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {item.headline}
              </p>
              {snippet && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {snippet}
                </p>
              )}
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function StockDetailPage() {
  const { symbol } = useParams({ from: "/stocks/$symbol" });
  const upperSymbol = symbol.toUpperCase();
  const router = useRouter();
  const { backend } = useBackend();
  const queryClient = useQueryClient();

  const today = formatDate(new Date());
  const thirtyDaysAgo = formatDate(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  );

  const { data: profile, isLoading: profileLoading } =
    useQuery<CompanyProfileResult>({
      queryKey: ["companyProfile", upperSymbol],
      queryFn: async () => {
        if (!backend)
          return {
            name: "",
            logo: "",
            currency: "",
            marketCap: 0,
            exchange: "",
          };
        return backend.getCompanyProfile(upperSymbol);
      },
      enabled: !!backend,
      staleTime: 24 * 60 * 60 * 1000,
    });

  const { data: quote, isLoading: quoteLoading } = useQuery<QuoteResult>({
    queryKey: ["quote", upperSymbol],
    queryFn: async () => {
      if (!backend) return { price: 0, change: 0, changePercent: 0 };
      return backend.getQuote(upperSymbol);
    },
    enabled: !!backend,
    refetchInterval: 60_000,
  });

  const { data: inWatchlist } = useQuery<boolean>({
    queryKey: ["isInWatchlist", upperSymbol],
    queryFn: async () => {
      if (!backend) return false;
      return backend.isInWatchlist(upperSymbol);
    },
    enabled: !!backend,
  });

  const { data: news, isLoading: newsLoading } = useQuery<NewsItem[]>({
    queryKey: ["companyNews", upperSymbol],
    queryFn: async () => {
      if (!backend) return [];
      return backend.getCompanyNews(upperSymbol, thirtyDaysAgo, today);
    },
    enabled: !!backend,
    staleTime: 5 * 60 * 1000,
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: async () => {
      if (!backend) throw new Error("Not connected");
      const companyName = profile?.name || upperSymbol;
      await backend.addToWatchlist(upperSymbol, companyName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["isInWatchlist", upperSymbol],
      });
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success(`${upperSymbol} added to watchlist`);
    },
    onError: () => {
      toast.error("Failed to add to watchlist");
    },
  });

  const tvSymbol = getTvSymbol(upperSymbol, profile?.exchange);

  const isPositive = (quote?.change ?? 0) >= 0;
  const PriceIcon = isPositive ? TrendingUp : TrendingDown;
  const priceColor = isPositive ? "text-emerald-400" : "text-red-400";

  return (
    <div
      className="max-w-6xl mx-auto px-4 py-6 space-y-6"
      data-ocid="stock_detail.page"
    >
      {/* Back button */}
      <button
        type="button"
        onClick={() => router.history.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        data-ocid="stock_detail.back_button"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Page Header */}
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          {profileLoading || quoteLoading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="h-10 w-40" />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {profile?.logo && (
                  <img
                    src={profile.logo}
                    alt={`${upperSymbol} logo`}
                    className="w-12 h-12 rounded-lg object-contain bg-muted p-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-display font-bold text-foreground">
                      {upperSymbol}
                    </h1>
                    {profile?.exchange && (
                      <Badge variant="outline" className="text-xs">
                        {profile.exchange}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {profile?.name || "—"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-3">
                {quote && (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-display font-bold text-foreground">
                      ${quote.price.toFixed(2)}
                    </span>
                    <div className={`flex items-center gap-1 ${priceColor}`}>
                      <PriceIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {isPositive ? "+" : ""}
                        {quote.change.toFixed(2)} ({isPositive ? "+" : ""}
                        {quote.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant={inWatchlist ? "secondary" : "default"}
                    size="sm"
                    disabled={inWatchlist || addToWatchlistMutation.isPending}
                    onClick={() => addToWatchlistMutation.mutate()}
                    data-ocid="stock_detail.watchlist_button"
                    className={
                      inWatchlist ? "text-primary border-primary/30" : ""
                    }
                  >
                    {inWatchlist ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5" />
                        In Watchlist
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-4 h-4 mr-1.5" />
                        Add to Watchlist
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.navigate({ to: "/watchlist" })}
                    data-ocid="stock_detail.create_alert_button"
                  >
                    <Bell className="w-4 h-4 mr-1.5" />
                    Create Alert
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TradingView Advanced Chart */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Price Chart
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          <TradingViewChart tvSymbol={tvSymbol} />
        </CardContent>
      </Card>

      {/* TradingView Symbol Info */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Company Overview
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          <TradingViewSymbolInfo tvSymbol={tvSymbol} />
        </CardContent>
      </Card>

      {/* TradingView Financials */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Financials
          </h2>
        </CardHeader>
        <CardContent className="p-0">
          <TradingViewFinancials tvSymbol={tvSymbol} />
        </CardContent>
      </Card>

      {/* Recent News */}
      <section data-ocid="stock_detail.news.section">
        <h2 className="text-lg font-display font-semibold text-foreground mb-3">
          Recent News
        </h2>

        {newsLoading ? (
          <div
            className="space-y-3"
            data-ocid="stock_detail.news.loading_state"
          >
            {["a", "b", "c", "d"].map((id) => (
              <Card
                key={`news-skeleton-${id}`}
                className="bg-card border-border"
              >
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !news || news.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent
              className="p-8 flex flex-col items-center justify-center text-center gap-3"
              data-ocid="stock_detail.news.empty_state"
            >
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
              <div>
                <p className="text-foreground font-medium">No recent news</p>
                <p className="text-muted-foreground text-sm mt-0.5">
                  No news found for {upperSymbol} in the last 30 days.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {news.slice(0, 10).map((item, i) => (
              <NewsCard key={`${item.url}-${i}`} item={item} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
