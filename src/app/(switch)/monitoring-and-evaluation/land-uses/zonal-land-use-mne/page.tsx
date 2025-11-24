import ProjectsListPage from '@/components/monitoring-and-evaluation/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function ZoneLandUsePage() {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'monitoring-and-evaluation',
      title: 'Zone Land Use monitoring-and-evaluation Projects',
    });
  }, [setPage]);

  return (
    <ProjectsListPage
      module="land-uses"
      moduleLevel="zonal-land-use-mne"
      pageTitle="Zone Land Use monitoring-and-evaluation"
    />
  );
}