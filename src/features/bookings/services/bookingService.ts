import { API_CONFIG } from "../../../app/config/api";
import type { Booking, BookingCreatePayload, BookingTimingPayload } from "./bookingTypes";

const BOOKINGS_URL = `${API_CONFIG.bookingBaseUrl}/bookings`;

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { detail?: string };
    return data.detail ?? "Booking request failed. Please try again.";
  } catch {
    return "Booking request failed. Please try again.";
  }
}

async function request<T>(path: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${BOOKINGS_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<T>;
}

export function createBooking(token: string, payload: BookingCreatePayload) {
  return request<Booking>("/", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyBookings(token: string) {
  return request<Booking[]>("/me", token);
}

export function getAllBookings(token: string) {
  return request<Booking[]>("/all", token);
}

export function getBookingsByUserId(token: string, userId: string) {
  return request<Booking[]>(`/users/${encodeURIComponent(userId)}`, token);
}

export function getBookingsByHallName(token: string, hallName: string) {
  return request<Booking[]>(`/halls/${encodeURIComponent(hallName)}`, token);
}

export function updateBookingTiming(token: string, bookingId: string, payload: BookingTimingPayload) {
  return request<Booking>(`/${encodeURIComponent(bookingId)}/timing`, token, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function cancelBooking(token: string, bookingId: string) {
  return request<{ detail: string }>(`/${encodeURIComponent(bookingId)}/cancel`, token, {
    method: "PATCH",
  });
}
