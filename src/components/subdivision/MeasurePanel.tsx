// React import not required with automatic JSX runtime
import useSubdivisionStore from './store/useSubdivisionStore';
import { Button } from '@/components/ui/button';

export default function MeasurePanel() {
  const lastMeasurement = useSubdivisionStore((s) => s.lastMeasurement);
  const setLastMeasurement = useSubdivisionStore((s) => s.setLastMeasurement);

  if (!lastMeasurement) return null;

  return (
    <div className="absolute top-4 right-4 z-50 bg-background/95 border rounded p-3 shadow">
      <div className="text-sm font-medium">Measurement</div>
      <div className="text-xs text-muted-foreground mt-2">
        {lastMeasurement.type === 'area' ? 'Area' : 'Length'}: <strong>{lastMeasurement.value?.toFixed(2)} {lastMeasurement.units || ''}</strong>
      </div>
      <div className="mt-2 flex gap-2">
  <Button type="button" size="sm" onClick={() => setLastMeasurement(null)}>Clear</Button>
      </div>
    </div>
  );
}
