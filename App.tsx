import { useBackend } from "@/hooks/useBackend";
import type { SearchResult } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { Search, TrendingUp, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { backend } = useBackend();
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!debouncedQuery.trim() || !backend) {
      setResults([]);
      return;
    }
    setLoading(true);
    backend
      .searchStocks(debouncedQuery.trim())
      .then((res) => {
        setResults(
          res.slice(0, 15).map((r) => ({
            symbol: r.symbol,
            description: r.description,
            displaySymbol: r.displaySymbol,
            type_: r.type,
          })),
        );
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery, backend]);

  const handleSelect = useCallback(
    (symbol: string) => {
      onClose();
      navigate({ to: "/stocks/$symbol", params: { symbol } });
    },
    [navigate, onClose],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
      role="presentation"
      data-ocid="command_palette"
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <dialog
        className="relative w-full max-w-2xl mx-4 bg-popover border border-border rounded-xl shadow-elevated overflow-hidden open:flex open:flex-col"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        aria-label="Stock search"
        open
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search stocks, e.g. AAPL, Tesla..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
            data-ocid="command_palette.search_input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded border border-border text-muted-foreground text-xs font-mono">
            ESC
          </kbd>
        </div>

        <div
          className="max-h-80 overflow-y-auto"
          data-ocid="command_palette.list"
        >
          {loading && (
            <div
              className="px-4 py-8 text-center text-muted-foreground text-sm"
              data-ocid="command_palette.loading_state"
            >
              Searching...
            </div>
          )}
          {!loading && results.length === 0 && query.trim() && (
            <div
              className="px-4 py-8 text-center text-muted-foreground text-sm"
              data-ocid="command_palette.empty_state"
            >
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
          {!loading && results.length === 0 && !query.trim() && (
            <div className="px-4 py-6 text-center text-muted-foreground text-sm">
              Type a ticker or company name to search
            </div>
          )}
          {results.map((result, i) => (
            <button
              key={result.symbol}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left group"
              onClick={() => handleSelect(result.symbol)}
              data-ocid={`command_palette.item.${i + 1}`}
            >
              <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {result.displaySymbol}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {result.type_}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {result.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </dialog>
    </div>
  );
}
