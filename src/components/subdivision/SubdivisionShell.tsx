import { useEffect, useState, useRef } from 'react';
import type { ParcelFeature } from '@/types/subdivision';
import { useThemeStore } from '@/store/themeStore';
import SubdivisionMapViewer from './components/SubdivisionMapViewer';
import SubdivisionLeftPanel from './components/SubdivisionLeftPanel';
import TopToolbar from './components/TopToolbar';
import RightDock from './components/RightDock';
import SubdivisionMapEngine from './components/SubdivisionMapEngine';
import { useSubdivisionValidation } from './hooks/useSubdivisionValidation';
import { useLocalityPlanQuery } from './hooks/useLocalityPlanQuery';

import useSubdivisionStore from './store/useSubdivisionStore';
import { SubdivisionErrorBoundary } from './components/SubdivisionErrorBoundary';

interface SubdivisionShellProps {
  parentParcel?: ParcelFeature;
  // baseMapId?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  localityId?: string | number | null;
}

export default function SubdivisionShell({
  parentParcel,
  value,
  disabled,
  className,
  onChange,
  localityId: propLocalityId,
}: SubdivisionShellProps) {
  useThemeStore(); // For theme consistency
  useSubdivisionValidation(); // Enable validation
  const [isMaximized, setIsMaximized] = useState(false);

  // Allow preview contexts (forms) to pass a serialized `value` representing the parent parcel.
  // If `parentParcel` is not provided but `value` is, try to parse it as GeoJSON Feature.
  let effectiveParent: ParcelFeature | undefined = parentParcel ?? undefined;
  if (!effectiveParent && value) {
    try {
      const maybe = typeof value === 'string' ? value : JSON.stringify(value);
      const parsed = JSON.parse(maybe);
      if (parsed && parsed.type === 'Feature' && parsed.properties) {
        effectiveParent = parsed as ParcelFeature;
      }
    } catch (e) {
      // ignore parse errors and keep effectiveParent undefined
    }
  }

  // Derive locality id for informational queries (do not gate UI).
  // Priority: explicitly passed propLocalityId > parent parcel properties
  const derivedLocalityId = (effectiveParent as any)?.properties?.locality || (effectiveParent as any)?.properties?.id || undefined;
  const localityId = propLocalityId ?? derivedLocalityId;
  // Keep plan query for telemetry or optional UX bits, but do NOT block rendering or show banners
  void useLocalityPlanQuery(localityId);

  // Ensure the central store knows about the parent parcel (single source of truth)
  const setParentParcel = useSubdivisionStore((s) => s.setParentParcel);
  const subdivisions = useSubdivisionStore((s) => s.subdivisions);
  const leftOpen = useSubdivisionStore((s) => s.leftPanelOpen);
  const rightOpen = useSubdivisionStore((s) => s.rightPanelOpen);

  const leftPanelRef = useRef<HTMLDivElement | null>(null);
  const rightPanelRef = useRef<HTMLDivElement | null>(null);

  // push effectiveParent into store when it changes
  useEffect(() => {
    setParentParcel(effectiveParent ?? null);
  }, [effectiveParent, setParentParcel]);

  // Store last emitted value to prevent unnecessary updates
  const lastEmittedValue = useRef('');
  
  // Emit onChange when subdivisions change so parent forms can stay in sync
  useEffect(() => {
    if (!onChange) return;
    try {
      const fc = { type: 'FeatureCollection', features: subdivisions };
      const newValue = JSON.stringify(fc);
      if (lastEmittedValue.current !== newValue) {
        lastEmittedValue.current = newValue;
        onChange(newValue);
      }
    } catch (e) {
      // ignore serialization errors
    }
  }, [subdivisions, onChange]);

  // Handle Escape key for exiting maximized mode
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMaximized(false);
    };
    if (isMaximized) {
      window.addEventListener('keydown', onEsc);
    }
    return () => window.removeEventListener('keydown', onEsc);
  }, [isMaximized]);

  // Focus trap + escape to close for mobile drawers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // close mobile panels
        useSubdivisionStore.getState().setLeftPanelOpen(false);
        useSubdivisionStore.getState().setRightPanelOpen(false);
      }
      if (e.key === 'Tab' && (leftOpen || rightOpen)) {
        const ref = leftOpen ? leftPanelRef.current : rightPanelRef.current;
        if (!ref) return;
        const focusable = Array.from(ref.querySelectorAll<HTMLElement>('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter((n) => !n.hasAttribute('disabled'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    if (leftOpen || rightOpen) {
      document.addEventListener('keydown', onKey);
      // focus first element in opened panel
      setTimeout(() => {
        try {
          const ref = leftOpen ? leftPanelRef.current : rightPanelRef.current;
          if (!ref) return;
          const first = ref.querySelector<HTMLElement>('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])');
          first?.focus();
        } catch {}
      }, 80);
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [leftOpen, rightOpen]);

  // When fullscreen toggles, ensure Mapbox map resizes and keeps style state
  const map = useSubdivisionStore((s) => s.map);
  const styleName = useSubdivisionStore((s) => s.styleName);
  const drawMode = useSubdivisionStore((s) => s.drawMode);
  
  // Handle map resize on fullscreen toggle
  const resizeTimeout = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!map) return;
    
    // Clear any pending resize
    if (resizeTimeout.current) {
      clearTimeout(resizeTimeout.current);
    }
    
    // Schedule new resize after layout settles
    resizeTimeout.current = window.setTimeout(() => {
      try { 
        if (map.resize) map.resize(); 
      } catch {}
    }, 150);

    return () => {
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current);
      }
    };
  }, [isMaximized, map]);

  // Handle style changes
  useEffect(() => {
    if (!map || !map.getStyle || drawMode) return; // Don't change style during active drawing
    
    try {
      const style = `mapbox://styles/mapbox/${styleName}`;
      const currentStyle = map.getStyle();
      
      if (currentStyle && currentStyle.sprite !== style) {
        map.setStyle(style);
      }
    } catch {}
  }, [map, styleName, drawMode]);

  return (
    <div className={`flex flex-col w-full h-full border rounded-md overflow-hidden ${isMaximized ? 'sub-fullscreen' : ''} ${className || ''}`}>
      {/* Top toolbar */}
      <TopToolbar 
        onToggleFullscreen={() => setIsMaximized((v) => !v)}
        isMaximized={isMaximized}
      />

  {/* Mount lightweight engine to fetch plans (hidden) */}
      <div className="sr-only" aria-hidden>
        <SubdivisionErrorBoundary>
          <SubdivisionMapEngine localityId={localityId} parentParcel={effectiveParent} />
        </SubdivisionErrorBoundary>
      </div>

      {/* Mobile backdrop when either panel is open */}
      <div
        className={`mobile-backdrop md:hidden ${leftOpen || rightOpen ? 'block' : 'hidden'}`}
        onClick={() => {
          useSubdivisionStore.getState().setLeftPanelOpen(false);
          useSubdivisionStore.getState().setRightPanelOpen(false);
        }}
        aria-hidden="true"
      />

      <div className="flex-1 flex relative">
        {/* Left panel - legend and layer toggles (render only when open) */}
        {leftOpen && (
          <div ref={leftPanelRef} className={`w-72 border-r bg-background/95 overflow-auto sub-left-panel open`}>
            <SubdivisionLeftPanel />
          </div>
        )}

        {/* Map area - will contain SubdivisionMapViewer */}
        <div className="flex-1 relative sub-main-area">
          <SubdivisionMapViewer
            parentParcel={effectiveParent}
            disabled={disabled}
            localityId={localityId}
            // baseMapId={props.baseMapId}
            isMaximized={isMaximized}
            onToggleFullscreen={() => setIsMaximized((v) => !v)}
          />
        </div>

        {/* Right panel - details dock (render only when open) */}
        {rightOpen && (
          <div ref={rightPanelRef} className={`w-96 border-l bg-background/95 overflow-auto sub-right-panel open`}>
            <RightDock />
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="h-7 border-t bg-background/95 px-3 text-xs flex items-center gap-4">
        {/* Status bar content */}
      </div>

      {/* CSS-driven fullscreen: apply class to root container to avoid remounting the map */}
    </div>
  );
}