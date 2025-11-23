import ProjectsListPage from '@/components/monitoring-and-evaluation/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function RegionalUsePage() {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'monitoring-and-evaluation',
      title: 'Regional Land Use MNE Projects',
    });
  }, [setPage]);

  return (
    <ProjectsListPage
      module="monitoring-and-evaluation/mne-projects"
      moduleLevel="regional-land-use-mne"
      pageTitle="Regional Land Use MNE"
    />
  );
}