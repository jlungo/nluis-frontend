import ProjectsListPage from '@/components/project/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function DistrictLandUsePage() {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'land-uses',
      title: "District Land Use Projects",
    });
  }, [setPage]);

  return (
    <ProjectsListPage
      module="land-uses"
      moduleLevel="district-land-use" 
      pageTitle="District Land Use" 
    />
  );
}