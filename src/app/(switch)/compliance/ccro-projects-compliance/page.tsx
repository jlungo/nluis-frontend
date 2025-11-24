import ProjectsListPage from '@/components/compliance-project/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function ZoneLandUsePage() {
    const { setPage } = usePageStore();

    useEffect(() => {
        setPage({
            module: 'compliance',
            title: 'CCRO Projects Compliance',
        });
    }, [setPage]);

    return (
        <ProjectsListPage
            moduleLevel="ccro-projects-compliance"
            pageTitle="CCRO Compliance Projects"
        />
    );
}