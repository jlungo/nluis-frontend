import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLandUsesQuery } from '@/queries/useSetupQuery';
import { useZoningStore } from '../store/useZoningStore';

export default function SelectByDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [mode, setMode] = useState<'type' | 'status'>('type');
  const [typeValue, setTypeValue] = useState<string>('');
  const [statusValue, setStatusValue] = useState<string>('');

  const { data: landUses = [] } = useLandUsesQuery();
  const api = useZoningStore((s) => s.api);

  useEffect(() => {
    if (!open) {
      setTypeValue('');
      setStatusValue('');
      setMode('type');
    }
  }, [open]);

  const submit = () => {
    if (mode === 'type') {
      api.selectByType?.(typeValue);
    } else {
      api.selectByStatus?.(statusValue);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Zones</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-2">
            <button className={`px-2 py-1 rounded ${mode === 'type' ? 'bg-muted' : ''}`} onClick={() => setMode('type')}>By Type</button>
            <button className={`px-2 py-1 rounded ${mode === 'status' ? 'bg-muted' : ''}`} onClick={() => setMode('status')}>By Status</button>
          </div>

          {mode === 'type' ? (
            <div>
              <Label className="text-sm">Land Use</Label>
              <Select value={typeValue} onValueChange={(v) => setTypeValue(v)}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select land use" />
                </SelectTrigger>
                <SelectContent>
                  {landUses.map((lu: any) => (
                    <SelectItem key={lu.id} value={String(lu.id)}>{lu.name || lu.name_en || lu.swahili || lu.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label className="text-sm">Status</Label>
              <Input value={statusValue} onChange={(e) => setStatusValue(e.target.value)} placeholder="e.g. Approved, Draft" />
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={submit}>Select</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
