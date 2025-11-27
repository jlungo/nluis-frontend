import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GRIIDashboardData } from '@/types/grii-dashboard';
import { useAuth } from '@/store/auth';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ProjectsComprehensiveProps {
  data: GRIIDashboardData;
  projects?: any[];
}

interface ProjectFilters {
  module: string | null;
  locality: string | null;
  status: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#FFA726',
  active: '#42A5F5',
  completed: '#66BB6A',
  cancelled: '#EF5350',
};

const getStatusColor = (status: string) => STATUS_COLORS[status.toLowerCase()] || '#999';

export const ProjectsComprehensive: React.FC<ProjectsComprehensiveProps> = ({ data }) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ProjectFilters>({
    module: null,
    locality: null,
    status: null,
  });
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [moduleLevels, setModuleLevels] = useState<any[]>([]);

  // Fetch available module levels on component mount
  useEffect(() => {
    const fetchModuleLevels = async () => {
      try {
        const response = await fetch(`/api/v1/form-management/levels/`);
        if (response.ok) {
          const data = await response.json();
          setModuleLevels(data.results || []);
        }
      } catch (error) {
        console.error('Error fetching module levels:', error);
      }
    };
    
    fetchModuleLevels();
  }, []);

  // Fetch projects from all modules
  useEffect(() => {
    const fetchAllProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const projectsData: any[] = [];
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('limit', '1000');
        params.append('offset', '0');
        if (user?.organization?.id) {
          params.append('organization', user.organization.id.toString());
        }
        if (filters.status) {
          params.append('project_status', filters.status);
        }

        // If specific module selected, query only that module
        if (filters.module) {
          try {
            const response = await fetch(`/api/v1/projects/?${params.toString()}&module_level=${filters.module}`);
            
            if (response.ok) {
              const moduleData = await response.json();
              
              if (moduleData.results && Array.isArray(moduleData.results)) {
                projectsData.push(
                  ...moduleData.results.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    reference_number: p.reference_number,
                    organization: p.organization,
                    module: filters.module,
                    budget: p.budget || 0,
                    status: p.project_status,
                    approval_status: p.approval_status,
                    registration_date: p.registration_date,
                    authorization_date: p.authorization_date,
                    remarks: p.remarks,
                    created_at: p.created_at,
                    total_locality: p.total_locality || 0,
                    total_funders: p.total_funders || 0,
                    localities: p.localities || [],
                    description: p.description,
                  }))
                );
              }
            }
          } catch (error) {
            console.error(`Error fetching projects from ${filters.module}:`, error);
          }
        } else {
          // Query all modules
          for (const moduleLevel of moduleLevels) {
            try {
              const response = await fetch(
                `/api/v1/projects/?${params.toString()}&module_level=${moduleLevel.slug}`
              );
              
              if (response.ok) {
                const moduleData = await response.json();
                
                if (moduleData.results && Array.isArray(moduleData.results)) {
                  projectsData.push(
                    ...moduleData.results.map((p: any) => ({
                      id: p.id,
                      name: p.name,
                      reference_number: p.reference_number,
                      organization: p.organization,
                      module: moduleLevel.name,
                      budget: p.budget || 0,
                      status: p.project_status,
                      approval_status: p.approval_status,
                      registration_date: p.registration_date,
                      authorization_date: p.authorization_date,
                      remarks: p.remarks,
                      created_at: p.created_at,
                      total_locality: p.total_locality || 0,
                      total_funders: p.total_funders || 0,
                      localities: p.localities || [],
                      description: p.description,
                    }))
                  );
                }
              }
            } catch (error) {
              console.error(`Error fetching projects from ${moduleLevel.name}:`, error);
            }
          }
        }

        setAllProjects(projectsData);
      } catch (error) {
        console.error('Error fetching all projects:', error);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    if (user?.organization?.id && moduleLevels.length > 0) {
      fetchAllProjects();
    }
  }, [user?.organization?.id, filters.status, filters.module, moduleLevels]);

  // Calculate statistics from real fetched data
  const calculateStats = () => {
    const stats = {
      total: allProjects.length,
      byStatus: {
        pending: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
      },
      totalBudget: 0,
      activeCount: 0,
      completedCount: 0,
    };

    allProjects.forEach((project: any) => {
      const status = (project.status || 'pending').toLowerCase();
      if (status in stats.byStatus) {
        stats.byStatus[status as keyof typeof stats.byStatus]++;
      }
      
      if (project.budget) {
        stats.totalBudget += parseFloat(project.budget) || 0;
      }

      if (status === 'active') {
        stats.activeCount++;
      }
      if (status === 'completed') {
        stats.completedCount++;
      }
    });

    return stats;
  };

  const projectStats = calculateStats();
  const byStatus = projectStats.byStatus;

  // Convert status counts to chart data
  const statusChartData = Object.entries(byStatus).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count as number,
    status: status,
  }));

  // Get unique localities from data
  const localities = Object.keys(data?.parcel?.byLocality || {});

  // Apply filters to projects
  const filteredProjects = allProjects.filter(p => {
    if (filters.module && p.module !== filters.module) return false;
    if (filters.locality && p.locality !== filters.locality) return false;
    if (filters.status && p.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{projectStats.activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${projectStats.totalBudget.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{projectStats.completedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Projects by Status</CardTitle>
            <CardDescription>Distribution across all statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusChartData.map((entry) => (
                    <Cell key={`cell-${entry.status}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Projects Count by Status</CardTitle>
            <CardDescription>Detailed breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {statusChartData.map((entry) => (
                    <Cell key={`bar-${entry.status}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Project List with Filters */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects Across Modules</CardTitle>
          <CardDescription>
            Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
            {isLoadingProjects && ' (Loading...)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Module and Locality Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Module Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Module</label>
              <select
                value={filters.module || ''}
                onChange={(e) => setFilters({ ...filters, module: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Modules</option>
                {moduleLevels.map((moduleLevel: any) => (
                  <option key={moduleLevel.slug} value={moduleLevel.slug}>
                    {moduleLevel.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Locality Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Locality</label>
              <select
                value={filters.locality || ''}
                onChange={(e) => setFilters({ ...filters, locality: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Localities</option>
                {localities.map(locality => (
                  <option key={locality} value={locality}>
                    {locality}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Filter by Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value || null })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Status Tabs */}
          <Tabs defaultValue="all" className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger 
                value="all"
                onClick={() => setFilters({ ...filters, status: null })}
              >
                All ({projectStats.total})
              </TabsTrigger>
              <TabsTrigger 
                value="status"
                onClick={() => setFilters({ ...filters, status: 'active' })}
              >
                Active ({byStatus.active})
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                onClick={() => setFilters({ ...filters, status: 'completed' })}
              >
                Completed ({byStatus.completed})
              </TabsTrigger>
              <TabsTrigger 
                value="pending"
                onClick={() => setFilters({ ...filters, status: 'pending' })}
              >
                Pending ({byStatus.pending})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Project Table */}
          {!isLoadingProjects && filteredProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-2 font-semibold">Project Name</th>
                    <th className="text-left py-2 px-2 font-semibold">Ref #</th>
                    <th className="text-left py-2 px-2 font-semibold">Organization</th>
                    <th className="text-left py-2 px-2 font-semibold">Module</th>
                    <th className="text-left py-2 px-2 font-semibold">Status</th>
                    <th className="text-left py-2 px-2 font-semibold">Localities</th>
                    <th className="text-left py-2 px-2 font-semibold">Funders</th>
                    <th className="text-left py-2 px-2 font-semibold">Registered</th>
                    <th className="text-left py-2 px-2 font-semibold">Authorized</th>
                    <th className="text-right py-2 px-2 font-semibold">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.slice(0, 100).map((project: any, idx: number) => (
                    <tr key={`${project.module}-${project.id}-${idx}`} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 font-medium text-blue-600">{project.name}</td>
                      <td className="py-2 px-2 text-xs text-gray-600">{project.reference_number || 'N/A'}</td>
                      <td className="py-2 px-2 text-xs">{project.organization || 'N/A'}</td>
                      <td className="py-2 px-2">
                        <Badge variant="outline" className="text-xs">{project.module}</Badge>
                      </td>
                      <td className="py-2 px-2">
                        <Badge style={{ backgroundColor: getStatusColor(project.status || '') }} className="text-xs">
                          {project.status || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="py-2 px-2 text-center font-medium">{project.total_locality || 0}</td>
                      <td className="py-2 px-2 text-center font-medium">{project.total_funders || 0}</td>
                      <td className="py-2 px-2 text-xs text-gray-600">
                        {project.registration_date ? new Date(project.registration_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-2 px-2 text-xs text-gray-600">
                        {project.authorization_date ? new Date(project.authorization_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-2 px-2 text-right font-semibold">${(project.budget || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProjects.length > 100 && (
                <div className="text-center py-4 text-gray-500">
                  Showing 100 of {filteredProjects.length} projects
                </div>
              )}
            </div>
          ) : isLoadingProjects ? (
            <div className="text-center py-8 text-gray-500">
              <p>Loading projects from all modules...</p>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No projects found matching the selected filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Breakdown Cards */}
      <Card>
        <CardHeader>
          <CardTitle>Project Status Breakdown</CardTitle>
          <CardDescription>Detailed statistics by status - calculated from real project data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(byStatus).map(([status, count]) => (
              <div
                key={status}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setFilters({ ...filters, status: status })}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 capitalize">{status}</p>
                    <p className="text-2xl font-bold">{count as number}</p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getStatusColor(status) + '20' }}
                  >
                    <span style={{ color: getStatusColor(status) }} className="text-lg font-semibold">
                      {count as number}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsComprehensive;
