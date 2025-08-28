import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  MoreVertical,
  Shield,
  Clock,
  Mail,
  Phone,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  UserCheck,
  UserX,
  Settings,
  Eye,
  Download,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useRolesQuery } from '@/queries/useRolesQuery';
import { useOrganizationsQuery } from '@/queries/useOrganizationQuery';
import { useUsersQuery, type UserType } from '@/queries/useUsersQuery';
import { genderTypes, userTypes } from '@/types/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

interface NewUser {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  roleId: string;
  organization: string;
  gender: number;
  user_type: number | string;
}

interface UserManagementProps {
  onInvitationSent?: (email: string, role: string, invitingAdmin: string) => void;
}

interface ApiError {
  response?: {
    data?: {
      detail?: string;
      email?: string[];
      phone?: string[];
      [key: string]: any;
    };
  };
  message?: string;
}

export default function UserManagement({ onInvitationSent }: UserManagementProps = {}) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: roles = [] } = useRolesQuery();
  const { data: organizations = [] } = useOrganizationsQuery();
  //  const organizations = org?.results || [];

  const [newUser, setNewUser] = useState<NewUser>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    roleId: '',
    organization: '',
    gender: 0,
    user_type: 0,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: NewUser) => {

      const data = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        role_id: userData.roleId,
        organization: userData.organization,
        gender: userData.gender,
        user_type: userData.user_type,
      }
      const response = await api.post('/auth/users/create/', data);
      return response.data;
    },
    onSuccess: (variables) => {
      
      // Close dialog and reset form
      setIsCreateUserOpen(false);
      setNewUser({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        roleId: '',
        organization: '',
        gender: 0,
        user_type: 0,
      });

      // Show success message
      setSuccessMessage(`User account created successfully! An email invitation has been sent to ${variables.email} to verify their account.`);
      setShowSuccessAlert(true);
      setCreateError(null);
      
      toast.success('User created and invitation email sent!');
      
      // Invalidate users query to refetch data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Auto-hide success alert after 10 seconds
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 10000);
    },
    onError: (error: ApiError) => {
      console.error('Error creating user:', error);
      
      let errorMessage = 'Failed to create user. Please try again.';
      
      if (error.response?.data) {
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.email) {
          errorMessage = `${error.response.data.email[0]}`;
        } else if (error.response.data.phone) {
          errorMessage = `${error.response.data.phone[0]}`;
        } else if (typeof error.response.data === 'object') {
          // errorMessage = 'Unexpected error occurred';
          const firstError = Object.values(error.response.data)[0];
          if (Array.isArray(firstError)) {
            errorMessage = `${firstError[0]}`;
          }
        }
      }
      
      setCreateError(errorMessage);
      toast.error(errorMessage);
    }
  });

  const editUserMutation = useMutation({
    mutationFn: async (userData: UserType) => {
      const data = {
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role, // TODO: Implement role update UUID
        organization: userData.organization,
        user_type: userData.user_type,
        status: userData.status,
      };
      const response = await api.put(`/auth/users/${userData.id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      setIsEditUserOpen(false);
      setEditingUser(null);
      setSuccessMessage('User updated successfully!');
      setShowSuccessAlert(true);
      toast.success('User updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 10000);
    },
    onError: (error: ApiError) => {
      console.error('Error updating user:', error);
      let errorMessage = 'Failed to update user. Please try again.';
      
      if (error.response?.data) {
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.email) {
          errorMessage = `${error.response.data.email[0]}`;
        } else if (error.response.data.phone) {
          errorMessage = `${error.response.data.phone[0]}`;
        }
      }
      
      toast.error(errorMessage);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/auth/users/${userId}/`);
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage('User deleted successfully!');
      setShowSuccessAlert(true);
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      setTimeout(() => {
        setShowSuccessAlert(false);
      }, 10000);
    },
    onError: (error: ApiError) => {
      console.error('Error deleting user:', error);
      let errorMessage = 'Failed to delete user. Please try again.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      toast.error(errorMessage);
    }
  });

  const regions = [
    'Dar es Salaam',
    'Dodoma',
    'Mwanza',
    'Arusha',
    'Mbeya',
    'Morogoro',
    'Tanga',
    'Mtwara',
    'Iringa',
    'Tabora'
  ];

  const { data: users = [], isLoading: isLoadingUsers, error: usersError } = useUsersQuery();

  // Update the filteredUsers function to use the fetched data
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrganization = selectedOrganization === 'all' || user.organization === selectedOrganization;
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && user.status === 'active') ||
                      (activeTab === 'pending' && user.status === 'pending') ||
                      (activeTab === 'inactive' && user.status === 'inactive');
    
    return matchesSearch && matchesOrganization && matchesRole && matchesTab;
  });

  const handleCreateUser = () => {
    if (!newUser.first_name || !newUser.last_name || !newUser.email || !newUser.roleId || !newUser.gender || !newUser.organization) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    createUserMutation.mutate(newUser);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setIsEditUserOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingUser) {
      editUserMutation.mutate(editingUser);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleSuspendUser = (userId: string) => { // TODO: Implement this
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = { ...user, status: 'suspended' as const };
      editUserMutation.mutate(updatedUser);
    }
  };

  const handleActivateUser = (userId: string) => { // TODO: Implement this
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = { ...user, status: 'active' as const };
      editUserMutation.mutate(updatedUser);
    }
  };

  const handleResendInvitation = (user: UserType) => { // TODO: Implement this
    console.log('Resending invitation to:', user.email);
    toast.success(`Invitation email resent to ${user.email}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'inactive':
        return <XCircle className="h-3 w-3" />;
      case 'suspended':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">User Management</h1>
          <p className="text-muted-foreground">Create and manage user accounts for the NLUIS system</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Users
          </Button>
          <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Create New User Account
                </DialogTitle>
                <DialogDescription>
                  Create a new user account. The user will receive an email invitation to verify their account.
                </DialogDescription>
              </DialogHeader>
              
              {/* Error Alert */}
              {createError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{createError}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="first_name">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="first_name"
                    className="w-full"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    placeholder="Enter first name"
                    disabled={createUserMutation.isPending}
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="last_name">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="last_name"
                    className="w-full"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    placeholder="Enter last name"
                    disabled={createUserMutation.isPending}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    className="w-full"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="user@nluis.go.tz"
                    disabled={createUserMutation.isPending}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    className="w-full"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="+255 7XX XXX XXX"
                    disabled={createUserMutation.isPending}
                  />
                </div>

                {/* Role */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
                  <Select
                    value={newUser.roleId}
                    onValueChange={(value) => setNewUser({ ...newUser, roleId: value })}
                    disabled={createUserMutation.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.length === 0 ? (
                        <SelectItem value="no-roles" disabled>
                          No roles available
                        </SelectItem>
                      ) : (
                        roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
                  <Select
                    value={newUser.gender.toString()}
                    onValueChange={(value) => setNewUser({ ...newUser, gender: parseInt(value) })}
                    disabled={createUserMutation.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(genderTypes).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Use Type */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="useType">Use Type <span className="text-red-500">*</span></Label>
                  <Select
                    value={newUser.user_type.toString()}
                    onValueChange={(value) => setNewUser({ ...newUser, user_type: parseInt(value) })}
                    disabled={createUserMutation.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select use type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(userTypes).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Organization */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="organization">Organization <span className="text-red-500">*</span></Label>
                  <Select
                    value={newUser.organization}
                    onValueChange={(value) => setNewUser({ ...newUser, organization: value })}
                    disabled={createUserMutation.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateUserOpen(false);
                    setCreateError(null);
                  }}
                  disabled={createUserMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateUser} 
                  className="gap-2"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Create & Send Invitation
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Account Created Successfully!</AlertTitle>
          <AlertDescription className="text-green-700">
            <div className="space-y-2">
              <p>{successMessage}</p>
              {onInvitationSent && (
                <div className="pt-2 border-t border-green-200">
                  <p className="text-sm font-medium text-green-800 mb-2">Demo: Test Invitation Flow</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const selectedRole = roles.find(role => role.id === newUser.roleId);
                      const roleName = selectedRole ? selectedRole.name : 'Unknown Role';
                      onInvitationSent(newUser.email, roleName, 'System Administrator');
                    }}
                    className="gap-2 bg-white hover:bg-green-50 text-green-700 border-green-300"
                  >
                    <User className="h-3 w-3" />
                    Simulate User Accepting Invitation
                  </Button>
                  <p className="text-xs text-green-600 mt-1">
                    Click to see the simplified password setup that invited users experience
                  </p>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-stretch gap-4 w-full">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
            </div>

            {/* Organization Select */}
            <div className="flex-1 min-w-0">
              <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Organizations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Select */}
            <div className="flex-1 min-w-0">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Responsive TabsList */}
        <TabsList className="flex flex-wrap w-full gap-2">
          <TabsTrigger value="all" className="flex-1 min-w-32">
            All Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1 min-w-32">
            Active ({users.filter(u => u.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex-1 min-w-32">
            Pending ({users.filter(u => u.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="inactive" className="flex-1 min-w-32">
            Inactive ({users.filter(u => u.status === 'inactive').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoadingUsers ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium mb-2">Loading users...</h3>
              </CardContent>
            </Card>
          ) : usersError ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Error loading users</h3>
                <p className="text-muted-foreground">Failed to fetch user data. Please try again.</p>
              </CardContent>
            </Card>
          ) : filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Try adjusting your search criteria' : 'Create your first user account to get started'}
                </p>
                <Button onClick={() => setIsCreateUserOpen(true)} className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create First User
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* Responsive user card layout */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      
                      {/* User Info */}
                      <div className="flex flex-1 items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">{user.first_name} {user.last_name}</h3>
                            <Badge variant="outline" className={`text-xs ${getStatusColor(user.status)}`}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(user.status)}
                                {user.status}
                              </span>
                            </Badge>
                            {!user.is_verified && (
                              <Badge variant="outline" className="text-xs text-orange-700 bg-orange-50">
                                <Mail className="h-3 w-3 mr-1" />
                                Unverified
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              {user.role}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {user.location}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last login: {user.last_login}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {user.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvitation(user)}
                            className="gap-2"
                          >
                            <Send className="h-4 w-4" />
                            Resend Invite
                          </Button>
                        )}
                        <Button
                          variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {user.status === 'active' ? (
                                <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Suspend User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleActivateUser(user.id)}>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit User Account
              </DialogTitle>
              <DialogDescription>
                Update user account information and permissions.
              </DialogDescription>
            </DialogHeader>
            
            {editingUser && (
              <div className="grid grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="editFirst_name">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="editFirst_name"
                    className="w-full"
                    value={editingUser.first_name}
                    onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })}
                    disabled={editUserMutation.isPending}
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="editLast_name">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="editLast_name"
                    className="w-full"
                    value={editingUser.last_name}
                    onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })}
                    disabled={editUserMutation.isPending}
                  />
                </div>

                {/* Email */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="editEmail">Email Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="editEmail"
                    type="email"
                    className="w-full"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    disabled={editUserMutation.isPending}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="editPhone">Phone Number</Label>
                  <Input
                    id="editPhone"
                    className="w-full"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    disabled={editUserMutation.isPending}
                  />
                </div>

                {/* Role */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="editRole">Role <span className="text-red-500">*</span></Label>
                  <Select
                    value={editingUser.role}
                    onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                    disabled={editUserMutation.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    value={editingUser.status}
                    onValueChange={(value) => setEditingUser({ 
                      ...editingUser, 
                      status: value as 'active' | 'inactive' | 'pending' | 'suspended' 
                    })}
                    disabled={editUserMutation.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Organization */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="editorganization">Organization</Label>
                  <Select
                    value={editingUser.organization || ''}
                    onValueChange={(value) => setEditingUser({ ...editingUser, organization: value })}
                    disabled={editUserMutation.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Location/Region */}
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="editLocation">Location/Region</Label>
                  <Select
                    value={editingUser.location}
                    onValueChange={(value) => setEditingUser({ ...editingUser, location: value })}
                    disabled={editUserMutation.isPending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsEditUserOpen(false)}
                disabled={editUserMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit} 
                className="gap-2"
                disabled={editUserMutation.isPending}
              >
                {editUserMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }