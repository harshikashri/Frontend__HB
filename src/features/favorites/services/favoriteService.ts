import { API_CONFIG } from "../../../app/config/api";

const FAVORITES_URL = `${API_CONFIG.bookingBaseUrl}/favorites`;

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { detail?: string };
    return data.detail ?? "Favorite request failed. Please try again.";
  } catch {
    return "Favorite request failed. Please try again.";
  }
}

async function requestFavorite(token: string, hallName: string, method: "POST" | "DELETE") {
  const response = await fetch(`${FAVORITES_URL}/${encodeURIComponent(hallName)}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<unknown>;
}

export function addFavorite(token: string, hallName: string) {
  return requestFavorite(token, hallName, "POST");
}

export function removeFavorite(token: string, hallName: string) {
  return requestFavorite(token, hallName, "DELETE");
}
