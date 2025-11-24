import ProjectsListPage from '@/components/monitoring-and-evaluation/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function ZoneLandUsePage() {
    const { setPage } = usePageStore();

    useEffect(() => {
        setPage({
            module: 'monitoring-and-evaluation',
            title: 'CCRO Projects Monitoring and Evaluation',
        });
    }, [setPage]);

    return (
        <ProjectsListPage
            moduleLevel="ccro-projects-mne"
            pageTitle="CCRO Monitoring and Evaluation Projects"
        />
    );
}