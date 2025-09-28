import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ProjectI } from "@/types/projects";
import { Badge } from "../ui/badge";
import { ProjectApprovalStatus, ProjectApprovalStatusColors } from "@/types/constants";
import { Progress } from "../ui/progress";

// Table columns for localities project
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LocalityColumns: ColumnDef<any>[] = [
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
                <p className="text-xs md:text-sm text-center lg:text-end min-w-24 shrink-0">{Number.isInteger(row.original.progress)
                    ? row.original.progress
                    : Math.floor(row.original.progress * 100) / 100}% Complete</p>
            </div>
        ),
    },
];