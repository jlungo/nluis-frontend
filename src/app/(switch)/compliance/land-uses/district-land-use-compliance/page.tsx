import ProjectsListPage from '@/components/compliance-project/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function DistrictLandUsePage() {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'compliance',
      title: "District Land Use Compliance Projects",
    });
  }, [setPage]);

  return (
    <ProjectsListPage
      module="land-uses"
      moduleLevel="district-land-use-compliance"
      pageTitle="District Land Use Compliance"
    />
  );
}