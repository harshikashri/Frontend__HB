import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import { BOOKING_NOTIFICATION_EVENT } from "../../notifications/hooks/useBookingNotifications";
import type { Hall, HallCreatePayload, HallUpdatePayload } from "../services/hallTypes";
import {
  addFacilityToHall,
  createHall,
  getAllHalls,
  getAvailableHalls,
  updateHall,
  updateHallFacilityStatus,
} from "../services/hallService";

export function useHalls() {
  const { token, user } = useAuth();
  const [halls, setHalls] = useState<Hall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = user?.role === "admin";

  const loadHalls = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextHalls = isAdmin ? await getAllHalls(token) : await getAvailableHalls(token);
      setHalls(nextHalls);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load halls.");
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, token]);

  useEffect(() => {
    void loadHalls();
  }, [loadHalls]);

  useEffect(() => {
    const refreshHalls = () => {
      void loadHalls();
    };

    window.addEventListener(BOOKING_NOTIFICATION_EVENT, refreshHalls);

    return () => {
      window.removeEventListener(BOOKING_NOTIFICATION_EVENT, refreshHalls);
    };
  }, [loadHalls]);

  const saveHall = useCallback(
    async (payload: HallCreatePayload) => {
      if (!token) {
        throw new Error("Missing authentication token.");
      }

      const createdHall = await createHall(token, payload);
      await loadHalls();
      return createdHall;
    },
    [loadHalls, token],
  );

  const editHall = useCallback(
    async (payload: HallUpdatePayload) => {
      if (!token) {
        throw new Error("Missing authentication token.");
      }

      const updatedHall = await updateHall(token, payload);
      await loadHalls();
      return updatedHall;
    },
    [loadHalls, token],
  );

  const assignFacility = useCallback(
    async (hallName: string, facilityName: string) => {
      if (!token) {
        throw new Error("Missing authentication token.");
      }

      await addFacilityToHall(token, hallName, facilityName);
      await loadHalls();
    },
    [loadHalls, token],
  );

  const setHallFacilityStatus = useCallback(
    async (hallName: string, facilityName: string, isActive: boolean) => {
      if (!token) {
        throw new Error("Missing authentication token.");
      }

      await updateHallFacilityStatus(token, hallName, facilityName, isActive);
      await loadHalls();
    },
    [loadHalls, token],
  );

  const stats = useMemo(
    () => ({
      total: halls.length,
      active: halls.filter((hall) => hall.is_active).length,
      disabled: halls.filter((hall) => !hall.is_active).length,
      capacity: halls.reduce((sum, hall) => sum + hall.capacity, 0),
    }),
    [halls],
  );

  return {
    halls,
    stats,
    isAdmin,
    isLoading,
    error,
    reload: loadHalls,
    createHall: saveHall,
    updateHall: editHall,
    assignFacility,
    setHallFacilityStatus,
  };
}
