import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import type { Identity } from "@dfinity/agent";
import type { Principal } from "@dfinity/principal";
import { useMemo } from "react";

export interface UseAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  identity: Identity | null;
  principal: Principal | null;
}

export function useAuth(): UseAuthReturn {
  const { identity, clear, login, isInitializing, isAuthenticated } =
    useInternetIdentity();

  const principal = useMemo(() => {
    if (!identity) return null;
    try {
      const p = identity.getPrincipal();
      if (p.isAnonymous()) return null;
      return p as unknown as Principal;
    } catch {
      return null;
    }
  }, [identity]);

  return {
    isAuthenticated,
    isLoading: isInitializing,
    login,
    logout: clear,
    identity: identity ?? null,
    principal,
  };
}
