import { useState } from "react";
import type { FormEvent } from "react";

type FacilityCreateFormProps = {
  isSaving: boolean;
  onCreate: (name: string) => Promise<void>;
};

export function FacilityCreateForm({ isSaving, onCreate }: FacilityCreateFormProps) {
  const [name, setName] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const facilityName = name.trim();

    if (!facilityName) {
      return;
    }

    await onCreate(facilityName);
    setName("");
  }

  return (
    <section className="tool-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Facility library</p>
          <h2>Create facility</h2>
        </div>
      </div>

      <form className="hall-form" onSubmit={handleSubmit}>
        <label htmlFor="facility-name">Facility name</label>
        <input
          id="facility-name"
          value={name}
          maxLength={100}
          placeholder="Projector, Wi-Fi, whiteboard"
          onChange={(event) => setName(event.target.value)}
          required
        />

        <button className="button button-primary" type="submit" disabled={isSaving}>
          {isSaving ? "Creating..." : "Create facility"}
        </button>
      </form>
    </section>
  );
}
