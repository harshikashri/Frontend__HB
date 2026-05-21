export type HallFacility = {
  facility: {
    id: number;
    name: string;
  };
  is_active: boolean;
};

export type Hall = {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  facilities: HallFacility[];
};

export type HallTimeSlot = {
  start_time: string;
  end_time: string;
  duration_minutes: number;
};

export type HallFreeSlots = {
  hall_id: string;
  hall_name: string;
  capacity: number;
  floor: number;
  search_start_datetime: string;
  search_end_datetime: string;
  available_slots: HallTimeSlot[];
};

export type HallSearchFilters = {
  start_datetime: string;
  end_datetime: string;
  hall_id?: string;
  hall_name?: string;
  facility_id?: number;
  facility_name?: string;
};

export type HallSearchResultHall = {
  hall_id: string;
  hall_name: string;
  capacity: number;
  floor: number;
  available_slots: HallTimeSlot[];
};

export type HallSearchResult = {
  search_filters: HallSearchFilters;
  results: HallSearchResultHall[];
};

export type HallCreatePayload = {
  name: string;
  capacity: number;
  floor: number;
  is_active?: boolean;
};

export type HallUpdatePayload = {
  hall_name: string;
  name?: string;
  capacity?: number;
  floor?: number;
  is_active?: boolean;
};
