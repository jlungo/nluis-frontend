// src/components/tables/members-columns.tsx
import { UserI } from "@/types/users";
import { ColumnDef } from "@tanstack/react-table";

const fallback = (v: unknown) =>
  v === null || v === undefined || v === "" ? "-" : String(v);

// Try to surface org name if it's an object; else show raw value/id

// Adjust these to match your backend enums
const GENDER_LABELS: Record<string | number, string> = {
  1: "Male",
  2: "Female",
};
const USER_TYPE_LABELS: Record<string | number, string> = {
  1: "Staff",
  2: "Planner",
  3: "Officer",
  4: "Stakeholder",
};

export const ListUsersColumns: ColumnDef<UserI, unknown>[] = [
  {
    id: "name",
    header: () => <div className="flex items-center gap-2">Name</div>,
    accessorFn: (m) =>
      `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || "-",
    cell: ({ getValue }) => (
      <div className="font-medium truncate max-w-[280px]">
        {String(getValue())}
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "email",
    header: () => <div className="flex items-center gap-2">Email</div>,
    accessorKey: "email",
    cell: ({ row }) => <span>{fallback(row.original.email)}</span>,
    enableSorting: true,
  },
  {
    id: "phone",
    header: () => <div className="flex items-center gap-2">Phone</div>,
    accessorKey: "phone",
    cell: ({ row }) => <span>{fallback(row.original.phone)}</span>,
    enableSorting: true,
  },
  {
    id: "role",
    header: () => <div className="flex items-center gap-2">Role</div>,
    accessorKey: "role",
    cell: ({ row }) => <span>{fallback(row.original.role)}</span>,
    enableSorting: true,
  },
  {
    id: "organization_name",
    header: () => <div className="flex items-center gap-2">Organization</div>,
    cell: ({ row }) => <span>{fallback(row.original.organization_name)}</span>,
    enableSorting: true,
  },
  {
    id: "user_type",
    header: () => <div className="flex items-center gap-2">User Type</div>,
    accessorKey: "user_type",
    cell: ({ row }) => {
      const raw = row.original.user_type as any;
      const label = USER_TYPE_LABELS[raw] ?? fallback(raw);
      return label;
    },
    enableSorting: true,
  },
  {
    id: "gender",
    header: () => <div className="flex items-center gap-2">Gender</div>,
    accessorKey: "gender",
    cell: ({ row }) => {
      const raw = row.original.gender as any;
      const label = GENDER_LABELS[raw] ?? fallback(raw);
      return label;
    },
    enableSorting: true,
  },
];