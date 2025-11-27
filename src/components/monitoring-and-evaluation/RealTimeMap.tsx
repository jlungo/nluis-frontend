import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardDataQuery } from '@/queries/useDashboardDataQuery';
import { Spinner } from '@/components/ui/spinner';
import { useMemo, useState } from 'react';

export default function RealTimeMap() {
    const { data: dashboardData, isLoading } = useDashboardDataQuery();
    const [filter, setFilter] = useState<'all' | 'parcels' | 'projects'>('all');

    const mapData = useMemo(() => {
        if (!dashboardData?.mapData) return { points: [], bounds: null };

        const points: Array<{ id: string, x: number, y: number, type: 'parcel' | 'project', status: string }> = [];
        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;

        const processCoordinates = (items: any[], type: 'parcel' | 'project') => {
            items.forEach(item => {
                let lat, lng;

                // Try to parse coordinates
                // Format could be "lat, lng", "POINT(lng lat)", or GeoJSON object
                try {
                    if (typeof item.coordinates === 'string') {
                        if (item.coordinates.includes('POINT')) {
                            // WKT format: POINT (30.123 -5.123)
                            const matches = item.coordinates.match(/POINT\s*\(([^ ]+)\s+([^ ]+)\)/);
                            if (matches) {
                                lng = parseFloat(matches[1]);
                                lat = parseFloat(matches[2]);
                            }
                        } else if (item.coordinates.includes(',')) {
                            // "lat, lng" format
                            const parts = item.coordinates.split(',');
                            lat = parseFloat(parts[0]);
                            lng = parseFloat(parts[1]);
                        }
                    } else if (typeof item.coordinates === 'object' && item.coordinates?.type === 'Point') {
                        // GeoJSON
                        lng = item.coordinates.coordinates[0];
                        lat = item.coordinates.coordinates[1];
                    }
                } catch (e) {
                    console.warn('Failed to parse coordinates for', item.id, e);
                }

                if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
                    // Update bounds
                    minLat = Math.min(minLat, lat);
                    maxLat = Math.max(maxLat, lat);
                    minLng = Math.min(minLng, lng);
                    maxLng = Math.max(maxLng, lng);

                    points.push({
                        id: item.id,
                        x: lng, // We'll normalize this later
                        y: lat,
                        type,
                        status: item.status
                    });
                }
            });
        };

        if (filter === 'all' || filter === 'parcels') {
            processCoordinates(dashboardData.mapData.parcels, 'parcel');
        }
        if (filter === 'all' || filter === 'projects') {
            processCoordinates(dashboardData.mapData.projects, 'project');
        }

        // Add some padding to bounds
        const latPadding = (maxLat - minLat) * 0.1 || 0.01;
        const lngPadding = (maxLng - minLng) * 0.1 || 0.01;

        return {
            points,
            bounds: {
                minLat: minLat - latPadding,
                maxLat: maxLat + latPadding,
                minLng: minLng - lngPadding,
                maxLng: maxLng + lngPadding
            }
        };
    }, [dashboardData, filter]);

    if (isLoading) {
        return <div className="flex justify-center p-10"><Spinner /></div>;
    }

    const { points, bounds } = mapData;
    const hasPoints = points.length > 0;

    return (
        <Card className="w-full h-[600px] flex flex-col">
            <CardHeader className="border-b bg-accent/30 shrink-0">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Navigation className="h-5 w-5" />
                        Real-time M&E Points
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'parcels' ? 'default' : 'outline'}
                            onClick={() => setFilter('parcels')}
                        >
                            Parcels
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === 'projects' ? 'default' : 'outline'}
                            onClick={() => setFilter('projects')}
                        >
                            Projects
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
                {hasPoints && bounds ? (
                    <div className="w-full h-full relative p-4">
                        {/* Simple SVG Map Visualization */}
                        <svg className="w-full h-full" viewBox={`0 0 100 100`} preserveAspectRatio="none">
                            {/* Grid lines for context */}
                            <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeOpacity="0.1" vectorEffect="non-scaling-stroke" />
                            <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeOpacity="0.1" vectorEffect="non-scaling-stroke" />
                            <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" strokeOpacity="0.1" vectorEffect="non-scaling-stroke" />
                            <line x1="25" y1="0" x2="25" y2="100" stroke="currentColor" strokeOpacity="0.1" vectorEffect="non-scaling-stroke" />
                            <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeOpacity="0.1" vectorEffect="non-scaling-stroke" />
                            <line x1="75" y1="0" x2="75" y2="100" stroke="currentColor" strokeOpacity="0.1" vectorEffect="non-scaling-stroke" />

                            {points.map(point => {
                                // Normalize coordinates to 0-100 range
                                // x: (val - min) / (max - min) * 100
                                // y: (max - val) / (max - min) * 100 (flip Y because SVG y grows downwards)
                                const x = ((point.x - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
                                const y = ((bounds.maxLat - point.y) / (bounds.maxLat - bounds.minLat)) * 100;

                                return (
                                    <g key={point.id} className="group cursor-pointer">
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r={point.type === 'project' ? 1.5 : 0.8}
                                            className={`${point.type === 'project' ? 'fill-blue-500' : 'fill-green-500'} transition-all duration-300 group-hover:r-2`}
                                        />
                                        <title>{point.type === 'project' ? 'Project' : 'Parcel'}: {point.status}</title>
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Legend Overlay */}
                        <div className="absolute bottom-4 right-4 bg-background/90 p-2 rounded shadow text-xs space-y-1 border">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span>Projects ({points.filter(p => p.type === 'project').length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span>Parcels ({points.filter(p => p.type === 'parcel').length})</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover opacity-50">
                        <div className="text-center p-6 bg-background/80 backdrop-blur-sm rounded-xl shadow-lg border">
                            <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold">No Geospatial Data Found</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">
                                No parcels or projects with valid coordinates were found in the current dataset.
                            </p>
                            <div className="mt-4 text-sm">
                                <p>Total Parcels: {dashboardData?.parcel?.total || 0}</p>
                                <p>Total Projects: {dashboardData?.project?.total || 0}</p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
