import CreateProject from '@/components/project/CreateProject';
import { usePageStore } from '@/store/pageStore';
import { LOCALITY_LEVELS } from '@/types/constants';
import { useLayoutEffect } from 'react';

export default function Page() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "land-uses",
      title: "Create National Land Use Project",
    });
  }, [setPage]);

  return (
    <div>
      <CreateProject 
        moduleLevel={LOCALITY_LEVELS.NATIONAL}
        afterCreateRedirectPath="/land-uses/national-land-use"
      />
    </div>
  );
}