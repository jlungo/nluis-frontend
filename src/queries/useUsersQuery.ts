// src/queries/users.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateUserPayloadI, UserI, UsersListParams } from "@/types/users";
import { usersService } from "@/services/user.services";

export const USERS_KEY = ["users"] as const;

// Paginated list – returns { items, rowCount, pageCount }
export function useUsersList(params: Required<Pick<UsersListParams, "page" | "page_size">> & Omit<UsersListParams, "page" | "page_size">) {
  return useQuery({
    queryKey: [USERS_KEY[0], params],
    queryFn: () => usersService.list(params),
    // keepPreviousData: true,
    staleTime: 30_000,
    select: (resp) => {
      const items = resp.results ?? [];
      const rowCount = resp.count ?? items.length;
      const pageCount = Math.max(1, Math.ceil(rowCount / params.page_size));
      return { items, rowCount, pageCount };
    },
  });
}

export function useCreateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayloadI) => usersService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useUpdateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (u: UserI) => usersService.update(u),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useDeleteUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}
