"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CCROApplication } from "@/types/ccro";
import { CCROStatusBadge } from "@/components/ccro/CCROStatusBadge";
import { Button } from "@/components/ui/button";
import { NidaVerificationModal } from "./NidaVerificationModal";

interface CCROApplicationDetailProps {
  application: CCROApplication;
  // onVerify should be a zero-arg callback because the modal receives the prefilled NIDA ID
  onVerify: () => Promise<void>;
  onIssueCCRO: () => void;
}

export function CCROApplicationDetail({ 
  application,
  onVerify,
  onIssueCCRO
}: CCROApplicationDetailProps) {
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<typeof application.partyInfo[0] | null>(null);
  
  const allPartiesVerified = application.partyInfo.every(
    party => party.verificationStatus === 'verified'
  );

  const handleVerifyClick = (party: typeof application.partyInfo[0]) => {
    setSelectedParty(party);
    setVerificationModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Application Details</h3>
          <p className="text-gray-500">Claim No: {application.claimNo}</p>
        </div>
        <CCROStatusBadge status={application.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Village</p>
              <p className="font-medium">{application.locality.village}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Hamlet</p>
              <p className="font-medium">{application.locality.hamlet}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Area</p>
              <p className="font-medium">{application.parcel.area}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {application.partyInfo.map((party, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-4">
                <div>
                  <p className="font-medium">{party.name}</p>
                  {party.idNumber && (
                    <p className="text-sm text-gray-500">ID: {party.idNumber}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    party.verificationStatus === 'verified'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {party.verificationStatus}
                  </span>
                  {party.verificationStatus !== 'verified' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleVerifyClick(party)}
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          disabled={!allPartiesVerified || application.status !== 'approved'}
          onClick={onIssueCCRO}
        >
          Issue CCRO
        </Button>
      </div>

      {selectedParty && (
        <NidaVerificationModal
          open={verificationModalOpen}
          onOpenChange={setVerificationModalOpen}
          // pass the party's NIDA ID into the modal and call onVerify without args
          onVerify={async () => {
            await onVerify();
            setVerificationModalOpen(false);
          }}
          partyName={selectedParty.name}
          nidaId={selectedParty.idNumber}
        />
      )}
    </div>
  );
}