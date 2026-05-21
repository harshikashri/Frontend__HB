import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { Booking, BookingTimingPayload } from "../services/bookingTypes";
import { toApiDateTime, toDateTimeInputValue } from "../utils/dateTime";

type BookingTimingFormProps = {
  booking: Booking | null;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (bookingId: string, payload: BookingTimingPayload) => Promise<void>;
};

export function BookingTimingForm({ booking, isSaving, onCancel, onSave }: BookingTimingFormProps) {
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");

  useEffect(() => {
    if (!booking) {
      setStartDateTime("");
      setEndDateTime("");
      return;
    }

    setStartDateTime(toDateTimeInputValue(booking.start_datetime));
    setEndDateTime(toDateTimeInputValue(booking.end_datetime));
  }, [booking]);

  if (!booking) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!booking) {
      return;
    }

    await onSave(booking.id, {
      start_datetime: toApiDateTime(startDateTime),
      end_datetime: toApiDateTime(endDateTime),
    });
  }

  return (
    <section className="tool-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Reschedule</p>
          <h2>{booking.hall_name}</h2>
        </div>
        <button className="button button-secondary" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>

      <form className="hall-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label htmlFor="edit-booking-start">Start date and time</label>
            <input
              id="edit-booking-start"
              type="datetime-local"
              value={startDateTime}
              onChange={(event) => setStartDateTime(event.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="edit-booking-end">End date and time</label>
            <input
              id="edit-booking-end"
              type="datetime-local"
              value={endDateTime}
              onChange={(event) => setEndDateTime(event.target.value)}
              required
            />
          </div>
        </div>

        <button className="button button-primary" type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save timing"}
        </button>
      </form>
    </section>
  );
}
