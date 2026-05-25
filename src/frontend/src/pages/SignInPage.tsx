import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "@tanstack/react-router";
import { BarChart2, Shield, TrendingUp, Zap } from "lucide-react";
import { useEffect } from "react";

const features = [
  {
    icon: BarChart2,
    label: "Live Prices",
    desc: "Real-time quotes via Finnhub",
  },
  { icon: Zap, label: "Price Alerts", desc: "Get notified when targets hit" },
  {
    icon: Shield,
    label: "Fully Onchain",
    desc: "All data on Internet Computer",
  },
];

export default function SignInPage() {
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard" });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center px-4"
      data-ocid="signin.page"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4 shadow-elevated">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            ChainStock
          </h1>
          <p className="text-muted-foreground text-sm mt-1 text-center">
            Open-source market tracking, running fully onchain.
          </p>
        </div>

        {/* Sign in card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-elevated">
          <h2 className="text-foreground font-semibold text-lg mb-1">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Sign in with Internet Identity to access your watchlist and alerts.
          </p>

          <button
            type="button"
            onClick={login}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-smooth disabled:opacity-60 disabled:cursor-not-allowed"
            data-ocid="signin.login_button"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Connect with Internet Identity
              </span>
            )}
          </button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            No account needed. Internet Identity is decentralized and private.
          </p>
        </div>

        {/* Feature chips */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-card/60 border border-border rounded-lg p-3 flex flex-col items-center gap-1.5 text-center"
            >
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">
                {label}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight">
                {desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
