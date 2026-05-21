import { useBookingNotifications } from "../hooks/useBookingNotifications";

export function NotificationTray() {
	const { notifications, isConnected, dismissNotification, clearNotifications } =
		useBookingNotifications();

	if (notifications.length === 0) {
		return isConnected ? (
			<section className="notification-tray notification-tray-idle" aria-live="polite">
				<span className="notification-dot" />
				<p>Listening for booking updates.</p>
			</section>
		) : null;
	}

	return (
		<section className="notification-tray" aria-live="polite">
			<div className="notification-tray-header">
				<div>
					<p className="eyebrow">Notifications</p>
					<h2>Booking updates</h2>
				</div>
				<button className="button button-secondary" type="button" onClick={clearNotifications}>
					Clear all
				</button>
			</div>

			<div className="notification-list">
				{notifications.map((notification) => (
					<article className="notification-card" key={notification.id}>
						<div className="notification-card-header">
							<div>
								<p className="notification-type">{notification.type.replaceAll("_", " ")}</p>
								<strong>{notification.message}</strong>
							</div>
							<button
								className="notification-dismiss"
								type="button"
								onClick={() => dismissNotification(notification.id)}
							>
								Dismiss
							</button>
						</div>
						<div className="notification-meta">
							{notification.user_name ? <span>{notification.user_name}</span> : null}
							{notification.booking?.hall_name ? <span>{notification.booking.hall_name}</span> : null}
							<span>{new Date(notification.created_at).toLocaleString()}</span>
						</div>
					</article>
				))}
			</div>
		</section>
	);
}