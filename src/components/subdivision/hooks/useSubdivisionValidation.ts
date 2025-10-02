import { useEffect } from 'react';
import { useSubdivisionStore } from '../store/useSubdivisionStore';
import { validateAllSubdivisions } from '../utils/validation';

export function useSubdivisionValidation() {
  const subdivisions = useSubdivisionStore((s) => s.subdivisions);
  const parentParcel = useSubdivisionStore((s) => s.parentParcel);
  const setValidationErrors = useSubdivisionStore((s) => s.setValidationErrors);

  useEffect(() => {
    if (!parentParcel || subdivisions.length === 0) {
      setValidationErrors([]);
      return;
    }

    const errors = validateAllSubdivisions(subdivisions, parentParcel);
    setValidationErrors(errors);
  }, [subdivisions, parentParcel, setValidationErrors]);
}