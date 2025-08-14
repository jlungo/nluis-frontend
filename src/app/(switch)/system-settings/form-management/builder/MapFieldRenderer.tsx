import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import ElegantMapViewer from '@/components/ElegantMapViewer';
import {
    MapPin,
    Navigation,
    Square,
    MousePointer,
    Crosshair,
    Map,
    Satellite,
    Target,
    Edit,
    Trash2,
    Copy,
    Download,
    Upload,
    Maximize,
    Minimize,
    ChevronDown,
    ChevronUp,
    Settings,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Ruler,
    MapPinned,
    Compass
} from 'lucide-react';

interface MapFieldRendererProps {
    type: 'map-area' | 'gps-coordinates' | 'boundary-mapper' | 'location-picker';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (value: any) => void;
    label: string;
    placeholder?: string;
    required?: boolean;
    helpText?: string;
}

interface GPSCoordinate {
    lat: number;
    lng: number;
    elevation?: number;
    accuracy?: number;
    timestamp?: string;
}

interface MapArea {
    id: string;
    name: string;
    type: 'polygon' | 'circle' | 'rectangle';
    coordinates: GPSCoordinate[];
    area?: number;
    perimeter?: number;
    center?: GPSCoordinate;
}

interface Boundary {
    id: string;
    name: string;
    coordinates: GPSCoordinate[];
    length?: number;
    isComplete: boolean;
}

