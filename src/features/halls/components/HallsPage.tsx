import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/hooks/useAuth";
import { useFavorites } from "../../favorites/hooks/useFavorites";
import { getAllFacilities } from "../../facilities/services/facilityService";
import type { Facility } from "../../facilities/services/facilityTypes";
import type {
  Hall,
  HallCreatePayload,
  HallSearchResultHall,
  HallTimeSlot,
  HallUpdatePayload,
} from "../services/hallTypes";
import { useHalls } from "../hooks/useHalls";
import { useHallSearch } from "../hooks/useHallSearch";
import { HallCard } from "./HallCard";
import { HallForm } from "./HallForm";
import { HallSearchPanel } from "./HallSearchPanel";
import type { HallSearchRefinements } from "./HallSearchPanel";
import { HallStats } from "./HallStats";

export function HallsPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const {
    halls,
    stats,
    isAdmin,
    isLoading,
    error,
    createHall,
    updateHall,
    assignFacility,
    setHallFacilityStatus,
  } = useHalls();
  const hallSearch = useHallSearch();
  const favorites = useFavorites();
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [availableFacilities, setAvailableFacilities] = useState<Facility[]>([]);
  const [facilityLoadError, setFacilityLoadError] = useState<string | null>(null);
  const [mutatingHallName, setMutatingHallName] = useState<string | null>(null);
  const [searchRefinements, setSearchRefinements] = useState<HallSearchRefinements>({
    query: "",
    minCapacity: null,
  });

  useEffect(() => {
    if (!token || !isAdmin) {
      return;
    }

    const authToken = token;
    let ignore = false;

    async function loadFacilities() {
      setFacilityLoadError(null);

      try {
        const facilities = await getAllFacilities(authToken);
        if (!ignore) {
          setAvailableFacilities(facilities);
        }
      } catch (error) {
        if (!ignore) {
          setFacilityLoadError(
            error instanceof Error ? error.message : "Unable to load facilities.",
          );
        }
      }
    }

    void loadFacilities();

    return () => {
      ignore = true;
    };
  }, [isAdmin, token]);

  const knownFacilities = useMemo(() => {
    const facilityMap = new Map<string, Facility>();

    for (const hall of halls) {
      for (const hallFacility of hall.facilities) {
        if (!isAdmin && !hallFacility.is_active) {
          continue;
        }

        facilityMap.set(hallFacility.facility.name.toLowerCase(), {
          id: hallFacility.facility.id,
          name: hallFacility.facility.name,
        });
      }
    }

    for (const facility of availableFacilities) {
      facilityMap.set(facility.name.toLowerCase(), facility);
    }

    return Array.from(facilityMap.values()).sort((first, second) =>
      first.name.localeCompare(second.name),
    );
  }, [availableFacilities, halls, isAdmin]);

  const searchSlotsByHallId = useMemo(() => {
    const slotMap = new Map<string, HallTimeSlot[]>();

    for (const result of hallSearch.result?.results ?? []) {
      slotMap.set(result.hall_id, result.available_slots);
    }

    return slotMap;
  }, [hallSearch.result]);

  const displayedHalls = useMemo(() => {
    if (!hallSearch.result) {
      return halls;
    }

    const hallMap = new Map(halls.map((hall) => [hall.id, hall]));
    const query = searchRefinements.query.toLowerCase();

    return hallSearch.result.results
      .filter((result: HallSearchResultHall) => result.available_slots.length > 0)
      .filter((result: HallSearchResultHall) =>
        searchRefinements.minCapacity ? result.capacity >= searchRefinements.minCapacity : true,
      )
      .filter((result: HallSearchResultHall) =>
        query ? result.hall_name.toLowerCase().includes(query) : true,
      )
      .map((result: HallSearchResultHall) => hallMap.get(result.hall_id))
      .filter((hall): hall is Hall => Boolean(hall));
  }, [hallSearch.result, halls, searchRefinements]);

  async function handleCreate(payload: HallCreatePayload, facilityNames: string[]) {
    setIsSaving(true);
    setFormError(null);
    setMessage(null);

    try {
      await createHall(payload);
      for (const facilityName of facilityNames) {
        await assignFacility(payload.name, facilityName);
      }
      setMessage("Hall created.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create hall.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdate(payload: HallUpdatePayload, facilityNames: string[]) {
    setIsSaving(true);
    setFormError(null);
    setMessage(null);

    try {
      await updateHall(payload);
      const currentFacilities = editingHall?.facilities ?? [];
      const currentFacilityNames = new Set(
        currentFacilities.map((hallFacility) => hallFacility.facility.name),
      );
      const selectedFacilityNameSet = new Set(facilityNames);
      const nextHallName = payload.name?.trim() || payload.hall_name;

      for (const facilityName of facilityNames) {
        if (!currentFacilityNames.has(facilityName)) {
          await assignFacility(nextHallName, facilityName);
        }
      }

      for (const hallFacility of currentFacilities) {
        const facilityName = hallFacility.facility.name;
        const shouldBeActive = selectedFacilityNameSet.has(facilityName);

        if (hallFacility.is_active !== shouldBeActive) {
          await setHallFacilityStatus(nextHallName, facilityName, shouldBeActive);
        }
      }

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

  function handleSelectHall(hall: Hall) {
    navigate(`/halls/${encodeURIComponent(hall.name)}`);
  }

  async function handleSearch(
    filters: Parameters<typeof hallSearch.search>[0],
    refinements: HallSearchRefinements,
  ) {
    setFormError(null);
    setMessage(null);
    setSearchRefinements(refinements);

    try {
      await hallSearch.search(filters);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to search halls.");
    }
  }

  function handleClearSearch() {
    hallSearch.clear();
    setSearchRefinements({ query: "", minCapacity: null });
    setFormError(null);
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

      {!isAdmin ? (
        <HallSearchPanel
          halls={halls}
          facilities={knownFacilities}
          isSearching={hallSearch.isSearching}
          isActive={Boolean(hallSearch.result)}
          onSearch={handleSearch}
          onClear={handleClearSearch}
        />
      ) : null}

      {isAdmin ? (
        <div className="admin-grid">
          <HallForm
            editingHall={editingHall}
            facilities={knownFacilities}
            isSaving={isSaving}
            onCancelEdit={() => setEditingHall(null)}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
          />
          <section className="tool-panel compact-panel">
            <p className="eyebrow">Status</p>
            {formError || facilityLoadError ? (
              <p className="form-message">{formError ?? facilityLoadError}</p>
            ) : null}
            {message ? <p className="success-message">{message}</p> : null}
            {!formError && !facilityLoadError && !message ? (
              <p className="muted-text">Ready</p>
            ) : null}
          </section>
        </div>
      ) : null}

      {!isAdmin && (formError || message) ? (
        <section className="tool-panel compact-panel">
          <p className="eyebrow">Status</p>
          {formError ? <p className="form-message">{formError}</p> : null}
          {message ? <p className="success-message">{message}</p> : null}
        </section>
      ) : null}

      {error || hallSearch.error ? <p className="form-message">{error ?? hallSearch.error}</p> : null}

      {!isAdmin && hallSearch.result ? (
        <section className="section-heading">
          <div>
            <p className="eyebrow">Search results</p>
            <h2>{displayedHalls.length} hall{displayedHalls.length === 1 ? "" : "s"} available</h2>
          </div>
          <button className="button button-secondary" type="button" onClick={handleClearSearch}>
            Show all halls
          </button>
        </section>
      ) : null}

      <section className="hall-grid" aria-live="polite">
        {isLoading || hallSearch.isSearching ? (
          <p className="muted-text">Loading halls...</p>
        ) : displayedHalls.length > 0 ? (
          displayedHalls.map((hall) => (
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
              onSelect={handleSelectHall}
              availableSlots={hallSearch.result ? searchSlotsByHallId.get(hall.id) ?? [] : undefined}
            />
          ))
        ) : (
          <section className="empty-state">
            <p className="eyebrow">No halls found</p>
            <h3>No halls match this search.</h3>
            <p>Adjust the time window or filters and search again.</p>
          </section>
        )}
      </section>
    </div>
  );
}
