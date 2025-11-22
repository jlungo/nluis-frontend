import ProjectsList from '@/components/compliance-project/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function Page() {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'compliance',
      title: 'Village Land Use Compliance Projects',
    });
  }, [setPage]);

  return (
    <ProjectsList
      module="land-uses"
      moduleLevel="village-land-use-compliance"
      pageTitle="Village Land Use Compliance"
    />
  );
}