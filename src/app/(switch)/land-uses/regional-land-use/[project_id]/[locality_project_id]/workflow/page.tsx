import { useParams } from "react-router";
import ViewWorkflow from "@/components/workflow/ViewWorkflow";

export default function Page() {
  const { locality_project_id } = useParams<{ locality_project_id: string }>();

  if (!locality_project_id)
    return <div className='flex flex-col items-center justify-center h-60'>
      <p className='text-muted-foreground'>No Locality Project Id!</p>
    </div>

  return (
    <ViewWorkflow
      pageTitle={"Regional Land Use Project Workflow"}
      projectLocalityId={locality_project_id}
      module={"land-uses"}
      moduleLevel={"regional-land-use"}
      worklowCategory={"workflow"}
    />
  )
}
