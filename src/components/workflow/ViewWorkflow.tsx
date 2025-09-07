import { Spinner } from "@/components/ui/spinner";
import { SectionedForm } from "./sectioned-form";
import { useWorkflowsQuery } from "@/queries/useWorkflowQuery";
import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect } from "react";
import { cn, getCategoryKey } from "@/lib/utils";
import { useFormDataQuery } from "@/queries/useFormDataQuery";
import type { ModuleTypes } from "@/types/modules";
import { useProjectQuery } from "@/queries/useProjectQuery";
import { Link } from "react-router";
import { buttonVariants } from "../ui/button";

type Props = {
    pageTitle: string;
    projectId: string;
    projectLocalityId: string;
    module: ModuleTypes;
    moduleLevel: string;
    worklowCategory: string
}

export default function ViewWorkflow({ pageTitle, projectId, projectLocalityId, module, moduleLevel, worklowCategory }: Props) {
    const { setPage } = usePageStore();

    const { data: project, isLoading: isLoadingProject } = useProjectQuery(projectId);
    const workflowKey = getCategoryKey(worklowCategory) ?? 6
    const { data: workflow, isLoading: isLoadingWorkflow } = useWorkflowsQuery(1, 0, '', module, moduleLevel, workflowKey);
    const { data: values, isLoading: isLoadingValues } = useFormDataQuery(workflow && workflow?.results && workflow.results.length > 0 ? workflow.results[0].slug : undefined, projectLocalityId)

    const projectLocaleName = project?.localities?.find(locale => `${locale.id}` === projectLocalityId)?.locality__name
    const projectLocaleId = project?.localities?.find(locale => `${locale.id}` === projectLocalityId)?.locality__id

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

    if (isLoadingWorkflow || isLoadingValues || isLoadingProject) return <div className='flex flex-col items-center justify-center h-60'>
        <Spinner />
        <p className="text-muted-foreground mt-4">Loading workflow and data...</p>
    </div>

    if (!project)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>No project with this data found!</p>
        </div>

    if (project.approval_status !== 2)
        return <div className='flex flex-col items-center justify-center h-80 gap-12'>
            <p className='text-muted-foreground'>This project is not approved!</p>
            <Link to={`/${module}/${moduleLevel}/${projectId}`} className={cn(buttonVariants({ size: 'sm' }))}>Go to project Details</Link>
        </div>

    if ((!projectLocaleName || !projectLocaleId) && !isLoadingWorkflow && !isLoadingValues && !isLoadingProject)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>Project Locality not found!</p>
        </div>

    if (!workflow || !workflow?.results || workflow.results.length === 0)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>No workflow data found!</p>
        </div>

    if (!values)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>Failed to fetch workflow data!</p>
        </div>

    return (
        <SectionedForm
            data={workflow.results[0]}
            values={values}
            projectLocalityId={projectLocalityId}
            projectName={project.name}
            projectLocaleName={projectLocaleName}
            projectLocaleId={projectLocaleId}
        />
    )
}
