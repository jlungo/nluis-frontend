import React, { useState } from 'react';
import { MapContainer, TileLayer, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GRIIDashboardData } from '@/types/grii-dashboard';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  data: GRIIDashboardData;
}

interface ParcelMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  stage: string;
  area: number;
  zone: string;
  photo: boolean;
}

interface LocalityMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  parcels: number;
  coverage: number;
}

// Sample locality coordinates for Tanzania - will be populated from dashboard data
const getLocalitiesFromData = (data: GRIIDashboardData): LocalityMarker[] => {
  // Build from actual dashboard data if available
  const localities: LocalityMarker[] = [];
  
  if (data?.parcel?.byLocality && typeof data.parcel.byLocality === 'object') {
    // Convert dashboard locality data to markers
    // Note: This uses mock coordinates as actual geo coordinates would come from backend
    const localityCoords: Record<string, { lat: number; lng: number }> = {
      'Dar es Salaam': { lat: -6.8, lng: 39.28 },
      'Arusha': { lat: -3.367, lng: 36.683 },
      'Mbeya': { lat: -8.899, lng: 33.447 },
      'Mwanza': { lat: -2.517, lng: 32.917 },
      'Dodoma': { lat: -6.167, lng: 35.75 },
      'Kigali': { lat: -1.942, lng: 30.06 },
    };

    let count = 0;
    for (const [locality, parcels] of Object.entries(data.parcel.byLocality)) {
      if (count >= 6) break; // Limit to 6 for performance
      const coords = localityCoords[locality as string] || { lat: 0, lng: 0 };
      const total = data.parcel.total || 1;
      const coverage = Math.min(100, Math.round(((parcels as number) / total) * 100));
      
      localities.push({
        id: `loc-${count}`,
        name: locality as string,
        lat: coords.lat,
        lng: coords.lng,
        parcels: parcels as number,
        coverage,
      });
      count++;
    }
  }

  // Return data-based localities if available, otherwise empty
  return localities.length > 0 ? localities : [];
};

// Sample parcel data - will be populated from dashboard
const getSampleParcels = (data: GRIIDashboardData): ParcelMarker[] => {
  const parcels: ParcelMarker[] = [];
  
  if (data?.mapData?.parcels && Array.isArray(data.mapData.parcels)) {
    // Use actual parcel data from dashboard
    data.mapData.parcels.slice(0, 5).forEach((p: any, i: number) => {
      if (p.coordinates) {
        parcels.push({
          id: `p${i + 1}`,
          name: `Parcel ${p.id}`,
          lat: p.coordinates[1] || 0,
          lng: p.coordinates[0] || 0,
          stage: p.status || 'unknown',
          area: 2500 + (i * 500),
          zone: 'Unknown',
          photo: true,
        });
      }
    });
  }
  
  return parcels;
};

// Color coding function
const getCoverageColor = (coverage: number) => {
  if (coverage >= 80) return '#00C49F';
  if (coverage >= 60) return '#FFBB28';
  return '#FF8042';
};

const getStageColor = (stage: string) => {
  switch (stage) {
    case 'registered':
      return '#00C49F';
    case 'gisReview':
      return '#FFBB28';
    case 'draft':
      return '#FF8042';
    default:
      return '#0088FE';
  }
};

