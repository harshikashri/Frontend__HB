import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import { getHallFreeSlots } from "../services/hallService";
import type { HallFreeSlots } from "../services/hallTypes";

type UseHallAvailabilityOptions = {
  hallId?: string;
  startDateTime: string;
  endDateTime: string;
};

export function useHallAvailability({
  hallId,
  startDateTime,
  endDateTime,
}: UseHallAvailabilityOptions) {
  const { token } = useAuth();
  const [availability, setAvailability] = useState<HallFreeSlots | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAvailability = useCallback(async () => {
    if (!token || !hallId) {
      setAvailability(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextAvailability = await getHallFreeSlots(token, hallId, startDateTime, endDateTime);
      setAvailability(nextAvailability);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load hall availability.");
    } finally {
      setIsLoading(false);
    }
  }, [endDateTime, hallId, startDateTime, token]);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  return {
    availability,
    isLoading,
    error,
    reload: loadAvailability,
  };
}
