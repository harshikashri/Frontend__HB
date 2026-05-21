const FAVORITES_KEY_PREFIX = "hall_booking_favorites";

function getStorageKey(userId: string) {
  return `${FAVORITES_KEY_PREFIX}:${userId}`;
}

export function getStoredFavoriteNames(userId: string) {
  const rawFavorites = localStorage.getItem(getStorageKey(userId));

  if (!rawFavorites) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawFavorites) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(getStorageKey(userId));
    return [];
  }
}

export function saveFavoriteNames(userId: string, hallNames: string[]) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(hallNames));
}
