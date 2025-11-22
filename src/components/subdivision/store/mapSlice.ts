import { type Map as MapboxMap } from 'mapbox-gl';
import { type StateCreator } from 'zustand';

export type MapInstance = MapboxMap | null;

export interface MapState {
  map: MapInstance;
  styleName: string;
  labelsVisible: boolean;
  getMap: () => MapInstance;
  setMap: (map: MapInstance) => void;
  setStyleName: (style: string) => void;
  setLabelsVisible: (visible: boolean) => void;
}

export interface StyleState {
  styleName: string;
  labelsVisible: boolean;
}

export interface MapSubscriptionState extends StyleState {}

export const createMapSlice: StateCreator<MapState> = (set, get) => ({
  map: null,
  styleName: 'streets-v11',
  labelsVisible: true,
  getMap: () => get().map,
  setMap: (map) => set({ map }),
  setStyleName: (styleName) => set({ styleName }),
  setLabelsVisible: (labelsVisible) => set({ labelsVisible })
});