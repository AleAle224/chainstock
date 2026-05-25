import { CommandPalette } from "@/components/CommandPalette";
import { useAuth } from "@/hooks/useAuth";
import { useTriggeredAlertToasts } from "@/hooks/useTriggeredAlertToasts";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  List,
  LogOut,
  Menu,
  Search,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/watchlist", label: "Watchlist", icon: List },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useTriggeredAlertToasts();

  // Global Cmd+K / Ctrl+K to open command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <div
      className="min-h-screen bg-background flex flex-col"
      data-ocid="layout"
    >
      {/* Header */}
      <header
        className="bg-card border-b border-border h-14 flex items-center px-4 gap-3 shrink-0 shadow-card sticky top-0 z-40"
        data-ocid="layout.header"
      >
        <Link
          to="/dashboard"
          className="flex items-center gap-2 mr-4"
          data-ocid="layout.logo_link"
        >
          <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-primary text-lg tracking-tight hidden sm:block">
            ChainStock
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-1 flex-1"
          data-ocid="layout.nav"
        >
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active =
              currentPath === to || currentPath.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
                data-ocid={`layout.nav.${label.toLowerCase()}_link`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Search trigger */}
        <button
          type="button"
          onClick={() => setCmdOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm ml-auto md:ml-0"
          data-ocid="layout.search_button"
          aria-label="Search stocks"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">Search stocks...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border text-xs font-mono">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-2 ml-2">
          <Link
            to="/profile"
            className="w-8 h-8 rounded-full bg-muted/60 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Profile"
            data-ocid="layout.profile_link"
          >
            <User className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label="Logout"
            data-ocid="layout.logout_button"
          >
            <LogOut className="w-4 h-4" />
          </button>
          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            data-ocid="layout.mobile_menu_button"
          >
            {mobileOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          className="md:hidden bg-card border-b border-border px-4 py-2 flex flex-col gap-1"
          data-ocid="layout.mobile_nav"
        >
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = currentPath === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
                onClick={() => setMobileOpen(false)}
                data-ocid={`layout.mobile_nav.${label.toLowerCase()}_link`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Main content */}
      <main className="flex-1 bg-background" data-ocid="layout.main">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="bg-card border-t border-border py-3 px-6 text-xs text-muted-foreground flex items-center justify-between"
        data-ocid="layout.footer"
      >
        <span>
          &copy; {new Date().getFullYear()} ChainStock. Open-source market
          tracking, running fully onchain.
        </span>
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          Built with caffeine.ai
        </a>
      </footer>

      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-card border-border text-foreground",
          duration: 6000,
        }}
      />
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
