import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { usePageStore } from "@/store/pageStore";
import { projectService } from '@/services/projects';
import { organizationService } from '@/services/organizations';
import type { Project, ProjectStats } from '@/types/projects';
import type { Organization } from '@/types/organizations';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FolderOpen,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2,
  RefreshCw,
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Building2
} from 'lucide-react';

export default function OrganizationProjectsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setPage } = usePageStore();
  
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Set page metadata
  useEffect(() => {
    setPage({
      module: 'organizations',
      title: 'Organization Projects'
    });
  }, [setPage]);

  // Load organization and projects
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        toast.error('Organization ID is required');
        navigate('/organizations/directory');
        return;
      }

      try {
        setLoading(true);
        console.log('Loading organization and projects data...');
        
        // Load organization details
        const orgData = await organizationService.getOrganization(id);
        console.log('Organization loaded:', orgData);
        setOrganization(orgData);

        // Load organization projects
        const projectsData = await projectService.getOrganizationProjects(id, {
          search: searchTerm,
          status: statusFilter,
          sort: '-created_at'
        });
        console.log('Projects loaded:', projectsData);
        setProjects(projectsData);

        // Load organization-specific stats
        try {
          const statsData = await projectService.getProjectStats(id);
          console.log('Stats loaded:', statsData);
          setStats(statsData);
        } catch (statsError) {
          console.error('Error loading stats (non-critical):', statsError);
        }

      } catch (error: any) {
        console.error('Error loading data:', error);
        toast.error('Failed to load organization projects');
        navigate('/organizations/directory');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadData, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [id, searchTerm, statusFilter, navigate]);

  const handleRefresh = async () => {
    if (!id) return;
    
    setRefreshing(true);
    try {
      const projectsData = await projectService.getOrganizationProjects(id, {
        search: searchTerm,
        status: statusFilter,
        sort: '-created_at'
      });
      setProjects(projectsData);
      
      const statsData = await projectService.getProjectStats(id);
      setStats(statsData);
      
      toast.success('Projects data refreshed');
    } catch (error: any) {
      console.error('Error refreshing projects:', error);
      toast.error('Failed to refresh projects data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateProject = () => {
    navigate(`/organizations/${id}/projects/new`);
  };

  const handleView = (project: Project) => {
    navigate(`/organizations/${id}/projects/${project.id}`);
  };

  const handleEdit = (project: Project) => {
    navigate(`/organizations/${id}/projects/${project.id}/edit`);
  };

  const handleDelete = async (project: Project) => {
    if (confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      try {
        await projectService.deleteProject(project.id);
        toast.success('Project deleted successfully');
        handleRefresh();
      } catch (error: any) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-progress-completed/10 text-progress-completed border-progress-completed/20';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Organization Not Found</h2>
        <p className="text-muted-foreground mb-4">The organization you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/organizations/directory')}>
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-none p-6 bg-background border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/organizations/${id}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Organization
            </Button>
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                {organization.name} - Projects
              </h2>
              <p className="text-muted-foreground">
                Manage projects for this organization
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleCreateProject}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Organization Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Organization Type</label>
                <p className="text-foreground">{organization.type?.name || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="text-foreground">{organization.district}, {organization.region}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge className={
                  organization.status === 'active' 
                    ? 'bg-progress-completed/10 text-progress-completed border-progress-completed/20'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                }>
                  {organization.status?.charAt(0).toUpperCase() + organization.status?.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Projects
                  </CardTitle>
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-semibold text-foreground mb-1">
                  {stats.total_projects}
                </div>
                <p className="text-xs text-muted-foreground">
                  All projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Active Projects
                  </CardTitle>
                  <div className="h-5 w-5 bg-progress-completed rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-semibold text-foreground mb-1">
                  {stats.active_projects}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently running
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Completed
                  </CardTitle>
                  <div className="h-5 w-5 bg-blue-500 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-semibold text-foreground mb-1">
                  {stats.completed_projects}
                </div>
                <p className="text-xs text-muted-foreground">
                  Finished projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Draft Projects
                  </CardTitle>
                  <div className="h-5 w-5 bg-gray-400 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-semibold text-foreground mb-1">
                  {stats.draft_projects}
                </div>
                <p className="text-xs text-muted-foreground">
                  In preparation
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription>
                  Manage projects for {organization.name}
                </CardDescription>
              </div>
              <Button
                onClick={handleCreateProject}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Timeline</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        {searchTerm || statusFilter ? 'No projects match your filters' : 'No projects found'}
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCreateProject}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Create First Project
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {project.description?.substring(0, 60)}
                              {project.description && project.description.length > 60 ? '...' : ''}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {project.type.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {project.location ? (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {project.location.district || project.location.region || 'N/A'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {project.progress_percentage !== undefined ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${project.progress_percentage}%` }}
                                />
                              </div>
                              <span className="text-sm">{project.progress_percentage}%</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {project.budget ? (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{formatCurrency(project.budget)}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {project.start_date ? (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                {new Date(project.start_date).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(project)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(project)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(project)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}