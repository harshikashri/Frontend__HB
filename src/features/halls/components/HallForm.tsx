import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { Hall, HallCreatePayload, HallUpdatePayload } from "../services/hallTypes";

type HallFormProps = {
  editingHall: Hall | null;
  isSaving: boolean;
  onCancelEdit: () => void;
  onCreate: (payload: HallCreatePayload) => Promise<void>;
  onUpdate: (payload: HallUpdatePayload) => Promise<void>;
};

const emptyForm = {
  name: "",
  floor: "1",
  capacity: "1",
  isActive: true,
};

export function HallForm({
  editingHall,
  isSaving,
  onCancelEdit,
  onCreate,
  onUpdate,
}: HallFormProps) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!editingHall) {
      setForm(emptyForm);
      return;
    }

    setForm({
      name: editingHall.name,
      floor: String(editingHall.floor),
      capacity: String(editingHall.capacity),
      isActive: editingHall.is_active,
    });
  }, [editingHall]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      floor: Number(form.floor),
      capacity: Number(form.capacity),
      is_active: form.isActive,
    };

    if (editingHall) {
      await onUpdate({
        hall_name: editingHall.name,
        ...payload,
      });
      return;
    }

    await onCreate(payload);
    setForm(emptyForm);
  }

  return (
    <section className="tool-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>{editingHall ? "Update hall" : "Create hall"}</h2>
        </div>
        {editingHall ? (
          <button className="button button-secondary" type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        ) : null}
      </div>

      <form className="hall-form" onSubmit={handleSubmit}>
        <label htmlFor="hall-name">Hall name</label>
        <input
          id="hall-name"
          value={form.name}
          maxLength={100}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          required
        />

        <div className="form-grid">
          <div>
            <label htmlFor="hall-floor">Floor</label>
            <input
              id="hall-floor"
              type="number"
              value={form.floor}
              onChange={(event) =>
                setForm((current) => ({ ...current, floor: event.target.value }))
              }
              required
            />
          </div>
          <div>
            <label htmlFor="hall-capacity">Capacity</label>
            <input
              id="hall-capacity"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(event) =>
                setForm((current) => ({ ...current, capacity: event.target.value }))
              }
              required
            />
          </div>
        </div>

        <label className="toggle-row" htmlFor="hall-active">
          <input
            id="hall-active"
            type="checkbox"
            checked={form.isActive}
            onChange={(event) =>
              setForm((current) => ({ ...current, isActive: event.target.checked }))
            }
          />
          <span>Active</span>
        </label>

        <button className="button button-primary" type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : editingHall ? "Save changes" : "Create hall"}
        </button>
      </form>
    </section>
  );
}
