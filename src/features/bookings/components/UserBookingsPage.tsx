import { useState } from "react";

import { BookingList } from "./BookingList";
import { BookingTimingForm } from "./BookingTimingForm";
import { useBookings } from "../hooks/useBookings";
import type { Booking, BookingTimingPayload } from "../services/bookingTypes";

export function UserBookingsPage() {
  const { bookings, stats, isLoading, error, updateTiming, cancelBooking } = useBookings();
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mutatingBookingId, setMutatingBookingId] = useState<string | null>(null);

  async function handleUpdate(bookingId: string, payload: BookingTimingPayload) {
    setIsSaving(true);
    setFormError(null);
    setMessage(null);

    try {
      await updateTiming(bookingId, payload);
      setEditingBooking(null);
      setMessage("Booking timing updated.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to update booking.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancel(booking: Booking) {
    setMutatingBookingId(booking.id);
    setFormError(null);
    setMessage(null);

    try {
      await cancelBooking(booking.id);
      if (editingBooking?.id === booking.id) {
        setEditingBooking(null);
      }
      setMessage("Booking cancelled.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to cancel booking.");
    } finally {
      setMutatingBookingId(null);
    }
  }

  return (
    <div className="halls-page">
      <section className="page-intro">
        <div>
          <p className="eyebrow">User bookings</p>
          <h2>Manage bookings</h2>
        </div>
        <span className="signed-in">{stats.booked} active bookings</span>
      </section>

      <section className="booking-summary" aria-label="Booking summary">
        <div className="stat-card">
          <span>Total bookings</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="stat-card">
          <span>Active</span>
          <strong>{stats.booked}</strong>
        </div>
        <div className="stat-card">
          <span>Cancelled</span>
          <strong>{stats.cancelled}</strong>
        </div>
      </section>

      <BookingTimingForm
        booking={editingBooking}
        isSaving={isSaving}
        onCancel={() => setEditingBooking(null)}
        onSave={handleUpdate}
      />

      {(formError || error || message) ? (
        <section className="tool-panel compact-panel">
          <p className="eyebrow">Status</p>
          {formError || error ? <p className="form-message">{formError ?? error}</p> : null}
          {message ? <p className="success-message">{message}</p> : null}
        </section>
      ) : null}

      <section className="section-heading">
        <div>
          <p className="eyebrow">Schedule</p>
          <h2>Your bookings</h2>
        </div>
      </section>

      <BookingList
        bookings={bookings}
        isAdmin={false}
        isLoading={isLoading}
        mutatingBookingId={mutatingBookingId}
        onEdit={setEditingBooking}
        onCancelBooking={handleCancel}
      />
    </div>
  );
}
