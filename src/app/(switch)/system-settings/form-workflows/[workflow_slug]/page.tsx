import { useLayoutEffect } from 'react';
import { usePageStore } from '@/store/pageStore';
import { useParams } from 'react-router';
import { useWorkflowQuery } from '@/queries/useWorkflowQuery';
import { SectionedForm } from '@/components/sectioned-form';
import { Spinner } from '@/components/ui/spinner';

export default function Page() {
    const { workflow_slug } = useParams<{ workflow_slug: string }>();
    const { setPage } = usePageStore();
    const { data, isLoading } = useWorkflowQuery(workflow_slug || "");

    useLayoutEffect(() => {
        setPage({
            module: 'system-settings',
            title: data ? data?.name : isLoading ? "..." : "Form Workflow Details",
            backButton: 'Modules'
        })
    }, [setPage, data])

    if (!data && !isLoading)
        return (
            <div className='flex flex-col items-center justify-center h-60'>
                <p className='text-muted-foreground'>No workflows found!</p>
            </div>
        )

    if (!data || isLoading)
        return (
            <div className='flex flex-col items-center justify-center h-60'>
                <Spinner />
                <p className="text-muted-foreground mt-4">Loading workflow...</p>
            </div>
        )

    if (isLoading)
        return (
            <div className='flex flex-col items-center justify-center h-60'>
                <Spinner />
                <p className="text-muted-foreground mt-4">Loading workflow...</p>
            </div>
        )

    return <SectionedForm data={data} disabled />
}