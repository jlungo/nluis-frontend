import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useSubdivisionStore } from '../store/useSubdivisionStore';

export function ValidationErrors() {
  const errors = useSubdivisionStore((s) => s.validationErrors);
  
  if (errors.length === 0) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Validation Errors</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4 mt-2 space-y-1">
          {errors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}