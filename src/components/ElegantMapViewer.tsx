import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Maximize2,
    Minimize2,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Layers,
    MapPin,
    Download,
    Share2,
    Map as MapIcon,
    Satellite,
    Ruler,
    X
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MapLayer {
    id: string;
    name: string;
    visible: boolean;
    type: 'base' | 'overlay' | 'data';
    opacity: number;
}

interface MapViewerProps {
    title?: string;
    mapId?: string;
    center?: [number, number];
    zoom?: number;
    layers?: MapLayer[];
    showControls?: boolean;
    showLayerPanel?: boolean;
    showFullScreenButton?: boolean;
    onFullScreen?: () => void;
    onLayerToggle?: (layerId: string, visible: boolean) => void;
    onDownload?: () => void;
    onShare?: () => void;
    className?: string;
    height?: string;
    // MapShop specific props
    isPreview?: boolean;
    price?: number;
    format?: 'digital' | 'print' | 'both';
    onPurchase?: () => void;
    // Village workflow specific props
    isEditable?: boolean;
    onEdit?: () => void;
    onSave?: () => void;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    annotations?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onAnnotationAdd?: (annotation: any) => void;
}

export default function ElegantMapViewer({
    title = "Map Viewer",
    //   mapId,
    //   center = [-6.8, 39.3], // Dodoma, Tanzania
    zoom = 10,
    layers = [],
    showControls = true,
    showLayerPanel = true,
    showFullScreenButton = true,
    onFullScreen,
    onLayerToggle,
    onDownload,
    onShare,
    className = "",
    height = "h-96",
    isPreview = false,
    price,
    //   format,
    onPurchase,
    isEditable = false,
    onEdit,
    //   onSave,
    annotations = [],
    //   onAnnotationAdd
}: MapViewerProps) {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [currentZoom, setCurrentZoom] = useState(zoom);
    const [showLayerPanelState, setShowLayerPanelState] = useState(false);
    const [mapType, setMapType] = useState<'satellite' | 'map'>('map');
    const [showMeasurement, setShowMeasurement] = useState(false);
    //   const mapRef = useRef<HTMLDivElement>(null);
    const fullscreenContainerRef = useRef<HTMLDivElement>(null);

    const defaultLayers: MapLayer[] = [
        { id: 'base-map', name: 'Base Map', visible: true, type: 'base', opacity: 1 },
        { id: 'boundaries', name: 'Administrative Boundaries', visible: true, type: 'overlay', opacity: 0.8 },
        { id: 'land-use', name: 'Land Use Zones', visible: true, type: 'data', opacity: 0.7 },
        { id: 'villages', name: 'Villages', visible: true, type: 'data', opacity: 1 },
        { id: 'roads', name: 'Roads & Infrastructure', visible: false, type: 'overlay', opacity: 0.6 },
        { id: 'water-bodies', name: 'Water Bodies', visible: true, type: 'overlay', opacity: 0.8 },
        { id: 'protected-areas', name: 'Protected Areas', visible: false, type: 'overlay', opacity: 0.5 }
    ];

    const activeLayers = layers.length > 0 ? layers : defaultLayers;

    // Handle fullscreen events
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!document.fullscreenElement;
            if (!isCurrentlyFullscreen && isFullScreen) {
                setIsFullScreen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullScreen) {
                handleExitFullScreen();
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isFullScreen]);

    const handleZoomIn = () => {
        setCurrentZoom(prev => Math.min(prev + 1, 18));
    };

    const handleZoomOut = () => {
        setCurrentZoom(prev => Math.max(prev - 1, 1));
    };

    const handleReset = () => {
        setCurrentZoom(zoom);
    };

    const handleFullScreen = async () => {
        if (isFullScreen) {
            await handleExitFullScreen();
            return;
        }

        try {
            // Try native fullscreen first
            if (fullscreenContainerRef.current && fullscreenContainerRef.current.requestFullscreen) {
                await fullscreenContainerRef.current.requestFullscreen();
                setIsFullScreen(true);
            } else {
                // Fallback to modal fullscreen
                setIsFullScreen(true);
            }

            if (onFullScreen) {
                onFullScreen();
            }
        } catch (error) {
            console.log(error)
            console.log('Fullscreen failed, using modal fallback');
            setIsFullScreen(true);
            if (onFullScreen) {
                onFullScreen();
            }
        }
    };

    const handleExitFullScreen = async () => {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.log(error)
            console.log('Exit fullscreen failed');
        }
        setIsFullScreen(false);
    };

    const handleLayerToggle = (layerId: string, visible: boolean) => {
        if (onLayerToggle) {
            onLayerToggle(layerId, visible);
        }
    };

    const MapControls = () => (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            {/* Zoom Controls */}
            <div className="bg-background/95 backdrop-blur border rounded-lg shadow-lg p-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    className="w-8 h-8 p-0"
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>
                <div className="text-xs text-center py-1 px-2 text-muted-foreground">
                    {currentZoom}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    className="w-8 h-8 p-0"
                >
                    <ZoomOut className="h-4 w-4" />
                </Button>
            </div>

            {/* Map Type Toggle */}
            <div className="bg-background/95 backdrop-blur border rounded-lg shadow-lg p-1">
                <Button
                    variant={mapType === 'map' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMapType('map')}
                    className="w-8 h-8 p-0"
                >
                    <MapIcon className="h-4 w-4" />
                </Button>
                <Button
                    variant={mapType === 'satellite' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMapType('satellite')}
                    className="w-8 h-8 p-0"
                >
                    <Satellite className="h-4 w-4" />
                </Button>
            </div>

            {/* Additional Controls */}
            <div className="bg-background/95 backdrop-blur border rounded-lg shadow-lg p-1">
                {showLayerPanel && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowLayerPanelState(!showLayerPanelState)}
                        className="w-8 h-8 p-0"
                    >
                        <Layers className="h-4 w-4" />
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMeasurement(!showMeasurement)}
                    className="w-8 h-8 p-0"
                >
                    <Ruler className="h-4 w-4" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="w-8 h-8 p-0"
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>

            {/* Full Screen Button */}
            {showFullScreenButton && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFullScreen}
                    className="bg-background/95 backdrop-blur border rounded-lg shadow-lg w-8 h-8 p-0"
                >
                    {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
            )}
        </div>
    );

    const LayerPanel = () => (
        <div className="absolute top-4 left-4 z-10 w-72">
            <Card className="bg-background/95 backdrop-blur shadow-lg">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Map Layers</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowLayerPanelState(false)}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <ScrollArea className="h-64">
                        <div className="space-y-3">
                            {activeLayers.map((layer) => (
                                <div key={layer.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={layer.id}
                                            checked={layer.visible}
                                            onCheckedChange={(checked: boolean) =>
                                                handleLayerToggle(layer.id, checked as boolean)
                                            }
                                        />
                                        <Label htmlFor={layer.id} className="text-sm">
                                            {layer.name}
                                        </Label>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {layer.type}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );

    const ActionButtons = () => (
        <div className="flex items-center justify-between gap-2">
            {/* MapShop Purchase Button */}
            {isPreview && onPurchase && (
                <Button
                    onClick={onPurchase}
                    size="sm"
                    className="text-xs bg-primary hover:bg-primary/90"
                >
                    <Download className="h-3 w-3 mr-1" />
                    <span className='sr-only 2xl:not-sr-only'>Purchase -</span> {price?.toLocaleString()} TZS
                </Button>
            )}

            {showLayerPanel && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLayerPanelState(!showLayerPanelState)}
                    className='text-xs'
                >
                    <Layers className="h-3 w-3 mr-1" />
                    Layers
                </Button>
            )}

            {isEditable && onEdit && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                    className='text-xs'
                >
                    <MapPin className="h-3 w-3 mr-1" />
                    Edit
                </Button>
            )}

            {onDownload && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onDownload}
                    className='text-xs'
                >
                    <Download className="h-3 w-3 mr-1" />
                    Download
                </Button>
            )}

            {onShare && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onShare}
                    className='text-xs'
                >
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                </Button>
            )}

            {showFullScreenButton && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFullScreen}
                    className='text-xs'
                >
                    {isFullScreen ? <Minimize2 className="h-3 w-3 mr-1" /> : <Maximize2 className="h-3 w-3 mr-1" />}
                    {isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
                </Button>
            )}
        </div>
    );

    const MapContent = () => (
        <div className="relative w-full h-full bg-muted dark:bg-muted/80 rounded-lg overflow-hidden">
            {/* Mock Map Content */}
            <div
                className="w-full h-full bg-gradient-to-br from-green-100 via-green-50 to-blue-100 relative"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23385C99' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            >
                {/* Mock Geographic Features */}
                <div className="absolute inset-0">
                    {/* Village Areas */}
                    <div className="absolute top-1/4 left-1/4 w-16 h-12 bg-yellow-200/60 rounded-lg border border-yellow-400/30" />
                    <div className="absolute top-2/3 right-1/4 w-20 h-16 bg-orange-200/60 rounded-lg border border-orange-400/30" />

                    {/* Agricultural Areas */}
                    <div className="absolute top-1/2 left-1/3 w-24 h-20 bg-green-200/60 rounded border border-green-400/30" />
                    <div className="absolute bottom-1/4 left-1/6 w-28 h-24 bg-green-300/60 rounded border border-green-500/30" />

                    {/* Water Bodies */}
                    <div className="absolute top-1/6 right-1/3 w-12 h-32 bg-blue-300/70 rounded-full border border-blue-500/40" />
                    <div className="absolute bottom-1/3 right-1/6 w-20 h-8 bg-blue-200/70 rounded-full border border-blue-400/40" />

                    {/* Roads */}
                    <div className="absolute top-0 left-1/2 w-1 h-full bg-gray-400/60" />
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-400/60" />
                </div>

                {/* Map Annotations */}
                {annotations.map((annotation, index) => (
                    <div
                        key={index}
                        className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"
                        style={{
                            left: `${annotation.x}%`,
                            top: `${annotation.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                ))}

                {/* Measurement Tool Overlay */}
                {showMeasurement && (
                    <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur border rounded-lg shadow-lg p-3">
                        <div className="text-sm font-medium">Measurement Tool</div>
                        <div className="text-xs text-muted-foreground">Click to start measuring</div>
                    </div>
                )}

                {/* Preview Watermark for MapShop */}
                {isPreview && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <div className="bg-background/90 border rounded-lg p-4 text-center">
                            <div className="font-medium text-lg">Preview Mode</div>
                            <div className="text-sm text-muted-foreground">Purchase to access full resolution</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Map Controls */}
            {showControls && <MapControls />}

            {/* Layer Panel */}
            {showLayerPanel && showLayerPanelState && <LayerPanel />}
        </div>
    );

    // Full Screen Container - This is what gets fullscreened
    const FullScreenContainer = ({ children }: { children: React.ReactNode }) => (
        <div
            ref={fullscreenContainerRef}
            className={`${isFullScreen
                ? 'fixed inset-0 z-[9999] bg-background w-screen h-screen'
                : 'relative w-full h-full'
                }`}
        >
            {/* Full Screen Header */}
            {isFullScreen && (
                <div className="absolute top-4 left-4 z-20 bg-background/95 backdrop-blur border rounded-lg shadow-lg p-4">
                    <div className="flex items-center gap-2">
                        <MapIcon className="h-5 w-5" />
                        <span className="font-medium">{title}</span>
                    </div>
                </div>
            )}

            {/* Map Content */}
            <div className={isFullScreen ? 'w-full h-full' : 'w-full h-full'}>
                {children}
            </div>

            {/* Full Screen Exit Button */}
            {isFullScreen && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExitFullScreen}
                    className="absolute top-4 right-16 z-20 bg-background/95 backdrop-blur"
                >
                    <Minimize2 className="h-4 w-4 mr-2" />
                    Exit Full Screen
                </Button>
            )}
        </div>
    );

    // Regular Card Wrapper
    const CardWrapper = ({ children }: { children: React.ReactNode }) => (
        <Card className={cn('py-4 md:py-6 shadow-none bg-background', className)}>
            <CardHeader className='px-4 md:px-6'>
                <div className="flex flex-col justify-center gap-4">
                    <CardTitle className="flex gap-2">
                        <MapIcon className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    <ActionButtons />
                </div>
            </CardHeader>
            <CardContent className="pt-0 px-4 md:px-6">
                <div className={height}>
                    {children}
                </div>
            </CardContent>
        </Card>
    );

    // Main Render Logic
    if (isFullScreen) {
        // When in fullscreen, render only the fullscreen container
        return (
            <FullScreenContainer>
                <MapContent />
            </FullScreenContainer>
        );
    }

    // Normal card view
    return (
        <CardWrapper>
            <FullScreenContainer>
                <MapContent />
            </FullScreenContainer>
        </CardWrapper>
    );
}