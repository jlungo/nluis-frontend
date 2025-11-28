import { Spinner } from "@/components/ui/spinner";
import { SectionedForm } from "./sectioned-form";
import { useWorkflowsQuery } from "@/queries/useWorkflowQuery";
import { usePageStore } from "@/store/pageStore";
import { useEffect, useLayoutEffect } from "react";
import { cn, getCategoryKey } from "@/lib/utils";
import { useFormDataQuery } from "@/queries/useFormDataQuery";
import type { ModuleTypes } from "@/types/modules";
import { useProjectQuery } from "@/queries/useProjectQuery";
import { Link, useNavigate } from "react-router";
import { buttonVariants } from "../ui/button";

type Props = {
    pageTitle: string;
    projectId: string;
    projectLocalityId: string;
    topLevelModule?: ModuleTypes;
    module: ModuleTypes;
    moduleLevel: string;
    worklowCategory: string
}

export default function ViewWorkflow({ pageTitle, projectId, projectLocalityId, topLevelModule, module, moduleLevel, worklowCategory }: Props) {
    const { setPage } = usePageStore();
    const navigate = useNavigate()

    const { data: project, isLoading: isLoadingProject } = useProjectQuery(projectId);
    const workflowKey = getCategoryKey(worklowCategory) ?? 6
    const { data: workflow, isLoading: isLoadingWorkflow, isError: isErrorWorkflow, error: workflowError } = useWorkflowsQuery(1, 0, '', topLevelModule ? topLevelModule : module, moduleLevel, workflowKey);

    const workflowSlug = Array.isArray(workflow?.results) && workflow.results.length > 0 ? workflow.results[0].slug : undefined;
    const { data: values, isLoading: isLoadingValues } = useFormDataQuery(workflowSlug, projectLocalityId)

    const projectLocaleName = project?.localities?.find(locale => `${locale.id}` === projectLocalityId)?.locality__name
    const projectLocaleId = project?.localities?.find(locale => `${locale.id}` === projectLocalityId)?.locality__id
    const projectLocaleProgress = project?.localities?.find(locale => `${locale.id}` === projectLocalityId)?.progress
    const approval_status =
        project?.localities && project.localities.length > 0
            ? project.localities.every(loc => loc.approval_status === 1)
                ? 1
                : project.localities.every(loc => loc.approval_status === 3) ? 3 : 2
            : 2

    useLayoutEffect(() => {
        if (topLevelModule) setPage({
            module: topLevelModule,
            title: pageTitle,
            isFormPage: true
        })
        else setPage({
            module: module,
            title: pageTitle,
            isFormPage: true
        });
    }, [topLevelModule, module, pageTitle, setPage]);

    useEffect(() => {
        if (approval_status !== 2) {
            if (topLevelModule) navigate(`/${topLevelModule}/${module}/${moduleLevel}/${projectId}`, { replace: true })
            else navigate(`/${module}/${moduleLevel}/${projectId}`, { replace: true })
        }
    }, [approval_status, topLevelModule, module, moduleLevel, navigate, projectId])

    if (!workflowKey)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>Workflow key configuration error!</p>
        </div>

    if (isLoadingWorkflow || isLoadingValues || isLoadingProject) return <div className='flex flex-col items-center justify-center h-60'>
        <Spinner />
        <p className="text-muted-foreground mt-4">Loading workflow and data...</p>
    </div>

    if (isErrorWorkflow) {
        // Prefer backend-provided message if available
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msg = (workflowError as any)?.response?.data?.message || (workflowError as any)?.response?.data?.detail || (workflowError as any)?.message || 'Failed to fetch workflow';
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-destructive'>{msg}</p>
        </div>
    }

    if (!project)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>No project with this data found!</p>
        </div>

    if (approval_status !== 2)
        return <div className='flex flex-col items-center justify-center h-80 gap-12'>
            <p className='text-muted-foreground'>This project is not approved!</p>
            <Link
                to={topLevelModule ? `/${topLevelModule}/${module}/${moduleLevel}/${projectId}` : `/${module}/${moduleLevel}/${projectId}`}
                className={cn(buttonVariants({ size: 'sm' }))}
            >
                Go to project Details
            </Link>
        </div>

    if ((!projectLocaleName || !projectLocaleId) && !isLoadingWorkflow && !isLoadingValues && !isLoadingProject)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>Project Locality not found!</p>
        </div>

    if (!workflow || !Array.isArray(workflow.results) || workflow.results.length === 0)
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
            subLevelModule={topLevelModule ? module : undefined}
            projectLocaleProgress={projectLocaleProgress}
            moduleLevel={moduleLevel}
            projectId={projectId}
        />
    )
}
