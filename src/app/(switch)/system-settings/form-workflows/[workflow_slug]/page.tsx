import { useLayoutEffect } from 'react';
import { usePageStore } from '@/store/pageStore';
import { useParams } from 'react-router';
import { useWorkflowQuery } from '@/queries/useWorkflowQuery';

export default function Page() {
    const { setPage } = usePageStore();
    const { workflow_slug } = useParams<{ workflow_slug: string }>();

    const { data } = useWorkflowQuery('village-land-use-planning');

    console.log(data, workflow_slug)

    useLayoutEffect(() => {
        setPage({
            module: 'system-settings',
            title: "Form Workflow",
            backButton: 'Modules'
        })
    }, [setPage])

    return <>Hello</>
}