import { Spinner } from "@/components/ui/spinner";
import { useQuestionnaireQuery } from "@/queries/useQuestionnaireQuery";
import { usePageStore } from "@/store/pageStore";
import { useEffect, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";
import { type QuestionnaireDataBatchI, useQuestionnaireDataBatchQuery } from "@/queries/useQuestionnaireDataBatchQuery";
import type { ModuleTypes } from "@/types/modules";
import { useProjectQuery } from "@/queries/useProjectQuery";
import { Link, useNavigate } from "react-router";
import { Button, buttonVariants } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { DataTable } from "../DataTable";
import { BatchColumns } from "./batch-columns";

type Props = {
    pageTitle: string;
    projectId: string;
    projectLocalityId: string;
    topLevelModule?: ModuleTypes;
    module: ModuleTypes;
    moduleLevel: string;
    questionnaireId: string;
}

export default function Batches({ pageTitle, projectId, projectLocalityId, topLevelModule, module, moduleLevel, questionnaireId }: Props) {
    const { setPage } = usePageStore();
    const navigate = useNavigate()

    const { data: project, isLoading: isLoadingProject } = useProjectQuery(projectId);
    const { data: questionnaire, isLoading: isLoadingQuestionnaire } = useQuestionnaireQuery(questionnaireId);
    const { data: values, isLoading: isLoadingValues } = useQuestionnaireDataBatchQuery(questionnaire ? questionnaire.slug : undefined, projectLocalityId)

    const projectLocaleName = project?.localities?.find(locale => `${locale.id}` === projectLocalityId)?.locality__name
    const projectLocaleId = project?.localities?.find(locale => `${locale.id}` === projectLocalityId)?.locality__id

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
        <p className="text-muted-foreground mt-4">Loading questionnaire batches...</p>
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
            <p className='text-muted-foreground'>Failed to fetch questionnaire data batches!</p>
        </div>

    return (
        <div className="h-fit flex flex-col mb-20">
            <div className={`bg-primary/5 border-b border-border px-4 md:px-6 py-3 mb-6`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button type='button' variant="ghost" size="sm" onClick={() => navigate(-1)}>
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-sm md:text-base lg:text-lg font-semibold text-foreground/70">Submissions{projectLocaleName ? <span className='text-foreground'>: {projectLocaleName}</span> : null}{projectLocaleName ? <span className='text-foreground'> - {project.name}</span> : null}</h1>
                            <p className="text-xs lg:text-sm text-muted-foreground">
                                {questionnaire?.description || ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">

                    </div>
                </div>
            </div>
            <div className="px-4">
                <DataTable<QuestionnaireDataBatchI, unknown>
                    columns={BatchColumns}
                    data={values?.results || []}
                    isLoading={isLoadingValues}
                    enableGlobalFilter={false}
                    initialPageSize={10}
                    pageSizeOptions={[5, 10, 20, 50]}
                    onRowClick={({ batch }) => {
                        if (topLevelModule)
                            return navigate(`/${topLevelModule}/${module}/${moduleLevel}/${projectId}/${projectLocalityId}/questionnaire/${questionnaireId}/${batch}`)
                        return navigate(`/${module}/${moduleLevel}/${projectId}/${projectLocalityId}/questionnaire/${questionnaireId}/${batch}`)
                    }}
                />
            </div>
        </div>
    )
}
