import CreateOrEditProject from '@/components/monitoring-and-evaluation/CreateOrEditProject';
import { usePageStore } from '@/store/pageStore';
import { LOCALITY_LEVELS } from '@/types/constants';
import { useLayoutEffect } from 'react';

export default function Page() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "monitoring-and-evaluation",
      title: "Create CCRO Monitoring and Evaluation Project",
    });
  }, [setPage]);

  return (
    <CreateOrEditProject
      moduleLevel={LOCALITY_LEVELS.CCRO_PROJECT}
      redirectPath="/monitoring-and-evaluation/ccro-projects-mne"
      level="ccro-projects"
    />
  );
}