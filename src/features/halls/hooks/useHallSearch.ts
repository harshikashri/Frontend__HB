import { useCallback, useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import { searchAvailableHalls } from "../services/hallService";
import type { HallSearchFilters, HallSearchResult } from "../services/hallTypes";

export function useHallSearch() {
  const { token } = useAuth();
  const [result, setResult] = useState<HallSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (filters: HallSearchFilters) => {
      if (!token) {
        throw new Error("Missing authentication token.");
      }

      setIsSearching(true);
      setError(null);

      try {
        const nextResult = await searchAvailableHalls(token, filters);
        setResult(nextResult);
        return nextResult;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to search halls.";
        setError(message);
        throw new Error(message);
      } finally {
        setIsSearching(false);
      }
    },
    [token],
  );

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isSearching,
    error,
    search,
    clear,
  };
}
