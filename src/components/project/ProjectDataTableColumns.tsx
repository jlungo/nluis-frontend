import { ColumnDef } from "@tanstack/react-table";
import { cn, formatDate } from '@/lib/utils';
import { ProjectI } from "@/types/projects";
import { Badge } from "../ui/badge";
import { ProjectApprovalStatus, ProjectApprovalStatusColors } from "@/types/constants";
import { Progress } from "../ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { approvalStatus } from "./utils";

export const ProjectStatusBadge = ({ id, status }: { id: number; status: string; }) => (
  <Badge
    className={cn(`border border-accent font-medium ${ProjectApprovalStatusColors[id]}`)}
    variant='outline'
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
    accessorKey: 'reference_number',
    header: 'Reference Number/Id',
    cell: ({ row }: { row: { original: ProjectI } }) => (
      <div className="text-sm">{row.original.reference_number}</div>
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
        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 dark:text-blue-400 dark:bg-blue-950 text-sm font-medium rounded">
          {row.original.total_locality}
        </span>
      </div>
    ),
  },
  // {
  //   accessorKey: 'project_status',
  //   header: 'Project Status',
  //   cell: ({ row }: { row: { original: ProjectI } }) => {
  //     const readableStatus = ProjectStatus[row.original.project_status as keyof typeof ProjectStatus] || "Unknown";
  //     return (
  //       <div className="text-sm">
  //         <ProjectStatusBadge status={readableStatus} />
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: ({ row }: { row: { original: ProjectI } }) => {
      const progress =
        row.original?.localities && row.original.localities.length > 0
          ? row.original.localities.reduce((sum, locality) => sum + locality.progress, 0) /
          row.original.localities.length
          : 0;

      return (
        <div className="flex flex-col items-center gap-0.5">
          <p className="text-xs md:text-sm text-center lg:text-end min-w-24 shrink-0">{progress}% Complete</p>
          <Progress value={progress} className="min-w-32 max-w-48" />
        </div>
      )
    },
  },
  {
    accessorKey: 'approval_status',
    header: () => <div className="w-fit mx-auto">Approval Status</div>,
    cell: ({ row }: { row: { original: ProjectI } }) => {
      const approval_status = approvalStatus(row.original.localities)
      const readableApproval = ProjectApprovalStatus[approval_status as keyof typeof ProjectApprovalStatus] || "Unknown";
      return (
        <div className="text-sm w-fit mx-auto">
          <ProjectStatusBadge id={approval_status} status={readableApproval} />
        </div>
      );
    },
  },
  {
    accessorKey: 'organization',
    header: 'Organization',
    cell: ({ row }: { row: { original: ProjectI } }) => (
      <div className="text-sm max-w-40 overflow-hidden text-ellipsis">{row.original.organization}</div>
    ),
  },
];

// Table columns for localities project
export const LocalityTableColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'locality__name',
    header: 'Name',
  },
  {
    accessorKey: 'approval_status',
    enableSorting: false,
    header: () => (
      <p className="w-fit mx-auto">
        Approval Status
      </p>
    ),
    cell: ({ row }: { row: { original: NonNullable<ProjectI['localities']>[number] } }) => (
      <div className="w-fit mx-auto">
        <Badge className={`${ProjectApprovalStatusColors[row.original.approval_status]}`}>{ProjectApprovalStatus[row.original.approval_status]}</Badge>
      </div>
    ),
  },
  {
    accessorKey: 'remarks',
    enableSorting: false,
    header: () => (
      <p className="w-fit ml-6.5">
        Remarks
      </p>
    ),
    cell: ({ row }: { row: { original: NonNullable<ProjectI['localities']>[number] } }) => {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size='sm' className="rounded-full">View Remarks</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{row.original.locality__name} Remarks</DialogTitle>
              <DialogDescription>
                Project Locality Remarks for {row.original.locality__name}
              </DialogDescription>
            </DialogHeader>
            {row.original?.remarks && row.original.remarks.length > 0
              ? <p>{row.original?.remarks}</p>
              : (
                <div className="h-32 italic text-center flex flex-col items-center justify-center">
                  <p className="font-light text-xs md:text-sm">No remarks</p>
                </div>
              )
            }
          </DialogContent>
        </Dialog>
      )
    },
  },
  {
    accessorKey: 'progress',
    header: 'Progress',
    cell: ({ row }: { row: { original: NonNullable<ProjectI['localities']>[number] } }) => (
      <div className="flex flex-col-reverse lg:flex-row items-center gap-1">
        <Progress value={row.original.progress} className="min-w-32 max-w-48" />
        <p className="text-xs md:text-sm text-center lg:text-end min-w-24 shrink-0">{row.original.progress}% Complete</p>
      </div>
    ),
  },
];