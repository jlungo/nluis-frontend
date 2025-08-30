'use client';

import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ChevronLeft, ChevronRight, AlertCircle, FileSearch } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Types
type ProjectStatus = 'draft' | 'in-progress' | 'approved' | 'rejected' | 'completed';

interface ProjectForm {
  slug: string;
  name: string;
  description: string;
  version: string;
  project_name: string;
  section_name: string;
  level_name: string;
  module_name: string;
  created_at: string;
  status: ProjectStatus;
  current_task: string;
  localities_count: number;
}

interface ApiResponse {
  results: ProjectForm[];
  count: number;
  next: string | null;
  previous: string | null;
}

interface ProjectFilters {
  projectStatus: string;
  projectName: string;
  page: number;
}

const PROJECT_STATUSES = [
  { value: '', label: 'Select Project status' },
  { value: 'draft', label: 'Draft' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' }
];

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  completed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
};

const CURRENT_TASKS = [
  'Project Inception',
  'Data Collection',
  'Analysis',
  'Draft Preparation',
  'Review Process',
  'Final Output',
  'Approval Process'
];

// Custom Hooks
const useProjectForms = () => {
  const [data, setData] = useState<ApiResponse>({
    results: [],
    count: 0,
    next: null,
    previous: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [is404, setIs404] = useState(false);

  const fetchProjectForms = useCallback(async (filters: ProjectFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.projectStatus) params.append('status', filters.projectStatus);
      if (filters.projectName) params.append('search', filters.projectName);
      params.append('page', filters.page.toString());

      const response = await fetch(`/api/project-forms/?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setIs404(true);
          setData({ results: [], count: 0, next: null, previous: null });
          return;
        }
        throw new Error(`Failed to fetch project forms: ${response.status}`);
      }

      setIs404(false);
      setData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project forms');
      console.error('Project forms fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, is404, setIs404, fetchProjectForms };
};

const useUrlFilters = () => {
  const searchParams = useSearchParams()[0];
  const navigate = useNavigate();
  const location = useLocation();

  const getFiltersFromUrl = useCallback((): ProjectFilters => ({
    projectStatus: searchParams.get('status') || '',
    projectName: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page') || '1', 10)
  }), [searchParams]);

  const updateFiltersInUrl = useCallback((filters: ProjectFilters) => {
    const newParams = new URLSearchParams();
    if (filters.projectStatus) newParams.set('status', filters.projectStatus);
    if (filters.projectName) newParams.set('search', filters.projectName);
    if (filters.page > 1) newParams.set('page', filters.page.toString());

    navigate(`${location.pathname}${newParams.size ? `?${newParams}` : ''}`, { replace: true });
  }, [navigate, location.pathname]);

  return { getFiltersFromUrl, updateFiltersInUrl };
};

// Utility Functions
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';

    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }) + ' ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch {
    return 'Invalid Date';
  }
};

const getRandomItem = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

// Components
const FilterDropdown = ({
  value,
  onChange,
  options,
  className = "",
  id
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  id?: string;
}) => (
  <select
    id={id}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`bg-white dark:bg-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm min-w-[200px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${className}`}
    aria-label={options.find(opt => opt.value === value)?.label || 'Select option'}
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
);

const ProjectStatusBadge = ({ status }: { status: ProjectStatus }) => (
  <Badge className={`${STATUS_COLORS[status]} font-medium`}>
    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
  </Badge>
);

const PaginationControls = ({
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
}) => (
  <div className="flex items-center justify-between px-6 py-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
    <div className="text-sm text-gray-600 dark:text-gray-400">
      Page {currentPage} of {totalPages}
    </div>
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious}
        className="flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        className="flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Go to next page"
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  </div>
);

const LoadingTable = () => (
  <Card>
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {['No:', 'Created Date', 'Land Use', 'Land Use Planning', 'Localities', 'Current Task', 'Status'].map((header) => (
              <TableHead key={header}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array(5).fill(0).map((_, i) => (
            <TableRow key={`loading-${i}`}>
              {Array(7).fill(0).map((_, j) => (
                <TableCell key={`loading-cell-${i}-${j}`}>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
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
    <FileSearch className="h-12 w-12 mx-auto mb-4 opacity-50 text-gray-400 dark:text-gray-600" />
    <h3 className="font-medium text-gray-600 dark:text-gray-300 mb-2">No projects found</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400">
      {hasFilters ? 'Try adjusting your search criteria or filters' : 'No project forms have been created yet'}
    </p>
  </div>
);

// Main Component
export default function RegionalLandUsePage() {
  const { setPage } = usePageStore();
  const navigate = useNavigate();
  const { data, isLoading, error, is404, setIs404, fetchProjectForms } = useProjectForms();
  const { getFiltersFromUrl, updateFiltersInUrl } = useUrlFilters();

  const [filters, setFilters] = useState<ProjectFilters>(getFiltersFromUrl);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(getFiltersFromUrl().projectName);

  // Initialize page
  useLayoutEffect(() => {
    setPage({
      module: 'land-uses',
      title: "Regional Land Use Projects",

    });
  }, [setPage]);

  // Sync URL and state
  useEffect(() => {
    const urlFilters = getFiltersFromUrl();
    setFilters(urlFilters);
  }, [getFiltersFromUrl]);

  // Fetch data when filters change
  useEffect(() => {
    fetchProjectForms(filters);
  }, [fetchProjectForms, filters]);

  // Update URL when filters change
  useEffect(() => {
    updateFiltersInUrl(filters);
  }, [filters, updateFiltersInUrl]);

  // Handle errors by showing modal
  useEffect(() => {
    if (error) {
      setCurrentError(error);
      setShowErrorModal(true);
    }
  }, [error]);

  // Derived values
  const totalPages = Math.ceil(data.count / 10);
  const currentPage = filters.page;
  const hasActiveFilters = Boolean(filters.projectStatus);

  // Handlers
  const handleFilterChange = useCallback((key: keyof ProjectFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : Number(value)
    }));
  }, []);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    if (e.target.value === '') handleFilterChange('projectName', '');
  }, [handleFilterChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFilterChange('projectName', searchInput);
    }
  }, [searchInput, handleFilterChange]);

  const handleRetry = useCallback(() => {
    setShowErrorModal(false);
    fetchProjectForms(filters);
  }, [fetchProjectForms, filters]);

  const handleCancel = useCallback(() => {
    setShowErrorModal(false);
    setCurrentError(null);
    setIs404(false);
  }, [setIs404]);

  // Enhanced projects data
  const enhancedProjects = useMemo(() => data.results.map((project, i) => ({
    ...project,
    status: project.status || getRandomItem<ProjectStatus>(['draft', 'in-progress', 'approved', 'rejected', 'completed']),
    current_task: project.current_task || getRandomItem(CURRENT_TASKS),
    localities_count: project.localities_count || Math.floor(Math.random() * 5) + 1,
    created_at: project.created_at || new Date().toISOString(),
    rowNumber: (currentPage - 1) * 10 + i + 1
  })), [data.results, currentPage]);

  return (
    <div className="space-y-6 p-6">
      {/* Error Modal */}
      <Dialog open={showErrorModal || is404} onOpenChange={(open) => {
        setShowErrorModal(open);
        if (!open) setIs404(false);
      }}>
        <DialogContent className="sm:max-w-[425px] dark:border-gray-800 dark:bg-gray-950">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-gray-100">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
              {is404 ? "No Projects Found" : "Error Loading Projects"}
            </DialogTitle>
            <DialogDescription className="pt-4 dark:text-gray-400">
              {is404
                ? "No project forms have been found. This could be due to connection issues or the resource may not exist."
                : currentError
              }
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
        <h2 className="text-xl font-semibold">Project List</h2>
        <Button
          onClick={() => navigate('/land-uses/create-project', {
            state: {
              type: 'Regional Land Use Plans',
              from: location.pathname
            }
          })}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" /> Create New Project
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium dark:text-gray-300">Status:</span>
            <FilterDropdown
              id="project-status-filter"
              value={filters.projectStatus}
              onChange={(v) => handleFilterChange('projectStatus', v)}
              options={PROJECT_STATUSES}
              className="w-[200px]"
            />
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchInput}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyPress}
              className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-900 dark:text-gray-100"
            />
            <Button
              onClick={() => handleFilterChange('projectName', searchInput)}
              className="bg-primary hover:bg-primary/90"
            >
              Search
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Table */}
      {isLoading ? (
        <LoadingTable />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                  {['No:', 'Created Date', 'Land Use', 'Land Use Planning', 'Localities', 'Current Task', 'Status'].map((header) => (
                    <TableHead key={header} className={`${header === 'Localities' ? 'text-center' : ''} dark:text-gray-200`}>
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {enhancedProjects.map((project) => (
                  <TableRow key={project.slug} className="hover:bg-gray-50">
                    <TableCell className="text-center font-medium">{project.rowNumber}</TableCell>
                    <TableCell className="text-sm">{formatDate(project.created_at)}</TableCell>
                    <TableCell>
                      <Link
                        to={`/forms/${project.slug}`}
                        className="text-teal-600 hover:text-teal-800 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 rounded"
                      >
                        {project.name || 'Unnamed Project'}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{project.section_name || 'Regional Land Use'}</TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-teal-100 text-teal-800 text-sm font-medium rounded">
                        {project.localities_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{project.current_task}</TableCell>
                    <TableCell><ProjectStatusBadge status={project.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {enhancedProjects.length === 0 && <EmptyState hasFilters={hasActiveFilters} />}
          </div>

          {data.count > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              hasNext={!!data.next}
              hasPrevious={!!data.previous}
              onPageChange={(page) => handleFilterChange('page', page)}
            />
          )}
        </Card>
      )}

      {/* Results Summary */}
      {data.count > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Showing {enhancedProjects.length} of {data.count} project forms
        </div>
      )}
    </div>
  );
}
