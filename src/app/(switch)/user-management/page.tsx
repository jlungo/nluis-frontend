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
  Filter,
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
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  emailVerified: boolean;
  lastLogin: string;
  createdAt: string;
  location: string;
}

interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  location: string;
}

interface UserManagementProps {
  onInvitationSent?: (email: string, role: string, invitingAdmin: string) => void;
}

export default function UserManagement({ onInvitationSent }: UserManagementProps = {}) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [newUser, setNewUser] = useState<NewUser>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    location: ''
  });

  // Mock user data
  const mockUsers: User[] = [
    {
      id: 'user-001',
      firstName: 'John',
      lastName: 'Mwangi',
      email: 'john.mwangi@nluis.go.tz',
      phone: '+255 754 123 456',
      role: 'Land Use Planner',
      department: 'National Land Use Planning Commission',
      status: 'active',
      emailVerified: true,
      lastLogin: '2025-01-10 14:30',
      createdAt: '2024-06-15',
      location: 'Dar es Salaam'
    },
    {
      id: 'user-002',
      firstName: 'Sarah',
      lastName: 'Kimani',
      email: 'sarah.kimani@nluis.go.tz',
      phone: '+255 768 987 654',
      role: 'CCRO Officer',
      department: 'National Land Use Planning Commission',
      status: 'active',
      emailVerified: true,
      lastLogin: '2025-01-09 16:45',
      createdAt: '2024-03-20',
      location: 'Mwanza'
    },
    {
      id: 'user-003',
      firstName: 'David',
      lastName: 'Mollel',
      email: 'david.mollel@nluis.go.tz',
      phone: '+255 712 345 678',
      role: 'Administrator',
      department: 'National Land Use Planning Commission',
      status: 'active',
      emailVerified: true,
      lastLogin: '2025-01-10 09:15',
      createdAt: '2024-01-10',
      location: 'Dodoma'
    },
    {
      id: 'user-004',
      firstName: 'Grace',
      lastName: 'Mushi',
      email: 'grace.mushi@regional.go.tz',
      phone: '+255 787 654 321',
      role: 'Data Analyst',
      department: 'Regional Land Use Office',
      status: 'pending',
      emailVerified: false,
      lastLogin: 'Never',
      createdAt: '2025-01-08',
      location: 'Arusha'
    },
    {
      id: 'user-005',
      firstName: 'Michael',
      lastName: 'Nyerere',
      email: 'michael.nyerere@district.go.tz',
      phone: '+255 724 567 890',
      role: 'Document Manager',
      department: 'District Land Use Office',
      status: 'inactive',
      emailVerified: true,
      lastLogin: '2024-12-15 11:20',
      createdAt: '2024-08-05',
      location: 'Mtwara'
    },
    {
      id: 'user-006',
      firstName: 'Alice',
      lastName: 'Mbeki',
      email: 'alice.mbeki@village.go.tz',
      phone: '+255 713 456 789',
      role: 'Village Officer',
      department: 'Village Land Use Committee',
      status: 'active',
      emailVerified: true,
      lastLogin: '2025-01-08 10:30',
      createdAt: '2024-09-12',
      location: 'Morogoro'
    },
    {
      id: 'user-007',
      firstName: 'James',
      lastName: 'Kileo',
      email: 'james.kileo@zonal.go.tz',
      phone: '+255 756 234 567',
      role: 'Zonal Coordinator',
      department: 'Zonal Land Use Office',
      status: 'active',
      emailVerified: true,
      lastLogin: '2025-01-09 14:20',
      createdAt: '2024-05-20',
      location: 'Mbeya'
    },
    {
      id: 'user-008',
      firstName: 'Mary',
      lastName: 'Masanja',
      email: 'mary.masanja@ward.go.tz',
      phone: '+255 784 567 890',
      role: 'Ward Officer',
      department: 'Ward Land Use Committee',
      status: 'pending',
      emailVerified: false,
      lastLogin: 'Never',
      createdAt: '2025-01-05',
      location: 'Tanga'
    }
  ];

  const roles = [
    'Administrator',
    'Land Use Planner',
    'CCRO Officer',
    'Data Analyst',
    'Document Manager',
    'Compliance Officer',
    'Organization Manager',
    'Zonal Coordinator',
    'Village Officer',
    'Ward Officer',
    'Regional Coordinator',
    'District Officer',
    'System User'
  ];

  // Organization hierarchy for Tanzania Land Use System
  const organizations = [
    'National Land Use Planning Commission',
    'Regional Land Use Office',
    'District Land Use Office', 
    'Zonal Land Use Office',
    'Ward Land Use Committee',
    'Village Land Use Committee'
  ];

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

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrganization = selectedOrganization === 'all' || user.department === selectedOrganization;
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && user.status === 'active') ||
                      (activeTab === 'pending' && user.status === 'pending') ||
                      (activeTab === 'inactive' && user.status === 'inactive');
    
    return matchesSearch && matchesOrganization && matchesRole && matchesTab;
  });

  const handleCreateUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Simulate API call
    console.log('Creating user:', newUser);
    
    // Close dialog and reset form
    setIsCreateUserOpen(false);
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      location: ''
    });

    // Show success message
    setSuccessMessage(`User account created successfully! An email invitation has been sent to ${newUser.email} to verify their account.`);
    setShowSuccessAlert(true);
    
    toast.success('User created and invitation email sent!');
    
    // ADDED: Trigger invitation flow if callback provided
    if (onInvitationSent) {
      // For demo purposes, show a notification with a link to test the invitation flow
      setTimeout(() => {
        toast.success(
          <div className="space-y-2">
            <p>Invitation email sent to {newUser.email}</p>
            <button 
              onClick={() => onInvitationSent(newUser.email, newUser.role, 'System Administrator')}
              className="text-primary underline text-sm"
            >
              Click here to simulate user clicking invitation link
            </button>
          </div>, 
          { duration: 10000 }
        );
      }, 1000);
    }
    
    // Auto-hide success alert after 10 seconds
    setTimeout(() => {
      setShowSuccessAlert(false);
    }, 10000);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditUserOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingUser) {
      console.log('Updating user:', editingUser);
      setIsEditUserOpen(false);
      setEditingUser(null);
      toast.success('User updated successfully!');
    }
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Deleting user:', userId);
    toast.success('User deleted successfully');
  };

  const handleResendInvitation = (user: User) => {
    console.log('Resending invitation to:', user.email);
    toast.success(`Invitation email resent to ${user.email}`);
  };

  const handleSuspendUser = (userId: string) => {
    console.log('Suspending user:', userId);
    toast.success('User account suspended');
  };

  const handleActivateUser = (userId: string) => {
    console.log('Activating user:', userId);
    toast.success('User account activated');
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    placeholder="Enter last name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="user@nluis.go.tz"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="+255 7XX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Select value={newUser.department} onValueChange={(value) => setNewUser({...newUser, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org} value={org}>{org}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="location">Location/Region</Label>
                  <Select value={newUser.location} onValueChange={(value) => setNewUser({...newUser, location: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser} className="gap-2">
                  <Send className="h-4 w-4" />
                  Create & Send Invitation
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
                    onClick={() => onInvitationSent(newUser.email, newUser.role, 'System Administrator')}
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
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org} value={org}>{org}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Tabs and List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Users ({mockUsers.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({mockUsers.filter(u => u.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({mockUsers.filter(u => u.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({mockUsers.filter(u => u.status === 'inactive').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredUsers.length === 0 ? (
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                            <Badge variant="outline" className={`text-xs ${getStatusColor(user.status)}`}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(user.status)}
                                {user.status}
                              </span>
                            </Badge>
                            {!user.emailVerified && (
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
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {user.location}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last login: {user.lastLogin}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
              <div className="space-y-2">
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={editingUser.firstName}
                  onChange={(e) => setEditingUser({...editingUser, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={editingUser.lastName}
                  onChange={(e) => setEditingUser({...editingUser, lastName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editEmail">Email Address</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone Number</Label>
                <Input
                  id="editPhone"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editRole">Role</Label>
                <Select value={editingUser.role} onValueChange={(value) => setEditingUser({...editingUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editDepartment">Department</Label>
                <Select value={editingUser.department} onValueChange={(value) => setEditingUser({...editingUser, department: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))} */}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="editLocation">Location/Region</Label>
                <Select value={editingUser.location} onValueChange={(value) => setEditingUser({...editingUser, location: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}