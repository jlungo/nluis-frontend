import ProjectsListPage from '@/components/compliance-project/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function RegionalUsePage() {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'compliance',
      title: 'Regional Land Use Compliance Projects',
    });
  }, [setPage]);

  return (
    <ProjectsListPage
      module="land-uses"
      moduleLevel="regional-land-use-compliance"
      pageTitle="Regional Land Use Compliance"
    />
  );
}