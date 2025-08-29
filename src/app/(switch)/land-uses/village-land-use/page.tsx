'use client';

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileSearch, Search } from 'lucide-react';
import { ProjectInterface, useProjectsQuery } from '@/queries/useProjectQuery';
import { usePageStore } from '@/store/pageStore';
import { useLayoutEffect, useEffect } from 'react';
import type { ApiError } from '@/types/api-response';
import { DataTable } from '@/components/DataTable';
import { VillageLandUseTableColumn } from '@/lib/TableColumns/land-uses.colums';
import { ErrorDialog } from '@/components/ErrorDialog';

type ProjectStatus = 'draft' | 'in-progress' | 'approved' | 'rejected' | 'completed';

interface ProjectFiltersType {
  projectStatus: ProjectStatus | '';
  projectName: string;
}

const PROJECT_STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' }
];

export default function VillageLandUsePage() {
  const { setPage } = usePageStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState<ProjectFiltersType>({
    projectStatus: '',
    projectName: '',
  });
  const [searchInput, setSearchInput] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);

  // React Query hook for village land use projects
  const { data: projectsData, isLoading, error, refetch } = useProjectsQuery({
    type: 'village-land-use',
    status: filters.projectStatus || undefined,
    search: filters.projectName || undefined
  });
  const projects = projectsData?.results || [];
  // console.log('== Oiii oi fetched projects:', projects);

  // Initialize page
  useLayoutEffect(() => {
    setPage({
      module: 'land-uses',
      title: "Village Land Use Projects",
      backButton: 'Modules'
    });
  }, [setPage]);

  // Handle errors by showing error dialog
  useEffect(() => {
    if (error) {
      const apiError = error as ApiError;
      setCurrentError(
        apiError.response?.data?.detail ||
        apiError.message ||
        'Failed to fetch projects'
      );
      setShowErrorModal(true);
    }
  }, [error]);

  const hasActiveFilters = Boolean(filters.projectStatus || filters.projectName);

  // Handlers
  const handleFilterChange = (key: keyof ProjectFiltersType, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = () => {
    handleFilterChange('projectName', searchInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRetry = () => {
    setShowErrorModal(false);
    refetch();
  };

  const handleCancel = () => {
    setShowErrorModal(false);
    setCurrentError(null);
  };

  const handleRowClick = (project: ProjectInterface) => {
    navigate(`/projects/${project.id}`);
  };

  const rightToolbar = (
    <Button
      onClick={() => navigate('/land-uses/create-project', {
        state: {
          type: 'Village Land Use',
          from: location.pathname
        }
      })}
      className="gap-2"
    >
      <Plus className="h-4 w-4" /> Create New Project
    </Button>
  );

  return (
    <>
      {/* Error Modal */}
      <ErrorDialog
        open={showErrorModal}
        errorMessage={currentError || ''}
        onOpenChange={setShowErrorModal}
        onCancel={handleCancel}
        onRetry={handleRetry}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Village Land Use Projects</h1>
        <p className="text-muted-foreground">Manage and track village land use planning projects</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-col md:flex-row items-stretch gap-4 w-full">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by name..."
                value={searchInput}
                onChange={handleSearchInputChange}
                onKeyDown={handleKeyPress}
                className="w-full pl-10"
              />
            </div>

            {/* Status Select */}
            <div className="flex-1 min-w-0">
              <Select
                value={filters.projectStatus}
                onValueChange={(value) => handleFilterChange('projectStatus', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DataTable */}
      <DataTable<ProjectInterface, unknown>
        columns={VillageLandUseTableColumn}
        data={projects}
        isLoading={isLoading}
        showRowNumbers={true}
        onRowClick={handleRowClick}
        enableGlobalFilter={false}
        rightToolbar={rightToolbar}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
      />
    </>
  );
}