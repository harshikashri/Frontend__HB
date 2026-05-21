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
