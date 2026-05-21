export type BookingStatus = "booked" | "cancelled" | string;

export type Booking = {
  id: string;
  user_id: string;
  user_name: string;
  hall_id: string;
  hall_name: string;
  start_datetime: string;
  end_datetime: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
};

export type BookingCreatePayload = {
  hall_name: string;
  start_datetime: string;
  end_datetime: string;
};

export type BookingTimingPayload = {
  start_datetime: string;
  end_datetime: string;
};
