import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "field_agent" | "viewer" | "stakeholder";
  status: "active" | "inactive" | "pending" | "suspended";
  organization: string;
  region: string;
  district: string;
  lastLogin: string;
  createdAt: string;
  permissions: string[];
  projects: number;
  activities: number;
}

interface UserState {
  users: User[];
  selectedUsers: string[];
  loading: boolean;
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  regionFilter: string;
  viewMode: "list" | "grid" | "table";
  showAddUser: boolean;
  editingUser: User | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export default function UserManagementPage() {
  const { setPage } = usePageStore();
  const [state, setState] = useState<UserState>({
    users: [],
    selectedUsers: [],
    loading: true,
    searchTerm: "",
    roleFilter: "",
    statusFilter: "",
    regionFilter: "",
    viewMode: "list",
    showAddUser: false,
    editingUser: null,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  });

  useLayoutEffect(() => {
    setPage({
      module: "user-management",
      title: "User Management",
      backButton: "Back to Modules",
    });
  }, [setPage]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // TODO: Replace with actual API calls
      const mockUsers: User[] = [
        {
          id: "1",
          name: "John Mwita",
          email: "john.mwita@nluis.go.tz",
          phone: "+255 712 345 678",
          role: "admin",
          status: "active",
          organization: "NLUIS Headquarters",
          region: "Dar es Salaam",
          district: "Ilala",
          lastLogin: "2024-02-20T10:30:00Z",
          createdAt: "2023-01-15",
          permissions: ["read", "write", "delete", "admin"],
          projects: 8,
          activities: 45,
        },
        {
          id: "2",
          name: "Sarah Kimambo",
          email: "sarah.kimambo@nluis.go.tz",
          phone: "+255 713 456 789",
          role: "manager",
          status: "active",
          organization: "Mwanza Regional Office",
          region: "Mwanza",
          district: "Ilemela",
          lastLogin: "2024-02-19T14:20:00Z",
          createdAt: "2023-03-20",
          permissions: ["read", "write", "manage"],
          projects: 5,
          activities: 32,
        },
        {
          id: "3",
          name: "Michael Nyerere",
          email: "michael.nyerere@nluis.go.tz",
          phone: "+255 714 567 890",
          role: "field_agent",
          status: "active",
          organization: "Arusha Field Office",
          region: "Arusha",
          district: "Arusha",
          lastLogin: "2024-02-18T09:15:00Z",
          createdAt: "2023-06-10",
          permissions: ["read", "write"],
          projects: 3,
          activities: 28,
        },
        {
          id: "4",
          name: "Grace Mwambene",
          email: "grace.mwambene@nluis.go.tz",
          phone: "+255 715 678 901",
          role: "viewer",
          status: "pending",
          organization: "Kilimanjaro Regional Office",
          region: "Kilimanjaro",
          district: "Moshi",
          lastLogin: "2024-02-15T16:45:00Z",
          createdAt: "2024-01-05",
          permissions: ["read"],
          projects: 1,
          activities: 5,
        },
      ];

      setState((prev) => ({
        ...prev,
        users: mockUsers,
        loading: false,
        totalPages: Math.ceil(mockUsers.length / prev.pageSize),
      }));
    } catch (error) {
      console.error("Error loading users:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleUserSelection = (userId: string) => {
    setState((prev) => {
      const isSelected = prev.selectedUsers.includes(userId);
      const newSelected = isSelected
        ? prev.selectedUsers.filter((id) => id !== userId)
        : [...prev.selectedUsers, userId];

      return {
        ...prev,
        selectedUsers: newSelected,
      };
    });
  };

  const handleAddUser = () => {
    setState((prev) => ({ ...prev, showAddUser: true }));
  };

  const handleEditUser = (user: User) => {
    setState((prev) => ({ ...prev, editingUser: user }));
  };

  const handleDeleteUser = (userId: string) => {
    // TODO: Implement delete functionality
    console.log("Deleting user:", userId);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="destructive">Admin</Badge>;
      case "manager":
        return <Badge variant="default">Manager</Badge>;
      case "field_agent":
        return <Badge variant="secondary">Field Agent</Badge>;
      case "viewer":
        return <Badge variant="outline">Viewer</Badge>;
      case "stakeholder":
        return <Badge variant="outline">Stakeholder</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "inactive":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "suspended":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system users, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                viewMode: prev.viewMode === "list" ? "grid" : "list",
              }))
            }
          >
            {state.viewMode === "list" ? "Grid View" : "List View"}
          </Button>
          <Button onClick={handleAddUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            User Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={state.searchTerm}
                onChange={(e) =>
                  setState((prev) => ({ ...prev, searchTerm: e.target.value }))
                }
                className="pl-10"
              />
            </div>
            <Select
              value={state.roleFilter}
              onValueChange={(value) =>
                setState((prev) => ({ ...prev, roleFilter: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">All Roles</SelectItem> */}
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="field_agent">Field Agent</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="stakeholder">Stakeholder</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={state.statusFilter}
              onValueChange={(value) =>
                setState((prev) => ({ ...prev, statusFilter: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value="">All Status</SelectItem> */}
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filter by region"
              value={state.regionFilter}
              onChange={(e) =>
                setState((prev) => ({ ...prev, regionFilter: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{state.users.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">
                  {state.users.filter((u) => u.status === "active").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {state.users.filter((u) => u.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">
                  {state.users.filter((u) => u.role === "admin").length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      {state.viewMode === "list" ? (
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">
                      <Checkbox
                        checked={
                          state.selectedUsers.length === state.users.length
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setState((prev) => ({
                              ...prev,
                              selectedUsers: state.users.map((u) => u.id),
                            }));
                          } else {
                            setState((prev) => ({
                              ...prev,
                              selectedUsers: [],
                            }));
                          }
                        }}
                      />
                    </th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Contact</th>
                    <th className="text-left p-2">Role</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Organization</th>
                    <th className="text-left p-2">Last Login</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {state.users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <Checkbox
                          checked={state.selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleUserSelection(user.id)}
                        />
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">{getRoleBadge(user.role)}</td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.status)}
                          {getStatusBadge(user.status)}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          <div>{user.organization}</div>
                          <div className="text-muted-foreground">
                            {user.region}, {user.district}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-sm">
                          <div>
                            {new Date(user.lastLogin).toLocaleDateString()}
                          </div>
                          <div className="text-muted-foreground">
                            {new Date(user.lastLogin).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.users.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                  </div>
                  {getStatusBadge(user.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {user.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {user.region}, {user.district}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getRoleBadge(user.role)}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Projects</p>
                      <p className="font-medium">{user.projects}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Activities</p>
                      <p className="font-medium">{user.activities}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Actions */}
      {state.selectedUsers.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {state.selectedUsers.length} user(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Change Role
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Bulk Edit
                </Button>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
