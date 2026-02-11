import { useParams } from "react-router";
import ViewWorkflow from "@/components/workflow/ViewWorkflow";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Page() {
  const { project_id, locality_project_id } = useParams<{ locality_project_id: string; project_id: string }>();

  if (!project_id)
    return <div className='flex flex-col items-center justify-center h-60'>
      <p className='text-muted-foreground'>No Project Id!</p>
    </div>

  if (!locality_project_id)
    return <div className='flex flex-col items-center justify-center h-60'>
      <p className='text-muted-foreground'>No Locality Project Id!</p>
    </div>

  return (
    <div className="flex w-full min-h-screen relative overflow-x-hidden">
      <div className="flex-1 overflow-y-auto">
        <ViewWorkflow
          pageTitle={"Village Land Use Compliance Project Workflow"}
          projectId={project_id}
          projectLocalityId={locality_project_id}
          topLevelModule={"compliance"}
          module={"land-uses"}
          moduleLevel={"village-land-use-compliance"}
          worklowCategory={"workflow"}
        />
      </div>

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
          <div className="py-4 bg-accent/50 h-full">
            <ViewWorkflow
              pageTitle={"Village Land Use Project Workflow"}
              projectId={project_id}
              projectLocalityId={locality_project_id}
              topLevelModule={"compliance"}
              module={"land-uses"}
              moduleLevel={"village-land-use-compliance"}
              worklowCategory={"workflow"}
              noLink
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
