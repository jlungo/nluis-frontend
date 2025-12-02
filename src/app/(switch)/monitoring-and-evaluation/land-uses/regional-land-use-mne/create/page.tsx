import CreateOrEditProject from '@/components/monitoring-and-evaluation/CreateOrEditProject';
import { usePageStore } from '@/store/pageStore';
import { LOCALITY_LEVELS } from '@/types/constants';
import { useLayoutEffect } from 'react';

export default function Page() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "monitoring-and-evaluation",
      title: "Create Regional Land Use monitoring-and-evaluation Project",
    });
  }, [setPage]);

  return (
    <CreateOrEditProject
      moduleLevel={LOCALITY_LEVELS.REGION}
      redirectPath="/monitoring-and-evaluation/land-uses/regional-land-use-mne"
      level='regional-land-use'
    />
  );
}