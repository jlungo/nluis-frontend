import ProjectsListPage from '@/components/compliance-project/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function NationalUsePage() {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'compliance',
      title: 'National Land Use Compliance Projects',
    });
  }, [setPage]);

  return (
    <ProjectsListPage
      module="land-uses"
      moduleLevel="national-land-use-compliance"
      pageTitle="National Land Use Compliance"
    />
  );
}