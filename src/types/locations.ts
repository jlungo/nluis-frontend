export interface Region {
  id: string;
  name: string;
  code?: string;
}

export interface District {
  id: string;
  name: string;
  region_id: string;
  region?: Region;
  code?: string;
}

export interface Ward {
  id: string;
  name: string;
  district_id: string;
  district?: District;
  code?: string;
}

export interface Village {
  id: string;
  name: string;
  ward_id: string;
  ward?: Ward;
  code?: string;
}

export interface LocationFilters {
  search?: string;
  region_id?: string;
  district_id?: string;
  ward_id?: string;
}