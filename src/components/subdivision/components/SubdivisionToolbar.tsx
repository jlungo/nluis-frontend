import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Check, X } from 'lucide-react';
import useSubdivisionStore from '../store/useSubdivisionStore';

const SubdivisionToolbar: React.FC = () => {
  const refresh = useSubdivisionStore((s) => s.setPlans); // placeholder: we will call plan refresh via other means
  const selectAll = useSubdivisionStore((s) => s.selectAll);
  const deselectAll = useSubdivisionStore((s) => s.deselectAll);
  const setIsDrawing = useSubdivisionStore((s) => s.setIsDrawing);

  return (
    <div className="flex items-center gap-2 p-2">
  <Button type="button" size="sm" variant="ghost" onClick={() => {
        // naive refresh: re-trigger by clearing then no-op (engine will fetch when localityId changes)
        // For now call selectAll as a visible debug action; we'll wire proper refresh later.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__SUBDIVISION_REFRESH__ = Date.now();
        // no-op to satisfy compile
        refresh([]);
      }}>
        <RefreshCw className="w-4 h-4 mr-1" /> Refresh Plans
      </Button>

  <Button type="button" size="sm" variant="ghost" onClick={() => selectAll()}>
        <Check className="w-4 h-4 mr-1" /> All
      </Button>

  <Button type="button" size="sm" variant="ghost" onClick={() => deselectAll()}>
        <X className="w-4 h-4 mr-1" /> None
      </Button>

  <Button type="button" size="sm" onClick={() => setIsDrawing(true)}>
        <Plus className="w-4 h-4 mr-1" /> Add Subdivision
      </Button>
    </div>
  );
};

export default SubdivisionToolbar;
