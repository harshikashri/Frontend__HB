import { AUTH_ENDPOINTS } from "../../../app/config/api";
import type {
  LoginCredentials,
  RegisterCredentials,
  RegisterResponse,
  TokenResponse,
} from "./authTypes";

const LOGIN_ROLES = ["user", "admin"] as const;

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { detail?: string };
    return data.detail ?? "Request failed. Please try again.";
  } catch {
    return "Request failed. Please try again.";
  }
}

async function requestLogin(credentials: LoginCredentials, role: string) {
  const body = new URLSearchParams({
    username: credentials.username,
    password: credentials.password,
    role,
  });

  const response = await fetch(AUTH_ENDPOINTS.login, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<TokenResponse>;
}

export async function loginUser(credentials: LoginCredentials) {
  let lastError = "Invalid credentials";

  for (const role of LOGIN_ROLES) {
    try {
      return await requestLogin(credentials, role);
    } catch (error) {
      lastError = error instanceof Error ? error.message : lastError;
    }
  }

  throw new Error(lastError);
}

export async function registerUser(credentials: RegisterCredentials) {
  const response = await fetch(AUTH_ENDPOINTS.register, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<RegisterResponse>;
}
