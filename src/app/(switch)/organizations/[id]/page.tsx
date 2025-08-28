import { useState, useEffect, JSX } from "react";
import { useUsersQuery } from "@/queries/useUsersQuery";
import { useParams, useNavigate } from "react-router";
import { organizationService } from "@/services/organizations";
import { OrganizationStatusE, type OrganizationI } from "@/types/organizations";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Building2,
  MapPin,
  Mail,
  Users,
  FolderOpen,
  Edit,
  Loader2,
  User,
  Plus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Lightweight shapes in case the service doesn't return embedded lists
// Adjust to your actual API types if available
interface ProjectI {
  id: string | number;
  name: string;
  status?: string;
  start_date?: string | Date;
}
// Remove MemberI, use User from useUsersQuery

export default function OrganizationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState<OrganizationI | null>(null);
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState<ProjectI[] | null>(null);
  // Remove local members state
  const [listsLoading, setListsLoading] = useState(false);

  useEffect(() => {
    const loadOrganization = async () => {
      if (!id) {
        toast.error("Organization ID is required");
        // Removed back button per request; keep silent redirect for safety
        navigate("/organizations/");
        return;
      }

      try {
        setLoading(true);
        const org = await organizationService.getOrganization(id);
        if (!org) {
          toast.error("Organization not found");
          setOrganization(null);
          return;
        }
        setOrganization(org);
      } catch (error: any) {
        console.error("Error loading organization:", error);
        if (error.response?.status === 404) {
          toast.error("Organization not found");
        } else if (error.response?.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("Failed to load organization details");
        }
        setOrganization(null);
      } finally {
        setLoading(false);
      }
    };

    loadOrganization();
  }, [id, navigate]);

  // Only keep mock projects for now

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
        <p className="text-muted-foreground mb-4">
          The organization you're looking for doesn't exist.
        </p>
        {/* Back button removed per request */}
      </div>
    );
  }

  const Stat = ({ label, value, icon }: { label: string; value: string | number | undefined; icon?: JSX.Element }) => (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value ?? "-"}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* TOP: compact basic + contact details banner (merged) */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Left: Name + status + type */}
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-muted/60">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold leading-none">{organization.name}</h1>
                  <Badge
                    className={
                      organization.status === OrganizationStatusE.ACTIVE
                        ? "bg-progress-completed/10 text-progress-completed border-progress-completed/20"
                        : organization.status === OrganizationStatusE.PENDING
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : "bg-red-100 text-red-800 border-red-200"
                    }
                  >
                    {organization.status === OrganizationStatusE.ACTIVE
                      ? "Active"
                      : organization.status === OrganizationStatusE.PENDING
                      ? "Pending"
                      : "Inactive"}
                  </Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground flex flex-wrap items-center gap-3">
                  <span>Type: {organization.type instanceof Object ? (organization.type as any).name : organization.type}</span>
                  <Separator orientation="vertical" className="h-4 hidden sm:block" />
                  <span>Registered: {organization.created_at ? new Date(organization.created_at).toLocaleDateString() : "-"}</span>
                </div>

                {/* Merged Contact Details */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4"/> {organization.primary_email || "-"}</div>
                  <div className="flex items-center gap-2 text-sm"><User className="h-4 w-4"/> {organization.phone || "-"}</div>
                  <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4"/> {organization.address || "-"}</div>
                </div>
              </div>
            </div>

            {/* Right: compact stats + edit (back/Manage Projects removed) */}
            <div className="flex items-center gap-6">
              <Stat label="Members" value={organization.members_count || 0} icon={<Users className="h-4 w-4" />} />
              <Stat label="Projects" value={organization.projects_count || 0} icon={<FolderOpen className="h-4 w-4" />} />
              <div className="hidden md:block">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/organizations/${id}/edit`)}>
                    <Edit className="h-4 w-4 mr-2"/>
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* MAIN: switch between Projects and Members */}
      <Tabs defaultValue="projects" className="w-full">
        <div className="flex items-center justify-between mb-3">
          <TabsList>
            <TabsTrigger value="projects" className="px-4">Projects</TabsTrigger>
            <TabsTrigger value="members" className="px-4">Members</TabsTrigger>
          </TabsList>
          {/* Top-right actions intentionally minimal per requests */}
        </div>

        {/* Projects Tab (Data Table) */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5"/> Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {listsLoading ? (
                <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin"/></div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[240px]">Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead className="w-[1%] whitespace-nowrap text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(projects ?? []).map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.name}</TableCell>
                          <TableCell>{p.status || "-"}</TableCell>
                          <TableCell>{p.start_date ? new Date(p.start_date).toLocaleDateString() : "-"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/organizations/${id}/projects`)}>View</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {(projects ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground py-6">No projects to display.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab (Data Table) */}
        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Members</CardTitle>
              <Button size="sm" onClick={() => navigate(`/organizations/${id}/members/new`)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </CardHeader>
            <CardContent>
              {/* Use useUsersQuery to fetch members */}
              {organization ? (
                (() => {
                  const {
                    data: users,
                    isLoading: membersLoading,
                    isError: membersError,
                  } = useUsersQuery({ organizations: [organization] });
                  if (membersLoading) {
                    return <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin"/></div>;
                  }
                  if (membersError) {
                    return <div className="text-destructive">Failed to load members.</div>;
                  }
                  if (!users || users.length === 0) {
                    return <p className="text-sm text-muted-foreground py-6">No members found.</p>;
                  }
                  return (
                    <div className="w-full overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[220px]">Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="w-[1%] whitespace-nowrap text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((m) => (
                            <TableRow key={m.id}>
                              <TableCell className="font-medium">{m.firstName} {m.lastName}</TableCell>
                              <TableCell>{m.email || "-"}</TableCell>
                              <TableCell>{m.role || "-"}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => navigate(`/organizations/${id}/members/${m.id}`)}>View</Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );
                })()
              ) : (
                <div className="text-muted-foreground">No organization loaded.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>



      {/* Bottom actions for small screens (Back removed) */}
      <div className="md:hidden">
        <Button variant="outline" className="w-full" onClick={() => navigate(`/organizations/${id}/edit`)}>
          <Edit className="h-4 w-4 mr-2"/> Edit
        </Button>
      </div>
    </div>
  );
}
