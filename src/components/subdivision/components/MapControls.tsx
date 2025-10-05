import React from 'react';
import { Button } from '@/components/ui/button';
import { Maximize2, RotateCw, RotateCcw, Plus, Minus } from 'lucide-react';
import useSubdivisionStore from '../store/useSubdivisionStore';

interface MapControlsProps {
    // react-map-gl MapRef or raw Mapbox map instance
    map?: any | null;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const MapControls: React.FC<MapControlsProps> = ({ map, position = 'top-left' }) => {
  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2',
  };

  const isDrawing = useSubdivisionStore((s) => s.isDrawing);

  const resolveMap = (): any => {
    // If this is a react-map-gl MapRef, it exposes getMap()
    if (!map) return null;
      try {
        // react-map-gl MapRef has `getMap()`
        if (typeof (map as any).getMap === 'function') return (map as any).getMap();
        // Some callers may have passed a wrapper object with `.current`
        if (map?.current && typeof map.current.getMap === 'function') return map.current.getMap();
        // If it's already a Mapbox map instance, return as-is
        return map;
      } catch {
        return null;
      }
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDrawing) return;
    const m = resolveMap();
    try { m?.zoomIn?.(); } catch {}
  };
  
  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDrawing) return;
    const m = resolveMap();
    try { m?.zoomOut?.(); } catch {}
  };
  
  const handleRotateLeft = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDrawing) return;
    const m = resolveMap();
    try {
      const bearing = (typeof m.getBearing === 'function' ? m.getBearing() : 0) - 90;
      m.easeTo?.({ bearing: ((bearing % 360) + 360) % 360 });
    } catch {}
  };
  
  const handleResetNorth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDrawing) return;
    const m = resolveMap();
    try { m?.easeTo?.({ bearing: 0, pitch: 0 }); } catch {}
  };
  
  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDrawing) return;
      // Use the same centralized handler used elsewhere so toggling fullscreen keeps behavior consistent
      try { window.dispatchEvent(new CustomEvent('subdivision:toggle-fullscreen')); } catch {}
  };

  if (!map) return null;

  return (
    <div className={`absolute ${positionClasses[position]} z-10`}>
      <div className="bg-background border rounded-lg shadow-sm flex flex-col gap-1 p-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          onClick={handleZoomIn}
          title="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          onClick={handleZoomOut}
          title="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="h-px bg-border my-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          onClick={handleRotateLeft}
          title="Rotate left"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          onClick={handleResetNorth}
          title="Reset bearing to north"
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <div className="h-px bg-border my-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="w-6 h-6"
          onClick={handleFullscreen}
          title="Toggle fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};