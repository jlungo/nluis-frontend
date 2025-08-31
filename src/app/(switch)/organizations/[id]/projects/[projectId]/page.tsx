import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { usePageStore } from "@/store/pageStore";
import { projectService } from '@/services/projects';
import { organizationService } from '@/services/organizations';
import type { ProjectI, ProjectUser } from '@/types/projects';
import type { OrganizationI } from '@/types/organizations';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FolderOpen,
  Calendar,
  DollarSign,
  Users,
  Edit,
  ArrowLeft,
  Loader2,
  Building2,
  User,
  Clock,
  Target,
  AlertCircle
} from 'lucide-react';

export default function ProjectDetailPage() {
  const { id, projectId } = useParams();
  const navigate = useNavigate();
  const { setPage } = usePageStore();

  const [project, setProject] = useState<ProjectI | null>(null);
  const [organization, setOrganization] = useState<OrganizationI | null>(null);
  const [projectUsers, setProjectUsers] = useState<ProjectUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Set page metadata
  useEffect(() => {
    setPage({
      module: 'organizations',
      title: 'Project Details'
    });
  }, [setPage]);

  useEffect(() => {
    const loadData = async () => {
      if (!id || !projectId) {
        toast.error('Project ID is required');
        navigate('/organizations/directory');
        return;
      }

      try {
        setLoading(true);
        console.log('Loading project and organization data...');

        // Load project details
        const projectData = await projectService.getProject(projectId);
        console.log('Project loaded:', projectData);
        setProject(projectData);

        // Load organization details
        const orgData = await organizationService.getOrganization(id);
        console.log('Organization loaded:', orgData);
        setOrganization(orgData);

        // Load project users
        try {
          const usersData = await projectService.getProjectUsers(projectId);
          console.log('Project users loaded:', usersData);
          setProjectUsers(usersData);
        } catch (usersError) {
          console.error('Error loading project users (non-critical):', usersError);
        }

      } catch (error) {
        console.error('Error loading project data:', error);
        toast.error('Failed to load project details');
        navigate(`/organizations/${id}/projects`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, projectId, navigate]);

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'active':
  //       return 'bg-progress-completed/10 text-progress-completed border-progress-completed/20';
  //     case 'completed':
  //       return 'bg-blue-100 text-blue-800 border-blue-200';
  //     case 'draft':
  //       return 'bg-gray-100 text-gray-800 border-gray-200';
  //     case 'suspended':
  //       return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  //     case 'cancelled':
  //       return 'bg-red-100 text-red-800 border-red-200';
  //     default:
  //       return 'bg-gray-100 text-gray-800 border-gray-200';
  //   }
  // };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'coordinator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'member':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'observer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat('en-TZ', {
  //     style: 'currency',
  //     currency: 'TZS',
  //     minimumFractionDigits: 0,
  //   }).format(amount);
  // };

  // const formatDate = (dateString: string) => {
  //   return new Date(dateString).toLocaleDateString('en-US', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric'
  //   });
  // };

  // const calculateDaysRemaining = (endDate: string) => {
  //   const end = new Date(endDate);
  //   const now = new Date();
  //   const diffTime = end.getTime() - now.getTime();
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  //   return diffDays;
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project || !organization) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
        <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
        <Button onClick={() => navigate(`/organizations/${id}/projects`)}>
          Back to Projects
        </Button>
      </div>
    );
  }

  const daysRemaining = null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/organizations/${id}/projects`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {project.name}
            </h1>
            <p className="text-muted-foreground">{organization.name}</p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/organizations/${id}/projects/${projectId}/edit`)}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project Name</label>
                  <p className="text-foreground font-medium">{project.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Project Type</label>
                  {/* <Badge variant="outline" className="mt-1">
                    {project.type.name}
                  </Badge> */}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {/* <Badge className={getStatusColor(project.status)}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge> */}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                  <p className="text-foreground">
                    {/* {project.created_at ? formatDate(project.created_at) : 'N/A'} */}
                  </p>
                </div>
              </div>

              {project.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-foreground mt-1">{project.description}</p>
                </div>
              )}

              {/* Progress */}
              {/* {project.progress_percentage !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-muted-foreground">Progress</label>
                    <span className="text-sm font-medium">{project.progress_percentage}%</span>
                  </div>
                  <Progress value={project.progress_percentage} className="h-2" />
                </div>
              )} */}
            </CardContent>
          </Card>

          {/* Timeline and Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline and Budget
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <p className="text-foreground">
                    {/* {project.start_date ? formatDate(project.start_date) : 'Not set'} */}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">End Date</label>
                  <p className="text-foreground">
                    {/* {project.end_date ? formatDate(project.end_date) : 'Not set'} */}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Budget</label>
                  <p className="text-foreground font-medium">
                    {/* {project.budget ? formatCurrency(project.budget) : 'Not specified'} */}
                  </p>
                </div>
                {daysRemaining !== null && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Days Remaining</label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className={`font-medium ${daysRemaining < 0 ? 'text-red-600' : daysRemaining < 30 ? 'text-yellow-600' : 'text-foreground'}`}>
                        {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          {/* {project.location && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.location.region && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Region</label>
                      <p className="text-foreground">{project.location.region}</p>
                    </div>
                  )}
                  {project.location.district && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">District</label>
                      <p className="text-foreground">{project.location.district}</p>
                    </div>
                  )}
                  {project.location.ward && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Ward</label>
                      <p className="text-foreground">{project.location.ward}</p>
                    </div>
                  )}
                  {project.location.village && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Village</label>
                      <p className="text-foreground">{project.location.village}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )} */}

          {/* Project Team */}
          {projectUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Project Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.user_name}</p>
                          <p className="text-sm text-muted-foreground">{user.user_email}</p>
                        </div>
                      </div>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Organization Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-foreground font-medium">{organization.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <p className="text-foreground">{organization.type_name || 'Unknown'}</p>
              </div>
              {/* <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="text-foreground">{organization.district}, {organization.region}</p>
              </div> */}
              <Separator />
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/organizations/${id}`)}
              >
                <Building2 className="h-4 w-4 mr-2" />
                View Organization
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Progress</span>
                </div>
                {/* <span className="font-semibold">{project.progress_percentage || 0}%</span> */}
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Team Members</span>
                </div>
                <span className="font-semibold">{projectUsers.length}</span>
              </div>
              {project.budget && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Budget</span>
                    </div>
                    {/* <span className="font-semibold text-sm">{formatCurrency(project.budget)}</span> */}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/organizations/${id}/projects/${projectId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/organizations/${id}/projects`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Button>
            </CardContent>
          </Card>

          {/* Status Alert */}
          {daysRemaining !== null && daysRemaining < 30 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">
                      {daysRemaining < 0 ? 'Project Overdue' : 'Deadline Approaching'}
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      {daysRemaining < 0
                        ? `This project is ${Math.abs(daysRemaining)} days overdue.`
                        : `This project is due in ${daysRemaining} days.`
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}