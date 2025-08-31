'use client';

import ProjectsListPage from '@/components/project/ProjectsListPage';
import { usePageStore } from '@/store/pageStore';
import { useEffect } from 'react';

export default function NationalUsePage() {
  const { setPage } = usePageStore();

  useEffect(() => {
    setPage({
      module: 'land-uses',
      title: 'National Land Use Projects',
    });
  }, [setPage]);

  return (
    <ProjectsListPage
      module="land-uses"
      moduleLevel="national-land-use" 
      pageTitle="National Land Use" 
    />
  );
}