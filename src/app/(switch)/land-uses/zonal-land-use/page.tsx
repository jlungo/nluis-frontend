import ProjectsListPage from '@/components/project/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function ZoneLandUsePage() {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'land-uses',
      title: 'Zone Land Use Projects',
    });
  }, [setPage]);

  return (
    <ProjectsListPage
      module="land-uses"
      moduleLevel="zonal-land-use"
      pageTitle="Zone Land Use"
    />
  );
}