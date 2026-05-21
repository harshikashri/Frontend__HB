import { useEffect, useMemo, useState } from "react";

import type { BookingCreatePayload } from "../../bookings/services/bookingTypes";
import type { HallFreeSlots } from "../services/hallTypes";

const SLOT_MINUTES = 30;

type CalendarSlot = {
  id: string;
  status: "available" | "booked";
  start: Date;
  end: Date;
  index: number;
};

type HallAvailabilityCalendarProps = {
  availability: HallFreeSlots | null;
  selectedDate: string;
  isLoading: boolean;
  isBooking: boolean;
  error?: string | null;
  onDateChange: (date: string) => void;
  onBookSelected: (payload: BookingCreatePayload) => Promise<void>;
};

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatTime(value: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(typeof value === "string" ? new Date(value) : value);
}

function formatDuration(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
}

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toApiDateTime(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:00`;
}

function isSlotAvailable(slotStart: Date, slotEnd: Date, availability: HallFreeSlots) {
  return availability.available_slots.some((slot) => {
    const availableStart = new Date(slot.start_time);
    const availableEnd = new Date(slot.end_time);
    return slotStart >= availableStart && slotEnd <= availableEnd;
  });
}

function buildSlots(availability: HallFreeSlots | null): CalendarSlot[] {
  if (!availability) {
    return [];
  }

  const searchStart = new Date(availability.search_start_datetime);
  const searchEnd = new Date(availability.search_end_datetime);
  const slots: CalendarSlot[] = [];
  let cursor = searchStart;
  let index = 0;

  while (cursor < searchEnd) {
    const slotStart = new Date(cursor);
    const slotEnd = new Date(cursor.getTime() + SLOT_MINUTES * 60_000);

    if (slotEnd > searchEnd) {
      break;
    }

    slots.push({
      id: slotStart.toISOString(),
      status: isSlotAvailable(slotStart, slotEnd, availability) ? "available" : "booked",
      start: slotStart,
      end: slotEnd,
      index,
    });

    cursor = slotEnd;
    index += 1;
  }

  return slots;
}

export function HallAvailabilityCalendar({
  availability,
  selectedDate,
  isLoading,
  isBooking,
  error,
  onDateChange,
  onBookSelected,
}: HallAvailabilityCalendarProps) {
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const slots = useMemo(() => buildSlots(availability), [availability]);
  const availableMinutes = availability?.available_slots.reduce(
    (total, slot) => total + slot.duration_minutes,
    0,
  ) ?? 0;
  const selectedSlots = slots
    .filter((slot) => selectedSlotIds.includes(slot.id))
    .sort((left, right) => left.index - right.index);
  const selectedStart = selectedSlots[0]?.start ?? null;
  const selectedEnd = selectedSlots[selectedSlots.length - 1]?.end ?? null;
  const selectedMinutes = selectedSlots.length * SLOT_MINUTES;
  const canBookSelection = Boolean(availability && selectedStart && selectedEnd && selectedSlots.length > 0);

  useEffect(() => {
    setSelectedSlotIds([]);
  }, [availability?.hall_id, selectedDate]);

  function handleSlotClick(slot: CalendarSlot) {
    if (slot.status !== "available" || isBooking) {
      return;
    }

    setSelectedSlotIds((currentIds) => {
      const currentSlots = slots
        .filter((candidate) => currentIds.includes(candidate.id))
        .sort((left, right) => left.index - right.index);
      const isSelected = currentIds.includes(slot.id);

      if (currentSlots.length === 0) {
        return [slot.id];
      }

      const firstIndex = currentSlots[0].index;
      const lastIndex = currentSlots[currentSlots.length - 1].index;

      if (isSelected) {
        if (currentSlots.length === 1) {
          return [];
        }

        if (slot.index === firstIndex || slot.index === lastIndex) {
          return currentIds.filter((id) => id !== slot.id);
        }

        return [slot.id];
      }

      if (slot.index === firstIndex - 1 || slot.index === lastIndex + 1) {
        return [...currentIds, slot.id];
      }

      return [slot.id];
    });
  }

  async function handleBookSelection() {
    if (!availability || !selectedStart || !selectedEnd) {
      return;
    }

    await onBookSelected({
      hall_name: availability.hall_name,
      start_datetime: toApiDateTime(selectedStart),
      end_datetime: toApiDateTime(selectedEnd),
    });
    setSelectedSlotIds([]);
  }

  return (
    <section className="availability-panel" aria-live="polite">
      <div className="availability-header">
        <div>
          <p className="eyebrow">Availability</p>
          <h2>{formatDateLabel(selectedDate)}</h2>
        </div>
        <div className="availability-controls">
          <button className="button button-secondary" type="button" onClick={() => onDateChange(addDays(selectedDate, -1))}>
            Previous
          </button>
          <input
            aria-label="Availability date"
            type="date"
            value={selectedDate}
            onChange={(event) => onDateChange(event.target.value)}
          />
          <button className="button button-secondary" type="button" onClick={() => onDateChange(addDays(selectedDate, 1))}>
            Next
          </button>
        </div>
      </div>

      <div className="availability-summary">
        <div>
          <span>30 min slots</span>
          <strong>{slots.filter((slot) => slot.status === "available").length}</strong>
        </div>
        <div>
          <span>Available time</span>
          <strong>{formatDuration(availableMinutes)}</strong>
        </div>
        <div>
          <span>Calendar view</span>
          <strong>24 hrs</strong>
        </div>
      </div>

      {error ? <p className="form-message">{error}</p> : null}

      <div className="slot-selection-bar">
        <div>
          <span>Selected booking</span>
          <strong>
            {selectedStart && selectedEnd
              ? `${formatTime(selectedStart)} - ${formatTime(selectedEnd)} (${formatDuration(selectedMinutes)})`
              : "Choose available 30 min slots"}
          </strong>
        </div>
        <div className="slot-selection-actions">
          <button
            className="button button-secondary"
            type="button"
            disabled={selectedSlotIds.length === 0 || isBooking}
            onClick={() => setSelectedSlotIds([])}
          >
            Clear
          </button>
          <button
            className="button button-primary"
            type="button"
            disabled={!canBookSelection || isBooking}
            onClick={handleBookSelection}
          >
            {isBooking ? "Booking..." : "Book selected slots"}
          </button>
        </div>
      </div>

      <div className="availability-calendar">
        <div className="calendar-grid" aria-busy={isLoading}>
          {isLoading ? <p className="calendar-loading muted-text">Loading availability...</p> : null}
          {!isLoading && slots.length === 0 ? (
            <p className="calendar-loading muted-text">No availability data for this date.</p>
          ) : null}
          {!isLoading
            ? slots.map((slot) => (
                <button
                  className={`calendar-slot ${slot.status === "available" ? "slot-available" : "slot-booked"} ${
                    selectedSlotIds.includes(slot.id) ? "slot-selected" : ""
                  }`}
                  key={slot.id}
                  type="button"
                  disabled={slot.status !== "available" || isBooking}
                  onClick={() => handleSlotClick(slot)}
                >
                  <span>{slot.status === "available" ? "Available" : "Booked"}</span>
                  <strong>{formatTime(slot.start)} - {formatTime(slot.end)}</strong>
                </button>
              ))
            : null}
        </div>
      </div>

      <div className="slot-list compact-slot-list">
        <span className="slot-key slot-key-available">Available</span>
        <span className="slot-key slot-key-selected">Selected</span>
        <span className="slot-key slot-key-booked">Booked</span>
      </div>
    </section>
  );
}
