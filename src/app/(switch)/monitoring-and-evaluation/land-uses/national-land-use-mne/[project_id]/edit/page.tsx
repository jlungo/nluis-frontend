import CreateOrEditProject from '@/components/monitoring-and-evaluation/CreateOrEditProject';
import { usePageStore } from '@/store/pageStore';
import { LOCALITY_LEVELS } from '@/types/constants';
import { useLayoutEffect } from 'react';
import { useParams } from 'react-router';

export default function Page() {
  const { setPage } = usePageStore();
  const { project_id } = useParams<{ project_id: string }>();

  useLayoutEffect(() => {
    setPage({
      module: "monitoring-and-evaluation",
      title: "Edit National Land Use monitoring-and-evaluation Project",
    });
  }, [setPage]);

  return (
    <CreateOrEditProject
      projectId={project_id as string}
      moduleLevel={LOCALITY_LEVELS.NATIONAL}
      redirectPath="/monitoring-and-evaluation/land-uses/national-land-use-mne"
      level='national-land-use'
    />
  )
}