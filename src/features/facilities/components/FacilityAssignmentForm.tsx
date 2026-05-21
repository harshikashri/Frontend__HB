import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import type { Facility } from "../services/facilityTypes";
import type { Hall } from "../../halls/services/hallTypes";

type FacilityAssignmentFormProps = {
  halls: Hall[];
  facilities: Facility[];
  isSaving: boolean;
  onAssign: (hallName: string, facilityName: string) => Promise<void>;
};

export function FacilityAssignmentForm({
  halls,
  facilities,
  isSaving,
  onAssign,
}: FacilityAssignmentFormProps) {
  const [hallName, setHallName] = useState("");
  const [facilityName, setFacilityName] = useState("");
  const activeHalls = useMemo(() => halls.filter((hall) => hall.is_active), [halls]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hallName || !facilityName.trim()) {
      return;
    }

    await onAssign(hallName, facilityName.trim());
    setFacilityName("");
  }

  return (
    <section className="tool-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Hall setup</p>
          <h2>Add facility to hall</h2>
        </div>
      </div>

      <form className="hall-form" onSubmit={handleSubmit}>
        <label htmlFor="assignment-hall">Hall</label>
        <select
          id="assignment-hall"
          value={hallName}
          onChange={(event) => setHallName(event.target.value)}
          required
        >
          <option value="">Select hall</option>
          {activeHalls.map((hall) => (
            <option key={hall.id} value={hall.name}>
              {hall.name}
            </option>
          ))}
        </select>

        <label htmlFor="assignment-facility">Facility</label>
        <input
          id="assignment-facility"
          list="facility-options"
          value={facilityName}
          placeholder="Choose or type facility name"
          onChange={(event) => setFacilityName(event.target.value)}
          required
        />
        <datalist id="facility-options">
          {facilities.map((facility) => (
            <option key={`${facility.id}-${facility.name}`} value={facility.name} />
          ))}
        </datalist>

        <button className="button button-primary" type="submit" disabled={isSaving}>
          {isSaving ? "Adding..." : "Add to hall"}
        </button>
      </form>
    </section>
  );
}
