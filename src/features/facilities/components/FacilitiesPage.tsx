import { useMemo, useState } from "react";

import { useAuth } from "../../auth/hooks/useAuth";
import { useHalls } from "../../halls/hooks/useHalls";
import { createFacility } from "../services/facilityService";
import type { Facility } from "../services/facilityTypes";
import { FacilityAssignmentForm } from "./FacilityAssignmentForm";
import { FacilityCreateForm } from "./FacilityCreateForm";
import { HallFacilityMatrix } from "./HallFacilityMatrix";

export function FacilitiesPage() {
  const { token } = useAuth();
  const { halls, isLoading, error, assignFacility, setHallFacilityStatus } = useHalls();
  const [createdFacilities, setCreatedFacilities] = useState<Facility[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [mutatingKey, setMutatingKey] = useState<string | null>(null);

  const knownFacilities = useMemo(() => {
    const facilityMap = new Map<string, Facility>();

    for (const hall of halls) {
      for (const hallFacility of hall.facilities) {
        facilityMap.set(hallFacility.facility.name.toLowerCase(), {
          id: hallFacility.facility.id,
          name: hallFacility.facility.name,
        });
      }
    }

    for (const facility of createdFacilities) {
      facilityMap.set(facility.name.toLowerCase(), facility);
    }

    return Array.from(facilityMap.values()).sort((first, second) =>
      first.name.localeCompare(second.name),
    );
  }, [createdFacilities, halls]);

  async function handleCreate(name: string) {
    if (!token) {
      throw new Error("Missing authentication token.");
    }

    setIsCreating(true);
    setFormError(null);
    setMessage(null);

    try {
      const facility = await createFacility(token, { name });
      setCreatedFacilities((current) => [...current, facility]);
      setMessage("Facility created. Add it to a hall when ready.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create facility.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleAssign(hallName: string, facilityName: string) {
    setIsAssigning(true);
    setFormError(null);
    setMessage(null);

    try {
      await assignFacility(hallName, facilityName);
      setMessage(`${facilityName} added to ${hallName}.`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to add facility to hall.");
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleToggle(hallName: string, facilityName: string, isActive: boolean) {
    const key = `${hallName}-${facilityName}`;
    setMutatingKey(key);
    setFormError(null);
    setMessage(null);

    try {
      await setHallFacilityStatus(hallName, facilityName, isActive);
      setMessage(`${facilityName} ${isActive ? "enabled" : "disabled"} for ${hallName}.`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to update facility status.");
    } finally {
      setMutatingKey(null);
    }
  }

  return (
    <div className="halls-page">
      <section className="page-intro">
        <div>
          <p className="eyebrow">Admin facilities</p>
          <h2>Manage facilities</h2>
        </div>
        <span className="signed-in">{knownFacilities.length} known facilities</span>
      </section>

      <div className="admin-grid">
        <FacilityCreateForm isSaving={isCreating} onCreate={handleCreate} />
        <FacilityAssignmentForm
          halls={halls}
          facilities={knownFacilities}
          isSaving={isAssigning}
          onAssign={handleAssign}
        />
      </div>

      <section className="tool-panel compact-panel">
        <p className="eyebrow">Status</p>
        {formError || error ? <p className="form-message">{formError ?? error}</p> : null}
        {message ? <p className="success-message">{message}</p> : null}
        {!formError && !error && !message ? (
          <p className="muted-text">Create a facility, add it to a hall, or toggle availability.</p>
        ) : null}
      </section>

      <section>
        <div className="section-heading facility-section-heading">
          <div>
            <p className="eyebrow">Per hall</p>
            <h2>Facility availability</h2>
          </div>
        </div>

        {isLoading ? (
          <p className="muted-text">Loading facilities...</p>
        ) : (
          <HallFacilityMatrix halls={halls} mutatingKey={mutatingKey} onToggle={handleToggle} />
        )}
      </section>
    </div>
  );
}
