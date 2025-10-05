import React from 'react';
import { Button } from '@/components/ui/button';
import useSubdivisionStore from './store/useSubdivisionStore';

interface ZoningPanelProps {
  className?: string;
}

export const ZoningPanel: React.FC<ZoningPanelProps> = ({ className = '' }) => {
  const plans = useSubdivisionStore((s) => s.plans);
  const togglePlan = useSubdivisionStore((s) => s.togglePlan);
  const selectAll = useSubdivisionStore((s) => s.selectAll);
  const deselectAll = useSubdivisionStore((s) => s.deselectAll);

  return (
    <div className={`p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Eligible Plans</h3>
        <div className="flex gap-1">
          <Button type="button" size="sm" variant="ghost" onClick={selectAll}>All</Button>
          <Button type="button" size="sm" variant="ghost" onClick={deselectAll}>None</Button>
        </div>
      </div>

      <div className="space-y-2 max-h-[60vh] overflow-auto">
        {plans.map((z) => (
          <div key={z.id} className="flex items-center gap-2 p-2 border rounded">
            <input type="checkbox" checked={!!z.selected} onChange={(e) => { e.stopPropagation(); togglePlan(z.id); }} />
            <div className="w-3 h-3 rounded-full" style={{ background: z.color || '#888' }} />
            <div className="flex-1 text-sm">{z.name}</div>
            <div className="text-xs text-muted-foreground">{z.info}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZoningPanel;
