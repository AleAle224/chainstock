import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { useBackend } from "@/hooks/useBackend";
import DashboardPage from "@/pages/DashboardPage";
import OnboardingPage from "@/pages/OnboardingPage";
import ProfilePage from "@/pages/ProfilePage";
import SignInPage from "@/pages/SignInPage";
import StockDetailPage from "@/pages/StockDetailPage";
import WatchlistPage from "@/pages/WatchlistPage";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useRef } from "react";

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    // Redirect root to dashboard; sign-in page handles unauthenticated state
    throw redirect({ to: "/dashboard" });
  },
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signin",
  component: SignInPage,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/onboarding",
  component: function OnboardingRoute() {
    return (
      <Layout>
        <OnboardingPage />
      </Layout>
    );
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: function DashboardRoute() {
    return (
      <Layout>
        <DashboardPage />
      </Layout>
    );
  },
});

const watchlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/watchlist",
  component: function WatchlistRoute() {
    return (
      <Layout>
        <WatchlistPage />
      </Layout>
    );
  },
});

const stockDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stocks/$symbol",
  component: function StockDetailRoute() {
    return (
      <Layout>
        <StockDetailPage />
      </Layout>
    );
  },
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: function ProfileRoute() {
    return (
      <Layout>
        <ProfilePage />
      </Layout>
    );
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  signInRoute,
  onboardingRoute,
  dashboardRoute,
  watchlistRoute,
  stockDetailRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();
  const { backend } = useBackend();
  const navigate = useNavigate();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !backend || checkedRef.current) return;
    checkedRef.current = true;
    const currentPath = window.location.pathname;
    if (currentPath === "/onboarding" || currentPath === "/profile") return;
    backend
      .hasCompletedOnboarding()
      .then((completed) => {
        if (!completed) {
          navigate({ to: "/onboarding" });
        }
      })
      .catch(() => {
        /* silently ignore if backend unavailable */
      });
  }, [isAuthenticated, backend, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading ChainStock...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignInPage />;
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return <AuthGate />;
}
