import { API_CONFIG } from "../../../app/config/api";
import type {
  Hall,
  HallCreatePayload,
  HallFreeSlots,
  HallSearchFilters,
  HallSearchResult,
  HallUpdatePayload,
} from "./hallTypes";

const HALLS_URL = `${API_CONFIG.bookingBaseUrl}/halls`;
const FREE_SLOTS_URL = `${API_CONFIG.bookingBaseUrl}/free-slots`;
const SEARCH_URL = `${API_CONFIG.bookingBaseUrl}/search`;

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { detail?: string };
    return data.detail ?? "Hall request failed. Please try again.";
  } catch {
    return "Hall request failed. Please try again.";
  }
}

async function request<T>(path: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${HALLS_URL}${path}`, {
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

async function requestFreeSlots<T>(path: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${FREE_SLOTS_URL}${path}`, {
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

async function requestSearch<T>(path: string, token: string, options: RequestInit = {}) {
  const response = await fetch(`${SEARCH_URL}${path}`, {
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

export function getAvailableHalls(token: string) {
  return request<Hall[]>("/", token);
}

export function getAllHalls(token: string) {
  return request<Hall[]>("/all", token);
}

export function createHall(token: string, payload: HallCreatePayload) {
  return request<Hall>("/", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateHall(token: string, payload: HallUpdatePayload) {
  return request<Hall>("/", token, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function addFacilityToHall(token: string, hallName: string, facilityName: string) {
  return request<void>(`/${encodeURIComponent(hallName)}/facilities`, token, {
    method: "POST",
    body: JSON.stringify({
      facility_name: facilityName,
    }),
  });
}

export function updateHallFacilityStatus(
  token: string,
  hallName: string,
  facilityName: string,
  isActive: boolean,
) {
  return request<void>("/facilities", token, {
    method: "PATCH",
    body: JSON.stringify({
      hall_name: hallName,
      facility_name: facilityName,
      is_active: isActive,
    }),
  });
}

export function getHallFreeSlots(
  token: string,
  hallId: string,
  startDateTime: string,
  endDateTime: string,
) {
  const params = new URLSearchParams({
    start_datetime: startDateTime,
    end_datetime: endDateTime,
  });

  return requestFreeSlots<HallFreeSlots>(`/${encodeURIComponent(hallId)}?${params.toString()}`, token);
}

export function searchAvailableHalls(token: string, filters: HallSearchFilters) {
  const params = new URLSearchParams({
    start_datetime: filters.start_datetime,
    end_datetime: filters.end_datetime,
  });

  if (filters.hall_id) {
    params.set("hall_id", filters.hall_id);
  }

  if (filters.hall_name) {
    params.set("hall_name", filters.hall_name);
  }

  if (filters.facility_id) {
    params.set("facility_id", String(filters.facility_id));
  }

  if (filters.facility_name) {
    params.set("facility_name", filters.facility_name);
  }

  return requestSearch<HallSearchResult>(`/available-halls?${params.toString()}`, token);
}
