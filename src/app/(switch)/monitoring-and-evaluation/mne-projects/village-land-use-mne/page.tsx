import ProjectsList from '@/components/monitoring-and-evaluation/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function Page() {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'monitoring-and-evaluation',
      title: 'Village Land Use MNE Projects',
    });
  }, [setPage]);

  return (
    <ProjectsList
      module="land-uses"
      moduleLevel="village-land-use-mne"
      pageTitle="Village Land Use MNE"
    />
  );
}