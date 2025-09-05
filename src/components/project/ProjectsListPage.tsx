import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Plus, Search } from 'lucide-react';
import { useProjectsQuery, useDeleteProject } from '@/queries/useProjectQuery';
import { ErrorDialog } from '@/components/ErrorDialog';
import { DataTable } from '@/components/DataTable';
import { ProjectsDataTableColumn } from '@/components/project/ProjectDataTableColumns';
import type { ApiError } from '@/types/api-response';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ProjectI, ProjectsListPageProps } from '@/types/projects';
import ActionButtons from '@/components/ActionButtons';
import { ProjectApprovalStatus, ProjectStatusFilters } from '@/types/constants';
import { canCreateProject, canDeleteProject } from './permissions';
import { useAuth } from '@/store/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export default function ProjectsListPage({ module, moduleLevel, pageTitle }: ProjectsListPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth()

  const [filters, setFilters] = useState({ status: '', name: '', approval_status: '' });
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, error: queryError, refetch } = useProjectsQuery({
    organization: user?.organization?.id || '',
    module_level: moduleLevel,
    status: filters.status || undefined,
    search: filters.name || undefined,
    approval_status: filters.approval_status || undefined
  });

  const { mutateAsync } = useDeleteProject();

  useEffect(() => {
    if (queryError) {
      const err = queryError as ApiError;
      setError(err.response?.data?.detail || err.message || 'Failed to fetch projects');
    }
  }, [queryError]);

  const handleChange = (key: 'status' | 'name' | 'approval_status', value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const handleRowClick = (project: ProjectI) =>
    navigate(`/${module}/${moduleLevel}/${project.id}`);

  const handleCreate = () =>
    navigate(`/${module}/${moduleLevel}/create`, {
      state: { type: pageTitle, from: location.pathname },
    });

  const handleDelete = (project: ProjectI) => {
    if (!user || !user.role?.name) return
    const canDelete = canDeleteProject(user.role.name, project.approval_status)
    if (!canDelete) return
    mutateAsync(project.id).then(() => refetch());
  };

  const canCreate = () => {
    if (!user || !user.role?.name) return false
    return canCreateProject(user.role.name)
  }

  if (!user) return

  return (
    <>
      <ErrorDialog
        open={!!error}
        errorMessage={error || ''}
        onOpenChange={() => setError(null)}
        onCancel={() => setError(null)}
        onRetry={() => {
          setError(null);
          refetch();
        }}
      />

      <div className='flex justify-between items-start'>
        <div className='space-y-1'>
          <h1 className="text-lg lg:text-2xl font-semibold capitalize">{decodeURIComponent(moduleLevel.replace(/-/g, " "))} Projects</h1>
          <p className="text-muted-foreground text-sm">Manage and track land use planning projects</p>
        </div>
        {canCreate() ? (
          <Button type='button' onClick={handleCreate} size='sm' className="gap-2 text-xs md:text-sm">
            <Plus className="h-4 w-4" /> <span className='hidden lg:inline'>Create </span>New Project
          </Button>
        ) : null}
      </div>

      <Card className="mb-5">
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChange('name', search)}
                className="pl-10"
              />
            </div>

            <div className="flex-1">
              <Select
                value={filters.status}
                onValueChange={(val) => handleChange('status', val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ProjectStatusFilters).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => handleChange('name', search)} size='sm' className="gap-2">
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={filters.approval_status} onValueChange={e => handleChange('approval_status', e)}>
        <TabsList className='rounded-full w-full'>
          <TabsTrigger value="" className='cursor-pointer rounded-full text-xs md:text-sm'>All</TabsTrigger>
          {Object.entries(ProjectApprovalStatus).map(([key, label]) => (
            <TabsTrigger key={key} value={key} className='cursor-pointer rounded-full text-xs md:text-sm'>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={filters.approval_status}>
          <DataTable<ProjectI, unknown>
            columns={ProjectsDataTableColumn}
            data={data?.results || []}
            isLoading={isLoading}
            showRowNumbers
            enableGlobalFilter={false}
            onRowClick={handleRowClick}
            initialPageSize={10}
            pageSizeOptions={[5, 10, 20, 50]}
            rowActions={(row) => (
              <ActionButtons
                entity={row}
                entityName="Project"
                onView={e => navigate(`${e.id}`)}
                onEdit={e => navigate(`${e.id}/edit`)}
                deleteFunction={() => handleDelete(row)}
              />
            )}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}