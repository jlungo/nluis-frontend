"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NidaVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: () => Promise<void>;
  partyName: string;
  nidaId?: string;
}

export function NidaVerificationModal({
  open,
  onOpenChange,
  onVerify,
  partyName,
  nidaId,
}: NidaVerificationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!nidaId) {
      setError("No NIDA ID available for verification");
      return;
    }

    // Validate NIDA format (20 digits for Tanzania)
    if (nidaId.length !== 20 || !/^\d+$/.test(nidaId)) {
      setError("Invalid NIDA format. Must be exactly 20 digits");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onVerify();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>NIDA Verification</DialogTitle>
          <DialogDescription>
            Verify {partyName}'s identity using their NIDA number
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="nida-id">NIDA Number (20 digits)</Label>
            <Input
              id="nida-id"
              value={nidaId || ''}
              readOnly
              className="bg-muted font-mono"
              placeholder="NIDA not provided"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVerify} 
              disabled={loading || !nidaId}
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}