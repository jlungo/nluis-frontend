import { Spinner } from "@/components/ui/spinner";
import { SectionedForm } from "./sectioned-form";
import { useWorkflowsQuery } from "@/queries/useWorkflowQuery";
import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect } from "react";
import { getCategoryKey } from "@/lib/utils";
import { useFormDataQuery } from "@/queries/useFormDataQuery";
import type { ModuleTypes } from "@/types/modules";

type Props = {
    pageTitle: string;
    projectLocalityId: string;
    module: ModuleTypes;
    moduleLevel: string;
    worklowCategory: string
}

export default function ViewWorkflow({ pageTitle, projectLocalityId, module, moduleLevel, worklowCategory }: Props) {
    const { setPage } = usePageStore();

    const workflowKey = getCategoryKey(worklowCategory) ?? 6
    const { data: workflow, isLoading: isLoadingWorkflow } = useWorkflowsQuery(1, 0, '', module, moduleLevel, workflowKey);
    const { data: values, isLoading: isLoadingValues } = useFormDataQuery(workflow && workflow?.results && workflow.results.length > 0 ? workflow.results[0].slug : undefined, projectLocalityId)

    useLayoutEffect(() => {
        setPage({
            module: module,
            title: pageTitle,
            isFormPage: true
        });
    }, [setPage]);

    if (!workflowKey)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>Workflow key configuration error!</p>
        </div>

    if (isLoadingWorkflow || isLoadingValues) return <div className='flex flex-col items-center justify-center h-60'>
        <Spinner />
        <p className="text-muted-foreground mt-4">Loading workflow and data...</p>
    </div>

    if (!workflow || !workflow?.results || workflow.results.length === 0)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>No workflow data found!</p>
        </div>

    if (!values)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>Failed to fetch workflow data!</p>
        </div>

    return <SectionedForm data={workflow.results[0]} values={values} projectLocalityId={projectLocalityId} />
}
