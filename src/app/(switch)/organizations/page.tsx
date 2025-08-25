import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building,
  Building2,
  Users,
  Plus,
  MapPin,
  MoreVertical,
  Globe,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useOrganizationsQuery, useOrganizationStatsQuery } from '@/queries/useOrganizationQuery';
// import type { Organization } from '@/types/organizations';
import { toast } from 'sonner';

export default function OrganizationsModuleDashboard() {
  const navigate = useNavigate();
  
  // Use React Query hooks instead of direct service calls
  const { data: organizations = [], isLoading, refetch, isRefetching } = useOrganizationsQuery({ 
    limit: 5,
    sort: '-created_at'
  });
  
  const { data: stats } = useOrganizationStatsQuery();

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Organizations data refreshed');
    } catch (error) {
      console.error('Error refreshing organizations:', error);
      toast.error('Failed to refresh organizations data');
    }
  };

  // Compute stats cards data based on API response with fallbacks
  const activeOrgsCount = organizations.filter(org => org.status === 'active').length;
  const totalMembersFromOrgs = organizations.reduce((sum, org) => sum + (org.members_count || 0), 0);
  const uniqueTypes = [...new Set(organizations.map(org => org.type?.name).filter(Boolean))];
  const uniqueRegions = [...new Set(organizations.map(org => org.region).filter(Boolean))];

  const organizationStats = [
    {
      title: 'Total Organizations',
      value: stats?.total_organizations?.toString() ?? organizations.length.toString(),
      change: `${activeOrgsCount} active`,
      icon: <Building className="h-5 w-5" />,
      color: 'text-primary'
    },
    {
      title: 'Active Members',
      value: stats?.total_members?.toString() ?? totalMembersFromOrgs.toString(),
      change: 'Across all organizations',
      icon: <Users className="h-5 w-5" />,
      color: 'text-chart-2'
    },
    {
      title: 'Organization Types',
      value: (stats?.organizations_by_type?.length ?? uniqueTypes.length).toString(),
      change: stats?.organizations_by_type?.map(t => t.type_name).join(', ') ?? uniqueTypes.join(', ') ?? 'Various types',
      icon: <Building2 className="h-5 w-5" />,
      color: 'text-chart-3'
    },
    {
      title: 'Coverage Areas',
      value: (stats?.coverage_areas?.length ?? uniqueRegions.length).toString(),
      change: 'Regional coverage',
      icon: <Globe className="h-5 w-5" />,
      color: 'text-chart-4'
    }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Module Header - Fixed */}
      <div className="flex-none p-6 bg-background border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Organizations Management</h2>
            <p className="text-muted-foreground">
              Manage organizational structure, memberships, and institutional relationships within the NLUIS system
            </p>
          </div>
          <Button
            onClick={() => navigate('registration')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Register Organization
          </Button>
        </div>
      </div>
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {organizationStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-semibold text-foreground mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Organizations */}
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Organizations</CardTitle>
              <CardDescription>
                Recently registered organizations in the system
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefetching}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => navigate('/organizations/directory')}
                  className="flex items-center gap-2"
                >
                  View All Organizations
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/organizations/registration')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Register New
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : organizations.length === 0 ? (
              <div className="text-center p-8">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No organizations found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by registering your first organization
                </p>
                <Button 
                  onClick={() => navigate('/organizations/registration')}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Register Organization
                </Button>
              </div>
            ) : organizations.map((org, index) => (
              <div 
                key={org.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => org.id && navigate(`/organizations/${org.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{org.name || 'Unnamed Organization'}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-muted-foreground">{org.type?.name || 'Unknown Type'}</span>
                      <Badge variant="outline" className="text-xs">
                        {org.type?.name || 'Unknown'}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {`${org.district || 'Unknown'}, ${org.region || 'Unknown'}`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{org.members_count || 0}</div>
                    <div className="text-xs">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{org.projects_count || 0}</div>
                    <div className="text-xs">Projects</div>
                  </div>
                  <div className="text-center">
                    <Badge 
                      className={
                        org.status === 'active' 
                          ? 'bg-progress-completed/10 text-progress-completed border-progress-completed/20'
                          : org.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }
                    >
                      {org.status ? org.status.charAt(0).toUpperCase() + org.status.slice(1) : 'Unknown'}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('directory')}
            >
              View All Organizations
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
