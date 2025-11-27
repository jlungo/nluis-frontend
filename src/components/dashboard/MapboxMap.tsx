import React, { useRef, useState } from 'react';
import MapGL, { NavigationControl, Marker, Popup } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GRIIDashboardData } from '@/types/grii-dashboard';

interface MapboxMapProps {
  data: GRIIDashboardData;
}

interface LocalityMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  parcels: number;
  coverage: number;
}

// Mapbox token (same as zoning component)
const MAPBOX_TOKEN = 'pk.eyJ1IjoiY3Jlc2NlbnRzYW1iaWxhIiwiYSI6ImNtZWx5ZXR4OTA5Y3gyanNkOHM0cjFtN2sifQ.RC22kROvjoVE5LdsCSPSsA';
const MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v11';

// Default localities in Tanzania region
const DEFAULT_LOCALITIES: LocalityMarker[] = [
  { id: 'dar', name: 'Dar es Salaam', lat: -6.8, lng: 39.28, parcels: 0, coverage: 0 },
  { id: 'arusha', name: 'Arusha', lat: -3.367, lng: 36.683, parcels: 0, coverage: 0 },
  { id: 'mbeya', name: 'Mbeya', lat: -8.899, lng: 33.447, parcels: 0, coverage: 0 },
  { id: 'mwanza', name: 'Mwanza', lat: -2.517, lng: 32.917, parcels: 0, coverage: 0 },
  { id: 'dodoma', name: 'Dodoma', lat: -6.167, lng: 35.75, parcels: 0, coverage: 0 },
];

export const DashboardMapboxMap: React.FC<MapboxMapProps> = ({ data }) => {
  const mapRef = useRef<any>(null);
  const [viewState, setViewState] = useState({
    longitude: 35.5,
    latitude: -6.5,
    zoom: 5,
    bearing: 0,
    pitch: 0,
  });
  const [hoveredLocality, setHoveredLocality] = useState<string | null>(null);

  // Build locality markers from data
  const localities = DEFAULT_LOCALITIES.map((loc) => ({
    ...loc,
    parcels: data?.parcel?.total || 0,
    coverage: 75, // Default coverage
  }));

  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: localities.map((loc) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [loc.lng, loc.lat],
        },
        properties: {
          name: loc.name,
          parcels: loc.parcels,
          coverage: loc.coverage,
        },
      })),
    };
    const dataStr = JSON.stringify(geojson, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard-localities.geojson';
    link.click();
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>Parcel registration and CCRO coverage by locality</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportGeoJSON}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export GeoJSON
        </Button>
      </CardHeader>
      <CardContent>
        <div className="w-full h-96 rounded-md overflow-hidden border">
          <MapGL
            ref={mapRef}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MAPBOX_STYLE}
            mapboxAccessToken={MAPBOX_TOKEN}
          >
            <NavigationControl position="top-right" />

            {/* Render locality markers */}
            {localities.map((locality) => (
              <div key={locality.id}>
                <Marker
                  longitude={locality.lng}
                  latitude={locality.lat}
                  onClick={() => setHoveredLocality(locality.id)}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transform hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: '#0088FE',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                    onMouseEnter={() => setHoveredLocality(locality.id)}
                  >
                    <MapPin size={16} />
                  </div>
                </Marker>

                {hoveredLocality === locality.id && (
                  <Popup
                    longitude={locality.lng}
                    latitude={locality.lat}
                    anchor="bottom"
                    onClose={() => setHoveredLocality(null)}
                  >
                    <div className="p-3 bg-white rounded-lg shadow-lg">
                      <h3 className="font-semibold text-sm mb-2">{locality.name}</h3>
                      <div className="space-y-1 text-xs">
                        <div>
                          <Badge variant="secondary">Parcels: {locality.parcels.toLocaleString()}</Badge>
                        </div>
                        <div>
                          <Badge variant="outline">Coverage: {locality.coverage}%</Badge>
                        </div>
                      </div>
                    </div>
                  </Popup>
                )}
              </div>
            ))}
          </MapGL>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardMapboxMap;
