// src/services/users.ts
import api from "@/lib/axios";
import { PaginatedResponseI } from "@/types/pagination";
import type { CreateUserPayloadI, UserI, UsersListParams } from "@/types/users";

export const usersService = {
  list: async (params: UsersListParams) =>
    (await api.get<PaginatedResponseI<UserI>>("/auth/users/", { params })).data,
  create: async (payload: CreateUserPayloadI) => {
    const data = {
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      phone: payload.phone,
      role_id: payload.roleId,
      organization: payload.organization,
      gender: payload.gender,
      user_type: payload.user_type,
    };
    return (await api.post("/auth/users/create/", data)).data;
  },
  update: async (u: UserI) =>
    (
      await api.put(`/auth/users/${u.id}/`, {
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        organization: u.organization,
        user_type: u.user_type,
      })
    ).data,
  remove: async (id: string) => (await api.delete(`/auth/users/${id}/`)).data,
};
