import CreateOrEditProject from '@/components/monitoring-and-evaluation/CreateOrEditProject';
import { usePageStore } from '@/store/pageStore';
import { LOCALITY_LEVELS } from '@/types/constants';
import { useLayoutEffect } from 'react';

export default function Page() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "monitoring-and-evaluation",
      title: "Create Village Land Use MNE Project",
    });
  }, [setPage]);

  return <CreateOrEditProject moduleLevel={LOCALITY_LEVELS.VILLAGE} redirectPath="/monitoring-and-evaluation/land-uses/village-land-use-mne" />;
}