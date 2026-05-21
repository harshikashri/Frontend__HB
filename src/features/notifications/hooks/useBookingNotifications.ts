import { useEffect, useState } from "react";

import { API_CONFIG } from "../../../app/config/api";
import { useAuth } from "../../auth/hooks/useAuth";

export const BOOKING_NOTIFICATION_EVENT = "hall-booking-notification";

export type BookingNotification = {
	id: string;
	type: string;
	message: string;
	user_name?: string;
	hall?: {
		id?: string;
		name?: string;
	};
	booking?: {
		id: string;
		hall_id: string;
		hall_name: string;
		start_datetime: string;
		end_datetime: string;
		status: string;
	};
	created_at: string;
};

export function useBookingNotifications() {
	const { token, user } = useAuth();
	const [notifications, setNotifications] = useState<BookingNotification[]>([]);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (!token || !user) {
			setNotifications([]);
			setIsConnected(false);
			return;
		}

		const source = new EventSource(
			`${API_CONFIG.bookingBaseUrl}/notifications/stream?token=${encodeURIComponent(token)}`,
		);

		source.onopen = () => {
			setIsConnected(true);
		};

		source.onmessage = (event) => {
			try {
				const notification = JSON.parse(event.data) as BookingNotification;
				setNotifications((current) => [notification, ...current].slice(0, 5));
				window.dispatchEvent(
					new CustomEvent(BOOKING_NOTIFICATION_EVENT, {
						detail: notification,
					}),
				);
			} catch {
				setNotifications((current) => current);
			}
		};

		source.addEventListener("notification", (event) => {
			const messageEvent = event as MessageEvent<string>;
			try {
				const notification = JSON.parse(messageEvent.data) as BookingNotification;
				setNotifications((current) => [notification, ...current].slice(0, 5));
				window.dispatchEvent(
					new CustomEvent(BOOKING_NOTIFICATION_EVENT, {
						detail: notification,
					}),
				);
			} catch {
				setNotifications((current) => current);
			}
		});

		source.onerror = () => {
			setIsConnected(false);
		};

		return () => {
			source.close();
			setIsConnected(false);
		};
	}, [token, user]);

	const dismissNotification = (id: string) => {
		setNotifications((current) => current.filter((notification) => notification.id !== id));
	};

	const clearNotifications = () => {
		setNotifications([]);
	};

	return {
		notifications,
		isConnected,
		dismissNotification,
		clearNotifications,
	};
}