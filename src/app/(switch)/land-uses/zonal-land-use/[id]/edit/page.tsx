import EditProject from '@/components/project/EditProject';
import { usePageStore } from '@/store/pageStore';
import { LOCALITY_LEVELS } from '@/types/constants';
import { useLayoutEffect } from 'react';
import { useParams } from 'react-router';

export default function Page() {
  const { setPage } = usePageStore();
  const { id } = useParams<{ id: string }>();

  useLayoutEffect(() => {
    setPage({
      module: "land-uses",
      title: "Edit Zonal Land Use Project",
    });
  }, [setPage]);

  return (
    <div>
      <EditProject 
        projectId={id as string}
        moduleLevel={LOCALITY_LEVELS.ZONAL}
        afterUpdateRedirectPath="/land-uses/zonal-land-use"
      />
    </div>
  );
}