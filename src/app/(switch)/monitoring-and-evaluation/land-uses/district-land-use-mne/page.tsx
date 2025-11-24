import ProjectsListPage from '@/components/monitoring-and-evaluation/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function DistrictLandUsePage() {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'monitoring-and-evaluation',
      title: "District Land Use Monitoring-and-Evaluation Projects",
    });
  }, [setPage]);

  return (
    <ProjectsListPage
      module="land-uses"
      moduleLevel="district-land-use-mne"
      pageTitle="District Land Use Monitoring-and-Evaluation Projects"
    />
  );
}