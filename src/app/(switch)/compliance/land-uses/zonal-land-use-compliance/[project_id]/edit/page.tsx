import CreateOrEditProject from '@/components/project/CreateOrEditProject';
import { usePageStore } from '@/store/pageStore';
import { LOCALITY_LEVELS } from '@/types/constants';
import { useLayoutEffect } from 'react';
import { useParams } from 'react-router';

export default function Page() {
  const { setPage } = usePageStore();
  const { project_id } = useParams<{ project_id: string }>();

  useLayoutEffect(() => {
    setPage({
      module: "land-uses",
      title: "Edit Zonal Land Use Project",
    });
  }, [setPage]);

  return <CreateOrEditProject projectId={project_id as string} moduleLevel={LOCALITY_LEVELS.ZONAL} redirectPath="/land-uses/zonal-land-use" />
}