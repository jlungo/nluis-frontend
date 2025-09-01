import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from '@/lib/utils';
import { ProjectI } from "@/types/projects";
import { Badge } from "../ui/badge";
import { ProjectStatus, ProjectApprovalStatus, ProjectStatusColors } from "@/types/constants";

export const ProjectStatusBadge = ({ status }: { status: string }) => (
  <Badge
    className={`${
      ProjectStatusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    } font-medium`}
  >
    {status}
  </Badge>
);

// Columns for Projects DataTable
export const ProjectsDataTableColumn: ColumnDef<ProjectI, unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Project Name',
    cell: ({ row }: { row: { original: ProjectI } }) => (
      <div className="text-sm">{row.original.name}</div>
    ),
  },
  {
    accessorKey: 'registration_date',
    header: 'Registration Date',
    cell: ({ row }: { row: { original: ProjectI } }) => (
      <div className="text-sm">{formatDate(row.original.registration_date)}</div>
    ),
  },
  {
    accessorKey: 'authorization_date',
    header: 'Authorization Date',
    cell: ({ row }: { row: { original: ProjectI } }) => (
      <div className="text-sm">{formatDate(row.original.authorization_date)}</div>
    ),
  },
  {
    accessorKey: 'budget',
    header: 'Budget',
    cell: ({ row }: { row: { original: ProjectI } }) => (
      <div className="text-sm">{Number(row.original.budget).toLocaleString('en-UK')}</div>
    ),
  },
  {
    accessorKey: 'total_locality',
    header: 'Total Localities',
    cell: ({ row }: { row: { original: ProjectI } }) => (
      <div className="text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 dark:text-blue-400 dark:bg-blue-900 text-sm font-medium rounded">
          {row.original.total_locality}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'project_status',
    header: 'Project Status',
    cell: ({ row }: { row: { original: ProjectI } }) => {
      const readableStatus = ProjectStatus[row.original.project_status as keyof typeof ProjectStatus] || "Unknown";
      return (
        <div className="text-sm">
          <ProjectStatusBadge status={readableStatus} />
        </div>
      );
    },
  },
  {
    accessorKey: 'approval_status',
    header: 'Approval Status',
    cell: ({ row }: { row: { original: ProjectI } }) => {
      const readableApproval = ProjectApprovalStatus[row.original.approval_status as keyof typeof ProjectApprovalStatus] || "Unknown";
      return (
        <div className="text-sm">
          <ProjectStatusBadge status={readableApproval} />
        </div>
      );
    },
  },
];

// Table columns for localities project
export const LocalityTableColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'locality__name',
    header: 'Name',
  },
];