import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { organizationService } from '@/services/organizations';
import type { Organization } from '@/types/organizations';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Search,
  MapPin,
  ArrowUpDown,
  Loader2,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SortField = 'name' | 'type' | 'region' | 'status' | 'members_count' | 'projects_count';
type SortOrder = 'asc' | 'desc';

export default function OrganizationDirectory() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{field: SortField; order: SortOrder}>({
    field: 'name',
    order: 'asc'
  });

  // Load organizations
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Attempting to fetch organizations...');
        const orgs = await organizationService.getOrganizations({ 
          search: searchTerm,
          sort: `${sortConfig.order === 'desc' ? '-' : ''}${sortConfig.field}`
        });
        console.log('✅ Organizations fetched successfully:', orgs);
        console.log('📊 First organization structure:', orgs[0]);
        setOrganizations(orgs);
      } catch (error) {
        console.error('❌ Error loading organizations:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          fullURL: `${error.config?.baseURL}${error.config?.url}`
        });
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(loadData, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm, sortConfig]);

  // Sorting handler
  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      order: current.field === field && current.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Action handlers
  const handleView = (id: string) => {
    console.log('View organization:', id);
    navigate(`/organizations/${id}`);
  };

  const handleEdit = (id: string) => {
    console.log('Edit organization:', id);
    navigate(`/organizations/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    console.log('Delete organization:', id);
    
    // Show confirmation dialog
    if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      try {
        await organizationService.deleteOrganization(id);
        toast.success('Organization deleted successfully');
        
        // Refresh the list
        const orgs = await organizationService.getOrganizations({ 
          search: searchTerm,
          sort: `${sortConfig.order === 'desc' ? '-' : ''}${sortConfig.field}`
        });
        setOrganizations(orgs);
      } catch (error) {
        console.error('Error deleting organization:', error);
        toast.error('Failed to delete organization');
      }
    }
  };

  return (
    <div>
      {/* Search */}
      <div className="flex justify-end mb-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search organizations..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Organizations Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">No.</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Organization
                  {sortConfig.field === 'name' && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-2">
                  Type
                  {sortConfig.field === 'type' && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('region')}
              >
                <div className="flex items-center gap-2">
                  Location
                  {sortConfig.field === 'region' && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="text-center cursor-pointer"
                onClick={() => handleSort('members_count')}
              >
                <div className="flex items-center gap-2 justify-center">
                  Members
                  {sortConfig.field === 'members_count' && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="text-center cursor-pointer"
                onClick={() => handleSort('projects_count')}
              >
                <div className="flex items-center gap-2 justify-center">
                  Projects
                  {sortConfig.field === 'projects_count' && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  {sortConfig.field === 'status' && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No organizations found
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org, index) => (
                <TableRow key={org.id || Math.random()}>
                  <TableCell className="text-center font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{org.name || 'Unnamed Organization'}</div>
                      <div className="text-sm text-muted-foreground">{org.primary_email || 'No email'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      {org.type?.name || 'Unknown Type'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{org.district || 'Unknown'}, {org.region || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{org.members_count || 0}</TableCell>
                  <TableCell className="text-center">{org.projects_count || 0}</TableCell>
                  <TableCell>
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
                        <DropdownMenuItem 
                          onClick={() => org.id && handleView(org.id)}
                          disabled={!org.id}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => org.id && handleEdit(org.id)}
                          disabled={!org.id}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => org.id && handleDelete(org.id)}
                          disabled={!org.id}
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
    </div>
  );
}