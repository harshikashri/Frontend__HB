import { useState } from "react";
import type { FormEvent } from "react";

import { BookingList } from "./BookingList";
import { useBookings } from "../hooks/useBookings";

export function AdminBookingsPage() {
  const [draftHallName, setDraftHallName] = useState("");
  const [selectedHallName, setSelectedHallName] = useState("");
  const { bookings, stats, isLoading, error } = useBookings({
    hallName: selectedHallName.trim() || undefined,
  });

  function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectedHallName(draftHallName.trim());
  }

  function clearFilter() {
    setDraftHallName("");
    setSelectedHallName("");
  }

  return (
    <div className="halls-page">
      <section className="page-intro">
        <div>
          <p className="eyebrow">Admin bookings</p>
          <h2>Booking overview</h2>
        </div>
        <span className="signed-in">
          {selectedHallName ? "Filtered by hall" : "All halls"}
        </span>
      </section>

      <section className="booking-summary" aria-label="Booking summary">
        <div className="stat-card">
          <span>Total bookings</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card">
          <span>Booked</span>
          <strong>{stats.booked}</strong>
        </div>
        <div className="stat-card">
          <span>Cancelled</span>
          <strong>{stats.cancelled}</strong>
        </div>
      </section>

      <section className="tool-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Find bookings</p>
            <h2>Hall filter</h2>
          </div>
          {selectedHallName ? (
            <button className="button button-secondary" type="button" onClick={clearFilter}>
              Clear
            </button>
          ) : null}
        </div>

        <form className="booking-filter-form" onSubmit={handleFilter}>
          <label htmlFor="booking-hall-name">Hall name</label>
          <input
            id="booking-hall-name"
            value={draftHallName}
            placeholder="Enter a hall name"
            onChange={(event) => setDraftHallName(event.target.value)}
          />
          <button className="button button-primary" type="submit">
            View hall bookings
          </button>
        </form>
      </section>

      {error ? (
        <section className="tool-panel compact-panel">
          <p className="eyebrow">Status</p>
          <p className="form-message">{error}</p>
        </section>
      ) : null}

      <section className="section-heading">
        <div>
          <p className="eyebrow">Records</p>
          <h2>{selectedHallName ? "Selected hall bookings" : "All bookings"}</h2>
        </div>
      </section>

      <BookingList bookings={bookings} isAdmin isLoading={isLoading} />
    </div>
  );
}
