"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CCROApplication, NIDA_STATUS_LABELS } from "@/types/ccro";
import { CCROStatusBadge } from "@/components/ccro/CCROStatusBadge";
import { Button } from "@/components/ui/button";
import { NidaVerificationModal } from "./NidaVerificationModal";
import { useCCROStore } from "@/store/ccroStore";

interface CCROApplicationDetailProps {
  application: CCROApplication;
}

export function CCROApplicationDetail({ 
  application,
}: CCROApplicationDetailProps) {
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { verifyPartyNida, checkNidaStatus, approveCCRO, issueCCRO, error } = useCCROStore();
  
  const canApprove = 
    application.stage === 'submitted' && 
    application.nida_check_status === 'verified';
  
  const canIssue = 
    application.stage === 'approved' && 
    application.nida_check_status === 'verified';

  const handleVerifyClick = (partyId: number) => {
    setSelectedPartyId(partyId);
    setVerificationModalOpen(true);
  };

  const handleVerifyNida = async () => {
    if (!selectedPartyId) return;
    
    setIsLoading(true);
    try {
      await verifyPartyNida(selectedPartyId);
      // Recheck NIDA status after verification
      await checkNidaStatus(application.id);
      setVerificationModalOpen(false);
      setSelectedPartyId(null);
    } catch (err) {
      console.error('NIDA verification failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveCCRO = async () => {
    setIsLoading(true);
    try {
      await approveCCRO(application.id);
    } catch (err) {
      console.error('Approve CCRO failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIssueCCRO = async () => {
    setIsLoading(true);
    try {
      await issueCCRO(application.id);
    } catch (err) {
      console.error('Issue CCRO failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">CCRO Application Details</h3>
          <p className="text-gray-500">Application ID: {application.id}</p>
        </div>
        <CCROStatusBadge status={application.stage} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* NIDA Validation Gate Status */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-900">NIDA Verification Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{NIDA_STATUS_LABELS[application.nida_check_status]}</p>
              {application.nida_check_notes && (
                <p className="text-sm text-gray-600 mt-1">{application.nida_check_notes}</p>
              )}
            </div>
            {(application.nida_check_status === 'missing' || application.nida_check_status === 'invalid') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleVerifyClick(application.party)}
              >
                Verify NIDA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parcel Information */}
      {application.parcel_details && (
        <Card>
          <CardHeader>
            <CardTitle>Parcel Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Parcel Number</p>
              <p className="font-medium">{application.parcel_details.parcel_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Area (sqm)</p>
              <p className="font-medium">{application.parcel_details.area_sqm.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stage</p>
              <p className="font-medium">{application.parcel_details.stage}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Locality</p>
              <p className="font-medium">{application.parcel_details.locality_name}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Party/Parties Information */}
      {application.parcel_details?.allocations && (
        <Card>
          <CardHeader>
            <CardTitle>Owners (Allocations)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {application.parcel_details.allocations.map((allocation) => (
                <div key={allocation.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{allocation.party_name}</p>
                    <p className="text-sm text-gray-500">Share: {allocation.proposed_share}%</p>
                    {allocation.proposed_right_type && (
                      <p className="text-sm text-gray-500">Right Type: {allocation.proposed_right_type}</p>
                    )}
                  </div>
                  <div className="text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {allocation.status}
                  </div>
                </div>
              ))}
              
              {/* Total shares validation */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium">
                  Total Share: {application.parcel_details.allocations.reduce((sum, a) => sum + (a.proposed_share || 0), 0)}%
                </p>
                {application.parcel_details.allocations.reduce((sum, a) => sum + (a.proposed_share || 0), 0) !== 100 && (
                  <p className="text-xs text-red-600 mt-1">⚠️ Shares must total exactly 100%</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        {application.stage === 'submitted' && (
          <Button
            size="lg"
            variant="outline"
            disabled={!canApprove || isLoading}
            onClick={handleApproveCCRO}
          >
            {isLoading ? 'Approving...' : 'Approve CCRO'}
          </Button>
        )}
        
        {application.stage === 'approved' && (
          <Button
            size="lg"
            disabled={!canIssue || isLoading}
            onClick={handleIssueCCRO}
          >
            {isLoading ? 'Issuing...' : 'Issue CCRO Certificate'}
          </Button>
        )}
      </div>

      {/* NIDA Verification Modal */}
      {selectedPartyId && (
        <NidaVerificationModal
          open={verificationModalOpen}
          onOpenChange={setVerificationModalOpen}
          onVerify={async () => {
            await handleVerifyNida();
          }}
          partyName={application.party_details?.individual_party?.full_name || 'Unknown'}
          nidaId={application.party_details?.individual_party?.nida_number}
        />
      )}
    </div>
  );
}