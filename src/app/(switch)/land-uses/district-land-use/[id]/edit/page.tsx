import EditProject from '@/components/project/EditProject';
import { usePageStore } from '@/store/pageStore';
import { LOCALITY_LEVELS } from '@/types/constants';
import { useLayoutEffect } from 'react';
import { useParams } from 'react-router';

export default function Page() {
  const { setPage } = usePageStore();
  const { project_slug } = useParams<{ project_slug: string }>();

  useLayoutEffect(() => {
    setPage({
      module: "land-uses",
      title: "Edit District Land Use Project",
    });
  }, [setPage]);

  return (
    <div>
      <EditProject 
        projectSlug={project_slug as string}
        moduleLevel={LOCALITY_LEVELS.DISTRICT}
        afterUpdateRedirectPath="/land-uses/district-land-use"
      />
    </div>
  );
}