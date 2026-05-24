import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import { BOOKING_NOTIFICATION_EVENT } from "../../notifications/hooks/useBookingNotifications";
import {
  cancelBooking,
  createBooking,
  getAllBookings,
  getBookingsByHallName,
  getBookingsByUserId,
  getMyBookings,
  updateBookingTiming,
} from "../services/bookingService";
import type { Booking, BookingCreatePayload, BookingTimingPayload } from "../services/bookingTypes";

type UseBookingsOptions = {
  userId?: string;
  hallName?: string;
  enabled?: boolean;
};

export function useBookings(options: UseBookingsOptions = {}) {
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = user?.role === "admin";

  const loadBookings = useCallback(async () => {
    if (options.enabled === false) {
      setIsLoading(false);
      return;
    }

    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let nextBookings: Booking[];

      if (isAdmin && options.hallName) {
        nextBookings = await getBookingsByHallName(token, options.hallName);
      } else if (isAdmin && options.userId) {
        nextBookings = await getBookingsByUserId(token, options.userId);
      } else {
        nextBookings = isAdmin ? await getAllBookings(token) : await getMyBookings(token);
      }

      setBookings(nextBookings);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to load bookings.");
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, options.enabled, options.hallName, options.userId, token]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    const refreshBookings = () => {
      void loadBookings();
    };

    window.addEventListener(BOOKING_NOTIFICATION_EVENT, refreshBookings);

    return () => {
      window.removeEventListener(BOOKING_NOTIFICATION_EVENT, refreshBookings);
    };
  }, [loadBookings]);

  const bookHall = useCallback(
    async (payload: BookingCreatePayload) => {
      if (!token) {
        throw new Error("Missing authentication token.");
      }

      const booking = await createBooking(token, payload);
      await loadBookings();
      return booking;
    },
    [loadBookings, token],
  );

  const updateTiming = useCallback(
    async (bookingId: string, payload: BookingTimingPayload) => {
      if (!token) {
        throw new Error("Missing authentication token.");
      }

      const booking = await updateBookingTiming(token, bookingId, payload);
      await loadBookings();
      return booking;
    },
    [loadBookings, token],
  );

  const cancel = useCallback(
    async (bookingId: string) => {
      if (!token) {
        throw new Error("Missing authentication token.");
      }

      await cancelBooking(token, bookingId);
      await loadBookings();
    },
    [loadBookings, token],
  );

  const stats = useMemo(
    () => ({
      total: bookings.length,
      booked: bookings.filter((booking) => booking.status !== "cancelled").length,
      cancelled: bookings.filter((booking) => booking.status === "cancelled").length,
    }),
    [bookings],
  );

  return {
    bookings,
    stats,
    isAdmin,
    isLoading,
    error,
    reload: loadBookings,
    bookHall,
    updateTiming,
    cancelBooking: cancel,
  };
}
