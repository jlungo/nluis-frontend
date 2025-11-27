import { Spinner } from "@/components/ui/spinner";
import { SectionedForm } from "./sectioned-form";
import { useQuestionnaireQuery } from "@/queries/useQuestionnaireQuery";
import { usePageStore } from "@/store/pageStore";
import { useEffect, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";
import { useQuestionnaireDataQuery } from "@/queries/useQuestionnaireDataQuery";
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
    questionnaireId: string;
    batch: string;
}

export default function ViewQuestionnaire({ pageTitle, projectId, projectLocalityId, topLevelModule, module, moduleLevel, questionnaireId, batch }: Props) {
    const { setPage } = usePageStore();
    const navigate = useNavigate()

    const { data: project, isLoading: isLoadingProject } = useProjectQuery(projectId);
    const { data: questionnaire, isLoading: isLoadingQuestionnaire } = useQuestionnaireQuery(questionnaireId);
    const { data: values, isLoading: isLoadingValues } = useQuestionnaireDataQuery(questionnaire ? questionnaire.slug : undefined, projectLocalityId, batch)

    const projectLocaleName = project?.localities?.find(locale => `${locale.id}` === projectLocalityId)?.locality__name
    const projectLocaleId = project?.localities?.find(locale => `${locale.id}` === projectLocalityId)?.locality__id

    // const questionnaireProgress =
    //     questionnaire && values
    //         ? (values.length /
    //             questionnaire.questionnaire_sections
    //                 .flatMap(q => q.questionnaire_section_forms)
    //                 .flatMap(f => f.custom_form_fields).length) *
    //         100
    //         : 0;

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
            <Link
                to={topLevelModule ? `/${topLevelModule}/${module}/${moduleLevel}/${projectId}` : `/${module}/${moduleLevel}/${projectId}`}
                className={cn(buttonVariants({ size: 'sm' }))}
            >
                Go to project Details
            </Link>
        </div>

    if ((!projectLocaleName || !projectLocaleId) && !isLoadingQuestionnaire && !isLoadingValues && !isLoadingProject)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>Project Locality not found!</p>
        </div>

    if (!questionnaire)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>No questionnaire data found!</p>
        </div>

    if (!values)
        return <div className='flex flex-col items-center justify-center h-60'>
            <p className='text-muted-foreground'>Failed to fetch questionnaire data!</p>
        </div>

    return (
        <SectionedForm
            data={questionnaire}
            values={values}
            projectLocalityId={projectLocalityId}
            projectName={project.name}
            projectLocaleName={projectLocaleName}
            projectLocaleId={projectLocaleId}
            subLevelModule={topLevelModule ? module : undefined}
            moduleLevel={moduleLevel}
            projectId={projectId}
        // questionnaireProgress={questionnaireProgress}
        />
    )
}
