import { useCallback, useEffect, useMemo, useRef } from 'react';
import MapGL, { NavigationControl, Source, Layer } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
// @ts-expect-error no types
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useSubdivisionStore } from '../store/useSubdivisionStore';

import type { SubdivisionFeature, NewSubdivisionFeature } from '@/types/subdivision';
import type { ParcelFeature } from '@/types/subdivision';
import { ensureMultiPolygon, calculateArea } from '../utils/geometry';
import { validateSubdivision } from '../utils/validation';
import { toast } from 'sonner';
import { 
  useParcelSubdivisionsQuery,
  useCreateSubdivision,
  useUpdateSubdivision,
  useDeleteSubdivision 
} from '@/queries/useParcelQuery';
import { useResidentialZonesQuery } from '@/queries/useZoningQuery';

interface SubdivisionMapViewerProps {
  parentParcel?: ParcelFeature;
  disabled?: boolean;
  isMaximized?: boolean;
}

export default function SubdivisionMapViewer({
  parentParcel,
  disabled,
  isMaximized
}: SubdivisionMapViewerProps) {
  // Refs
  const mapRef = useRef<MapRef | null>(null);
  const drawRef = useRef<MapboxDraw | null>(null);

  // Only fetch subdivisions if we have a parent parcel
  const { data: backendSubdivisions = [] } = useParcelSubdivisionsQuery(
    parentParcel?.properties.id
  );
  


  // Store access
  const subdivisions = useSubdivisionStore((s) => s.subdivisions);
  const selectedId = useSubdivisionStore((s) => s.selectedId);
  const isDrawing = useSubdivisionStore((s) => s.isDrawing);
  const setSelectedId = useSubdivisionStore((s) => s.setSelectedId);

  // Backend mutations
  const { mutateAsync: createNewSubdivision } = useCreateSubdivision();
  const { mutateAsync: updateExistingSubdivision } = useUpdateSubdivision();
  const { mutateAsync: deleteExistingSubdivision } = useDeleteSubdivision();
  
  // Fetch residential zoning for the area
  const { data: residentialZones } = useResidentialZonesQuery(
    parentParcel?.properties.area_id
  );

  // Sync backend subdivisions with local state
  useEffect(() => {
    if (backendSubdivisions.length > 0) {
      useSubdivisionStore.setState({ subdivisions: backendSubdivisions });
    }
  }, [backendSubdivisions]);

  // Initialize draw control
  const initializeDraw = useCallback(() => {
    if (!mapRef.current || drawRef.current) return;

    drawRef.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: !disabled, // Hide polygon tool when disabled
        trash: !disabled // Hide delete tool when disabled
      },
      defaultMode: 'simple_select'
    });

    mapRef.current.addControl(drawRef.current);
  }, [disabled]);

  // Set up event handlers for draw interactions
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onSelect = (e: any) => {
      const ids = e.features.map((f: any) => f.id);
      setSelectedId(ids[0] || null);
    };

    const onCreate = async (e: { features: Array<{ id: string; geometry: any }> }) => {
      const [feature] = e.features;
      if (!feature || !parentParcel) return;
      
      // Create new subdivision feature
      const subdivision: NewSubdivisionFeature = {
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          title: 'Subdivision ' + (subdivisions.length + 1),
          size: calculateArea(feature.geometry.coordinates[0]), // Calculate actual area
          status: 'Pending',
          landUseId: parentParcel.properties.landUseId || '',
          parentId: parentParcel.properties.id,
          allocations: [],
          subdivisionDate: new Date().toISOString(),
          approvalStatus: 'Pending'
        }
      };

      // Validate the new subdivision
      const validationErrors = validateSubdivision(subdivision as SubdivisionFeature, parentParcel, subdivisions);
      
      if (validationErrors.length > 0) {
        toast.error(validationErrors[0].message);
        drawRef.current?.delete(feature.id);
        return;
      }

      try {
        const created = await createNewSubdivision({ 
          parcelId: parentParcel.properties.id, 
          data: subdivision as Omit<SubdivisionFeature, "id">
        });
        setSelectedId(created.id);
      } catch (error) {
        toast.error('Failed to create subdivision');
        drawRef.current?.delete(feature.id);
      }
    };

    const onUpdate = async (e: any) => {
      const [feature] = e.features;
      if (!feature || !selectedId || !parentParcel) return;

      const geometry = ensureMultiPolygon(feature.geometry);
      try {
        await updateExistingSubdivision({ 
          parcelId: parentParcel.properties.id, 
          subdivisionId: selectedId, 
          data: { geometry } 
        });
      } catch (error) {
        toast.error('Failed to update subdivision');
      }
    };

    const onDelete = async (e: any) => {
      const ids = e.features.map((f: any) => f.id);
      if (!parentParcel) return;

      for (const id of ids) {
        try {
          await deleteExistingSubdivision({ 
            parcelId: parentParcel.properties.id, 
            subdivisionId: id 
          });
        } catch (error) {
          toast.error(`Failed to delete subdivision ${id}`);
        }
      }
    };

    map.on('draw.select', onSelect);
    map.on('draw.create', onCreate);
    map.on('draw.update', onUpdate);
    map.on('draw.delete', onDelete);

    return () => {
      map.off('draw.select', onSelect);
      map.off('draw.create', onCreate);
      map.off('draw.update', onUpdate);
      map.off('draw.delete', onDelete);
    };
  }, [
    selectedId,
    setSelectedId,
    subdivisions.length,
    parentParcel,
    disabled
  ]);

  // Update draw mode based on isDrawing state
  useEffect(() => {
    if (!drawRef.current) return;
    drawRef.current.changeMode(isDrawing ? 'draw_polygon' : 'simple_select');
  }, [isDrawing]);

  // Calculate initial viewport based on parent parcel or default to Tanzania center
  const initialViewport = useMemo(() => {
    if (!parentParcel) {
      // Center on Tanzania's approximate center coordinates
      return { longitude: 35.7516, latitude: -6.3690, zoom: 5.8 };
    }

    // Calculate center of parent parcel (simple average of coordinates)
    const coords = parentParcel.geometry.coordinates[0][0] as [number, number][];
    const lons = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    
    return {
      longitude: (Math.min(...lons) + Math.max(...lons)) / 2,
      latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
      zoom: 15
    };
  }, [parentParcel]);

  return (
    <div 
      className={`w-full ${isMaximized ? 'fixed inset-0 z-50' : 'h-full'} bg-background`}
      style={{ 
        height: isMaximized ? '100vh' : '100%',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      {/* Map Container */}
      <div className="w-full h-full relative">
        <MapGL
          ref={mapRef}
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
          initialViewState={initialViewport}
          mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
          onLoad={initializeDraw}
          style={{ 
            width: '100%', 
            height: '100%',
            transition: 'all 0.3s ease-in-out'
          }}
          minZoom={5.5}
          maxZoom={20}
          maxBounds={[
            [29.3269, -11.7457], // Southwest coordinates of Tanzania
            [40.4484, -0.9862]   // Northeast coordinates of Tanzania
          ]}
        >
          {/* Residential Zones Layer */}
          {residentialZones && (
            <Source
              id="residential-zones"
              type="geojson"
              data={residentialZones}
            >
              <Layer
                id="residential-zones-fill"
                type="fill"
                paint={{
                  'fill-color': '#FFA07A',
                  'fill-opacity': 0.4
                }}
              />
              <Layer
                id="residential-zones-line"
                type="line"
                paint={{
                  'line-color': '#FF6347',
                  'line-width': 2
                }}
              />
            </Source>
          )}
          <NavigationControl position="top-right" />
        </MapGL>
      </div>
    </div>
  );
}