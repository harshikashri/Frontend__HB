import { API_CONFIG } from "../../../app/config/api";
import type { Facility, FacilityCreatePayload } from "./facilityTypes";

const FACILITIES_URL = `${API_CONFIG.bookingBaseUrl}/facilities`;

async function readError(response: Response) {
  try {
    const data = (await response.json()) as { detail?: string };
    return data.detail ?? "Facility request failed. Please try again.";
  } catch {
    return "Facility request failed. Please try again.";
  }
}

export async function createFacility(token: string, payload: FacilityCreatePayload) {
  const response = await fetch(`${FACILITIES_URL}/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<Facility>;
}
