// src/components/users/UsersTable.tsx
import { useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { ListUsersColumns } from "./users.columns";
import type { UserI } from "@/types/users";
import { useUsersList } from "@/queries/useUsersQuery";
import ActionButtons from "@/components/ActionButtons";

type Filters = {
  search?: string;
  role?: string;
  organization?: string;
  status?: "active" | "inactive" | "pending" | "suspended";
};

type Props = {
  filters: Filters;
  onEdit: (u: UserI) => void;
  onDelete: (id: string) => void;
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
  onResendInvite: (u: UserI) => void;
};

export default function UsersTable({
  filters,
  onEdit,
}: Props) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isLoading, isFetching, error } = useUsersList({
    page: pagination.pageIndex + 1,
    page_size: pagination.pageSize,
    search: filters.search || undefined,
    role: filters.role && filters.role !== "all" ? filters.role : undefined,
    organization:
      filters.organization && filters.organization !== "all"
        ? filters.organization
        : undefined,
    status: filters.status,
  });

  if (error)
    return (
      <div className="p-4 text-destructive text-sm">Failed to load users.</div>
    );

  return (
    <DataTable
      data={data?.items ?? []}
      columns={ListUsersColumns}
      isLoading={isLoading || isFetching}
      showRowNumbers
      enableGlobalFilter={false}
      // server pagination
      manualPagination
      pageCount={data?.pageCount ?? 1}
      pagination={pagination}
      onPaginationChange={setPagination}
      rowCount={data?.rowCount ?? 0}
      // actions – adapt to your DataTable’s row arg shape
    //   rowActions={(u: UserI) => (
    //     <div className="flex items-center gap-2">
    //       {u.status === "pending" && (
    //         <button
    //           className="text-sm underline"
    //           onClick={() => onResendInvite(u)}
    //         >
    //           Resend Invite
    //         </button>
    //       )}
    //       <button className="text-sm underline" onClick={() => onEdit(u)}>
    //         Edit
    //       </button>
    //       {u.status === "active" ? (
    //         <button
    //           className="text-sm underline"
    //           onClick={() => onSuspend(u.id)}
    //         >
    //           Suspend
    //         </button>
    //       ) : (
    //         <button
    //           className="text-sm underline"
    //           onClick={() => onActivate(u.id)}
    //         >
    //           Activate
    //         </button>
    //       )}
    //       <button
    //         className="text-sm text-red-600 underline"
    //         onClick={() => onDelete(u.id)}
    //       >
    //         Delete
    //       </button>
    //     </div>
    //   )}
      rowActions={(row) => (
        <ActionButtons
          entity={row}
          entityName="Member"
        //   onView={(e) => navigate(`/member/${(e as any).id}`)}
          onEdit={(row) =>onEdit(row)}
          deleteFunction={undefined}
        />
      )}
    />
  );
}
