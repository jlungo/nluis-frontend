import { useEffect, useState } from 'react';
import type { ParcelFeature } from '@/types/subdivision';
import { useThemeStore } from '@/store/themeStore';
import { ParcelList } from './components/ParcelList';
import { ParcelDetails } from './components/ParcelDetails';
import SubdivisionMapViewer from './components/SubdivisionMapViewer';
import { useSubdivisionValidation } from './hooks/useSubdivisionValidation';

interface SubdivisionShellProps {
  parentParcel?: ParcelFeature;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function SubdivisionShell({
  parentParcel,
  disabled,
  className,
}: SubdivisionShellProps) {
  useThemeStore(); // For theme consistency
  useSubdivisionValidation(); // Enable validation
  const [isMaximized, setIsMaximized] = useState(false);

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

  return (
    <div className={`flex flex-col w-full h-full border rounded-md overflow-hidden ${className || ''}`}>
      {/* Main content area with map */}
      <div className="flex-1 relative">
        <SubdivisionMapViewer 
          parentParcel={parentParcel}
          disabled={disabled} 
        />
      </div>
      <div className="flex-1 flex">
        {/* Left panel - will contain parcel list and tools */}
        <div className="w-64 border-r bg-background/95">
          <ParcelList />
        </div>

        {/* Map area - will contain SubdivisionMapViewer */}
        <div className="flex-1 relative">
          {parentParcel ? (
            <SubdivisionMapViewer 
              parentParcel={parentParcel}
              disabled={disabled} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-sm text-muted-foreground">Loading parcel data...</p>
              </div>
            </div>
          )}
        </div>

        {/* Right panel - will contain parcel details and party allocation */}
        <div className="w-96 border-l bg-background/95">
          <ParcelDetails />
        </div>
      </div>

      {/* Status bar */}
      <div className="h-7 border-t bg-background/95 px-3 text-xs flex items-center gap-4">
        {/* Status bar content */}
      </div>
    </div>
  );
}