import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { organizationService } from '@/services/organizations';
import type { Organization } from '@/types/organizations';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  MapPin,
  Mail,
  Users,
  FolderOpen,
  Edit,
  ArrowLeft,
  Loader2,
  User
} from 'lucide-react';

export default function OrganizationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrganization = async () => {
      if (!id) {
        toast.error('Organization ID is required');
        navigate('/organizations/directory');
        return;
      }

      try {
        setLoading(true);
        console.log('Loading organization:', id);
        const org = await organizationService.getOrganization(id);
        console.log('Organization loaded:', org);
        
        if (!org) {
          toast.error('Organization not found');
          setOrganization(null);
          return;
        }
        
        setOrganization(org);
      } catch (error: any) {
        console.error('Error loading organization:', error);
        
        // More specific error handling
        if (error.response?.status === 404) {
          toast.error('Organization not found');
        } else if (error.response?.status === 500) {
          toast.error('Server error. Please try again later.');
        } else {
          toast.error('Failed to load organization details');
        }
        
        // Don't redirect immediately, let user see the error
        setOrganization(null);
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();
  }, [id, navigate]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/organizations/directory')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {organization.name || 'Unnamed Organization'}
            </h1>
            <p className="text-muted-foreground">Organization Details</p>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/organizations/${id}/edit`)}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Organization
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Organization Name</label>
                  <p className="text-foreground font-medium">{organization.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Organization Type</label>
                  <p className="text-foreground">{organization.type?.name || 'Unknown Type'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div>
                    <Badge 
                      className={
                        organization.status === 'active' 
                          ? 'bg-progress-completed/10 text-progress-completed border-progress-completed/20'
                          : organization.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }
                    >
                      {organization.status ? organization.status.charAt(0).toUpperCase() + organization.status.slice(1) : 'Unknown'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Registration Date</label>
                  <p className="text-foreground">
                    {organization.created_at ? new Date(organization.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              {organization.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-foreground mt-1">{organization.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Primary Email</label>
                  <p className="text-foreground">{organization.primary_email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <p className="text-foreground">N/A</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Physical Address</label>
                  <p className="text-foreground">{organization.physical_address || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Region</label>
                  <p className="text-foreground">{organization.region || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">District</label>
                  <p className="text-foreground">{organization.district || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Focal Person Information */}
          {(organization.focal_person_name || organization.focal_person_email || organization.focal_person_job_title) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Focal Person
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-foreground">{organization.focal_person_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Job Title</label>
                    <p className="text-foreground">{organization.focal_person_job_title || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-foreground">{organization.focal_person_email || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Members</span>
                </div>
                <span className="font-semibold">{organization.members_count || 0}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{organization.projects_count || 0}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/organizations/${id}/projects`)}
                    className="h-6 px-2 text-xs"
                  >
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Focus Areas */}
          {organization.focus_areas && organization.focus_areas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Focus Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {organization.focus_areas.map((area, index) => (
                    <Badge key={index} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/organizations/${id}/projects`)}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Manage Projects
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(`/organizations/${id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Organization
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/organizations/directory')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Directory
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}