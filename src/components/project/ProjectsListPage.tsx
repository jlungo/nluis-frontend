'use client';

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
import { ProjectStatusFilters } from '@/types/constants';
import { useUserOrganization } from '@/hooks/use-user-organization';

export default function ProjectsListPage({ module, moduleLevel, pageTitle }: ProjectsListPageProps) {
  const userOrganization = useUserOrganization();
  const navigate = useNavigate();
  const location = useLocation();

  const [filters, setFilters] = useState({ status: '', name: '' });
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, error: queryError, refetch } = useProjectsQuery({
    organization: userOrganization || '',
    module_level: 1, // TODO: Update to use dynamic module level
    status: filters.status || undefined,
    search: filters.name || undefined,
  }); 

  const deleteProjectMutation = useDeleteProject();

  useEffect(() => {
    if (queryError) {
      const err = queryError as ApiError;
      setError(err.response?.data?.detail || err.message || 'Failed to fetch projects');
    }
  }, [queryError]);

  const handleChange = (key: 'status' | 'name', value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const handleSearch = () => handleChange('name', search);

  const handleRowClick = (project: ProjectI) =>
    navigate(`/${module}/${moduleLevel}/${project.id}`);

  const handleCreate = () =>
    navigate(`/${module}/${moduleLevel}/create`, {
      state: { type: pageTitle, from: location.pathname },
    });

  const handleDelete = async (project: ProjectI) => {
      try {
        await deleteProjectMutation.mutateAsync(project.id);
        refetch();
      } catch (error) {
        // console.error('Failed to delete project: ', error);
        setError('Failed to delete project. Please try again.');
      }
  };

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

      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Projects List</h1>
        <p className="text-muted-foreground">Manage and track land use planning projects</p>
      </div>

      <Card className="mb-6">
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <DataTable<ProjectI, unknown>
        columns={ProjectsDataTableColumn}
        data={data?.results || []}
        isLoading={isLoading}
        showRowNumbers
        enableGlobalFilter={false}
        onRowClick={handleRowClick}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 20, 50]}
        rightToolbar={
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Create New Project
          </Button>
        }
        rowActions={(row) => (
          <ActionButtons
            entity={row}
            entityName="Project"
            onView={(e) => navigate(`${e.id}`)}
            onEdit={(e) => navigate(`${e.id}/edit`)}
            deleteFunction={handleDelete}
          />
        )}
      />
    </>
  );
}