"use client";

import { useParams, useNavigate } from "react-router";
import { useLayoutEffect } from "react";
import { usePageStore } from "@/store/pageStore";
import { useLandApplicationQuery } from "@/queries/useLandApplicationQuery";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OwnershipTypeBadge } from "@/components/land-application/OwnershipTypeBadge";
import { LandApplicationStatusBadge } from "@/components/land-application/LandApplicationStatusBadge";
import { ArrowLeft, Loader2, MapPin, User, Users, Calendar, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function LandApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setPage } = usePageStore();

  const { data: application, isLoading, error } = useLandApplicationQuery(id);

  useLayoutEffect(() => {
    setPage({
      module: "ccro-management",
      title: application?.claim_number || "Land Application",
    });
  }, [setPage, application?.claim_number]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded p-4 text-sm text-red-800">
          {error ? `Error: ${(error as Error).message}` : "Application not found"}
        </div>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">{application.claim_number}</h2>
          {application.registration_number && (
            <p className="text-sm text-muted-foreground">
              Registration: {application.registration_number}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <OwnershipTypeBadge type={application.ownership_type} />
          <LandApplicationStatusBadge status={application.status} size="md" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Locality</span>
              <span className="font-medium">{application.locality_name || '-'}</span>
            </div>
            {application.hamlet && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hamlet</span>
                <span className="font-medium">{application.hamlet}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Area</span>
              <span className="font-medium">
                {application.estimated_area_acres?.toFixed(2) || '-'} acres
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Use</span>
              <span className="font-medium">{application.current_land_use || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Proposed Use</span>
              <span className="font-medium">{application.proposed_land_use || '-'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">{formatDate(application.created_at)}</span>
            </div>
            {application.submitted_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted</span>
                <span className="font-medium">{formatDate(application.submitted_at)}</span>
              </div>
            )}
            {application.verified_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verified</span>
                <span className="font-medium">{formatDate(application.verified_at)}</span>
              </div>
            )}
            {application.completed_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{formatDate(application.completed_at)}</span>
              </div>
            )}
            {application.rejected_at && (
              <div className="flex justify-between text-red-600">
                <span>Rejected</span>
                <span className="font-medium">{formatDate(application.rejected_at)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {application.applicants && application.applicants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" /> Applicants
            </CardTitle>
            <CardDescription>
              {application.applicant_count || application.applicants.length} applicant(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {application.applicants.map((applicant, idx) => (
                <div key={applicant.id || idx} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{applicant.party_name || `Party #${applicant.party}`}</p>
                    <p className="text-sm text-muted-foreground capitalize">{applicant.role}</p>
                  </div>
                  {applicant.party_nida && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      NIDA: {applicant.party_nida}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {application.neighbors && application.neighbors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Neighbors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {application.neighbors.map((neighbor, idx) => (
                <div key={neighbor.id || idx} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded">
                      {neighbor.direction}
                    </span>
                    {neighbor.field_verified && (
                      <span className="text-xs text-green-600">✓ Verified</span>
                    )}
                  </div>
                  <p className="font-medium text-sm">{neighbor.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{neighbor.neighbor_type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {application.parcels && application.parcels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Parcels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {application.parcels.map((parcel, idx) => (
                <div key={parcel.id || idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{parcel.parcel_number}</p>
                    {parcel.uka_namba && (
                      <p className="text-sm text-muted-foreground">UKA: {parcel.uka_namba}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{parcel.area_sqm.toLocaleString()} sqm</p>
                    {parcel.has_conflicts && (
                      <span className="text-xs text-red-600">⚠ Conflicts</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {application.rejection_reason && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Rejection Reason</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{application.rejection_reason}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
