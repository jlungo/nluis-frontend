import CreateOrEditProject from '@/components/compliance-project/CreateOrEditProject';
import { usePageStore } from '@/store/pageStore';
import { LOCALITY_LEVELS } from '@/types/constants';
import { useLayoutEffect } from 'react';

export default function Page() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "compliance",
      title: "Create National Land Use Compliance Project",
    });
  }, [setPage]);

  return (
    <CreateOrEditProject
      moduleLevel={LOCALITY_LEVELS.NATIONAL}
      redirectPath="/compliance/land-uses/national-land-use-compliance"
      level="national-land-use"
    />
  );
}