import { OrganizationStatusE, type OrganizationI } from '@/types/organizations';
import { ColumnDef } from '@tanstack/react-table';
import { Badge, Building2, Mail, MapPin, Users } from 'lucide-react';

export const ListOrganizationsColumns: ColumnDef<OrganizationI, unknown>[] = [
  {
    accessorKey: "name",
    header: () => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary" /> Organization
      </div>
    ),
    cell: ({ row }) => {
      const org = row.original;
      return (
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
            {org.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="font-medium leading-tight">{org.name}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" /> {org.primary_email || "-"}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type_name",
    header: () => (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary" /> Type
      </div>
    ),
    cell: ({ getValue }) => <span className="whitespace-nowrap">{String(getValue() ?? "-")}</span>,
    enableSorting: true,
  },
  {
    id: "location",
    header: () => (
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" /> Location
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="truncate max-w-[320px]">{row.original.address || "-"}</span>
      </div>
    ),
    sortingFn: (a, b) => {
      const av = (a.original.address || "").toString().toLowerCase();
      const bv = (b.original.address || "").toString().toLowerCase();
      return av.localeCompare(bv);
    },
  },
  {
    accessorKey: "members_count",
    header: () => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" /> Members
      </div>
    ),
    cell: ({ getValue }) => <div className="text-center w-full">{Number(getValue() ?? 0)}</div>,
    enableSorting: true,
    size: 90,
  },
  {
    accessorKey: "projects_count",
    header: () => <div className="text-center w-full">Projects</div>,
    cell: ({ getValue }) => <div className="text-center w-full">{Number(getValue() ?? 0)}</div>,
    enableSorting: true,
    size: 90,
  },
  {
    accessorKey: "status",
    header: () => <div className="whitespace-nowrap">Status</div>,
    cell: ({ row }) => {
      const s = row.original.status;
      const cls =
        s === OrganizationStatusE.ACTIVE
          ? "bg-progress-completed/10 text-progress-completed border-progress-completed/20"
          : s === OrganizationStatusE.PENDING
          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
          : "bg-red-100 text-red-800 border-red-200";
      const text = s === OrganizationStatusE.ACTIVE ? "Active" : s === OrganizationStatusE.PENDING ? "Pending" : "Inactive";
      return <Badge className={cls}>{text}</Badge>;
    },
    enableSorting: true,
  },
];

