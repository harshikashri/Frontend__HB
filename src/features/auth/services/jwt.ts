import type { AuthUser, JwtPayload } from "./authTypes";

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const decoded = atob(padded);

  return decodeURIComponent(
    decoded
      .split("")
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );
}

export function decodeJwt(token: string): JwtPayload {
  const [, payload] = token.split(".");

  if (!payload) {
    throw new Error("Invalid token received from server.");
  }

  return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
}

export function isTokenExpired(payload: JwtPayload) {
  if (!payload.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
}

export function createUserFromToken(token: string): AuthUser {
  const payload = decodeJwt(token);

  if (isTokenExpired(payload)) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (!payload.user_id || !payload.username || !payload.role) {
    throw new Error("Login succeeded, but the token is missing user details.");
  }

  return {
    id: payload.user_id,
    username: payload.username,
    role: payload.role,
  };
}
