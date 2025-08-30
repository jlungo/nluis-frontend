'use client';

import ProjectsList from '@/components/project/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function VillageLandUsePage() {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'land-uses',
      title: 'Village Land Use Projects',
      backButton: 'Modules',
    });
  }, [setPage]);

  return (
    <ProjectsList
      module="land-uses"
      moduleLevel="village-land-use" 
      pageTitle="Village Land Use" 
    />
  );
}