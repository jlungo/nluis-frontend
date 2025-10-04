import { useLayoutEffect } from 'react';
import { usePageStore } from '@/store/pageStore';
import { useParams } from 'react-router';
import { useQuestionnaireQuery } from '@/queries/useQuestionnaireQuery';
import { SectionedForm } from '@/components/questionnaire/sectioned-form';
import { Spinner } from '@/components/ui/spinner';

export default function Page() {
    const { questionnaire_slug } = useParams<{ questionnaire_slug: string }>();
    const { setPage } = usePageStore();
    const { data, isLoading } = useQuestionnaireQuery(questionnaire_slug || "");

    useLayoutEffect(() => {
        setPage({
            module: 'system-settings',
            title: data ? data?.name : isLoading ? "..." : "Form Questionnaire Details",
        })
    }, [setPage, data, isLoading])

    if (!data && !isLoading)
        return (
            <div className='flex flex-col items-center justify-center h-60'>
                <p className='text-muted-foreground'>No questionnaires found!</p>
            </div>
        )

    if (!data || isLoading)
        return (
            <div className='flex flex-col items-center justify-center h-60'>
                <Spinner />
                <p className="text-muted-foreground mt-4">Loading questionnaire...</p>
            </div>
        )

    if (isLoading)
        return (
            <div className='flex flex-col items-center justify-center h-60'>
                <Spinner />
                <p className="text-muted-foreground mt-4">Loading questionnaire...</p>
            </div>
        )

    return <SectionedForm data={data} disabled />
}