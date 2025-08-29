import { Spinner } from "@/components/ui/spinner";
import { SectionedForm } from "@/components/sectioned-form";
import { useLevelWorkflowQuery } from "@/queries/useWorkflowQuery";
import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect } from "react";
import { getCategoryKey } from "@/lib/utils";
// import { useParams } from "react-router";

export default function Page() {
  // const { project_slug } = useParams<{ project_slug: string }>();
  const { setPage } = usePageStore();

  // const { data, isLoading } = useProjectQuery(workflow_slug || "");
  const { data: workflow, isLoading: isLoadingWorkflow } = useLevelWorkflowQuery("village-land-use");

  useLayoutEffect(() => {
    setPage({
      module: 'land-uses',
      title: "Village Land Use Project Workflow",
      backButton: 'Modules',
      isFormPage: true
    });
  }, [setPage]);

  const workflowKey = getCategoryKey('workflow')

  if (!workflowKey)
    return <div className='flex flex-col items-center justify-center h-60'>
      <p className='text-muted-foreground'>No workflow key configuration error!</p>
    </div>

  if (!workflow || !Array.isArray(workflow))
    return <div className='flex flex-col items-center justify-center h-60'>
      <p className='text-muted-foreground'>No workflow data found!</p>
    </div>

  const category = workflow.filter(item => item.category === workflowKey);
  const maxVersion = category.length > 0 ? Math.max(...category.map(item => Number(item.version))) : 0
  const data = category.filter(item => Number(item.version) === maxVersion);

  if (data.length === 0 && !isLoadingWorkflow)
    return <div className='flex flex-col items-center justify-center h-60'>
      <p className='text-muted-foreground'>No workflow data found!</p>
    </div>

  if (data.length === 0 || isLoadingWorkflow)
    return (
      <div className='flex flex-col items-center justify-center h-60'>
        <Spinner />
        <p className="text-muted-foreground mt-4">Loading workflow...</p>
      </div>
    )

  if (isLoadingWorkflow) return <div className='flex flex-col items-center justify-center h-60'>
    <Spinner />
    <p className="text-muted-foreground mt-4">Loading workflow...</p>
  </div>

  return <SectionedForm data={data[0]} />
}
