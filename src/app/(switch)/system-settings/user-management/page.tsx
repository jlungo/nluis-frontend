import { useLayoutEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CheckCircle,
  Download,
  Search,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useRolesQuery } from "@/queries/useRolesQuery";
import type { UserI } from "@/types/users";
import { useDeleteUserMutation } from "@/queries/useUsersQuery";
import UsersTable from "./list/usertable";
import UserCreateDialog from "./create/page";
import UserEditDialog from "./edit/page";
import { usePageStore } from "@/store/pageStore";
import { useOrganizationsQuery } from "@/queries/useOrganizationQuery";
import { useLocalitiesQuery } from "@/queries/useLocalityQuery";
import { tanzaniaLocalityKey, userStatus } from "@/types/constants";

export default function UserManagement() {
  // set layout
  const { setPage } = usePageStore();
  useLayoutEffect(() => {
    setPage({
      module: "system-settings",
      title: "User Management"
    });
  }, [setPage]);

  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserI | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: roles = [] } = useRolesQuery();
  const { data: organizations } = useOrganizationsQuery();
  const { data: regions } = useLocalitiesQuery(tanzaniaLocalityKey);

  const deleteUser = useDeleteUserMutation();

  const handleResendInvitation = (u: UserI) => {
    toast.success(`Invitation email resent to ${u.email}`);
  };
  const handleEdit = (u: UserI) => {
    setEditingUser(u);
    setIsEditOpen(true);
  };
  const handleDelete = (id: string) => {
    if (confirm("Delete this user? This cannot be undone.")) {
      deleteUser.mutate(id, {
        onSuccess: () => setSuccess("User deleted successfully!"),
      });
    }
  };
  const handleSuspend = (id: string) =>
    setEditingUser((prev) =>
      prev && prev.id === id ? { ...prev, status: "suspended" } : prev
    );
  const handleActivate = (id: string) =>
    setEditingUser((prev) =>
      prev && prev.id === id ? { ...prev, status: "active" } : prev
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-muted-foreground">
            Create and manage user accounts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Users
          </Button>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-stretch gap-4 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Select
                value={selectedOrganization}
                onValueChange={setSelectedOrganization}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Organizations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations && organizations?.results.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-0">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="flex flex-wrap w-full gap-2 rounded-full">
          <TabsTrigger value="" className="flex-1 min-w-32 rounded-full cursor-pointer">
            All
          </TabsTrigger>
          {Object.entries(userStatus).reverse().map(([key, label]) => (
            <TabsTrigger key={key} value={key} className='cursor-pointer rounded-full text-xs md:text-sm'>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={status}>
          <UsersTable
            filters={{
              search: searchQuery || undefined,
              role: selectedRole !== "all" ? selectedRole : undefined,
              organization:
                selectedOrganization !== "all"
                  ? selectedOrganization
                  : undefined,
              status,
            }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSuspend={handleSuspend}
            onActivate={handleActivate}
            onResendInvite={handleResendInvitation}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <UserCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        roles={roles}
        organizations={organizations?.results || []}
        onSuccess={() =>
          setSuccess("User account created! Invitation email sent.")
        }
      />
      <UserEditDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        user={editingUser}
        roles={roles}
        organizations={organizations?.results || []}
        regions={regions || []}
      />
    </div>
  );
}
