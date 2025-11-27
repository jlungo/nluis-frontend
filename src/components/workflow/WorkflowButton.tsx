import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Loader2 } from 'lucide-react';
import { useWorkflowAccessCheck } from '@/hooks/useWorkflowAccessCheck';

interface WorkflowButtonProps {
  locality_id: string;
  moduleLevel: string;
  approval_status: number;
  onClick: () => void;
}

/**
 * Workflow button with access check
 * Validates if locality has required projects based on module level
 * Land use levels require land use project, CCRO level requires CCRO project
 */
export const WorkflowButton: React.FC<WorkflowButtonProps> = ({
  locality_id,
  moduleLevel,
  approval_status,
  onClick,
}) => {
  const { canAccess, isLoading, reason } = useWorkflowAccessCheck({
    locality_id,
    moduleLevel,
  });

  const isDisabled = approval_status !== 2 || !canAccess || isLoading;
  const disabledReason = approval_status !== 2 
    ? 'Workflow is only available for approved localities' 
    : reason;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="sm"
            className={
              'disabled:opacity-10 mr-5 bg-primary/20 text-primary hover:bg-primary/30 dark:text-primary'
            }
            disabled={isDisabled}
            onClick={onClick}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Workflow'
            )}
          </Button>
        </TooltipTrigger>
        {isDisabled && disabledReason && (
          <TooltipContent className="max-w-xs">
            <p>{disabledReason}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
