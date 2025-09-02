export interface UserI {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role?: string;
  organization?: string;
  organization_name?: string;
  user_type: number;
  gender: number;
  last_login?: string;
  created_at: string;
  is_verified: boolean;
  status: "active" | "inactive" | "pending" | "suspended";
  location: string;
}


export type CreateUserPayloadI = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  roleId: string;
  organization: string;
  gender: number;
  user_type: number | string;
};

export type UsersListParams = {
  page?: number;         // 1-based
  page_size?: number;    // page size
  search?: string;
  role?: string;
  organization?: string;
  status?: "active" | "inactive" | "pending" | "suspended";
};


