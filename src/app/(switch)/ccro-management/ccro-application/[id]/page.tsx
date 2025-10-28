"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CCROStatusBadge } from "@/components/ccro/CCROStatusBadge";
import { NidaVerificationModal } from "@/components/ccro/NidaVerificationModal";
import MapboxViewer from "@/components/mapbox/MapboxViewer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useCCROStore } from "@/store/ccroStore";

export default function CCROApplicationDetail() {
  const { id } = useParams();
  const { applications, loading, fetchApplications } = useCCROStore();
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<{ name: string; idNumber?: string; verificationStatus: 'verified' | 'unverified' } | null>(null);

  useEffect(() => {
    if (applications.length === 0) {
      fetchApplications();
    }
  }, [applications.length, fetchApplications]);

  const application = applications.find(app => app.id === id);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!application) {
    return (
      <div className="p-6 space-y-4">
        <div>Application not found</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">
            Application {application.claimNo}
          </h2>
          <CCROStatusBadge status={application.status} />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {application.status !== 'completed' && 
            application.partyInfo.every(party => party.verificationStatus === 'verified') && (
            <Button 
              variant="default"
              onClick={() => {
                // TODO: Implement CCRO issuance
                console.log('Issue CCRO for application:', application.id);
              }}
            >
              Issue CCRO
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="bg-background dark:bg-card text-foreground dark:text-card-foreground">
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Village</dt>
                  <dd className="font-medium">{application.locality.village}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Hamlet</dt>
                  <dd className="font-medium">{application.locality.hamlet}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Area</dt>
                  <dd className="font-medium">{application.parcel.area}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="bg-background dark:bg-card text-foreground dark:text-card-foreground">
            <CardHeader>
              <CardTitle>Party Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {application.partyInfo.map((party, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{party.name}</p>
                      {party.idNumber && (
                        <p className="text-sm text-muted-foreground">
                          ID: {party.idNumber}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          party.verificationStatus === "verified"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {party.verificationStatus}
                      </span>
                      <Button
                        size="sm"
                        variant={party.verificationStatus === "verified" ? "outline" : "default"}
                        onClick={() => {
                          setSelectedParty(party);
                          setVerificationModalOpen(true);
                        }}
                      >
                        {party.verificationStatus === "verified" ? "Re-verify" : "Verify"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background dark:bg-card text-foreground dark:text-card-foreground">
            <CardHeader>
              <CardTitle>Allocations</CardTitle>
            </CardHeader>
            <CardContent>
              {application.parcel.allocations && application.parcel.allocations.length > 0 ? (
                <div className="space-y-3">
                  {application.parcel.allocations.map((alloc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{alloc.partyName ?? 'Unknown'}</p>
                        {alloc.rights && <p className="text-sm text-gray-500">{alloc.rights}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{alloc.share ?? '-'}%</p>
                        {alloc.effectiveFrom && <p className="text-xs text-muted-foreground">From {alloc.effectiveFrom}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No allocation information available</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-background dark:bg-card text-foreground dark:text-card-foreground">
            <CardContent className="p-0 h-[calc(100vh-8rem)]">
              {application.parcel.geom ? (
                <div className="h-full">
                  <MapboxViewer
                    initialViewState={{
                      longitude: application.parcel.geom.coordinates[0],
                      latitude: application.parcel.geom.coordinates[1],
                      zoom: 12,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    mapStyle="mapbox://styles/mapbox/streets-v11"
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground border-t rounded-b-lg">
                  No parcel geometry available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedParty && (
        <NidaVerificationModal
          open={verificationModalOpen}
          onOpenChange={setVerificationModalOpen}
          onVerify={async () => {
            // TODO: When implementing the NIDA API:
            // 1. Call the NIDA verification API with selectedParty.idNumber
            // 2. Update the party's verification status in the store
            console.log("Verifying party with NIDA:", selectedParty.idNumber);
          }}
          partyName={selectedParty.name}
          nidaId={selectedParty.idNumber}
        />
      )}
    </div>
  );
}