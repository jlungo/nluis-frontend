import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, ChevronLeft, ChevronRight, AlertCircle, FileSearch } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useVillageLandUseProjects } from '@/queries/useProjectQuery';
import type { Project } from '@/types/projects';

// Types
type ProjectStatus = 'draft' | 'in-progress' | 'approved' | 'rejected' | 'completed';

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
export default function VillageLandUsePage() {
  const { setPage } = usePageStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { getFiltersFromUrl, updateFiltersInUrl } = useUrlFilters();

  const [filters, setFilters] = useState<ProjectFilters>(getFiltersFromUrl);
  const [searchInput, setSearchInput] = useState(getFiltersFromUrl().projectName);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null);

  // Use React Query hook for village land use projects
  const { data: projects = [], isLoading, error, refetch } = useVillageLandUseProjects({
    status: filters.projectStatus || undefined,
    search: filters.projectName || undefined
  });

  // Initialize page
  useLayoutEffect(() => {
    setPage({
      module: 'land-uses',
      title: "Village Land Use Projects",
      backButton: 'Modules'
    });
  }, [setPage]);

  // Sync URL and state
  useEffect(() => {
    const urlFilters = getFiltersFromUrl();
    setFilters(urlFilters);
  }, [getFiltersFromUrl]);

  // Update URL when filters change
  useEffect(() => {
    updateFiltersInUrl(filters);
  }, [filters, updateFiltersInUrl]);

  // Handle errors by showing modal
  useEffect(() => {
    if (error) {
      setCurrentError(error instanceof Error ? error.message : 'Failed to fetch projects');
      setShowErrorModal(true);
    }
  }, [error]);

  // Derived values
  const hasActiveFilters = Boolean(filters.projectStatus);
  const currentPage = filters.page;
  const pageSize = 10;
  const totalPages = Math.ceil(projects.length / pageSize);
  const paginatedProjects = projects.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
    refetch();
  }, [refetch]);

  const handleCancel = useCallback(() => {
    setShowErrorModal(false);
    setCurrentError(null);
  }, []);

  // Enhanced projects data
  const enhancedProjects = useMemo(() => paginatedProjects.map((project: Project, i: number) => ({
    ...project,
    slug: project.id,
    name: project.name || 'Unnamed Project',
    section_name: 'Village Land Use',
    status: (project.status || getRandomItem<ProjectStatus>(['draft', 'in-progress', 'approved', 'rejected', 'completed'])) as ProjectStatus,
    current_task: getRandomItem(CURRENT_TASKS),
    localities_count: Math.floor(Math.random() * 5) + 1,
    created_at: project.created_at || new Date().toISOString(),
    rowNumber: (currentPage - 1) * pageSize + i + 1
  })), [paginatedProjects, currentPage]);

  return (
    <>
      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-[425px] dark:border-gray-800 dark:bg-gray-950">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-gray-100">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
              Error Loading Projects
            </DialogTitle>
            <DialogDescription className="pt-4 dark:text-gray-400">
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
        <h2 className="text-xl font-semibold">Project List</h2>
        <Button
          onClick={() => navigate('/land-uses/create-project', {
            state: {
              type: 'Village Land Use',
              from: location.pathname
            }
          })}
          size="sm"
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" /><span className="hidden md:block">Create </span>New Project
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
                    <TableCell className="text-sm">{project.section_name || 'Village Land Use'}</TableCell>
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

          {projects.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              hasNext={currentPage < totalPages}
              hasPrevious={currentPage > 1}
              onPageChange={(page) => handleFilterChange('page', page)}
            />
          )}
        </Card>
      )}

      {/* Results Summary */}
      {projects.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Showing {enhancedProjects.length} of {projects.length} project forms
        </div>
      )}
    </>
  );
}