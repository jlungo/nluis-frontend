import { type Map as MapboxMap } from 'mapbox-gl';

export interface MapState {
  styleName: string;
  labelsVisible: boolean;
}

export interface StyleState {
  styleName: string;
  labelsVisible: boolean;
}

export type MapInstance = MapboxMap | null;

export interface MapSubscriptionState {
  styleName: string;
  labelsVisible: boolean;
}