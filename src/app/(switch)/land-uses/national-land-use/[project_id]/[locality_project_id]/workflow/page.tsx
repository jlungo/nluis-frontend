import { Spinner } from "@/components/ui/spinner";
import { SectionedForm } from "@/components/sectioned-form";
import { useLevelWorkflowQuery } from "@/queries/useWorkflowQuery";
import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect } from "react";
import { getCategoryKey } from "@/lib/utils";
import { useParams } from "react-router";
// import { useFormDataQuery } from "@/queries/useFormDataQuery";

export default function Page() {
  const { locality_project_id } = useParams<{ locality_project_id: string }>();
  const { setPage } = usePageStore();

  const { data: workflow, isLoading: isLoadingWorkflow } = useLevelWorkflowQuery("national-land-use");

  useLayoutEffect(() => {
    setPage({
      module: 'land-uses',
      title: "National Land Use Project Workflow",
      isFormPage: true
    });
  }, [setPage]);

  const workflowKey = getCategoryKey('workflow')

  if (!workflowKey)
    return <div className='flex flex-col items-center justify-center h-60'>
      <p className='text-muted-foreground'>Workflow key configuration error!</p>
    </div>

  if (!workflow && !isLoadingWorkflow)
    return <div className='flex flex-col items-center justify-center h-60'>
      <p className='text-muted-foreground'>No workflow data found!</p>
    </div>

  const categorized = workflow ? workflow.filter(item => item.category === workflowKey) : [];
  const maxVersion = categorized.length > 0 ? Math.max(...categorized.map(item => Number(item.version))) : 0
  const workflowData = categorized.filter(item => Number(item.version) === maxVersion);

  if (workflowData.length === 0 && !isLoadingWorkflow)
    return <div className='flex flex-col items-center justify-center h-60'>
      <p className='text-muted-foreground'>No workflow data found!</p>
    </div>

  if (isLoadingWorkflow) return <div className='flex flex-col items-center justify-center h-60'>
    <Spinner />
    <p className="text-muted-foreground mt-4">Loading workflow...</p>
  </div>

  if (!locality_project_id)
    return <div className='flex flex-col items-center justify-center h-60'>
      <p className='text-muted-foreground'>No project identifier!</p>
    </div>

  // const { data: values, isLoading } = useFormDataQuery(workflowData[0].slug, id)

  // if (isLoading) return <div className='flex flex-col items-center justify-center h-60'>
  //   <Spinner />
  //   <p className="text-muted-foreground mt-4">Loading workflow data...</p>
  // </div>

  return <SectionedForm data={workflowData[0]} values={[]} projectLocalityId={locality_project_id} />
}
