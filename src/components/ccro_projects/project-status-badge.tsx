import { ProjectApprovalStatusColors } from "@/types/constants";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

export const ProjectStatusBadge = ({ id, status }: { id: number; status: string; }) => (
    <Badge
        className={cn(`border border-accent font-medium ${ProjectApprovalStatusColors[id]}`)}
        variant='outline'
    >
        {status}
    </Badge>
);