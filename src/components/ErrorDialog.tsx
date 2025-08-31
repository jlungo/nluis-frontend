import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

type ErrorDialogProps = {
  open: boolean;
  errorMessage: string;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onRetry: () => void;
  cancelText?: string;
  retryText?: string;
  title?: string;
};

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  open,
  errorMessage,
  onOpenChange,
  onCancel,
  onRetry,
  cancelText = 'Cancel',
  retryText = 'Try Again',
  title = 'Error Loading Projects',
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            {title}
          </DialogTitle>
          <DialogDescription className="pt-4">
            {errorMessage}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button onClick={onRetry}>
            {retryText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
