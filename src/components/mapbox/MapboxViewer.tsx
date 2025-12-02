import React from 'react';
import Map, { NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { MapRef } from 'react-map-gl/mapbox';

type MapboxViewerProps = {
  initialViewState?: any;
  mapboxAccessToken?: string;
  mapStyle?: string;
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: [number[], number[]];
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

const MapboxViewer = React.forwardRef<MapRef | null, MapboxViewerProps>(
  ({ initialViewState, mapboxAccessToken, mapStyle, minZoom, maxZoom, maxBounds, children, style, ...rest }, ref) => {
    return (
      <Map
        // @ts-ignore - react-map-gl types are a bit loose here for forwardRef compat
        ref={ref}
        initialViewState={initialViewState}
        mapboxAccessToken={mapboxAccessToken}
        mapStyle={mapStyle}
        minZoom={minZoom}
        maxZoom={maxZoom}
        maxBounds={maxBounds}
        style={{ width: '100%', height: '100%', ...(style || {}) }}
        {...(rest as any)}
      >
        <NavigationControl position="top-right" />
        {children}
      </Map>
    );
  }
);

export default MapboxViewer;
