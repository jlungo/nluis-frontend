// src/components/tables/projects-columns.tsx
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ProjectI } from "@/types/projects";

const formatDate = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString() : "-";

export const ListOrganizationProjectsColumns: ColumnDef<ProjectI, unknown>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: () => <div className="flex items-center gap-2">Name</div>,
    cell: ({ row }) => (
      <div className="font-medium truncate max-w-[320px]">
        {row.original.name}
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "status",
    header: () => <div className="flex items-center gap-2">Status</div>,
    accessorFn: (p) => p.project_type_info.name ?? "-",
    cell: ({ getValue }) => {
      const v = String(getValue() ?? "-");
      const tone =
        v.toLowerCase() === "active"
          ? "bg-progress-completed/10 text-progress-completed border-progress-completed/20"
          : v.toLowerCase() === "pending"
          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
          : "bg-muted text-foreground/80 border-muted-foreground/20";
      return <Badge className={tone}>{v}</Badge>;
    },
    enableSorting: true,
  },
  {
    id: "start_date",
    header: () => <div className="flex items-center gap-2">Start Date</div>,
    accessorFn: (p) => (p as any).reg_date,
    cell: ({ getValue }) => <span>{formatDate(getValue() as any)}</span>,
    enableSorting: true,
  },
];
