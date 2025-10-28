import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Maximize, 
  Minimize, 
  Menu as MenuIcon, 
  Tag,
  Save,
  Download,
  Eye,
  EyeOff,
  Layers,
  MapPin,
  ChevronDown,
  FileJson,
  ScanLine
} from 'lucide-react';
import useSubdivisionStore from '@/components/subdivision/store/useSubdivisionStore';
import { useLandUsesQuery } from '@/queries/useSetupQuery';
import { cn } from '@/lib/utils';

interface MenuBarProps {
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

interface MenuButtonProps {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
}

interface ItemProps {
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  icon?: React.ElementType;
}

interface GroupProps {
  label: string;
  children: React.ReactNode;
}

function MenuButton({ label, icon: Icon, children }: MenuButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5",
          "hover:bg-muted hover:shadow-sm",
          open ? "bg-muted shadow-sm" : ""
        )}
        onClick={() => setOpen((v) => !v)}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
        <ChevronDown className={cn(
          "w-3 h-3 transition-transform",
          open && "rotate-180"
        )} />
      </button>
      {open && (
        <div className="absolute z-50 mt-2 w-64 rounded-lg border-2 bg-popover shadow-xl animate-in fade-in-0 zoom-in-95">
          <div className="p-1">
            {typeof children === 'function' ? children(close) : children}
          </div>
        </div>
      )}
    </div>
  );
}

function Item({ onClick, children, disabled, icon: Icon }: ItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all",
        "hover:bg-muted hover:translate-x-0.5",
        disabled ? "opacity-50 cursor-not-allowed" : ""
      )}
    >
      {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      {children}
    </button>
  );
}

