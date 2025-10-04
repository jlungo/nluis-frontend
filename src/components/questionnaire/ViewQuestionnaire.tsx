import { Spinner } from "@/components/ui/spinner";
import { SectionedForm } from "./sectioned-form";
import { useQuestionnairesQuery } from "@/queries/useQuestionnaireQuery";
import { usePageStore } from "@/store/pageStore";
import { useEffect, useLayoutEffect } from "react";
import { cn, getCategoryKey } from "@/lib/utils";
import { useQuestionnaireDataQuery } from "@/queries/useQuestionnaireDataQuery";
import type { ModuleTypes } from "@/types/modules";
import { useProjectQuery } from "@/queries/useProjectQuery";
import { Link, useNavigate } from "react-router";
import { buttonVariants } from "../ui/button";

type Props = {
    pageTitle: string;
    projectId: string;
    projectLocalityId: string;
    module: ModuleTypes;
    moduleLevel: string;
    worklowCategory: string
}

export default function ViewQuestionnaire({ pageTitle, projectId, projectLocalityId, module, moduleLevel, worklowCategory }: Props) {
    const { setPage } = usePageStore();
    const navigate = useNavigate()

    const { data: project, isLoading: isLoadingProject } = useProjectQuery(projectId);
    const questionnaireKey = getCategoryKey(worklowCategory) ?? 6
    const { data: questionnaire, isLoading: isLoadingQuestionnaire } = useQuestionnairesQuery(1, 0, '', module, moduleLevel, questionnaireKey);
    const { data: values, isLoading: isLoadingValues } = useQuestionnaireDataQuery(questionnaire && questionnaire?.results && questionnaire.results.length > 0 ? questionnaire.results[0].slug : undefined, projectLocalityId)

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
        setPage({
            module: module,
            title: pageTitle,
            isFormPage: true
        });
    }, [module, pageTitle, setPage]);

    useEffect(() => {
        if (approval_status !== 2) navigate(`/${module}/${moduleLevel}/${projectId}`, { replace: true })
    }, [approval_status, module, moduleLevel, navigate, projectId])

    if (!questionnaireKey)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>Questionnaire key configuration error!</p>
        </div>

    if (isLoadingQuestionnaire || isLoadingValues || isLoadingProject) return <div className='flex flex-col items-center justify-center h-60'>
        <Spinner />
        <p className="text-muted-foreground mt-4">Loading questionnaire and data...</p>
    </div>

    if (!project)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>No project with this data found!</p>
        </div>

    if (approval_status !== 2)
        return <div className='flex flex-col items-center justify-center h-80 gap-12'>
            <p className='text-muted-foreground'>This project is not approved!</p>
            <Link to={`/${module}/${moduleLevel}/${projectId}`} className={cn(buttonVariants({ size: 'sm' }))}>Go to project Details</Link>
        </div>

    if ((!projectLocaleName || !projectLocaleId) && !isLoadingQuestionnaire && !isLoadingValues && !isLoadingProject)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>Project Locality not found!</p>
        </div>

    if (!questionnaire || !questionnaire?.results || questionnaire.results.length === 0)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>No questionnaire data found!</p>
        </div>

    if (!values)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>Failed to fetch questionnaire data!</p>
        </div>

    return (
        <SectionedForm
            data={questionnaire.results[0]}
            values={values}
            projectLocalityId={projectLocalityId}
            projectName={project.name}
            projectLocaleName={projectLocaleName}
            projectLocaleId={projectLocaleId}
            projectLocaleProgress={projectLocaleProgress}
        />
    )
}
