import { ColumnDef } from "@tanstack/react-table";
import { ProjectI } from "@/types/projects";
import { Badge } from "../ui/badge";
import { ProjectApprovalStatus, ProjectApprovalStatusColors } from "@/types/constants";
import { Progress } from "../ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useLocalityProjectsCheckQuery } from "@/queries/useLocalityProjectsCheckQuery";

// Inline component for project requirement column
const ProjectRequirementColumn: React.FC<{ localityId: string; moduleLevel: string }> = ({
  localityId,
  moduleLevel,
}) => {
  const { data: projectsCheck, isLoading } = useLocalityProjectsCheckQuery(localityId);

  if (isLoading) {
    return (
      <div className="w-fit mx-auto">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  // Determine which requirement to check based on module level
  const isLandUse = /-land-use-/.test(moduleLevel);
  const hasRequirement = isLandUse 
    ? projectsCheck?.has_land_use_project 
    : projectsCheck?.has_ccro_project;

  return (
    <div className="w-fit mx-auto">
      <Badge 
        variant={hasRequirement ? "default" : "secondary"}
        className={hasRequirement 
          ? "bg-green-500/20 text-green-700 dark:text-green-400" 
          : "bg-red-500/20 text-red-700 dark:text-red-400"
        }
      >
        {hasRequirement ? "Yes" : "No"}
      </Badge>
    </div>
  );
};

export const createLocalityColumnsWithRequirements = (moduleLevel: string): ColumnDef<any>[] => [
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
        accessorKey: 'project_requirement',
        enableSorting: false,
        header: () => {
            // Determine the requirement label based on module level
            const isLandUse = /-land-use-/.test(moduleLevel);
            const label = isLandUse ? 'Land Use Plan' : 'CCRO Project';
            return <p className="w-fit mx-auto">{label}</p>;
        },
        cell: ({ row }: { row: { original: NonNullable<ProjectI['localities']>[number] } }) => (
            <ProjectRequirementColumn 
                localityId={row.original.locality__id}
                moduleLevel={moduleLevel}
            />
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
