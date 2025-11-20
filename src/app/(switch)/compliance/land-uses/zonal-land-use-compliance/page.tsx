import ProjectsListPage from '@/components/compliance-project/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function ZoneLandUsePage() {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'compliance',
      title: 'Zone Land Use Compliance Projects',
    });
  }, [setPage]);

  return (
    <ProjectsListPage
      module="land-uses"
      moduleLevel="zonal-land-use-compliance"
      pageTitle="Zone Land Use Compliance"
    />
  );
}