import { useState } from 'react';
import { useSubdivisionStore } from '../store/useSubdivisionStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PartyAllocation } from '@/types/subdivision';

export function ParcelDetails() {
  const [tab, setTab] = useState('details');
  const subdivisions = useSubdivisionStore((s) => s.subdivisions);
  const selectedId = useSubdivisionStore((s) => s.selectedId);
  const updateSubdivision = useSubdivisionStore((s) => s.updateSubdivision);

  const selectedParcel = subdivisions.find(
    (sub) => sub.properties.id === selectedId
  );

  if (!selectedParcel) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Select a subdivision to view details
      </div>
    );
  }

  const handleAllocationChange = (allocations: PartyAllocation[]) => {
    updateSubdivision(selectedParcel.properties.id, {
      properties: {
        ...selectedParcel.properties,
        allocations
      }
    });
  };

  return (
    <Tabs value={tab} onValueChange={setTab} className="h-full flex flex-col">
      <div className="border-b px-3">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="parties">Parties</TabsTrigger>
        </TabsList>
      </div>

      <ScrollArea className="flex-1">
        <TabsContent value="details" className="m-0">
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={selectedParcel.properties.title}
                onChange={(e) =>
                  updateSubdivision(selectedParcel.properties.id, {
                    properties: {
                      ...selectedParcel.properties,
                      title: e.target.value
                    }
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Size (hectares)</Label>
              <Input
                type="number"
                value={selectedParcel.properties.size}
                onChange={(e) =>
                  updateSubdivision(selectedParcel.properties.id, {
                    properties: {
                      ...selectedParcel.properties,
                      size: parseFloat(e.target.value) || 0
                    }
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={selectedParcel.properties.notes || ''}
                onChange={(e) =>
                  updateSubdivision(selectedParcel.properties.id, {
                    properties: {
                      ...selectedParcel.properties,
                      notes: e.target.value
                    }
                  })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="parties" className="m-0">
          <PartyAllocationForm
            allocations={selectedParcel.properties.allocations}
            onChange={handleAllocationChange}
          />
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
}

interface PartyAllocationFormProps {
  allocations: PartyAllocation[];
  onChange: (allocations: PartyAllocation[]) => void;
}

function PartyAllocationForm({ allocations, onChange }: PartyAllocationFormProps) {
  const [newPartyName, setNewPartyName] = useState('');

  const addParty = () => {
    if (!newPartyName.trim()) return;

    onChange([
      ...allocations,
      {
        partyId: crypto.randomUUID(),
        name: newPartyName.trim(),
        share: 0
      }
    ]);

    setNewPartyName('');
  };

  const updateShare = (partyId: string, share: number) => {
    onChange(
      allocations.map((a) =>
        a.partyId === partyId ? { ...a, share } : a
      )
    );
  };

  const removeParty = (partyId: string) => {
    onChange(allocations.filter((a) => a.partyId !== partyId));
  };

  const totalShare = allocations.reduce((sum, a) => sum + a.share, 0);

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Party name"
          value={newPartyName}
          onChange={(e) => setNewPartyName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addParty()}
        />
        <Button onClick={addParty}>Add</Button>
      </div>

      <div className="space-y-3">
        {allocations.map((allocation) => (
          <div
            key={allocation.partyId}
            className="flex items-center gap-2"
          >
            <div className="flex-1">{allocation.name}</div>
            <Input
              type="number"
              value={allocation.share}
              onChange={(e) =>
                updateShare(
                  allocation.partyId,
                  Math.max(0, Math.min(100, parseFloat(e.target.value) || 0))
                )
              }
              className="w-24"
            />
            <div className="w-8">%</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeParty(allocation.partyId)}
            >
              ×
            </Button>
          </div>
        ))}
      </div>

      <div className={`text-sm ${totalShare === 100 ? 'text-green-600' : 'text-orange-600'}`}>
        Total allocation: {totalShare}%
      </div>
    </div>
  );
}