import CreateOrEditProject from '@/components/ccro_projects/CreateOrEditProject';
import { usePageStore } from '@/store/pageStore';
import { LOCALITY_LEVELS } from '@/types/constants';
import { useLayoutEffect } from 'react';

export default function Page() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "ccro-management",
      title: "Create CCRO Project",
    });
  }, [setPage]);

  return <CreateOrEditProject moduleLevel={LOCALITY_LEVELS.VILLAGE} redirectPath="/ccro-management/ccro-projects" />;
}