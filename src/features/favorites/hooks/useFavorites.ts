import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import { addFavorite, removeFavorite } from "../services/favoriteService";
import { getStoredFavoriteNames, saveFavoriteNames } from "../services/favoriteStorage";

export function useFavorites() {
  const { token, user } = useAuth();
  const [favoriteNames, setFavoriteNames] = useState<string[]>([]);
  const [mutatingHallName, setMutatingHallName] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || user.role !== "user") {
      setFavoriteNames([]);
      return;
    }

    setFavoriteNames(getStoredFavoriteNames(user.id));
  }, [user?.id, user?.role]);

  const favoriteNameSet = useMemo(
    () => new Set(favoriteNames.map((hallName) => hallName.toLowerCase())),
    [favoriteNames],
  );

  const persist = useCallback(
    (nextNames: string[]) => {
      if (!user?.id) {
        return;
      }

      const sortedNames = Array.from(new Set(nextNames)).sort((first, second) =>
        first.localeCompare(second),
      );
      setFavoriteNames(sortedNames);
      saveFavoriteNames(user.id, sortedNames);
    },
    [user?.id],
  );

  const add = useCallback(
    async (hallName: string) => {
      if (!token) {
        throw new Error("Missing authentication token.");
      }

      setMutatingHallName(hallName);

      try {
        await addFavorite(token, hallName);
        persist([...favoriteNames, hallName]);
      } catch (error) {
        if (error instanceof Error && error.message === "Hall is already in favorites") {
          persist([...favoriteNames, hallName]);
          return;
        }

        throw error;
      } finally {
        setMutatingHallName(null);
      }
    },
    [favoriteNames, persist, token],
  );

  const remove = useCallback(
    async (hallName: string) => {
      if (!token) {
        throw new Error("Missing authentication token.");
      }

      setMutatingHallName(hallName);

      try {
        await removeFavorite(token, hallName);
        persist(favoriteNames.filter((favoriteName) => favoriteName !== hallName));
      } catch (error) {
        if (error instanceof Error && error.message === "Favorite not found") {
          persist(favoriteNames.filter((favoriteName) => favoriteName !== hallName));
          return;
        }

        throw error;
      } finally {
        setMutatingHallName(null);
      }
    },
    [favoriteNames, persist, token],
  );

  return {
    favoriteNames,
    favoriteNameSet,
    mutatingHallName,
    isFavorite: (hallName: string) => favoriteNameSet.has(hallName.toLowerCase()),
    addFavorite: add,
    removeFavorite: remove,
  };
}