export const GRIIGeographicMap: React.FC<MapProps> = ({ data }) => {
  const [layer, setLayer] = useState<'localities' | 'parcels'>('localities');
  const [selectedMarker, setSelectedMarker] = useState<LocalityMarker | ParcelMarker | null>(null);

  // Get dynamic data from dashboard
  const localities = getLocalitiesFromData(data);
  const parcels = getSampleParcels(data);

  const handleDownloadGeoJSON = () => {
    const features = layer === 'localities' 
      ? localities.map(loc => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [loc.lng, loc.lat] },
          properties: { name: loc.name, parcels: loc.parcels, coverage: loc.coverage },
        }))
      : parcels.map(parcel => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [parcel.lng, parcel.lat] },
          properties: { name: parcel.name, stage: parcel.stage, area: parcel.area, zone: parcel.zone },
        }));

    if (features.length === 0) {
      alert('No data available to export');
      return;
    }

    const geojson = { type: 'FeatureCollection', features };
    const dataStr = JSON.stringify(geojson, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${layer}-data.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full lg:col-span-2">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Geographic Coverage Map
          </CardTitle>
          <CardDescription>Interactive spatial data visualization</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            variant={layer === 'localities' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayer('localities')}
          >
            Localities
          </Button>
          <Button
            variant={layer === 'parcels' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayer('parcels')}
          >
            Parcels
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadGeoJSON}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            GeoJSON
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full h-96 rounded-lg overflow-hidden border">
          <MapContainer
            center={[-6.5, 35.5]}
            zoom={6}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Localities Layer */}
            {layer === 'localities' &&
              localities.map((locality) => (
                <CircleMarker
                  key={locality.id}
                  center={[locality.lat, locality.lng]}
                  radius={10 + (locality.coverage / 100) * 10}
                  pathOptions={{
                    color: getCoverageColor(locality.coverage),
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.6,
                  }}
                  eventHandlers={{
                    click: () => setSelectedMarker(locality),
                  }}
                >
                  {selectedMarker && 'parcels' in selectedMarker && (selectedMarker as LocalityMarker).id === locality.id && (
                    <Popup>
                      <div className="min-w-48 p-2">
                        <h3 className="font-bold text-lg mb-2">{locality.name}</h3>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Parcels:</strong> {locality.parcels.toLocaleString()}
                          </p>
                          <p>
                            <strong>Coverage:</strong>{' '}
                            <Badge
                              variant={
                                locality.coverage >= 80
                                  ? 'default'
                                  : locality.coverage >= 60
                                    ? 'secondary'
                                    : 'destructive'
                              }
                            >
                              {locality.coverage}%
                            </Badge>
                          </p>
                          <p>
                            <strong>Coordinates:</strong> {locality.lat.toFixed(3)}, {locality.lng.toFixed(3)}
                          </p>
                        </div>
                      </div>
                    </Popup>
                  )}
                </CircleMarker>
              ))}

            {/* Parcels Layer */}
            {layer === 'parcels' &&
              parcels.map((parcel) => (
                <CircleMarker
                  key={parcel.id}
                  center={[parcel.lat, parcel.lng]}
                  radius={8}
                  pathOptions={{
                    color: getStageColor(parcel.stage),
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: 0.6,
                  }}
                  eventHandlers={{
                    click: () => setSelectedMarker(parcel),
                  }}
                >
                  {selectedMarker && 'stage' in selectedMarker && (selectedMarker as ParcelMarker).id === parcel.id && (
                    <Popup>
                      <div className="min-w-48 p-2">
                        <h3 className="font-bold text-lg mb-2">{parcel.name}</h3>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Stage:</strong>{' '}
                            <Badge
                              variant={
                                parcel.stage === 'registered'
                                  ? 'default'
                                  : parcel.stage === 'gisReview'
                                    ? 'secondary'
                                    : 'destructive'
                              }
                            >
                              {parcel.stage}
                            </Badge>
                          </p>
                          <p>
                            <strong>Zone:</strong> {parcel.zone}
                          </p>
                          <p>
                            <strong>Area:</strong> {(parcel.area / 1000).toFixed(1)} kSqm
                          </p>
                          <p>
                            <strong>Photos:</strong> {parcel.photo ? '✅' : '❌'}
                          </p>
                        </div>
                      </div>
                    </Popup>
                  )}
                </CircleMarker>
              ))}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="p-4 bg-gray-50 text-sm">
          {layer === 'localities' ? (
            <div>
              <h4 className="font-semibold mb-2">Coverage Levels</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Low Coverage (&lt;60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span>Medium Coverage (60-80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>High Coverage (&gt;80%)</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-semibold mb-2">Parcel Status</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Registered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span>GIS Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Draft</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Quick location map for overview
export const QuickLocationMap: React.FC<MapProps> = ({ data }) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Coverage Heatmap</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="w-full h-48 rounded-lg overflow-hidden border">
          <MapContainer
            center={[-6.5, 35.5]}
            zoom={5}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {getLocalitiesFromData(data).map((locality: LocalityMarker) => (
              <CircleMarker
                key={locality.id}
                center={[locality.lat, locality.lng]}
                radius={8}
                pathOptions={{
                  color: getCoverageColor(locality.coverage),
                  weight: 2,
                  opacity: 0.8,
                  fillOpacity: 0.7,
                }}
              />
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};
