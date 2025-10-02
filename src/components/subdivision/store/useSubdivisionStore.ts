import { create } from 'zustand';
import type { 
  ParcelFeature, 
  SubdivisionFeature, 
  PartyInfo, 
  ValidationError 
} from '@/types/subdivision';

interface SubdivisionState {
  // Parent parcel being subdivided
  parentParcel: ParcelFeature | null;
  
  // List of subdivisions
  subdivisions: SubdivisionFeature[];
  
  // Currently selected subdivision
  selectedId: string | null;
  
  // UI state
  isDrawing: boolean;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  
  // Validation state
  validationErrors: ValidationError[];
  
  // Party management
  parties: PartyInfo[];
}

interface SubdivisionActions {
  // Parent parcel actions
  setParentParcel: (parcel: ParcelFeature | null) => void;
  
  // Subdivision actions
  addSubdivision: (subdivision: SubdivisionFeature) => void;
  updateSubdivision: (id: string, updates: Partial<SubdivisionFeature>) => void;
  deleteSubdivision: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  
  // UI actions
  setIsDrawing: (drawing: boolean) => void;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  
  // Validation actions
  setValidationErrors: (errors: ValidationError[]) => void;
  clearValidationErrors: () => void;
  
  // Party actions
  addParty: (party: PartyInfo) => void;
  updateParty: (id: string, updates: Partial<PartyInfo>) => void;
  deleteParty: (id: string) => void;
}

type SubdivisionStore = SubdivisionState & SubdivisionActions;

export const useSubdivisionStore = create<SubdivisionStore>((set) => ({
  // Initial state
  parentParcel: null,
  subdivisions: [],
  selectedId: null,
  isDrawing: false,
  leftPanelOpen: true,
  rightPanelOpen: true,
  validationErrors: [],
  parties: [],

  // Actions
  setParentParcel: (parcel) => set({ parentParcel: parcel }),
  
  addSubdivision: (subdivision) => 
    set((state) => ({
      subdivisions: [...state.subdivisions, subdivision]
    })),
    
  updateSubdivision: (id, updates) =>
    set((state) => ({
      subdivisions: state.subdivisions.map((sub) =>
        sub.properties.id === id ? { ...sub, ...updates } : sub
      )
    })),
    
  deleteSubdivision: (id) =>
    set((state) => ({
      subdivisions: state.subdivisions.filter((sub) => sub.properties.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId
    })),
    
  setSelectedId: (id) => set({ selectedId: id }),
  
  setIsDrawing: (drawing) => set({ isDrawing: drawing }),
  setLeftPanelOpen: (open) => set({ leftPanelOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  
  setValidationErrors: (errors) => set({ validationErrors: errors }),
  clearValidationErrors: () => set({ validationErrors: [] }),
  
  addParty: (party) =>
    set((state) => ({
      parties: [...state.parties, party]
    })),
    
  updateParty: (id, updates) =>
    set((state) => ({
      parties: state.parties.map((party) =>
        party.id === id ? { ...party, ...updates } : party
      )
    })),
    
  deleteParty: (id) =>
    set((state) => ({
      parties: state.parties.filter((party) => party.id !== id)
    }))
}));