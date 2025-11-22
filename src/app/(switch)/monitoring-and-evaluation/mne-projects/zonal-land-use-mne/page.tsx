import ProjectsListPage from '@/components/monitoring-and-evaluation/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function ZonalLandUseMnePage() {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'monitoring-and-evaluation',
      title: 'Zonal Land Use MNE Projects',
    });
  }, [setPage]);

  return (
    <ProjectsListPage
      module="land-uses"
      moduleLevel="zonal-land-use-mne"
      pageTitle="Zonal Land Use MNE"
    />
  );
}