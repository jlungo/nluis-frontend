export interface UserI {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role?: string;
  role_id?: string;
  organization?: string;
  organization_name?: string;
  user_type: number;
  gender: number;
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
  page?: number; // 1-based
  page_size?: number; // page size
  keyword?: string;
  role?: string;
  organization?: string;
  is_verified?: string;
};
