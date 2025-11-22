import ProjectsListPage from '@/components/monitoring-and-evaluation/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function NationalUsePage() {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'monitoring-and-evaluation',
      title: 'National Land Use MNE Projects',
    });
  }, [setPage]);

  return (
    <ProjectsListPage
      module="land-uses"
      moduleLevel="national-land-use-mne"
      pageTitle="National Land Use MNE"
    />
  );
}