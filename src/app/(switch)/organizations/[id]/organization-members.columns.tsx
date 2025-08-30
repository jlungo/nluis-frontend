// src/components/tables/members-columns.tsx
import { UserType } from "@/queries/useUsersQuery";
import { ColumnDef } from "@tanstack/react-table";




export const ListOrganizationMembersColumns : ColumnDef<UserType, unknown>[] =[
  {
    id: "name",
    header: () => <div className="flex items-center gap-2">Name</div>,
    accessorFn: (m) => `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || "-",
    cell: ({ getValue }) => (
      <div className="font-medium truncate max-w-[280px]">{String(getValue())}</div>
    ),
    enableSorting: true,
  },
  {
    id: "email",
    header: () => <div className="flex items-center gap-2">Email</div>,
    accessorKey: "email",
    cell: ({ row }) => <span>{row.original.email ?? "-"}</span>,
    enableSorting: true,
  },
  {
    id: "role",
    header: () => <div className="flex items-center gap-2">Role</div>,
    accessorKey: "role",
    cell: ({ row }) => <span>{row.original.role ?? "-"}</span>,
    enableSorting: true,
  },

];
