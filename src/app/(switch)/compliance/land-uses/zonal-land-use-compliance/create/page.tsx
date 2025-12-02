import CreateOrEditProject from '@/components/compliance-project/CreateOrEditProject';
import { usePageStore } from '@/store/pageStore';
import { LOCALITY_LEVELS } from '@/types/constants';
import { useLayoutEffect } from 'react';

export default function Page() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "compliance",
      title: "Create Zonal Land Use Compliance Project",
    });
  }, [setPage]);

  return (
    <CreateOrEditProject
      moduleLevel={LOCALITY_LEVELS.ZONAL}
      redirectPath="/compliance/land-uses/zonal-land-use-compliance"
      level="zonal-land-use"
    />
  )
}