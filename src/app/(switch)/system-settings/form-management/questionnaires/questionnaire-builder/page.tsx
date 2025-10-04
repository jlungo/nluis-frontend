import { useLayoutEffect } from 'react';
import { usePageStore } from '@/store/pageStore';
import QuestionnaireBuilder from '../QuestionnaireBuilder';

export default function Page() {
    const { setPage } = usePageStore();

    useLayoutEffect(() => {
        setPage({
            module: 'system-settings',
            title: "Questionnaire Builder",
        })
    }, [setPage])

    return <QuestionnaireBuilder />
}