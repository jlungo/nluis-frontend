import React, { useState, useEffect } from 'react';
import { organizationService } from '@/services/organizations';
import type { Organization } from '@/types/organizations';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Search,
  MapPin,
  ArrowUpDown,
  Loader2
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type SortField = 'name' | 'type' | 'region' | 'status' | 'members_count' | 'projects_count';
type SortOrder = 'asc' | 'desc';

export default function OrganizationDirectory() {
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
        const orgs = await organizationService.getOrganizations({ 
          search: searchTerm,
          sort: `${sortConfig.order === 'desc' ? '-' : ''}${sortConfig.field}`
        });
        setOrganizations(orgs);
      } catch (error) {
        console.error('Error loading organizations:', error);
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
                className="cursor-pointer hover:bg-accent/50"
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
                className="cursor-pointer hover:bg-accent/50"
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
                className="cursor-pointer hover:bg-accent/50"
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
                className="text-center cursor-pointer hover:bg-accent/50"
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
                className="text-center cursor-pointer hover:bg-accent/50"
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
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-2">
                  Status
                  {sortConfig.field === 'status' && (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No organizations found
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org, index) => (
                <TableRow key={org.id} className="hover:bg-accent/50">
                  <TableCell className="text-center font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{org.name}</div>
                      <div className="text-sm text-muted-foreground">{org.primary_email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      {org.type.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{org.district}, {org.region}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{org.members_count}</TableCell>
                  <TableCell className="text-center">{org.projects_count}</TableCell>
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
                      {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                    </Badge>
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
