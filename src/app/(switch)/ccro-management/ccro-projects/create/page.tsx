import CreateOrEditProject from '@/components/project/CreateOrEditProject';
import { usePageStore } from '@/store/pageStore';
import { LOCALITY_LEVELS } from '@/types/constants';

import { useLayoutEffect } from 'react';

export default function Page() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "ccro-management",
      title: "Create Village Land Subdivision Project",
    });
  }, [setPage]);

  // Render the generic project create form but set the target locality level to Village
  // so the locality selector drills to villages while the form itself will submit
  // module_level = CCRO_MODULE_SLUG (handled in the CCRO form component)
  return <CreateOrEditProject moduleLevel={LOCALITY_LEVELS.VILLAGE} redirectPath="/ccro-management/ccro-projects" />;
}