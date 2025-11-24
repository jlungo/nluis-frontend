import CreateOrEditProject from '@/components/monitoring-and-evaluation/CreateOrEditProject';
import { usePageStore } from '@/store/pageStore';
import { LOCALITY_LEVELS } from '@/types/constants';
import { useLayoutEffect } from 'react';

export default function Page() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "monitoring-and-evaluation",
      title: "Create Zonal Land Use monitoring-and-evaluation Project",
    });
  }, [setPage]);

  return <CreateOrEditProject moduleLevel={LOCALITY_LEVELS.ZONAL} redirectPath="/monitoring-and-evaluation/land-uses/zonal-land-use-mne" />;
}