import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PlanUpload from './PlanUpload';
import api from '@/lib/axios';

interface WorkflowGateProps {
  localityId: string | number;       // The actual locality ID (locality__id)
  localityName?: string;
  onProceed: () => void;            // Called when check passes and we should proceed to workflow
  disabled?: boolean;                // Pass through approval status check
  children?: React.ReactNode;        // Optional slot for custom UI
}

/**
 * Gate component that checks for plan existence before allowing workflow access.
 * Preserves existing boundary check behavior while adding plan requirement.
 */
export default function WorkflowGate({
  localityId,
  localityName = 'this locality',
  onProceed,
  disabled = false,
  children
}: WorkflowGateProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
  // Legacy boundary check (preserve existing behavior)
  const checkBoundary = async () => {
    try {
      await api.get(`/localities/localities/${localityId}/boundary/`);
      return true;
    } catch {
      return false;
    }
  };

  // Check if locality has a plan
  const checkPlan = async () => {
    try {
      const response = await api.get(`/zoning/plans/?locality=${localityId}`);
      return response.data.hasPlan;
    } catch {
      return false;
    }
  };

  const handleClick = async () => {
    // Skip if disabled (not approved)
    if (disabled) {
      toast.error('Locality must be approved before accessing workflow');
      return;
    }

    setIsChecking(true);
    const loadingToast = toast.loading('Checking requirements...');

    try {
      // First check if plan exists
      const hasPlan = await checkPlan();
      
      if (!hasPlan) {
        toast.dismiss(loadingToast);
        toast.info(`No land use plan found for ${localityName}. Please upload one to proceed.`);
        setUploadOpen(true);
        setIsChecking(false);
        return;
      }

      // Then do legacy boundary check
      const hasBoundary = await checkBoundary();
      toast.dismiss(loadingToast);
      
      if (!hasBoundary) {
        toast.error(`No boundary data found for ${localityName}`);
        setIsChecking(false);
        return;
      }

      // All checks passed - proceed to workflow
      onProceed();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to verify workflow requirements');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <>
      {children || (
        <Button
          type="button"
          size="sm"
          className="disabled:opacity-10 mr-5 bg-primary/20 text-primary hover:bg-primary/30 dark:text-primary"
          disabled={disabled || isChecking}
          onClick={handleClick}
        >
          {isChecking ? 'Checking...' : 'Workflow'}
        </Button>
      )}
      
      <PlanUpload
        isOpen={uploadOpen}
        onOpenChange={setUploadOpen}
        localityId={localityId}
        localityName={localityName}
        onSuccess={() => {
          setUploadOpen(false);
          handleClick(); // Recheck requirements after upload
        }}
      />
    </>
  );
}