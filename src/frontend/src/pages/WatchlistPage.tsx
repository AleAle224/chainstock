import type {
  CompanyProfileResult,
  QuoteResult,
  WatchlistEntry,
} from "@/backend";
import { AlertsPanel } from "@/components/AlertsPanel";
import { CreateAlertModal } from "@/components/CreateAlertModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBackend } from "@/hooks/useBackend";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  PlusCircle,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

function formatMarketCap(val: number): string {
  if (val >= 1e12) return `${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `${(val / 1e6).toFixed(2)}M`;
  return `${val.toFixed(0)}`;
}

interface RowData {
  entry: WatchlistEntry;
  quote: QuoteResult | undefined;
  profile: CompanyProfileResult | undefined;
  isLoadingQuote: boolean;
  isLoadingProfile: boolean;
}

function WatchlistRow({
  data,
  onRemove,
}: { data: RowData; onRemove: (symbol: string) => void }) {
  const navigate = useNavigate();
  const { entry, quote, profile, isLoadingQuote, isLoadingProfile } = data;
  const isPos = (quote?.changePercent ?? 0) >= 0;

  return (
    <tr
      data-ocid={`watchlist.item.${entry.symbol}`}
      className="border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
      onClick={() =>
        navigate({ to: "/stocks/$symbol", params: { symbol: entry.symbol } })
      }
      onKeyUp={(e) => {
        if (e.key === "Enter" || e.key === " ")
          navigate({ to: "/stocks/$symbol", params: { symbol: entry.symbol } });
      }}
    >
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-display font-semibold text-foreground text-sm">
            {entry.symbol}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
        {isLoadingProfile ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          (profile?.name ?? entry.company)
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {isLoadingQuote ? (
          <Skeleton className="h-4 w-16 ml-auto" />
        ) : (
          <span
            className={`font-mono text-sm font-medium ${isPos ? "text-emerald-400" : "text-red-400"}`}
          >
            ${quote?.price.toFixed(2) ?? "—"}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {isLoadingQuote ? (
          <Skeleton className="h-4 w-16 ml-auto" />
        ) : (
          <span
            className={`flex items-center justify-end gap-1 text-sm font-medium ${
              isPos ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {quote
              ? `${isPos ? "+" : ""}${quote.changePercent.toFixed(2)}%`
              : "—"}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {isLoadingProfile ? (
          <Skeleton className="h-4 w-20 ml-auto" />
        ) : (
          <span className="text-sm text-muted-foreground font-mono">
            {profile ? formatMarketCap(profile.marketCap) : "—"}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          type="button"
          data-ocid={`watchlist.delete_button.${entry.symbol}`}
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Remove ${entry.symbol} from watchlist?`)) {
              onRemove(entry.symbol);
            }
          }}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label={`Remove ${entry.symbol}`}
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

export default function WatchlistPage() {
  const { backend } = useBackend();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [alertModalOpen, setAlertModalOpen] = useState(false);

  const { data: watchlist = [], isLoading: loadingWatchlist } = useQuery<
    WatchlistEntry[]
  >({
    queryKey: ["watchlist"],
    queryFn: async () => (backend ? backend.getMyWatchlist() : []),
    enabled: !!backend,
    refetchInterval: 60_000,
  });

  const symbols = watchlist.map((e) => e.symbol);

  const quoteQueries = useQueries({
    queries: symbols.map((sym) => ({
      queryKey: ["quote", sym],
      queryFn: async (): Promise<QuoteResult> => {
        if (!backend) throw new Error("no backend");
        return backend.getQuote(sym);
      },
      enabled: !!backend,
      refetchInterval: 30_000,
    })),
  });

  const profileQueries = useQueries({
    queries: symbols.map((sym) => ({
      queryKey: ["profile", sym],
      queryFn: async (): Promise<CompanyProfileResult> => {
        if (!backend) throw new Error("no backend");
        return backend.getCompanyProfile(sym);
      },
      enabled: !!backend,
      staleTime: 24 * 60 * 60 * 1000,
    })),
  });

  const removeMutation = useMutation({
    mutationFn: async (symbol: string) => {
      if (!backend) return;
      await backend.removeFromWatchlist(symbol);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["watchlist"] }),
  });

  const filteredIndices = symbols
    .map((sym, i) => ({ sym, i }))
    .filter(
      ({ sym }) =>
        sym.toLowerCase().includes(search.toLowerCase()) ||
        (watchlist[symbols.indexOf(sym)]?.company ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()),
    );

  const rowData: RowData[] = filteredIndices.map(({ sym: _sym, i }) => ({
    entry: watchlist[i],
    quote: quoteQueries[i]?.data,
    profile: profileQueries[i]?.data,
    isLoadingQuote: quoteQueries[i]?.isLoading ?? false,
    isLoadingProfile: profileQueries[i]?.isLoading ?? false,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            My Watchlist
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {watchlist.length} {watchlist.length === 1 ? "stock" : "stocks"}{" "}
            tracked
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              data-ocid="watchlist.search_input"
              type="search"
              placeholder="Filter stocks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 h-9 w-48 rounded-md border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button
            type="button"
            data-ocid="watchlist.open_modal_button"
            onClick={() => setAlertModalOpen(true)}
            disabled={watchlist.length === 0}
            className="flex items-center gap-2"
          >
            <PlusCircle size={16} />
            Create Alert
          </Button>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loadingWatchlist ? (
          <div className="p-4 flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-40 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : watchlist.length === 0 ? (
          <div
            data-ocid="watchlist.empty_state"
            className="flex flex-col items-center gap-4 py-16 text-muted-foreground"
          >
            <BookOpen size={48} strokeWidth={1.2} className="text-primary/50" />
            <div className="text-center">
              <p className="font-display text-foreground font-medium">
                Your watchlist is empty
              </p>
              <p className="text-sm mt-1">
                Search for stocks to add them to your watchlist.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              data-ocid="watchlist.search_button"
              onClick={() => navigate({ to: "/dashboard" })}
              className="flex items-center gap-2"
            >
              <Search size={15} />
              Search Stocks
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-ocid="watchlist.table">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Change %
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Market Cap
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rowData.map((rd) => (
                  <WatchlistRow
                    key={rd.entry.symbol}
                    data={rd}
                    onRemove={(sym) => removeMutation.mutate(sym)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alerts Panel */}
      <AlertsPanel />

      {/* Create Alert Modal */}
      <CreateAlertModal
        open={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        symbols={symbols}
      />
    </div>
  );
}
