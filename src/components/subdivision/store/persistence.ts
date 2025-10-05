import { type StateCreator } from 'zustand';
import { subdivisionService } from '@/services/subdivision';
import { debounce } from '@/lib/debounce';
import type { SubdivisionState, SubdivisionActions } from './types';

const SAVE_DEBOUNCE_MS = 1000; // 1 second debounce for saves

// Define which state changes should trigger saves
const IMMEDIATE_SAVE_KEYS = ['subdivisions'];
const DEBOUNCED_SAVE_KEYS = [
  'labelsVisible',
  'showPlans',
  'showParcels',
  'parcelOpacity',
  'boundaryGlow',
  'leftPanelOpen',
  'rightPanelOpen',
] as const;

// Create debounced save functions
const debouncedSaveSubdivisions = debounce((subdivisions) => {
  subdivisionService.saveSubdivisions(subdivisions).catch(console.error);
}, SAVE_DEBOUNCE_MS);

const debouncedSavePreferences = debounce((preferences) => {
  subdivisionService.savePreferences(preferences).catch(console.error);
}, SAVE_DEBOUNCE_MS);

type Store = SubdivisionState & SubdivisionActions;

export const persist = <T extends Store>(config: StateCreator<T>): StateCreator<T> => {
  return (set, get, _api) =>
    config((nextState: any, ...args: any[]) => {
      // Call original setter (cast to any to satisfy overloaded signatures)
      (set as any)(nextState, ...args);

      // Get latest state
      const state = get();
      const changes = typeof nextState === 'object' ? nextState : {};

      // Handle immediate saves
      if (IMMEDIATE_SAVE_KEYS.some((key) => key in changes)) {
        debouncedSaveSubdivisions(state.subdivisions as any);
      }

      // Handle debounced preference saves
      if (DEBOUNCED_SAVE_KEYS.some((key) => key in changes)) {
        // Build preferences object in a type-safe but simple way
        const preferences: Record<string, any> = {};
        for (const key of DEBOUNCED_SAVE_KEYS) {
          if (key in changes) {
            preferences[key] = (state as any)[key];
          }
        }

        if (Object.keys(preferences).length > 0) {
          debouncedSavePreferences(preferences as any);
        }
      }
    }, get, _api);
};
