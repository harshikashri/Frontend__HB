import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useHalls } from "../../halls/hooks/useHalls";
import type { Hall } from "../../halls/services/hallTypes";
import { HallCard } from "../../halls/components/HallCard";
import { useFavorites } from "../hooks/useFavorites";

export function FavoritesPage() {
  const { halls, isLoading, error } = useHalls();
  const favorites = useFavorites();
  const [message, setMessage] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);

  const favoriteHalls = useMemo(() => {
    return halls.filter((hall) => favorites.isFavorite(hall.name));
  }, [favorites, halls]);

  const totalCapacity = favoriteHalls.reduce((sum, hall) => sum + hall.capacity, 0);

  async function handleRemoveFavorite(hall: Hall) {
    setMessage(null);
    setFavoriteError(null);

    try {
      await favorites.removeFavorite(hall.name);
      setMessage(`${hall.name} removed from favorites.`);
    } catch (error) {
      setFavoriteError(error instanceof Error ? error.message : "Unable to remove favorite.");
    }
  }

  return (
    <div className="halls-page">
      <section className="favorites-hero">
        <div>
          <p className="eyebrow">User favorites</p>
          <h2>Your preferred halls</h2>
          <p>
            Keep frequently used halls close at hand and remove them whenever your
            shortlist changes.
          </p>
        </div>
        <Link className="button button-secondary" to="/halls">
          Browse halls
        </Link>
      </section>

      <section className="favorites-summary" aria-label="Favorites summary">
        <div className="stat-card">
          <span>Favorite halls</span>
          <strong>{favoriteHalls.length}</strong>
        </div>
        <div className="stat-card">
          <span>Combined capacity</span>
          <strong>{totalCapacity}</strong>
        </div>
      </section>

      {(favoriteError || error || message) ? (
        <section className="tool-panel compact-panel">
          <p className="eyebrow">Status</p>
          {favoriteError || error ? <p className="form-message">{favoriteError ?? error}</p> : null}
          {message ? <p className="success-message">{message}</p> : null}
        </section>
      ) : null}

      <section className="favorites-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Shortlist</p>
            <h2>Saved halls</h2>
          </div>
        </div>
      </section>

      <section className="hall-grid" aria-live="polite">
        {isLoading ? (
          <p className="muted-text">Loading favorites...</p>
        ) : favoriteHalls.length > 0 ? (
          favoriteHalls.map((hall) => (
            <HallCard
              key={hall.id}
              hall={hall}
              isAdmin={false}
              isMutating={favorites.mutatingHallName === hall.name}
              isFavorite
              onEdit={() => undefined}
              onToggleStatus={() => undefined}
              onRemoveFavorite={handleRemoveFavorite}
            />
          ))
        ) : (
          <section className="empty-state">
            <p className="eyebrow">No favorites yet</p>
            <h3>Build a shortlist for faster booking decisions.</h3>
            <p>Add halls from the browse page and they will appear here for quick access.</p>
            <Link className="button button-primary" to="/halls">
              Browse halls
            </Link>
          </section>
        )}
      </section>
    </div>
  );
}
