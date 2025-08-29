import { Badge } from "@/components/ui/badge";
import { ProjectInterface } from "@/queries/useProjectQuery";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from '@/lib/utils';
import { Button } from "@/components/ui/button";

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-purple-100 text-purple-800'
};

const ProjectStatusBadge = ({ status }: { status: string }) => (
<Badge className={`${STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'} font-medium`}>
    {status}
</Badge>
);

// Columns for Village Land Use DataTable
export const VillageLandUseTableColumn: ColumnDef<ProjectInterface, unknown>[] = [
    {
      accessorKey: 'reg_date',
      header: 'Registration Date',
      cell: ({ row }: { row: { original: ProjectInterface } }) => (
        <div className="text-sm">{formatDate(row.original.reg_date)}</div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Project Name',
      cell: ({ row }: { row: { original: ProjectInterface } }) => (
        <Button
          variant="link"
          className="text-blue-600 hover:text-blue-800 font-medium p-0 h-auto justify-start"
        >
          {row.original.name}
        </Button>
      ),
    },
    {
      accessorKey: 'project_type',
      header: 'Project Type',
      cell: ({ row }: { row: { original: ProjectInterface } }) => (
        <div className="text-sm">{row.original.project_type_info.name}</div>
      ),
    },
    {
      accessorKey: 'station',
      header: 'Station',
      cell: ({ row }: { row: { original: ProjectInterface } }) => (
        <div className="text-sm">{row.original.station_info.name}</div>
      ),
    },
    {
      accessorKey: 'total_locality',
      header: 'Total Villages',
      cell: ({ row }: { row: { original: ProjectInterface } }) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-teal-100 text-teal-800 dark:text-teal-400 dark:bg-teal-900 text-sm font-medium rounded">
            {row.original.total_locality}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'current_task',
      header: 'Current Task',
      cell: ({ row }: { row: { original: ProjectInterface } }) => (
        <div className="text-sm">{row.original.current_task}</div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: ProjectInterface } }) => (
        <ProjectStatusBadge status={row.original.status_info} />
      ),
      enableSorting: false,
    },
];