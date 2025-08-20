import { useLayoutEffect } from 'react';
import { usePageStore } from '@/store/pageStore';
import WorkflowBuilder from '../../../WorkflowBuilder';

export default function Page() {
    const { setPage } = usePageStore();

    useLayoutEffect(() => {
        setPage({
            module: 'system-settings',
            title: "Form Workflow",
            backButton: 'Modules',
            isFormPage: true
        })
    }, [setPage])

    return <WorkflowBuilder />
}