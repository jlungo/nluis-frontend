import { JSX, useCallback, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FeatureCollection } from 'geojson';
import L from 'leaflet';

// Fix Leaflet icon loading issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

interface ActiveLayers {
  regions: boolean;
  districts: boolean;
  wards: boolean;
  villages: boolean;
}

interface MapBoxMapProps {
  onRegionClick: (regionName: string) => void;
  selectedRegion: string | null;
  activeLayers: ActiveLayers;
  layerData: Record<string, any>;
  geojson?: any;
  onFeatureClick?: (name: string, type: string, properties: any) => void;
  selectedFeature: string | null;
  selectedType: string | null
}

// Constants and styles
const TANZANIA_CENTER: [number, number] = [-6.369, 34.8888];
const DEFAULT_ZOOM = 6;

const layerStyle = {
  default: {
    fillColor: '#f8fafc',
    color: '#64748b',
    weight: 1,
    fillOpacity: 0.5
  },
  hover: {
    fillColor: '#bfdbfe',
    color: '#3b82f6',
    weight: 2,
    fillOpacity: 0.5
  },
  selected: {
    fillColor: '#3b82f6',
    color: '#1d4ed8',
    weight: 2,
    fillOpacity: 0.7
  }
};

// Component that watches for selectedRegion changes and updates the map view
const MapUpdater: React.FC<{ selectedRegion: string | null }> = ({ selectedRegion }) => {
  const map = useMap();

  useEffect(() => {
    // If you want to zoom to the selected region, you can add that logic here
    // You'll need to find the bounds of the selected region from your GeoJSON data
  }, [selectedRegion, map]);

  return null;
};

function MapBoxMap({
  onRegionClick,
  selectedRegion,
  activeLayers,
  layerData,
  geojson,
  onFeatureClick
}: MapBoxMapProps): JSX.Element {
  // Combine layerData with legacy geojson prop
  const effectiveLayerData = useMemo(() => ({
    ...layerData,
    ...(geojson ? { regions: geojson } : {})
  }), [layerData, geojson]);

  // Handle feature click events
  const handleFeatureClick = useCallback((feature: any, layerType: string) => {
    const name = feature.properties?.name;
    if (!name) return;

    if (onFeatureClick) {
      onFeatureClick(name, layerType, feature.properties || {});
    } else if (onRegionClick) {
      onRegionClick(name);
    }
  }, [onFeatureClick, onRegionClick]);

  // Style function for GeoJSON layers
  const getLayerStyle = useCallback((feature: any) => {
    const isSelected = selectedRegion === feature.properties?.name;
    return isSelected ? layerStyle.selected : layerStyle.default;
  }, [selectedRegion]);

  // Event handlers for each feature
  const onEachFeature = useCallback((feature: any, layer: L.Layer, layerType: string) => {
    if (layer instanceof L.Path) {
      layer.on({
        mouseover: () => {
          if (feature.properties?.name !== selectedRegion) {
            layer.setStyle(layerStyle.hover);
          }
        },
        mouseout: () => {
          if (feature.properties?.name !== selectedRegion) {
            layer.setStyle(layerStyle.default);
          }
        },
        click: () => handleFeatureClick(feature, layerType)
      });
    }
  }, [selectedRegion, handleFeatureClick]);

  return (
    <div className="map-container" style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <MapContainer
        center={TANZANIA_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ width: '100%', height: '100%' }}
        minZoom={5}
        maxZoom={14}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LayersControl position="topright">
          {Object.entries(effectiveLayerData).map(([layerType, data]) => (
            activeLayers[layerType as keyof ActiveLayers] && data && (
              <LayersControl.Overlay
                key={layerType}
                name={layerType.charAt(0).toUpperCase() + layerType.slice(1)}
                checked={true}
              >
                <GeoJSON
                  key={`${layerType}-${selectedRegion}`}
                  data={data as FeatureCollection}
                  style={getLayerStyle}
                  onEachFeature={(feature, layer) => onEachFeature(feature, layer, layerType)}
                />
              </LayersControl.Overlay>
            )
          ))}
        </LayersControl>
        <MapUpdater selectedRegion={selectedRegion} />
      </MapContainer>
    </div>
  );
}

export default MapBoxMap;
