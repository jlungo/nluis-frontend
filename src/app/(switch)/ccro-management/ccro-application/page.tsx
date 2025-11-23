"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CCROApplication, STAGE_LABELS, NIDA_STATUS_LABELS } from "@/types/ccro";
import { DataTable } from "@/components/DataTable";
import { CCROStatusBadge } from "@/components/ccro/CCROStatusBadge";
import ActionButtons from "@/components/ActionButtons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useCCROStore } from "@/store/ccroStore";
import { type ColumnDef } from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Filters {
  stage: string;
  village: string;
}

export default function CCROPage() {
  const navigate = useNavigate();
  const { 
    applications, 
    error,
    fetchApplications
  } = useCCROStore();
  
  const [filters, setFilters] = useState<Filters>({
    stage: 'all',
    village: 'all',
  });

  useEffect(() => {
    fetchApplications({});
  }, [fetchApplications]);

  const columns: ColumnDef<CCROApplication>[] = [
    {
      id: 'id',
      header: 'Application ID',
      accessorFn: (row: CCROApplication) => row.id,
    },
    {
      id: 'stage',
      header: 'Stage',
      cell: ({ row }: { row: { original: CCROApplication } }) => (
        <CCROStatusBadge status={row.original.stage} />
      )
    },
    {
      id: 'location',
      header: 'Location',
      cell: ({ row }: { row: { original: CCROApplication } }) => (
        <span>
          {row.original.parcel_details?.locality_name || 'N/A'}
        </span>
      )
    },
    {
      id: 'parcel',
      header: 'Parcel Number',
      cell: ({ row }: { row: { original: CCROApplication } }) => (
        <span>{row.original.parcel_details?.parcel_number || `#${row.original.parcel}`}</span>
      )
    },
    {
      id: 'allocations',
      header: 'Allocations',
      cell: ({ row }: { row: { original: CCROApplication } }) => {
        const allocations = row.original.parcel_details?.allocations || [];
        return (
          <div className="space-y-1">
            {allocations.length > 0 ? (
              allocations.slice(0, 2).map((alloc, index: number) => (
                <div key={index} className="text-sm">
                  {alloc.party_name} ({alloc.proposed_share}%)
                </div>
              ))
            ) : (
              <span className="text-sm text-gray-500">No allocations</span>
            )}
            {allocations.length > 2 && <div className="text-xs text-gray-400">+{allocations.length - 2} more</div>}
          </div>
        );
      }
    },
    {
      id: 'nida_status',
      header: 'NIDA Status',
      cell: ({ row }: { row: { original: CCROApplication } }) => {
        const status = row.original.nida_check_status;
        const colors: Record<string, string> = {
          verified: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          missing: 'bg-red-100 text-red-800',
          invalid: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`text-xs px-2 py-1 rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
            {NIDA_STATUS_LABELS[status]}
          </span>
        );
      }
    },
    {
      id: 'area',
      header: 'Area (sqm)',
      accessorFn: (row: CCROApplication) => row.parcel_details?.area_sqm || '-',
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
            deleteFunction={async (app) => {
              if (confirm('Are you sure you want to delete this application?')) {
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
    pending: applications.filter(a => ['submitted', 'review'].includes(a.stage)).length,
    approved: applications.filter(a => a.stage === 'approved').length,
    issued: applications.filter(a => a.stage === 'issued').length
  };

  const villages = Array.from(
    new Set(applications
      .map(app => app.parcel_details?.locality_name)
      .filter((v): v is string => !!v))
  ).sort();

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
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
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
              <CardTitle className="text-sm font-medium">Issued CCROs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.issued}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {error && (
        <div className="px-8 py-2">
          <div className="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-800">
            Error: {error}
          </div>
        </div>
      )}

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>CCRO Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              searchPlaceholder="Search by application ID, location, or parcel number..."
              rightToolbar={
                <div className="flex items-center gap-2">
                  <Select
                    value={filters.stage}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, stage: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      {Object.entries(STAGE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.village}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, village: value }))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {villages.map(village => (
                        <SelectItem key={village} value={village}>{village}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              }
              columns={columns}
              data={applications.filter(app => {
                const stageMatch = filters.stage === 'all' || app.stage === filters.stage;
                const villageMatch = filters.village === 'all' || app.parcel_details?.locality_name === filters.village;

                return stageMatch && villageMatch;
              })}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
