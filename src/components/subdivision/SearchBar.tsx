import React from 'react';
import useSubdivisionStore from './store/useSubdivisionStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SearchBar() {
  const [q, setQ] = React.useState('');
  const subdivisions = useSubdivisionStore((s) => s.subdivisions);
  const setSelectedId = useSubdivisionStore((s) => s.setSelectedId);

  const runSearch = () => {
    if (!q) return;
    const term = q.trim().toLowerCase();
  // search by id, plan, owner, coordinates (simple heuristics)
    let found = subdivisions.find((sub: any) => {
      const id = String(sub.properties?.id || '') || '';
      if (id.toLowerCase() === term) return true;
  const zone = String(sub.properties?.plan || sub.properties?.zone || '') || '';
  if (zone.toLowerCase().includes(term)) return true;
      const owner = String(sub.properties?.owner || '') || '';
      if (owner.toLowerCase().includes(term)) return true;
      // coordinates search format: lat,lng or lng,lat
      if (/^-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?$/.test(term)) {
        const [a, b] = term.split(',').map((s) => parseFloat(s));
        // check centroid proximity
        if (sub.properties?.centroid) {
          const cLng = sub.properties.centroid.lng;
          const cLat = sub.properties.centroid.lat;
          const dist = Math.hypot(cLng - b, cLat - a);
          if (dist < 0.01) return true; // ~1km tolerance heuristic
        }
      }
      return false;
    });

    if (found) {
      const sel = (found.properties && ((found.properties as any).id || (found.properties as any)._drawId)) || null;
      setSelectedId(sel);
      // zooming is handled in the map click handler by listening to selectedId elsewhere
    } else {
      window.alert('No matching parcel found (local search)');
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2",
      "relative w-full"
    )}>
      <Input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && runSearch()}
        placeholder="Search parcel ID, plan, or coordinates"
        className="pl-8"
      />
      <Search 
        className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" 
      />
      <Button
        variant="secondary"
        size="sm"
        onClick={runSearch}
        type="submit"
        className="absolute right-0 h-full rounded-l-none"
      >
        Search
      </Button>
    </div>
  );
}
