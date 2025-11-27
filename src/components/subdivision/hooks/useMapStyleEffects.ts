/**
 * Hook for managing map style and label visibility effects
 */
import { useEffect } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';

export const useMapStyle = (getMap: () => MapboxMap | any, styleName: string) => {
  useEffect(() => {
    const map = getMap();
    if (!map) return;

    try {
      map.setStyle(`mapbox://styles/mapbox/${styleName}`);
    } catch (error) {
      console.error('Error setting map style:', error);
    }
  }, [styleName, getMap]);
};

export const useMapLabelVisibility = (getMap: () => MapboxMap | any, labelsVisible: boolean) => {
  useEffect(() => {
    const map = getMap();
    if (!map || !map.getStyle) return;

    try {
      const style = map.getStyle();
      if (!style?.layers) return;
      
      style.layers.forEach((layer: any) => {
        const id = layer.id;
        if (!id) return;

        const isLabel = 
          (layer.layout && layer.layout['text-field']) || 
          id.toLowerCase().includes('label') || 
          id.toLowerCase().includes('place');
        
        if (isLabel) {
          try {
            map.setLayoutProperty(id, 'visibility', labelsVisible ? 'visible' : 'none');
          } catch {}
        }
      });
    } catch (error) {
      console.error('Error updating label visibility:', error);
    }
  }, [labelsVisible, getMap]);
};

export const useMapPaintProperties = (
  getMap: () => MapboxMap | any,
  {
    showPlans,
    parcelOpacity,
    boundaryGlow,
  }: {
    showPlans: boolean;
    parcelOpacity: number;
    boundaryGlow: boolean;
  }
) => {
  useEffect(() => {
    const map = getMap();
    if (!map || !map.isStyleLoaded?.()) return;
    
    try {
      const mapInstance = map as MapboxMap;
      
      if (mapInstance.getLayer('plans-fill')) {
        mapInstance.setLayoutProperty('plans-fill', 'visibility', showPlans ? 'visible' : 'none');
      }
      if (mapInstance.getLayer('parcel-fill')) {
        mapInstance.setPaintProperty('parcel-fill', 'fill-opacity', parcelOpacity);
      }
      if (mapInstance.getLayer('parcel-line')) {
        mapInstance.setPaintProperty('parcel-line', 'line-width', boundaryGlow ? 3 : 2);
      }
      if (mapInstance.getLayer('plans-line')) {
        mapInstance.setPaintProperty('plans-line', 'line-width', boundaryGlow ? 2.5 : 0.75);
      }
    } catch {}
  }, [getMap, showPlans, parcelOpacity, boundaryGlow]);
};