export default function MapFieldRenderer({
    type,
    value,
    onChange,
    label,
    //   placeholder,
    required = false,
    helpText
}: MapFieldRendererProps) {
    //   const [activeTab, setActiveTab] = useState<'map' | 'coordinates' | 'import'>('map');
    const [manualCoordinates, setManualCoordinates] = useState('');
    const [mapMode, setMapMode] = useState<'select' | 'draw' | 'edit'>('select');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [mapLayer, setMapLayer] = useState<'satellite' | 'terrain' | 'street'>('satellite');
    const [showControls, setShowControls] = useState(true);
    const [sectionsExpanded, setSectionsExpanded] = useState({
        mapView: true,
        coordinates: false,
        tools: false,
        data: false
    });

    const mapContainerRef = useRef<HTMLDivElement>(null);

    // Fullscreen functionality
    const toggleFullscreen = useCallback(() => {
        if (!mapContainerRef.current) return;

        if (!isFullscreen) {
            // Enter fullscreen
            if (mapContainerRef.current.requestFullscreen) {
                mapContainerRef.current.requestFullscreen();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } else if ((mapContainerRef.current as any).webkitRequestFullscreen) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (mapContainerRef.current as any).webkitRequestFullscreen();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } else if ((mapContainerRef.current as any).msRequestFullscreen) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (mapContainerRef.current as any).msRequestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } else if ((document as any).webkitExitFullscreen) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (document as any).webkitExitFullscreen();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } else if ((document as any).msExitFullscreen) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (document as any).msExitFullscreen();
            }
            setIsFullscreen(false);
        }
    }, [isFullscreen]);

    // Listen for fullscreen changes
    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(document.fullscreenElement));
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Toggle section expansion
    const toggleSection = (section: keyof typeof sectionsExpanded) => {
        setSectionsExpanded(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Mock GPS location function
    const getCurrentLocation = () => {
        const mockLocation: GPSCoordinate = {
            lat: -6.7924,
            lng: 39.2083,
            elevation: 55,
            accuracy: 5,
            timestamp: new Date().toISOString()
        };

        if (type === 'gps-coordinates') {
            onChange(mockLocation);
        } else if (type === 'location-picker') {
            onChange({
                location: mockLocation,
                address: 'Dar es Salaam, Tanzania',
                description: 'Current GPS Location'
            });
        }
    };

    const formatCoordinates = (coord: GPSCoordinate) => {
        return `${coord.lat.toFixed(6)}, ${coord.lng.toFixed(6)}`;
    };

    const parseCoordinatesInput = (input: string): GPSCoordinate[] => {
        try {
            const lines = input.trim().split('\n');
            return lines.map(line => {
                const [lat, lng] = line.split(',').map(coord => parseFloat(coord.trim()));
                return { lat, lng };
            }).filter(coord => !isNaN(coord.lat) && !isNaN(coord.lng));
        } catch {
            return [];
        }
    };

    // Map Controls Component
    const MapControls = () => (
        <div className={`absolute top-4 right-4 space-y-2 ${isFullscreen ? 'z-50' : 'z-10'}`}>
            {/* Fullscreen Toggle */}
            <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="bg-background/95 backdrop-blur-sm border shadow-lg"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>

            {/* Map Layer Controls */}
            <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 space-y-1 shadow-lg">
                <Button
                    variant={mapLayer === 'satellite' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMapLayer('satellite')}
                    className="w-full justify-start gap-2"
                >
                    <Satellite className="h-3 w-3" />
                    Satellite
                </Button>
                <Button
                    variant={mapLayer === 'terrain' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMapLayer('terrain')}
                    className="w-full justify-start gap-2"
                >
                    <Map className="h-3 w-3" />
                    Terrain
                </Button>
                <Button
                    variant={mapLayer === 'street' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMapLayer('street')}
                    className="w-full justify-start gap-2"
                >
                    <MapPinned className="h-3 w-3" />
                    Street
                </Button>
            </div>

            {/* Map Tools */}
            <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-2 space-y-1 shadow-lg">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    title="Zoom In"
                >
                    <ZoomIn className="h-3 w-3" />
                    Zoom In
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    title="Zoom Out"
                >
                    <ZoomOut className="h-3 w-3" />
                    Zoom Out
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    title="Reset View"
                >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    title="Measure Distance"
                >
                    <Ruler className="h-3 w-3" />
                    Measure
                </Button>
            </div>

            {/* Controls Toggle */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => setShowControls(!showControls)}
                className="bg-background/95 backdrop-blur-sm border shadow-lg"
                title={showControls ? 'Hide Controls' : 'Show Controls'}
            >
                <Settings className="h-4 w-4" />
            </Button>
        </div>
    );

    // Fullscreen Map Interface
    const FullscreenMapInterface = () => (
        <div
            ref={mapContainerRef}
            className={`${isFullscreen ? 'fixed inset-0 z-[9999] bg-background' : 'relative'}`}
            data-fullscreen-container
        >
            <div className={`${isFullscreen ? 'h-screen' : 'h-96'} relative bg-muted rounded-lg overflow-hidden`}>
                <ElegantMapViewer
                    center={value?.center || value?.location || { lat: -6.7924, lng: 39.2083 }}
                    zoom={isFullscreen ? 15 : 13}
                    onLocationSelect={(coords: { lat: number; lng: number }) => {
                        if (mapMode === 'draw') {
                            if (type === 'map-area') {
                                const newArea: MapArea = {
                                    id: `area-${Date.now()}`,
                                    name: 'Selected Area',
                                    type: 'polygon',
                                    coordinates: [coords],
                                    center: coords
                                };
                                onChange(newArea);
                            } else if (type === 'boundary-mapper') {
                                const currentBoundary = value as Boundary;
                                const newBoundary: Boundary = {
                                    id: currentBoundary?.id || `boundary-${Date.now()}`,
                                    name: currentBoundary?.name || 'New Boundary',
                                    coordinates: [...(currentBoundary?.coordinates || []), coords],
                                    isComplete: false
                                };
                                onChange(newBoundary);
                            }
                        } else if (type === 'gps-coordinates') {
                            onChange(coords);
                        } else if (type === 'location-picker') {
                            onChange({
                                location: coords,
                                address: 'Selected Location',
                                description: 'Map-selected location'
                            });
                        }
                    }}
                    className="w-full h-full"
                />

                <MapControls />

                {/* Drawing Mode Indicator */}
                {mapMode === 'draw' && (
                    <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            <p className="text-sm font-medium">Drawing Mode Active</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Click on the map to add points
                        </p>
                    </div>
                )}

                {/* Fullscreen Controls Panel */}
                {isFullscreen && showControls && (
                    <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm border rounded-lg p-4 space-y-4 shadow-lg max-w-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium">{label}</h3>
                            <Badge variant="outline">{type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</Badge>
                        </div>

                        {/* Mode Controls */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Mode</Label>
                            <div className="flex gap-1">
                                <Button
                                    variant={mapMode === 'select' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMapMode('select')}
                                    className="gap-1 text-xs"
                                >
                                    <MousePointer className="h-3 w-3" />
                                    Select
                                </Button>
                                <Button
                                    variant={mapMode === 'draw' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMapMode('draw')}
                                    className="gap-1 text-xs"
                                >
                                    <Edit className="h-3 w-3" />
                                    Draw
                                </Button>
                                <Button
                                    variant={mapMode === 'edit' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMapMode('edit')}
                                    className="gap-1 text-xs"
                                >
                                    <Target className="h-3 w-3" />
                                    Edit
                                </Button>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Quick Actions</Label>
                            <div className="flex gap-1">
                                <Button variant="outline" size="sm" className="gap-1 text-xs">
                                    <Navigation className="h-3 w-3" />
                                    GPS
                                </Button>
                                <Button variant="outline" size="sm" className="gap-1 text-xs">
                                    <Copy className="h-3 w-3" />
                                    Copy
                                </Button>
                                <Button variant="outline" size="sm" className="gap-1 text-xs">
                                    <Download className="h-3 w-3" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderMapArea = () => {
        const currentArea = value as MapArea;

        return (
            <div className="space-y-6">
                {/* Map View Section */}
                <Collapsible
                    open={sectionsExpanded.mapView}
                    onOpenChange={() => toggleSection('mapView')}
                >
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                                <Map className="h-4 w-4 text-primary" />
                                <h4 className="font-medium">Interactive Map View</h4>
                                <Badge variant="outline" className="text-xs">
                                    {mapMode} mode
                                </Badge>
                            </div>
                            {sectionsExpanded.mapView ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-4 space-y-4">
                            {/* Mode Controls */}
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={mapMode === 'select' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMapMode('select')}
                                    className="gap-2"
                                >
                                    <MousePointer className="h-3 w-3" />
                                    Select
                                </Button>
                                <Button
                                    variant={mapMode === 'draw' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMapMode('draw')}
                                    className="gap-2"
                                >
                                    <Square className="h-3 w-3" />
                                    Draw Area
                                </Button>
                                <Button
                                    variant={mapMode === 'edit' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMapMode('edit')}
                                    className="gap-2"
                                >
                                    <Edit className="h-3 w-3" />
                                    Edit
                                </Button>
                                <Separator orientation="vertical" className="h-6" />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleFullscreen}
                                    className="gap-2"
                                >
                                    <Maximize className="h-3 w-3" />
                                    Fullscreen
                                </Button>
                            </div>

                            <FullscreenMapInterface />
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Coordinates Section */}
                <Collapsible
                    open={sectionsExpanded.coordinates}
                    onOpenChange={() => toggleSection('coordinates')}
                >
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                                <Navigation className="h-4 w-4 text-primary" />
                                <h4 className="font-medium">Coordinate Input</h4>
                            </div>
                            {sectionsExpanded.coordinates ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-4 space-y-4">
                            <div className="space-y-3">
                                <Label>Manual Coordinate Entry</Label>
                                <textarea
                                    className="w-full h-32 p-3 border rounded-md font-mono text-sm"
                                    placeholder="Enter coordinates (one per line):&#10;-6.7924, 39.2083&#10;-6.7925, 39.2084&#10;-6.7926, 39.2085"
                                    value={manualCoordinates}
                                    onChange={(e) => setManualCoordinates(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => {
                                            const coords = parseCoordinatesInput(manualCoordinates);
                                            if (coords.length > 0) {
                                                const newArea: MapArea = {
                                                    id: `area-${Date.now()}`,
                                                    name: 'Manual Area',
                                                    type: 'polygon',
                                                    coordinates: coords,
                                                    center: coords[0]
                                                };
                                                onChange(newArea);
                                            }
                                        }}
                                        className="gap-2"
                                    >
                                        <Target className="h-4 w-4" />
                                        Apply Coordinates
                                    </Button>
                                    <Button variant="outline" onClick={() => setManualCoordinates('')}>
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Data Import Section */}
                <Collapsible
                    open={sectionsExpanded.data}
                    onOpenChange={() => toggleSection('data')}
                >
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                                <Upload className="h-4 w-4 text-primary" />
                                <h4 className="font-medium">Data Import & Export</h4>
                            </div>
                            {sectionsExpanded.data ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-4">
                            <Card className="border-dashed">
                                <CardContent className="p-6 text-center">
                                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                                    <p className="font-medium mb-2">Import Area Data</p>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Support for KML, GeoJSON, and GPX files
                                    </p>
                                    <Button variant="outline" className="gap-2">
                                        <Upload className="h-4 w-4" />
                                        Choose File
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Area Information */}
                {currentArea && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Square className="h-4 w-4" />
                                Area Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Area</Label>
                                    <p className="font-medium">{currentArea.area ? `${(currentArea.area / 10000).toFixed(2)} hectares` : 'Calculating...'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Perimeter</Label>
                                    <p className="font-medium">{currentArea.perimeter ? `${(currentArea.perimeter / 1000).toFixed(2)} km` : 'Calculating...'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Center Point</Label>
                                    <p className="font-medium font-mono text-xs">
                                        {currentArea.center ? formatCoordinates(currentArea.center) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Coordinates</Label>
                                    <p className="font-medium">{currentArea.coordinates.length} points</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download className="h-3 w-3" />
                                    Export
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Copy className="h-3 w-3" />
                                    Copy
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2 text-destructive">
                                    <Trash2 className="h-3 w-3" />
                                    Clear
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    const renderGPSCoordinates = () => {
        const currentCoords = value as GPSCoordinate;

        return (
            <div className="space-y-6">
                {/* Input Section */}
                <Collapsible
                    open={sectionsExpanded.coordinates}
                    onOpenChange={() => toggleSection('coordinates')}
                >
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                                <Navigation className="h-4 w-4 text-primary" />
                                <h4 className="font-medium">GPS Coordinates Input</h4>
                            </div>
                            {sectionsExpanded.coordinates ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Latitude</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder="-6.7924"
                                        value={currentCoords?.lat || ''}
                                        onChange={(e) => onChange({
                                            ...currentCoords,
                                            lat: parseFloat(e.target.value) || 0
                                        })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Longitude</Label>
                                    <Input
                                        type="number"
                                        step="any"
                                        placeholder="39.2083"
                                        value={currentCoords?.lng || ''}
                                        onChange={(e) => onChange({
                                            ...currentCoords,
                                            lng: parseFloat(e.target.value) || 0
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={getCurrentLocation} className="gap-2">
                                    <Navigation className="h-4 w-4" />
                                    Get Current Location
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <Map className="h-4 w-4" />
                                    Pick from Map
                                </Button>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Map View Section */}
                <Collapsible
                    open={sectionsExpanded.mapView}
                    onOpenChange={() => toggleSection('mapView')}
                >
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <h4 className="font-medium">Map View</h4>
                            </div>
                            {sectionsExpanded.mapView ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-4">
                            <FullscreenMapInterface />
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Coordinate Information */}
                {currentCoords && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Compass className="h-4 w-4" />
                                Location Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Coordinates</Label>
                                    <p className="font-mono">{formatCoordinates(currentCoords)}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Elevation</Label>
                                    <p>{currentCoords.elevation ? `${currentCoords.elevation}m` : 'Unknown'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Accuracy</Label>
                                    <p>{currentCoords.accuracy ? `±${currentCoords.accuracy}m` : 'Unknown'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Timestamp</Label>
                                    <p>{currentCoords.timestamp ? new Date(currentCoords.timestamp).toLocaleString() : 'Now'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    const renderBoundaryMapper = () => {
        const currentBoundary = value as Boundary;

        return (
            <div className="space-y-6">
                {/* Drawing Tools Section */}
                <Collapsible
                    open={sectionsExpanded.tools}
                    onOpenChange={() => toggleSection('tools')}
                >
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                                <Edit className="h-4 w-4 text-primary" />
                                <h4 className="font-medium">Drawing Tools</h4>
                                <Badge variant="outline" className="text-xs">
                                    {currentBoundary?.coordinates.length || 0} points
                                </Badge>
                            </div>
                            {sectionsExpanded.tools ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={mapMode === 'draw' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMapMode('draw')}
                                    className="gap-2"
                                >
                                    <Edit className="h-3 w-3" />
                                    Draw Boundary
                                </Button>
                                <Button
                                    variant={mapMode === 'edit' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMapMode('edit')}
                                    className="gap-2"
                                >
                                    <MousePointer className="h-3 w-3" />
                                    Edit Points
                                </Button>
                                <Separator orientation="vertical" className="h-6" />
                                {currentBoundary?.isComplete && (
                                    <Badge className="gap-1">
                                        <Crosshair className="h-3 w-3" />
                                        Complete
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Map View Section */}
                <Collapsible
                    open={sectionsExpanded.mapView}
                    onOpenChange={() => toggleSection('mapView')}
                >
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                                <Map className="h-4 w-4 text-primary" />
                                <h4 className="font-medium">Boundary Map</h4>
                            </div>
                            {sectionsExpanded.mapView ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-4">
                            <FullscreenMapInterface />
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Boundary Information */}
                {currentBoundary && currentBoundary.coordinates.length > 0 && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Square className="h-4 w-4" />
                                Boundary Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Total Points</Label>
                                    <p className="font-medium">{currentBoundary.coordinates.length}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Length</Label>
                                    <p className="font-medium">{currentBoundary.length ? `${(currentBoundary.length / 1000).toFixed(2)} km` : 'Calculating...'}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Status</Label>
                                    <Badge variant={currentBoundary.isComplete ? 'default' : 'outline'} className="text-xs">
                                        {currentBoundary.isComplete ? 'Complete' : 'In Progress'}
                                    </Badge>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Name</Label>
                                    <Input
                                        value={currentBoundary.name}
                                        onChange={(e) => onChange({
                                            ...currentBoundary,
                                            name: e.target.value
                                        })}
                                        className="h-8"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onChange({
                                        ...currentBoundary,
                                        isComplete: true
                                    })}
                                    disabled={currentBoundary.coordinates.length < 3}
                                    className="gap-2"
                                >
                                    <Crosshair className="h-3 w-3" />
                                    Complete Boundary
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Download className="h-3 w-3" />
                                    Export
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2 text-destructive">
                                    <Trash2 className="h-3 w-3" />
                                    Clear
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    const renderLocationPicker = () => {
        const currentLocation = value as { location: GPSCoordinate; address: string; description: string };

        return (
            <div className="space-y-6">
                {/* Location Input Section */}
                <Collapsible
                    open={sectionsExpanded.coordinates}
                    onOpenChange={() => toggleSection('coordinates')}
                >
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <h4 className="font-medium">Location Details</h4>
                            </div>
                            {sectionsExpanded.coordinates ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <Label>Location Description</Label>
                                <Input
                                    placeholder="Describe this location..."
                                    value={currentLocation?.description || ''}
                                    onChange={(e) => onChange({
                                        ...currentLocation,
                                        description: e.target.value
                                    })}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={getCurrentLocation} className="gap-2">
                                    <Navigation className="h-4 w-4" />
                                    Use Current Location
                                </Button>
                                <Button variant="outline" className="gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Search Address
                                </Button>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Map View Section */}
                <Collapsible
                    open={sectionsExpanded.mapView}
                    onOpenChange={() => toggleSection('mapView')}
                >
                    <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
                            <div className="flex items-center gap-2">
                                <Map className="h-4 w-4 text-primary" />
                                <h4 className="font-medium">Location Map</h4>
                            </div>
                            {sectionsExpanded.mapView ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="p-4">
                            <FullscreenMapInterface />
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Location Information */}
                {currentLocation?.location && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <MapPinned className="h-4 w-4" />
                                Selected Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-xs text-muted-foreground">Coordinates</Label>
                                    <p className="font-mono text-sm">{formatCoordinates(currentLocation.location)}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-muted-foreground">Address</Label>
                                    <p className="text-sm">{currentLocation.address}</p>
                                </div>
                                {currentLocation.description && (
                                    <div>
                                        <Label className="text-xs text-muted-foreground">Description</Label>
                                        <p className="text-sm">{currentLocation.description}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    const renderFieldContent = () => {
        switch (type) {
            case 'map-area':
                return renderMapArea();
            case 'gps-coordinates':
                return renderGPSCoordinates();
            case 'boundary-mapper':
                return renderBoundaryMapper();
            case 'location-picker':
                return renderLocationPicker();
            default:
                return <div>Unsupported map field type</div>;
        }
    };

    const getFieldIcon = () => {
        switch (type) {
            case 'map-area':
                return <Square className="h-4 w-4" />;
            case 'gps-coordinates':
                return <Navigation className="h-4 w-4" />;
            case 'boundary-mapper':
                return <Edit className="h-4 w-4" />;
            case 'location-picker':
                return <MapPin className="h-4 w-4" />;
            default:
                return <Map className="h-4 w-4" />;
        }
    };

    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        {getFieldIcon()}
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                            {label}
                            {required && <span className="text-destructive">*</span>}
                        </CardTitle>
                        {helpText && (
                            <CardDescription className="mt-1">{helpText}</CardDescription>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleFullscreen}
                            className="gap-1"
                        >
                            <Maximize className="h-3 w-3" />
                            Fullscreen
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {renderFieldContent()}
            </CardContent>
        </Card>
    );
}