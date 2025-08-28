'use client';

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, ChevronLeft, ChevronRight, AlertCircle, FileSearch, Search } from 'lucide-react';
import { useProjectsQuery } from '@/queries/useProjectQuery';
import { usePageStore } from '@/store/pageStore';
import { useLayoutEffect, useEffect, useCallback, useMemo } from 'react';
import { formatDate } from '@/lib/utils';
import type { ApiError } from '@/types/api-response';

type ProjectStatus = 'draft' | 'in-progress' | 'approved' | 'rejected' | 'completed';

interface ProjectFiltersType {
  projectStatus: ProjectStatus | '';
  projectName: string;
  page: number;
}

const PROJECT_STATUSES = [
  { value: 'null', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' }
];

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-purple-100 text-purple-800'
};

export default function VillageLandUsePage() {
  const { setPage } = usePageStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState<ProjectFiltersType>({
    projectStatus: '',
    projectName: '',
    page: 1
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

  // Projects and pagination info from API response
  const projects = projectsData?.results || [];
  const pagination = {
    count: projectsData?.count || 0,
    next: projectsData?.next || null,
    previous: projectsData?.previous || null,
    current_page: filters.page,
    total_pages: Math.ceil((projectsData?.count || 0) / 50),
    has_previous: !!projectsData?.previous,
    has_next: !!projectsData?.next,
    total_count: projectsData?.count || 0
  };

  // Initialize page
  useLayoutEffect(() => {
    setPage({
      module: 'land-uses',
      title: "Village Land Use Projects",
      backButton: 'Modules'
    });
  }, [setPage]);

  // Handle errors by showing modal
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

  // List of projects
  const projectsList = useMemo(() =>
    projects.map((project, index) => ({
      ...project,
      rowNumber: ((filters.page - 1) * 50) + index + 1
    }))
    , [projects, filters.page]);

  // Handlers
  const handleFilterChange = useCallback((key: keyof ProjectFiltersType, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : Number(value)
    }));
  }, []);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleSearch = useCallback(() => {
    handleFilterChange('projectName', searchInput);
  }, [searchInput, handleFilterChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleRetry = useCallback(() => {
    setShowErrorModal(false);
    refetch();
  }, [refetch]);

  const handleCancel = useCallback(() => {
    setShowErrorModal(false);
    setCurrentError(null);
  }, []);

  const LoadingTable = () => (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {['No.', 'Registration Date', 'Project Name', 'Project Type', 'Station', 'Total Villages', 'Current Task', 'Status'].map((header) => (
                <TableHead key={header}>{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, i) => (
              <TableRow key={`loading-${i}`}>
                {Array(8).fill(0).map((_, j) => (
                  <TableCell key={`loading-cell-${i}-${j}`}>
                    <div className="h-4 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );

  const EmptyState = ({ hasFilters }: { hasFilters: boolean; }) => (
    <div className="text-center py-12">
      <FileSearch className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400" />
      <h3 className="font-medium text-gray-600 mb-2">No projects found</h3>
      <p className="text-sm text-gray-500">
        {hasFilters ? 'Try adjusting your search criteria or filters' : 'No project forms have been created yet'}
      </p>
    </div>
  );

  const ProjectStatusBadge = ({ status }: { status: string }) => (
    <Badge className={`${STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'} font-medium`}>
      {status}
    </Badge>
  );

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
      <div className="text-sm text-gray-600">
        Page {pagination.current_page} of {pagination.total_pages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFilterChange('page', pagination.current_page - 1)}
          disabled={!pagination.has_previous}
          className="flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFilterChange('page', pagination.current_page + 1)}
          disabled={!pagination.has_next}
          className="flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Error Loading Projects
            </DialogTitle>
            <DialogDescription className="pt-4">
              {currentError}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleRetry}>
              Try Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Village Land Use Projects</h1>
          <p className="text-muted-foreground">Manage and track village land use planning projects</p>
        </div>
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
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
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

      {/* Results Table */}
      {isLoading ? (
        <LoadingTable />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  {['No:', 'Registration Date', 'Project Name', 'Project Type', 'Station', 'Total Villages', 'Current Task', 'Status'].map((header) => (
                    <TableHead key={header} className={header === 'Total Villages' ? 'text-center' : ''}>
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectsList.map((project) => (
                  <TableRow key={project.id} className="hover:bg-gray-50">
                    <TableCell className="text-center font-medium">{project.rowNumber}</TableCell>
                    <TableCell className="text-sm">{formatDate(project.reg_date)}</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="text-teal-600 hover:text-teal-800 font-medium p-0 h-auto"
                      >
                        {project.name}
                      </Button>
                    </TableCell>
                    <TableCell className="text-sm">{project.project_type_info.name}</TableCell>
                    <TableCell className="text-sm">{project.station_info.name}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-teal-100 text-teal-800 text-sm font-medium rounded">
                        {project.total_locality}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{project.current_task}</TableCell>
                    <TableCell>
                      {/* {project.status_info.map((status, index) => (
                        <ProjectStatusBadge key={index} status={status} />
                      ))} */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {projectsList.length === 0 && <EmptyState hasFilters={hasActiveFilters} />}
          </div>

          {projectsList.length > 0 && (
            <PaginationControls />
          )}
        </Card>
      )}

      {/* Results Summary */}
      {projectsList.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {projectsList.length} of {pagination.total_count} Projects
        </div>
      )}
    </>
  );
}