function Group({ label, children }: GroupProps) {
  return (
    <div className="mb-2">
      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
        {label}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function MenuSeparator() {
  return <div className="my-2 h-px bg-border/50" />;
}

export default function MenuBar({ isMaximized, onToggleMaximize }: MenuBarProps) {
  const labelsVisible = useSubdivisionStore((s) => s.labelsVisible);
  const toggleLabels = useSubdivisionStore((s) => s.toggleLabels);
  const leftPanelOpen = useSubdivisionStore((s) => s.leftPanelOpen);
  const rightPanelOpen = useSubdivisionStore((s) => s.rightPanelOpen);

    const { data: landUses = [] } = useLandUsesQuery();
    const types = (() => {
      if (landUses && landUses.length) return landUses;
      // derive from known subdivisions in store
      try {
        const subs = useSubdivisionStore.getState().subdivisions || [];
        const m = new Map<string, any>();
        for (const s of subs) {
          const p = s?.properties || {};
          const name = p.title ?? String(p.landUseId ?? '');
          if (!name) continue;
          if (!m.has(String(name))) m.set(String(name), { id: p.landUseId ?? String(name), name, color: undefined });
        }
        return Array.from(m.values());
      } catch { return []; }
    })();

  const [mobileOpen, setMobileOpen] = useState(false);
  // @ts-ignore - Used in callbacks within store actions
  const selectedId = useSubdivisionStore((s) => s.selectedId);
  const subdivisions = useSubdivisionStore((s) => s.subdivisions);

  // Export GeoJSON handler
  const exportGeoJSON = () => {
    try {
      const features = useSubdivisionStore.getState().subdivisions || [];
      const featureCollection = {
        type: 'FeatureCollection',
        features,
      };

      const blob = new Blob([JSON.stringify(featureCollection, null, 2)], {
        type: 'application/geo+json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subdivisions_${new Date().toISOString().split('T')[0]}.geojson`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      window.alert('Export failed');
    }
  };

  // Save to API handler
  const handleSaveToAPI = () => {
    try {
      useSubdivisionStore.getState().api?.saveToAPI?.();
    } catch (error) {
      console.error('Save not available:', error);
      window.alert('Save not available');
    }
  };

  // Toggle labels handler
  const handleToggleLabels = () => {
    try {
      useSubdivisionStore.getState().api?.toggleLabels?.();
    } catch {
      toggleLabels();
    }
  };

  // Basemap change handler
  const handleBasemapChange = (styleName: string) => {
    useSubdivisionStore.getState().setStyleName(styleName);
  };

  // Menu content component
  const MenuContent = () => (
    <>
      <MenuButton label="Project" icon={FileJson}>
        {(close: () => void) => (
          <>
            <Group label="Save">
              <Item
                icon={Save}
                onClick={() => {
                  handleSaveToAPI();
                  close();
                }}
              >
                Save to API
              </Item>
              <Item
                icon={Download}
                onClick={() => {
                  exportGeoJSON();
                  close();
                }}
              >
                Export as GeoJSON
              </Item>
            </Group>
          </>
        )}
      </MenuButton>

      <MenuButton label="View" icon={Eye}>
        {(close: () => void) => (
          <>
            <Group label="Panels">
              <Item
                icon={leftPanelOpen ? EyeOff : Eye}
                onClick={() => {
                  const prev = useSubdivisionStore.getState().leftPanelOpen;
                  useSubdivisionStore.getState().setLeftPanelOpen(!prev);
                  close();
                }}
              >
                {leftPanelOpen ? 'Hide' : 'Show'} Left Panel
              </Item>
              <Item
                icon={rightPanelOpen ? EyeOff : Eye}
                onClick={() => {
                  const prev = useSubdivisionStore.getState().rightPanelOpen;
                  useSubdivisionStore.getState().setRightPanelOpen(!prev);
                  close();
                }}
              >
                {rightPanelOpen ? 'Hide' : 'Show'} Right Panel
              </Item>
            </Group>
            <MenuSeparator />
            <Group label="Labels">
              <Item
                icon={labelsVisible ? EyeOff : Eye}
                onClick={() => {
                  handleToggleLabels();
                  close();
                }}
              >
                {labelsVisible ? 'Hide' : 'Show'} Labels
              </Item>
            </Group>
            <MenuSeparator />
            <Group label="View">
              <Item
                icon={ScanLine}
                onClick={() => {
                  const { map, parentParcel: parent } = useSubdivisionStore.getState();
                  if (!map || !parent?.geometry?.coordinates) return;

                  try {
                    const coords = parent.geometry.coordinates[0][0];
                    const lngs = coords.map((c: any) => c[0]);
                    const lats = coords.map((c: any) => c[1]);
                    const bbox: [[number, number], [number, number]] = [
                      [Math.min(...lngs), Math.min(...lats)],
                      [Math.max(...lngs), Math.max(...lats)]
                    ];
                    map.fitBounds(bbox, { padding: 50, duration: 1000 });
                  } catch (error) {
                    console.error('Error fitting to extent:', error);
                  }
                  close();
                }}
              >
                Fit to Extent
              </Item>
            </Group>
          </>
        )}
      </MenuButton>

      <MenuButton label="Layer" icon={Layers}>
        {(close: () => void) => (
          <Group label="Basemap Style">
            <Item
              icon={MapPin}
              onClick={() => {
                handleBasemapChange('streets-v12');
                close();
              }}
            >
              Streets
            </Item>
            <Item
              icon={Layers}
              onClick={() => {
                handleBasemapChange('satellite-streets-v12');
                close();
              }}
            >
              Satellite Streets
            </Item>
            <Item
              icon={Layers}
              onClick={() => {
                handleBasemapChange('light-v10');
                close();
              }}
            >
              Light
            </Item>
          </Group>
        )}
      </MenuButton>
    </>
  );

  return (
    <div className="border-b bg-gradient-to-r from-background via-background to-muted/20 shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Mobile hamburger menu */}
        <div className="md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((v) => !v)}
            className="h-8 w-8"
          >
            <MenuIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex md:items-center md:gap-1">
          <MenuContent />
        </div>

        <div className="flex-1" />

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Subdivision count badge */}
          {subdivisions.length > 0 && (
            <Badge variant="secondary" className="hidden sm:flex gap-1">
              <span className="font-mono">{subdivisions.length}</span>
              <span className="text-muted-foreground">items</span>
            </Badge>
          )}

          {/* Label toggle button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleToggleLabels}
            className={cn(
              "h-8 w-8 transition-colors",
              labelsVisible && "text-primary bg-primary/10"
            )}
            title={labelsVisible ? 'Hide labels' : 'Show labels'}
          >
            <Tag className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Type selector (Land Use Types) */}
          <MenuButton label="Type">
            {(close: () => void) => (
              <Group label="Land Use Type">
                {types && types.length ? (
                  types.map((lu: any) => (
                    <Item
                      key={lu.id}
                      onClick={() => {
                        const state = useSubdivisionStore.getState();
                        const sel = state.selectedId;
                        if (sel) {
                          state.updateSubdivisions((subs) =>
                            subs.map((s) =>
                              s?.properties?.id === sel
                                ? { ...s, properties: { ...s.properties, landUseId: lu.id, title: lu.name } }
                                : s
                            )
                          );
                          try {
                            state.api?.updateSubdivision?.(sel, {
                              properties: { landUseId: lu.id, title: lu.name }
                            });
                          } catch {}
                        } else {
                          // no selected subdivision — set active plan (noop for land use), keep behavior minimal
                        }
                        close();
                      }}
                    >
                      <span
                        className="inline-block w-3 h-3 rounded border border-white shadow-sm"
                        style={{ backgroundColor: lu.color || '#ddd' }}
                      />
                      {lu.name}
                    </Item>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                    No types available
                  </div>
                )}
              </Group>
            )}
          </MenuButton>

          {/* Status selector */}
          <MenuButton label="Status">
            {(close: () => void) => (
              <Group label="Subdivision Status">
                {(['Pending', 'Active', 'Inactive'] as const).map((status) => (
                  <Item
                    key={`status-${status}`}
                    onClick={() => {
                      const state = useSubdivisionStore.getState();
                      const sel = state.selectedId;
                      if (sel) {
                        state.updateSubdivisions((subs) =>
                          subs.map((s) =>
                            (s?.properties?.id === sel
                              ? { ...s, properties: { ...s.properties, status } }
                              : s
                            )
                          )
                        );
                        try {
                          state.api?.updateSubdivision?.(sel, {
                            properties: { status }
                          });
                        } catch {}
                      }
                      close();
                    }}
                  >
                    {status}
                  </Item>
                ))}
              </Group>
            )}
          </MenuButton>

          {/* Maximize/Minimize toggle */}
          {onToggleMaximize && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <Button
                type="button"
                variant={isMaximized ? 'default' : 'ghost'}
                size="icon"
                onClick={onToggleMaximize}
                className="h-8 w-8"
                title={isMaximized ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isMaximized ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background shadow-lg animate-in slide-in-from-top-2">
          <div className="p-3 space-y-1">
            <MenuContent />
          </div>
        </div>
      )}
    </div>
  );
}