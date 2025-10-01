import { Specializations } from "@/types/constants";
import { ColumnDef } from "@tanstack/react-table";
import type { MembersI } from ".";

export const columns: ColumnDef<MembersI, unknown>[] = [
    {
        id: "first_name",
        accessorKey: "first_name",
        header: () => <div className="flex items-center gap-2">First Name</div>,
        cell: ({ row }) => (
            <div className="font-medium truncate max-w-[320px]">
                {row.original.first_name}
            </div>
        ),
        enableSorting: true,
    },
    {
        id: "last_name",
        accessorKey: "last_name",
        header: () => <div className="flex items-center gap-2">Last Name</div>,
        cell: ({ row }) => (
            <div className="font-medium truncate max-w-[320px]">
                {row.original.last_name}
            </div>
        ),
        enableSorting: true,
    },
    {
        id: "email",
        accessorKey: "email",
        header: () => <div className="flex items-center gap-2">Email</div>,
        cell: ({ row }) => (
            <div className="font-medium truncate max-w-[320px]">
                {row.original.email}
            </div>
        ),
        enableSorting: true,
    },
    {
        id: "role",
        accessorKey: "role",
        header: () => <div className="flex items-center gap-2">Role</div>,
        cell: ({ row }) => (
            <div className="font-medium truncate max-w-[320px]">
                {row.original.role}
            </div>
        ),
        enableSorting: true,
    },
    {
        id: "title",
        accessorKey: "title",
        header: () => <div className="flex items-center gap-2">Title/Role</div>,
        cell: ({ row }) => (
            <div className="font-medium truncate max-w-[320px]">
                {row.original.title}
            </div>
        ),
        enableSorting: true,
    },
    {
        id: "specialization",
        accessorKey: "specialization",
        header: () => <div className="flex items-center gap-2">Specialization Area</div>,
        cell: ({ row }) => (
            <div className="font-medium truncate max-w-[320px]">
                {row.original.specialization ? Specializations[row.original.specialization] : ''}
            </div>
        ),
        enableSorting: true,
    },
];