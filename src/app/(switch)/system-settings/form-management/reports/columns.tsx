import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ReportTemplateProps } from "@/queries/useReportTemplateQuery";
import { Check, X } from "lucide-react";

export const Columns: ColumnDef<ReportTemplateProps>[] = [
  {
    accessorKey: "name",
    header: "Template Name",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        {row.original.description && (
          <span className="text-xs text-muted-foreground line-clamp-1">
            {row.original.description}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "module_name",
    header: "Module",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.module_name}</Badge>
    ),
  },
  {
    accessorKey: "level_name",
    header: "Locality Level",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.level_name}</Badge>
    ),
  },
  {
    accessorKey: "placeholders",
    header: "Placeholders",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono text-xs">
          {row.original.placeholders.length}
        </Badge>
        {row.original.placeholders.length > 0 && (
          <span className="text-xs text-muted-foreground">fields</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) =>
      row.original.is_active ? (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          <Check className="w-3 h-3 mr-1" />
          Active
        </Badge>
      ) : (
        <Badge variant="secondary">
          <X className="w-3 h-3 mr-1" />
          Inactive
        </Badge>
      ),
  },
  {
    accessorKey: "created_date",
    header: "Created",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm">
          {new Date(row.original.created_date).toLocaleDateString()}
        </span>
        {row.original.created_by_name && (
          <span className="text-xs text-muted-foreground">
            by {row.original.created_by_name}
          </span>
        )}
      </div>
    ),
  },
];
