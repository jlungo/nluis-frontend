import { useRef } from 'react';
import MapGL, { NavigationControl } from 'react-map-gl/mapbox';
import type { MapRef } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function FormMapViewer() {
  // Ref for the map instance
  const mapRef = useRef<MapRef | null>(null);

  // Default viewport centered on Tanzania
  const initialViewport = {
    longitude: 35.7516,
    latitude: -6.3690,
    zoom: 5.8
  };

  return (
    <div className="absolute inset-0">
      <MapGL
        ref={mapRef}
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
        initialViewState={initialViewport}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        minZoom={5.5}
        maxZoom={20}
        style={{ width: '100%', height: '100%' }}
        maxBounds={[
          [29.3269, -11.7457], // Southwest coordinates of Tanzania
          [40.4484, -0.9862]   // Northeast coordinates of Tanzania
        ]}
      >
        <NavigationControl position="top-right" />
      </MapGL>
    </div>
  );
}