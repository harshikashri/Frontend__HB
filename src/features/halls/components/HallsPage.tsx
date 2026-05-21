import { useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import { useFavorites } from "../../favorites/hooks/useFavorites";
import type { Hall, HallCreatePayload, HallUpdatePayload } from "../services/hallTypes";
import { useHalls } from "../hooks/useHalls";
import { HallCard } from "./HallCard";
import { HallForm } from "./HallForm";
import { HallStats } from "./HallStats";

export function HallsPage() {
  const { user } = useAuth();
  const { halls, stats, isAdmin, isLoading, error, createHall, updateHall } = useHalls();
  const favorites = useFavorites();
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mutatingHallName, setMutatingHallName] = useState<string | null>(null);

  async function handleCreate(payload: HallCreatePayload) {
    setIsSaving(true);
    setFormError(null);
    setMessage(null);

    try {
      await createHall(payload);
      setMessage("Hall created.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create hall.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate(payload: HallUpdatePayload) {
    setIsSaving(true);
    setFormError(null);
    setMessage(null);

    try {
      await updateHall(payload);
      setEditingHall(null);
      setMessage("Hall updated.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to update hall.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleStatus(hall: Hall) {
    setMutatingHallName(hall.name);
    setFormError(null);
    setMessage(null);

    try {
      await updateHall({
        hall_name: hall.name,
        is_active: !hall.is_active,
      });
      if (editingHall?.name === hall.name) {
        setEditingHall(null);
      }
      setMessage(hall.is_active ? "Hall disabled." : "Hall enabled.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to update hall status.");
    } finally {
      setMutatingHallName(null);
    }
  }

  async function handleAddFavorite(hall: Hall) {
    setFormError(null);
    setMessage(null);

    try {
      await favorites.addFavorite(hall.name);
      setMessage(`${hall.name} added to favorites.`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to add favorite.");
    }
  }

  async function handleRemoveFavorite(hall: Hall) {
    setFormError(null);
    setMessage(null);

    try {
      await favorites.removeFavorite(hall.name);
      setMessage(`${hall.name} removed from favorites.`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to remove favorite.");
    }
  }

  return (
    <div className="halls-page">
      <section className="page-intro">
        <div>
          <p className="eyebrow">{isAdmin ? "Admin halls" : "Available halls"}</p>
          <h2>{isAdmin ? "Manage halls" : "Browse halls"}</h2>
        </div>
        <span className="signed-in">Signed in as {user?.username}</span>
      </section>

      <HallStats {...stats} isAdmin={isAdmin} />

      {isAdmin ? (
        <div className="admin-grid">
          <HallForm
            editingHall={editingHall}
            isSaving={isSaving}
            onCancelEdit={() => setEditingHall(null)}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
          />
          <section className="tool-panel compact-panel">
            <p className="eyebrow">Status</p>
            {formError ? <p className="form-message">{formError}</p> : null}
            {message ? <p className="success-message">{message}</p> : null}
            {!formError && !message ? <p className="muted-text">Ready</p> : null}
          </section>
        </div>
      ) : null}

      {!isAdmin && (formError || message) ? (
        <section className="tool-panel compact-panel">
          <p className="eyebrow">Favorites</p>
          {formError ? <p className="form-message">{formError}</p> : null}
          {message ? <p className="success-message">{message}</p> : null}
        </section>
      ) : null}

      {error ? <p className="form-message">{error}</p> : null}

      <section className="hall-grid" aria-live="polite">
        {isLoading ? (
          <p className="muted-text">Loading halls...</p>
        ) : halls.length > 0 ? (
          halls.map((hall) => (
            <HallCard
              key={hall.id}
              hall={hall}
              isAdmin={isAdmin}
              isMutating={
                isAdmin ? mutatingHallName === hall.name : favorites.mutatingHallName === hall.name
              }
              isFavorite={favorites.isFavorite(hall.name)}
              onEdit={setEditingHall}
              onToggleStatus={handleToggleStatus}
              onAddFavorite={handleAddFavorite}
              onRemoveFavorite={handleRemoveFavorite}
            />
          ))
        ) : (
          <p className="muted-text">No halls found.</p>
        )}
      </section>
    </div>
  );
}
