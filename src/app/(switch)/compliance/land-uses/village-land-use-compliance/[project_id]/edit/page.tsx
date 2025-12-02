import CreateOrEditProject from '@/components/compliance-project/CreateOrEditProject';
import { usePageStore } from '@/store/pageStore';
import { LOCALITY_LEVELS } from '@/types/constants';
import { useLayoutEffect } from 'react';
import { useParams } from 'react-router';

export default function Page() {
  const { setPage } = usePageStore();
  const { project_id } = useParams<{ project_id: string }>();

  useLayoutEffect(() => {
    setPage({
      module: "compliance",
      title: "Edit Village Land Use Compliance Project",
    });
  }, [setPage]);

  return (
    <CreateOrEditProject
      projectId={project_id as string}
      moduleLevel={LOCALITY_LEVELS.VILLAGE}
      redirectPath="/compliance/land-uses/village-land-use-compliance"
      level="village-land-use"
    />
  )
}