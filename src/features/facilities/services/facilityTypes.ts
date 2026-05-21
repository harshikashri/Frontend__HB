export type Facility = {
  id: number;
  name: string;
  created_at?: string;
};

export type FacilityCreatePayload = {
  name: string;
};
