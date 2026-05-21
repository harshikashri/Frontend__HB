import { useState } from "react";
import type { FormEvent } from "react";

import { BookingList } from "./BookingList";
import { useBookings } from "../hooks/useBookings";

export function AdminBookingsPage() {
  const [draftUserId, setDraftUserId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const { bookings, stats, isLoading, error } = useBookings({
    userId: selectedUserId.trim() || undefined,
  });

  function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSelectedUserId(draftUserId.trim());
  }

  function clearFilter() {
    setDraftUserId("");
    setSelectedUserId("");
  }

  return (
    <div className="halls-page">
      <section className="page-intro">
        <div>
          <p className="eyebrow">Admin bookings</p>
          <h2>Booking overview</h2>
        </div>
        <span className="signed-in">
          {selectedUserId ? "Filtered by user" : "All users"}
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
            <h2>User filter</h2>
          </div>
          {selectedUserId ? (
            <button className="button button-secondary" type="button" onClick={clearFilter}>
              Clear
            </button>
          ) : null}
        </div>

        <form className="booking-filter-form" onSubmit={handleFilter}>
          <label htmlFor="booking-user-id">User ID</label>
          <input
            id="booking-user-id"
            value={draftUserId}
            placeholder="Paste a user UUID"
            onChange={(event) => setDraftUserId(event.target.value)}
          />
          <button className="button button-primary" type="submit">
            View user bookings
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
          <h2>{selectedUserId ? "Selected user bookings" : "All bookings"}</h2>
        </div>
      </section>

      <BookingList bookings={bookings} isAdmin isLoading={isLoading} />
    </div>
  );
}
