import { useParams } from "react-router";
import ViewWorkflow from "@/components/workflow/ViewWorkflow";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useProjectQuery } from "@/queries/useProjectQuery";
import { Spinner } from "@/components/ui/spinner";

export default function Page() {
  const { project_id, locality_project_id } = useParams<{ locality_project_id: string; project_id: string }>();

  const { data: project, isLoading: isLoadingProject } = useProjectQuery(project_id);

  const relatedProject = project && project.related_projects && project.related_projects.length > 0 ? project.related_projects[0] : null;

  const currentLocale = project ? project.localities?.find(locale => String(locale.id) === locality_project_id) : null

  const relatedLocality = relatedProject ? relatedProject.localities?.find(locale => locale.locality__id === currentLocale?.locality__id) : null

  if (!project_id)
    return <div className='flex flex-col items-center justify-center h-60'>
      <p className='text-muted-foreground'>No Project Id!</p>
    </div>

  if (!locality_project_id)
    return <div className='flex flex-col items-center justify-center h-60'>
      <p className='text-muted-foreground'>No Locality Project Id!</p>
    </div>

  if (isLoadingProject) return <div className='flex flex-col items-center justify-center h-60'>
    <Spinner />
    <p className="text-muted-foreground mt-4">Loading workflow and data...</p>
  </div>

  return (
    <div className="flex w-full min-h-screen relative overflow-x-hidden">
      <div className="flex-1 overflow-y-auto">
        <ViewWorkflow
          pageTitle={"Regional Land Use monitoring-and-evaluation Project Workflow"}
          projectId={project_id}
          projectLocalityId={locality_project_id}
          topLevelModule={"monitoring-and-evaluation"}
          module={"land-uses"}
          moduleLevel={"regional-land-use-mne"}
          worklowCategory={"workflow"}
        />
      </div>

      {relatedProject && relatedLocality && (
        <Sheet>
          <TooltipProvider>
            <Tooltip>
              <SheetTrigger asChild>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="icon"
                    className="scale-150 mt-10 rounded-full fixed -right-2 top-24"
                  >
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Open workflow menu</span>
                  </Button>
                </TooltipTrigger>
              </SheetTrigger>
              <TooltipContent side="right" sideOffset={10}>
                <p>Open Land Use Workflow</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <SheetContent side="right" className="w-[90%] sm:max-w-screen sm:w-[calc((100vw-200px))] xl:w-[calc(100vw-216px)] 2xl:w-[calc(100vw-224px)] overflow-y-auto overflow-x-hidden">
            <div className="py-4 bg-accent/50 h-fit">
              <ViewWorkflow
                pageTitle={"Regional Land Use, Land Use Workflow"}
                projectId={relatedProject.id}
                projectLocalityId={String(relatedLocality.id)}
                module={"land-uses"}
                moduleLevel={"regional-land-use"}
                worklowCategory={"workflow"}
                noLink
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
