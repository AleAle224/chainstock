import { createActor } from "@/backend";
import type { Backend } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";

export interface UseBackendReturn {
  backend: Backend | null;
  isLoading: boolean;
}

export function useBackend(): UseBackendReturn {
  const { actor, isFetching } = useActor(createActor);

  return {
    backend: actor ?? null,
    isLoading: isFetching,
  };
}
