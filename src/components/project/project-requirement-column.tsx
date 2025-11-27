import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useLocalityProjectsCheckQuery } from "@/queries/useLocalityProjectsCheckQuery";

interface ProjectRequirementColumnProps {
  localityId: string;
  moduleLevel: string;
}

export const ProjectRequirementColumn: React.FC<ProjectRequirementColumnProps> = ({
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
