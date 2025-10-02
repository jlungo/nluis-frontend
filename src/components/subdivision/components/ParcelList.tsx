import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PencilRuler, Trash2 } from 'lucide-react';
import { useSubdivisionStore } from '../store/useSubdivisionStore';

export function ParcelList() {
  const subdivisions = useSubdivisionStore((s) => s.subdivisions);
  const selectedId = useSubdivisionStore((s) => s.selectedId);
  const setSelectedId = useSubdivisionStore((s) => s.setSelectedId);
  const deleteSubdivision = useSubdivisionStore((s) => s.deleteSubdivision);
  const setIsDrawing = useSubdivisionStore((s) => s.setIsDrawing);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setIsDrawing(true)}
        >
          <PencilRuler className="w-4 h-4 mr-2" />
          Add Subdivision
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {subdivisions.map((subdivision) => (
            <div
              key={subdivision.properties.id}
              className={`
                p-3 rounded-md border cursor-pointer
                hover:bg-accent hover:text-accent-foreground
                ${selectedId === subdivision.properties.id ? 'bg-accent text-accent-foreground' : ''}
              `}
              onClick={() => setSelectedId(subdivision.properties.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{subdivision.properties.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {subdivision.properties.size.toFixed(2)} ha
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSubdivision(subdivision.properties.id);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {subdivisions.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              No subdivisions yet. Click &quot;Add Subdivision&quot; to start.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}