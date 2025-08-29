'use client';

import { useState, useLayoutEffect, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Plus, Search } from 'lucide-react';
import { useProjectsQuery, ProjectInterface } from '@/queries/useProjectQuery';
import { usePageStore } from '@/store/pageStore';
import { ErrorDialog } from '@/components/ErrorDialog';
import { DataTable } from '@/components/DataTable';
import { VillageLandUseTableColumn } from '@/lib/TableColumns/land-uses.colums';
import type { ApiError } from '@/types/api-response';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' }
];

export default function VillageLandUsePage() {
  const navigate = useNavigate();
  const { setPage } = usePageStore();
  const location = useLocation();

  const [filters, setFilters] = useState({ status: '', name: '' });
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, error: queryError, refetch } = useProjectsQuery({
    type: 'village-land-use',
    status: filters.status || undefined,
    search: filters.name || undefined,
  });

  useLayoutEffect(() => {
    setPage({
      module: 'land-uses',
      title: 'Village Land Use Projects',
      backButton: 'Modules',
    });
  }, [setPage]);

  useEffect(() => {
    if (queryError) {
      const err = queryError as ApiError;
      setError(err.response?.data?.detail || err.message || 'Failed to fetch projects');
    }
  }, [queryError]);

  const handleChange = (key: 'status' | 'name', value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const handleSearch = () => handleChange('name', search);

  const handleRowClick = (project: ProjectInterface) =>
    navigate(`/projects/${project.id}`);

  const handleCreate = () =>
    navigate('/land-uses/create-project', {
      state: { type: 'Village Land Use', from: location.pathname },
    });

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
        <h1 className="text-2xl font-semibold">Village Land Use Projects</h1>
        <p className="text-muted-foreground">Manage and track village land use planning projects</p>
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
                  {STATUSES.map(({ value, label }) => (
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

      <DataTable<ProjectInterface, unknown>
        columns={VillageLandUseTableColumn}
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
      />
    </>
  );
}
