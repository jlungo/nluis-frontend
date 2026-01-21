"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  LandApplication,
  LAND_APPLICATION_STATUS_LABELS,
  OWNERSHIP_LABELS,
  OwnershipType,
} from "@/types/landApplication";
import {
  useSubmitLandApplication,
  useVerifyLandApplication,
  useCouncilApproveLandApplication,
  useAssemblyApproveLandApplication,
  useAssignSurveyor,
  useStartSurvey,
  useCompleteSurvey,
  useGISReview,
  useCompleteLandApplication,
  useRejectLandApplication,
  useVerifyNeighbor,
} from "@/queries/useLandApplicationQuery";
import { format } from "date-fns";

interface LandApplicationDetailProps {
  application: LandApplication;
  onRefresh: () => Promise<unknown> | void;
}

interface ApprovalForm {
  decision: "approved" | "rejected";
  chairman_name: string;
  veo_name: string;
  meeting_date: string;
  notes: string;
}

export function LandApplicationDetail({ application, onRefresh }: LandApplicationDetailProps) {
  const [showApprovalDialog, setShowApprovalDialog] = useState<null | "council" | "assembly">(null);
  const [approvalForm, setApprovalForm] = useState<ApprovalForm>({
    decision: "approved",
    chairman_name: "",
    veo_name: "",
    meeting_date: format(new Date(), "yyyy-MM-dd"),
    notes: "",
  });
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [surveyorId, setSurveyorId] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const submitMutation = useSubmitLandApplication({ onSuccess: handleSuccess });
  const verifyMutation = useVerifyLandApplication({ onSuccess: handleSuccess });
  const councilMutation = useCouncilApproveLandApplication({ onSuccess: handleSuccess });
  const assemblyMutation = useAssemblyApproveLandApplication({ onSuccess: handleSuccess });
  const assignMutation = useAssignSurveyor({ onSuccess: handleSuccess });
  const startSurveyMutation = useStartSurvey({ onSuccess: handleSuccess });
  const completeSurveyMutation = useCompleteSurvey({ onSuccess: handleSuccess });
  const gisReviewMutation = useGISReview({ onSuccess: handleSuccess });
  const completeMutation = useCompleteLandApplication({ onSuccess: handleSuccess });
  const rejectMutation = useRejectLandApplication({ onSuccess: handleSuccess });
  const verifyNeighborMutation = useVerifyNeighbor({ onSuccess: handleSuccess });

  function handleSuccess() {
    toast.success("Workflow updated");
    void onRefresh();
    setShowApprovalDialog(null);
    setShowAssignDialog(false);
    setShowRejectDialog(false);
  }

  const statusLabel = LAND_APPLICATION_STATUS_LABELS[application.status];
  const ownershipLabel = OWNERSHIP_LABELS[application.ownership_type as OwnershipType];

  const isLoading =
    submitMutation.isPending ||
    verifyMutation.isPending ||
    councilMutation.isPending ||
    assemblyMutation.isPending ||
    assignMutation.isPending ||
    startSurveyMutation.isPending ||
    completeSurveyMutation.isPending ||
    gisReviewMutation.isPending ||
    completeMutation.isPending ||
    rejectMutation.isPending;

  async function handleSubmit(fn: () => Promise<unknown>) {
    try {
      await fn();
    } catch (error) {
      console.error(error);
      toast.error("Action failed");
    }
  }

  const neighbors = application.neighbors || [];
  const applicants = application.applicants || [];
  const parcels = application.parcels || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Claim #{application.claim_number}</p>
          <h1 className="text-2xl font-bold">Land Application Details</h1>
          <p className="text-sm text-muted-foreground">Ownership: {ownershipLabel?.en}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="text-base">
            {statusLabel?.en}
          </Badge>
          {application.registration_number && (
            <Badge>{application.registration_number}</Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Actions</CardTitle>
          <CardDescription>Perform the next step based on current status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {application.status === "draft" && (
            <Button disabled={isLoading} onClick={() => handleSubmit(() => submitMutation.mutateAsync(application.id))}>
              Submit for Verification
            </Button>
          )}

          {application.status === "pending_verification" && (
            <Button disabled={isLoading} onClick={() => handleSubmit(() => verifyMutation.mutateAsync(application.id))}>
              Verify Application
            </Button>
          )}

          {application.status === "pending_council" && (
            <Button variant="outline" disabled={isLoading} onClick={() => setShowApprovalDialog("council")}>
              Council Decision
            </Button>
          )}

          {application.status === "pending_assembly" && (
            <Button variant="outline" disabled={isLoading} onClick={() => setShowApprovalDialog("assembly")}>
              Assembly Decision
            </Button>
          )}

          {application.status === "approved" && (
            <Button variant="outline" disabled={isLoading} onClick={() => setShowAssignDialog(true)}>
              Assign Surveyor
            </Button>
          )}

          {application.status === "assigned" && (
            <Button disabled={isLoading} onClick={() => handleSubmit(() => startSurveyMutation.mutateAsync(application.id))}>
              Start Survey
            </Button>
          )}

          {application.status === "surveying" && (
            <Button disabled={isLoading} onClick={() => handleSubmit(() => completeSurveyMutation.mutateAsync(application.id))}>
              Complete Survey
            </Button>
          )}

          {application.status === "survey_complete" && (
            <Button disabled={isLoading} onClick={() => handleSubmit(() => gisReviewMutation.mutateAsync(application.id))}>
              Send to GIS Review
            </Button>
          )}

          {application.status === "under_review" && (
            <Button disabled={isLoading} onClick={() => handleSubmit(() => completeMutation.mutateAsync(application.id))}>
              Complete Application
            </Button>
          )}

          {application.status !== "completed" && application.status !== "rejected" && (
            <Button variant="destructive" disabled={isLoading} onClick={() => setShowRejectDialog(true)}>
              Reject Application
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location & Land Use</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Locality</p>
            <p className="font-medium">{application.locality_name || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Hamlet</p>
            <p className="font-medium">{application.hamlet || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Land Use</p>
            <p className="font-medium">{application.current_land_use || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Proposed Land Use</p>
            <p className="font-medium">{application.proposed_land_use || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estimated Area (acres)</p>
            <p className="font-medium">{application.estimated_area_acres?.toFixed(2) || "—"}</p>
          </div>
        </CardContent>
      </Card>

      {applicants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Applicants</CardTitle>
            <CardDescription>{applicants.length} applicant(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {applicants.map((applicant) => (
              <div key={applicant.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <p className="font-medium">{applicant.party_name || `Party #${applicant.party}`}</p>
                  <p className="text-sm text-muted-foreground capitalize">{applicant.role}</p>
                </div>
                {applicant.party_nida && (
                  <Badge variant="secondary">NIDA: {applicant.party_nida}</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {neighbors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Neighbors</CardTitle>
            <CardDescription>Field verification status</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {neighbors.map((neighbor) => (
              <div key={neighbor.id} className="border rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{neighbor.name}</p>
                    <p className="text-xs text-muted-foreground">{neighbor.direction} • {neighbor.neighbor_type}</p>
                  </div>
                  <Badge variant={neighbor.field_verified ? "default" : "outline"}>
                    {neighbor.field_verified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                {!neighbor.field_verified && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={verifyNeighborMutation.isPending}
                    onClick={() =>
                      handleSubmit(() =>
                        verifyNeighborMutation.mutateAsync({
                          neighborId: neighbor.id,
                          payload: { field_verified: true },
                        })
                      )}
                  >
                    Mark Verified
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {parcels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Parcels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {parcels.map((parcel) => (
              <div key={parcel.id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{parcel.parcel_number}</p>
                  {parcel.uka_namba && <p className="text-sm text-muted-foreground">UKA: {parcel.uka_namba}</p>}
                </div>
                <div className="text-right">
                  <p className="font-medium">{parcel.area_sqm.toLocaleString()} sqm</p>
                  {parcel.has_conflicts && <p className="text-xs text-destructive">Conflicts detected</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Approval Dialog */}
      <Dialog open={!!showApprovalDialog} onOpenChange={() => setShowApprovalDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showApprovalDialog === "council" ? "Council" : "Assembly"} Decision</DialogTitle>
            <DialogDescription>Provide the official meeting details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="flex gap-2">
              <Button
                variant={approvalForm.decision === "approved" ? "default" : "outline"}
                onClick={() => setApprovalForm((prev) => ({ ...prev, decision: "approved" }))}
              >
                Approve
              </Button>
              <Button
                variant={approvalForm.decision === "rejected" ? "default" : "outline"}
                onClick={() => setApprovalForm((prev) => ({ ...prev, decision: "rejected" }))}
              >
                Reject
              </Button>
            </div>
            <Input
              placeholder="Chairman Name"
              value={approvalForm.chairman_name}
              onChange={(e) => setApprovalForm((prev) => ({ ...prev, chairman_name: e.target.value }))}
            />
            <Input
              placeholder="VEO Name"
              value={approvalForm.veo_name}
              onChange={(e) => setApprovalForm((prev) => ({ ...prev, veo_name: e.target.value }))}
            />
            <Input
              type="date"
              value={approvalForm.meeting_date}
              onChange={(e) => setApprovalForm((prev) => ({ ...prev, meeting_date: e.target.value }))}
            />
            <Textarea
              placeholder="Notes"
              value={approvalForm.notes}
              onChange={(e) => setApprovalForm((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(null)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                handleSubmit(() =>
                  (showApprovalDialog === "council" ? councilMutation : assemblyMutation).mutateAsync({
                    id: application.id,
                    payload: approvalForm,
                  })
                )
              }
              disabled={isLoading}
            >
              Submit Decision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Surveyor */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Surveyor</DialogTitle>
            <DialogDescription>Enter the surveyor ID provided by HQ.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Surveyor ID"
            value={surveyorId}
            onChange={(e) => setSurveyorId(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              disabled={!surveyorId || isLoading}
              onClick={() =>
                handleSubmit(() =>
                  assignMutation.mutateAsync({
                    id: application.id,
                    payload: { surveyor_id: Number(surveyorId) },
                  })
                )
              }
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Application */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Land Application</DialogTitle>
            <DialogDescription>Provide a reason visible to the applicant.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason || isLoading}
              onClick={() =>
                handleSubmit(() =>
                  rejectMutation.mutateAsync({
                    id: application.id,
                    payload: { reason: rejectReason },
                  })
                )
              }
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
