import { useState } from "react";
import type { FormEvent } from "react";

import type { Hall } from "../../halls/services/hallTypes";
import type { BookingCreatePayload } from "../services/bookingTypes";
import { toApiDateTime } from "../utils/dateTime";

type BookingFormProps = {
  halls: Hall[];
  selectedHall?: Hall | null;
  isSaving: boolean;
  onBook: (payload: BookingCreatePayload) => Promise<void>;
};

export function BookingForm({ halls, selectedHall, isSaving, onBook }: BookingFormProps) {
  const [hallName, setHallName] = useState(selectedHall?.name ?? "");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onBook({
      hall_name: selectedHall?.name ?? hallName,
      start_datetime: toApiDateTime(startDateTime),
      end_datetime: toApiDateTime(endDateTime),
    });

    setStartDateTime("");
    setEndDateTime("");
  }

  return (
    <section className="tool-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">New booking</p>
          <h2>Book a hall</h2>
        </div>
      </div>

      <form className="hall-form" onSubmit={handleSubmit}>
        {selectedHall ? (
          <div className="selected-hall-chip">
            <span>Hall</span>
            <strong>{selectedHall.name}</strong>
          </div>
        ) : (
          <>
            <label htmlFor="booking-hall">Hall</label>
            <select
              id="booking-hall"
              value={hallName}
              onChange={(event) => setHallName(event.target.value)}
              required
            >
              <option value="">Select hall</option>
              {halls.map((hall) => (
                <option key={hall.id} value={hall.name}>
                  {hall.name} · Floor {hall.floor} · {hall.capacity} seats
                </option>
              ))}
            </select>
          </>
        )}

        <div className="form-grid">
          <div>
            <label htmlFor="booking-start">Start date and time</label>
            <input
              id="booking-start"
              type="datetime-local"
              value={startDateTime}
              onChange={(event) => setStartDateTime(event.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="booking-end">End date and time</label>
            <input
              id="booking-end"
              type="datetime-local"
              value={endDateTime}
              onChange={(event) => setEndDateTime(event.target.value)}
              required
            />
          </div>
        </div>

        <button className="button button-primary" type="submit" disabled={isSaving}>
          {isSaving ? "Booking..." : "Book hall"}
        </button>
      </form>
    </section>
  );
}
