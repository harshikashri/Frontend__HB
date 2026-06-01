export const API_CONFIG = {
  authBaseUrl: import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:8000",
  bookingBaseUrl: import.meta.env.VITE_BOOKING_API_URL ?? "http://localhost:8001",
} as const;

export const AUTH_ENDPOINTS = {
  login: `${API_CONFIG.authBaseUrl}/auth/login`,
  register: `${API_CONFIG.authBaseUrl}/users/`,
} as const;
