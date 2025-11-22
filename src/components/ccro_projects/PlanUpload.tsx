import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { localityPlanQueryKey } from '@/queries/useLocalityPlanQuery';

interface PlanUploadProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  localityId: string | number;
  localityName?: string;
}

export default function PlanUpload({ 
  isOpen, 
  onOpenChange, 
  onSuccess,
  localityId,
  localityName = 'this locality'
}: PlanUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { mutate: uploadPlan, isPending } = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected');
      
      const formData = new FormData();
      formData.append('plan', file);
      
      return api.post(`/zoning/plans/${localityId}/upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [localityPlanQueryKey] });
      // Close dialog and notify parent
      onOpenChange(false);
      onSuccess?.();
      toast.success(`Plan uploaded successfully for ${localityName}`);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 
        error?.message || 
        'Failed to upload plan'
      );
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    uploadPlan();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Land Use Plan</DialogTitle>
          <DialogDescription>
            Upload a land use plan for {localityName}. This plan will be used for subdivision and workflow activities.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <input
              type="file"
              id="plan"
              className="hidden"
              onChange={handleFileChange}
              accept=".geojson,.json,.zip"
            />
            <label
              htmlFor="plan"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  {file ? file.name : 'Click to select plan file'}
                </p>
              </div>
            </label>
          </div>
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button" 
            onClick={handleUpload}
            disabled={!file || isPending}
          >
            {isPending ? 'Uploading...' : 'Upload Plan'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}