import { type StateCreator } from 'zustand';
import { debounce } from '@/lib/debounce';
import type { SubdivisionState, SubdivisionActions } from './types';

// Opt-in autosave via env to avoid unexpected API writes on random clicks
const AUTOSAVE = (import.meta as any)?.env?.VITE_SUBDIVISION_AUTOSAVE === 'true';

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
const debouncedSaveSubdivisions = debounce((subdivisions: any) => {
  if (!AUTOSAVE) return;
  // Lazy import only when enabled to avoid bundling API calls unintentionally
  import('@/services/subdivision')
    .then(({ subdivisionService }) => subdivisionService.saveSubdivisions(subdivisions))
    .catch(() => {});
}, SAVE_DEBOUNCE_MS);

const debouncedSavePreferences = debounce((preferences: any) => {
  // Default: store preferences locally to avoid backend writes on clicks
  try {
    const key = 'subdivision:preferences';
    const prev = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    const next = JSON.stringify(preferences);
    if (prev !== next && typeof localStorage !== 'undefined') localStorage.setItem(key, next);
  } catch {}
  // If autosave is explicitly enabled, also sync to backend
  if (!AUTOSAVE) return;
  import('@/services/subdivision')
    .then(({ subdivisionService }) => subdivisionService.savePreferences(preferences))
    .catch(() => {});
}, SAVE_DEBOUNCE_MS);

const SELECTED_KEY = 'subdivision:selectedZoneIds';

type Store = SubdivisionState & SubdivisionActions;

export const persist = <T extends Store>(config: StateCreator<T>): StateCreator<T> => {
  return (set, get, _api) => {
    // Restore selectedZoneIds from localStorage on init (best-effort)
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(SELECTED_KEY);
        if (raw !== null) {
          const arr = JSON.parse(raw) as unknown;
          if (Array.isArray(arr)) {
            const setVal = new Set<string>(arr.map((v: unknown) => String(v)));
            // Use set in a microtask to avoid interfering with initial config
            Promise.resolve().then(() => {
              try { (set as any)({ selectedZoneIds: setVal }); } catch {}
            });
          }
        }
      }
    } catch {}

    return config((nextState: any, ...args: any[]) => {
      // Call original setter (cast to any to satisfy overloaded signatures)
      (set as any)(nextState, ...args);

      // Get latest state
      const state = get();
      const changes = typeof nextState === 'object' ? nextState : {};

      // Persist selectedZoneIds immediately to localStorage when changed
      try {
        if ('selectedZoneIds' in changes) {
          const setVal: Set<string> = (state as any).selectedZoneIds || new Set<string>();
          const arr = Array.from(setVal);
          if (typeof localStorage !== 'undefined') localStorage.setItem(SELECTED_KEY, JSON.stringify(arr));
        }
      } catch {}

      // Handle immediate saves (opt-in only)
      if (IMMEDIATE_SAVE_KEYS.some((key) => key in changes)) {
        debouncedSaveSubdivisions(state.subdivisions as any);
      }

      // Handle debounced preference saves (local first, backend only if opt-in)
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
};
