export const API_CONFIG = {
  authBaseUrl: import.meta.env.VITE_AUTH_API_URL ?? "https://auth-backend-uvifs5ttza-el.a.run.app",
  bookingBaseUrl: import.meta.env.VITE_BOOKING_API_URL ?? "https://booking-backend-uvifs5ttza-el.a.run.app",
} as const;

export const AUTH_ENDPOINTS = {
  login: `${API_CONFIG.authBaseUrl}/auth/login`,
  register: `${API_CONFIG.authBaseUrl}/users/`,
} as const;
