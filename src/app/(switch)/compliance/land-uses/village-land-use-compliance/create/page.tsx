import CreateOrEditProject from '@/components/compliance-project/CreateOrEditProject';
import { usePageStore } from '@/store/pageStore';
import { LOCALITY_LEVELS } from '@/types/constants';
import { useLayoutEffect } from 'react';

export default function Page() {
  const { setPage } = usePageStore();

  useLayoutEffect(() => {
    setPage({
      module: "compliance",
      title: "Create Village Land Use Compliance Project",
    });
  }, [setPage]);

  return <CreateOrEditProject moduleLevel={LOCALITY_LEVELS.VILLAGE} redirectPath="/compliance/land-uses/village-land-use-compliance" />;
}