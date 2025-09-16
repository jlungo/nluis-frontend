import { useRef, useState, useEffect } from 'react';
import Map, { NavigationControl, Source, Layer } from 'react-map-gl/mapbox';
import { Card, CardContent } from '@/components/ui/card';
import { useGeoJSONLoader } from '@/hooks/useGeoJSONLoader';
import 'mapbox-gl/dist/mapbox-gl.css';

// Constants for styling
const REGION_LAYER_STYLE = {
  id: 'tanzania-regions',
  type: 'fill',
  paint: {
    'fill-color': '#088',
    'fill-opacity': 0.2,
    'fill-outline-color': '#000'
  }
} as const;

const REGION_LINE_STYLE = {
  id: 'tanzania-regions-line',
  type: 'line',
  paint: {
    'line-color': '#000',
    'line-width': 2
  }
} as const;

const DISTRICT_LAYER_STYLE = {
  id: 'tanzania-districts',
  type: 'fill',
  paint: {
    'fill-color': '#800',
    'fill-opacity': 0.2,
    'fill-outline-color': '#400'
  }
} as const;

const DISTRICT_LINE_STYLE = {
  id: 'tanzania-districts-line',
  type: 'line',
  paint: {
    'line-color': '#400',
    'line-width': 0.5
  }
} as const;

interface TanzaniaMapViewerProps {
  onRegionClick?: (region: string) => void;
}

export const TanzaniaMapViewer = ({ onRegionClick }: TanzaniaMapViewerProps) => {
  const mapRef = useRef(null);
  const [viewport, setViewport] = useState({
    longitude: 34.8888,
    latitude: -6.3690,
    zoom: 5
  });

  // Load GeoJSON data
  const { 
    data: regionsData,
    isLoading: regionsLoading,
    error: regionsError
  } = useGeoJSONLoader('/geojson/Regions.geojson');

  useEffect(() => {
    if (regionsError) {
      console.error('Error loading regions:', regionsError);
    }
    if (regionsData) {
      console.log('Regions data loaded:', regionsData);
    }
  }, [regionsError, regionsData]);

  const {
    data: districtsData,
    isLoading: districtsLoading,
    error: districtsError
  } = useGeoJSONLoader('/geojson/District_Councils.geojson');

  // Handle click events
  const handleClick = (event: any) => {
    const feature = event.features?.[0];
    if (feature && onRegionClick) {
      onRegionClick(feature.properties.REGION || feature.properties.name);
    }
  };

  if (regionsError || districtsError) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-destructive">
            Error loading map data: {regionsError?.message || districtsError?.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="absolute inset-0">
      {(regionsLoading || districtsLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      
      <Map
        ref={mapRef}
        mapboxAccessToken="pk.eyJ1IjoiY3Jlc2NlbnRzYW1iaWxhIiwiYSI6ImNtZWx5ZXR4OTA5Y3gyanNkOHM0cjFtN2sifQ.RC22kROvjoVE5LdsCSPSsA"
        mapStyle="mapbox://styles/mapbox/streets-v12"
        {...viewport}
        initialViewState={{
          longitude: 34.8888,
          latitude: -6.3690,
          zoom: 5
        }}
        style={{ width: '100%', height: '100%' }}
        onMove={evt => setViewport(evt.viewState)}
        interactiveLayerIds={['tanzania-regions', 'tanzania-districts']}
        onClick={handleClick}
      >
        <NavigationControl position="top-left" />
        
        {regionsData && (
          <Source type="geojson" data={regionsData}>
            <Layer {...REGION_LAYER_STYLE} />
            <Layer {...REGION_LINE_STYLE} />
          </Source>
        )}

        {districtsData && (
          <Source type="geojson" data={districtsData}>
            <Layer {...DISTRICT_LAYER_STYLE} />
            <Layer {...DISTRICT_LINE_STYLE} />
          </Source>
        )}
      </Map>
    </div>
  );
};
