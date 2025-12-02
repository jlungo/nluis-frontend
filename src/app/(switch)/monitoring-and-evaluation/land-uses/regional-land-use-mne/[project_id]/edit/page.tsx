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
      title: "Edit Regional Land Use monitoring-and-evaluation Project",
    });
  }, [setPage]);

  return (
    <CreateOrEditProject
      projectId={project_id as string}
      moduleLevel={LOCALITY_LEVELS.REGION}
      redirectPath="/monitoring-and-evaluation/land-uses/regional-land-use-mne"
      level='regional-land-use'
    />
  )
}