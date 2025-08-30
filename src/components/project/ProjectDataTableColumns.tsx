import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from '@/lib/utils';
import { ProjectI } from "@/types/projects";
import { Badge } from "../ui/badge";

// const STATUS_COLORS = {
//   draft: 'bg-gray-100 text-gray-800',
//   'in-progress': 'bg-blue-100 text-blue-800',
//   approved: 'bg-green-100 text-green-800',
//   rejected: 'bg-red-100 text-red-800',
//   completed: 'bg-purple-100 text-purple-800'
// };

// const ProjectStatusBadge = ({ status }: { status: string }) => (
// <Badge className={`${STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'} font-medium`}>
//     {status}
// </Badge>
// );

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
          <span className="inline-flex items-center justify-center w-6 h-6 bg-teal-100 text-teal-800 dark:text-teal-400 dark:bg-teal-900 text-sm font-medium rounded">
            {row.original.total_locality}
          </span>
        </div>
      ),
    },
];


// Table columns for localities project
export const LocalityTableColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'level',
    header: 'Level',
    cell: ({ row }) => {
      const level = row.original.level;
      const levelNames: Record<string, string> = {
        '1': 'Country',
        '2': 'Zonal',
        '3': 'Region',
        '4': 'District',
        '5': 'Ward',
        '6': 'Village'
      };
      return <Badge variant="outline">{levelNames[level] || level}</Badge>;
    },
  },
  {
    accessorKey: 'id',
    header: 'ID',
  },
];