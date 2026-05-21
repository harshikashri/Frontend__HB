import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { BookingList } from "../../bookings/components/BookingList";
import { BookingTimingForm } from "../../bookings/components/BookingTimingForm";
import { useBookings } from "../../bookings/hooks/useBookings";
import type {
  Booking,
  BookingCreatePayload,
  BookingTimingPayload,
} from "../../bookings/services/bookingTypes";
import { useFavorites } from "../../favorites/hooks/useFavorites";
import { useHalls } from "../hooks/useHalls";
import { useHallAvailability } from "../hooks/useHallAvailability";
import { HallAvailabilityCalendar } from "./HallAvailabilityCalendar";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

export function UserHallDetailPage() {
  const { hallName } = useParams();
  const { halls, isLoading, error } = useHalls();
  const bookings = useBookings();
  const favorites = useFavorites();
  const [selectedAvailabilityDate, setSelectedAvailabilityDate] = useState(() => toDateInputValue(new Date()));
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mutatingBookingId, setMutatingBookingId] = useState<string | null>(null);

  const hall = useMemo(() => {
    if (!hallName) {
      return null;
    }

    return halls.find((candidate) => candidate.name === hallName) ?? null;
  }, [hallName, halls]);

  const hallBookings = useMemo(() => {
    if (!hall) {
      return [];
    }

    return bookings.bookings.filter((booking) => booking.hall_name === hall.name);
  }, [bookings.bookings, hall]);

  const availabilityStartDateTime = `${selectedAvailabilityDate}T00:00:00`;
  const availabilityEndDateTime = `${addDays(selectedAvailabilityDate, 1)}T00:00:00`;
  const availability = useHallAvailability({
    hallId: hall?.id,
    startDateTime: availabilityStartDateTime,
    endDateTime: availabilityEndDateTime,
  });

  if (!hallName) {
    return <Navigate to="/halls" replace />;
  }

  async function handleAddFavorite() {
    if (!hall) {
      return;
    }

    setFormError(null);
    setMessage(null);

    try {
      await favorites.addFavorite(hall.name);
      setMessage(`${hall.name} added to favorites.`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to add favorite.");
    }
  }

  async function handleRemoveFavorite() {
    if (!hall) {
      return;
    }

    setFormError(null);
    setMessage(null);

    try {
      await favorites.removeFavorite(hall.name);
      setMessage(`${hall.name} removed from favorites.`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to remove favorite.");
    }
  }

  async function handleBook(payload: BookingCreatePayload) {
    setIsSaving(true);
    setFormError(null);
    setMessage(null);

    try {
      await bookings.bookHall(payload);
      await availability.reload();
      setMessage(`${payload.hall_name} booked successfully.`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create booking.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateBooking(bookingId: string, payload: BookingTimingPayload) {
    setIsSaving(true);
    setFormError(null);
    setMessage(null);

    try {
      await bookings.updateTiming(bookingId, payload);
      await availability.reload();
      setEditingBooking(null);
      setMessage("Booking timing updated.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to update booking.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancelBooking(booking: Booking) {
    setMutatingBookingId(booking.id);
    setFormError(null);
    setMessage(null);

    try {
      await bookings.cancelBooking(booking.id);
      await availability.reload();
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

  if (isLoading) {
    return <p className="muted-text">Loading hall details...</p>;
  }

  if (!hall) {
    return (
      <section className="empty-state">
        <p className="eyebrow">Hall not found</p>
        <h3>This hall is not available right now.</h3>
        <p>Return to the halls list to choose another available hall.</p>
        <Link className="button button-primary" to="/halls">
          Back to halls
        </Link>
      </section>
    );
  }

  return (
    <div className="halls-page">
      <section className="hall-detail-panel">
        <div className="hall-detail-header">
          <div>
            <p className="eyebrow">Hall details</p>
            <h2>{hall.name}</h2>
          </div>
          <div className="detail-actions">
            <Link className="button button-secondary" to="/halls">
              Back to halls
            </Link>
            <button
              aria-label={favorites.isFavorite(hall.name) ? `Remove ${hall.name} from favorites` : `Add ${hall.name} to favorites`}
              className={`favorite-star-button detail-favorite-button ${favorites.isFavorite(hall.name) ? "favorite-star-active" : ""}`}
              type="button"
              title={favorites.isFavorite(hall.name) ? "Remove favorite" : "Add favorite"}
              disabled={favorites.mutatingHallName === hall.name}
              onClick={favorites.isFavorite(hall.name) ? handleRemoveFavorite : handleAddFavorite}
            >
              {favorites.isFavorite(hall.name) ? "★" : "☆"}
            </button>
          </div>
        </div>

        <dl className="hall-detail-facts">
          <div>
            <dt>Floor</dt>
            <dd>{hall.floor}</dd>
          </div>
          <div>
            <dt>Capacity</dt>
            <dd>{hall.capacity}</dd>
          </div>
          <div>
            <dt>Facilities</dt>
            <dd>{hall.facilities.length}</dd>
          </div>
        </dl>

        {hall.facilities.length > 0 ? (
          <div className="facility-list detail-facilities">
            {hall.facilities.map(({ facility }) => (
              <span key={facility.id}>{facility.name}</span>
            ))}
          </div>
      ) : null}
      </section>

      <HallAvailabilityCalendar
        availability={availability.availability}
        selectedDate={selectedAvailabilityDate}
        isLoading={availability.isLoading}
        isBooking={isSaving}
        error={availability.error}
        onDateChange={setSelectedAvailabilityDate}
        onBookSelected={handleBook}
      />

      {(formError || error || bookings.error || message) ? (
        <section className="tool-panel compact-panel">
          <p className="eyebrow">Status</p>
          {formError || error || bookings.error ? (
            <p className="form-message">{formError ?? error ?? bookings.error}</p>
          ) : null}
          {message ? <p className="success-message">{message}</p> : null}
        </section>
      ) : null}

      {editingBooking ? (
        <BookingTimingForm
          booking={editingBooking}
          isSaving={isSaving}
          onCancel={() => setEditingBooking(null)}
          onSave={handleUpdateBooking}
        />
      ) : null}

      <section className="section-heading">
        <div>
          <p className="eyebrow">This hall</p>
          <h2>Your bookings here</h2>
        </div>
      </section>

      <BookingList
        bookings={hallBookings}
        isAdmin={false}
        isLoading={bookings.isLoading}
        mutatingBookingId={mutatingBookingId}
        onEdit={setEditingBooking}
        onCancelBooking={handleCancelBooking}
      />
    </div>
  );
}
