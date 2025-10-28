"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CCROApplication } from "@/types/ccro";
import { DataTable } from "@/components/DataTable";
import { CCROStatusBadge } from "@/components/ccro/CCROStatusBadge";
import ActionButtons from "@/components/ActionButtons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useCCROStore } from "@/store/ccroStore";
import { type ColumnDef } from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_LABELS } from "@/types/ccro";

interface Filters {
  status: string;
  village: string;
}

export default function CCROPage() {
  const navigate = useNavigate();
  const { 
    applications, 
    fetchApplications
  } = useCCROStore();
  
  const [filters, setFilters] = useState<Omit<Filters, 'search'>>({
    status: 'all',
    village: 'all',
  });

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const columns: ColumnDef<CCROApplication>[] = [
    {
      id: 'claimNo',
      header: 'Claim No',
      accessorFn: (row: CCROApplication) => row.claimNo,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: CCROApplication } }) => (
        <CCROStatusBadge status={row.original.status} />
      )
    },
    {
      id: 'location',
      header: 'Location',
      cell: ({ row }: { row: { original: CCROApplication } }) => (
        <span>
          {row.original.locality.village} - {row.original.locality.hamlet}
        </span>
      )
    },
    {
      id: 'parties',
      header: 'Parties',
      cell: ({ row }: { row: { original: CCROApplication } }) => (
        <div className="space-y-1">
          {row.original.partyInfo.map((party, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <span>{party.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                party.verificationStatus === 'verified' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {party.verificationStatus}
              </span>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'area',
      header: 'Area',
      accessorFn: (row: CCROApplication) => row.parcel.area,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: { row: { original: CCROApplication } }) => {
        const application = row.original;
        return (
          <ActionButtons
            entity={application}
            entityName="CCRO Application"
            onView={(app) => navigate(`/ccro-management/ccro-application/${app.id}`)}
            onEdit={(app) => navigate(`/ccro-management/ccro-application/${app.id}/edit`)}
            deleteFunction={async (app) => {
              if (confirm('Are you sure you want to delete this application?')) {
                // TODO: Implement actual delete
                console.log('Delete:', app.id);
              }
            }}
          />
        );
      },
    }
  ];

  const stats = {
    total: applications.length,
    pending: applications.filter(a => ['draft', 'submitted', 'under_review', 'surveying'].includes(a.status)).length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-8 space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">CCRO Management</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total CCROs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending CCROs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved CCROs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected CCROs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>CCRO Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              searchPlaceholder="Search by claim no, location, or parties..."
              rightToolbar={
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    onValueChange={(value) => setFilters(prev => ({ ...prev, village: value }))}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Village" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Villages</SelectItem>
                      {Array.from(new Set(applications.map(app => app.locality.village))).map(village => (
                        <SelectItem key={village} value={village}>{village}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              }
              columns={columns}
              data={applications.filter(app => {
                const statusMatch = filters.status === 'all' || app.status === filters.status;
                const villageMatch = filters.village === 'all' || app.locality.village === filters.village;

                return statusMatch && villageMatch;
              })}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
