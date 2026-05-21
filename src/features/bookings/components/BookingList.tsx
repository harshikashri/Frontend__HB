import type { Booking } from "../services/bookingTypes";
import { formatDateTime } from "../utils/dateTime";

type BookingListProps = {
  bookings: Booking[];
  isAdmin: boolean;
  isLoading: boolean;
  mutatingBookingId?: string | null;
  onEdit?: (booking: Booking) => void;
  onCancelBooking?: (booking: Booking) => void;
};

export function BookingList({
  bookings,
  isAdmin,
  isLoading,
  mutatingBookingId,
  onEdit,
  onCancelBooking,
}: BookingListProps) {
  if (isLoading) {
    return <p className="muted-text">Loading bookings...</p>;
  }

  if (bookings.length === 0) {
    return (
      <section className="empty-state">
        <p className="eyebrow">No bookings</p>
        <h3>{isAdmin ? "No bookings match this view." : "Your schedule is open."}</h3>
        <p>
          {isAdmin
            ? "Bookings will appear here as users reserve halls."
            : "Create a booking to reserve a hall for your next session."}
        </p>
      </section>
    );
  }

  return (
    <section className="booking-list">
      {bookings.map((booking) => {
        const isCancelled = booking.status === "cancelled";

        return (
          <article className={`booking-card ${isCancelled ? "booking-card-cancelled" : ""}`} key={booking.id}>
            <div className="booking-card-main">
              <div>
                <p className="eyebrow">{isAdmin ? booking.user_name : "Your booking"}</p>
                <h3>{booking.hall_name}</h3>
              </div>
              <span className={`status-pill ${isCancelled ? "disabled" : "active"}`}>
                {isCancelled ? "Cancelled" : "Booked"}
              </span>
            </div>

            <dl className="booking-times">
              <div>
                <dt>Starts</dt>
                <dd>{formatDateTime(booking.start_datetime)}</dd>
              </div>
              <div>
                <dt>Ends</dt>
                <dd>{formatDateTime(booking.end_datetime)}</dd>
              </div>
            </dl>

            {isAdmin ? (
              <div className="booking-meta">
                <span>User ID</span>
                <code>{booking.user_id}</code>
              </div>
            ) : null}

            {!isAdmin && !isCancelled ? (
              <div className="hall-actions">
                <button className="button button-secondary" type="button" onClick={() => onEdit?.(booking)}>
                  Update timing
                </button>
                <button
                  className="button button-danger"
                  type="button"
                  disabled={mutatingBookingId === booking.id}
                  onClick={() => onCancelBooking?.(booking)}
                >
                  Cancel booking
                </button>
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
