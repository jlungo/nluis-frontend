import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter, MapPin, Monitor, Printer, Search, Store } from "lucide-react";
import { useState } from "react";

// Updated mock available maps with new business model
const mockAvailableMaps = [
    {
        id: 'map-001',
        name: 'Kinondoni Village Land Use Map',
        region: 'Dar es Salaam',
        type: 'Village',
        viewPrice: 15000,
        printPrice: 45000,
        thumbnail: '/api/placeholder/150/100',
        description: 'Comprehensive village land use mapping with detailed zoning classifications.'
    },
    {
        id: 'map-002',
        name: 'Mbeya District Land Use Plan',
        region: 'Mbeya',
        type: 'District',
        viewPrice: 75000,
        printPrice: 150000,
        thumbnail: '/api/placeholder/150/100',
        description: 'District-level land use planning framework and implementation guidelines.'
    },
    {
        id: 'map-003',
        name: 'Arusha Region Development Framework',
        region: 'Arusha',
        type: 'Regional',
        viewPrice: 200000,
        printPrice: 350000,
        thumbnail: '/api/placeholder/150/100',
        description: 'Regional land use development framework with strategic planning insights.'
    },
    {
        id: 'map-004',
        name: 'Temeke Village Zoning Map',
        region: 'Dar es Salaam',
        type: 'Village',
        viewPrice: 18000,
        printPrice: 48000,
        thumbnail: '/api/placeholder/150/100',
        description: 'Detailed village zoning with land use classifications and boundaries.'
    }
];

export default function Page() {
    const [selectedMapType, setSelectedMapType] = useState<string>('all');

    const handlePurchaseMap = (mapId: string, mapName: string, purchaseType: 'view-access' | 'print-rights') => {
        const accessType = purchaseType === 'view-access' ? 'View Access' : 'Print Rights';
        console.log(`Purchasing ${mapName} with ${accessType} and id ${mapId}`);
        alert(`Adding ${mapName} (${accessType}) to cart...\n\nThis would redirect to the purchase flow in a real application.`);
    };

    const filteredMaps = selectedMapType === 'all'
        ? mockAvailableMaps
        : mockAvailableMaps.filter(map => map.type.toLowerCase() === selectedMapType);

    return (
        <div className="flex-1 outline-none space-y-6 mt-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                Browse Available Maps
                            </CardTitle>
                            <CardDescription>Discover and purchase official village land use maps</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                                <Search className="h-4 w-4 mr-1" />
                                Search
                            </Button>
                            <Button variant="outline" size="sm">
                                <Filter className="h-4 w-4 mr-1" />
                                Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Filter Buttons */}
                    <div className="flex items-center gap-2 pb-4 border-b border-border">
                        <span className="text-sm font-medium">Filter by type:</span>
                        {['all', 'village', 'district', 'regional'].map((type) => (
                            <Button
                                key={type}
                                variant={selectedMapType === type ? "default" : "outline"}
                                size="sm"
                                onClick={() => setSelectedMapType(type)}
                                className="capitalize"
                            >
                                {type}
                            </Button>
                        ))}
                    </div>

                    {/* Maps Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredMaps.map((map) => (
                            <Card key={map.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-0">
                                    <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                                        <MapPin className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-medium">{map.name}</h4>
                                                <p className="text-sm text-muted-foreground">{map.region} • {map.type} Level</p>
                                            </div>
                                            <Badge variant="outline">{map.type}</Badge>
                                        </div>

                                        <p className="text-sm text-muted-foreground">{map.description}</p>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Monitor className="h-3 w-3" />
                                                    View Access (1 year)
                                                </span>
                                                <span className="font-medium">TZS {map.viewPrice.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Printer className="h-3 w-3" />
                                                    Print Rights (unlimited)
                                                </span>
                                                <span className="font-medium">TZS {map.printPrice.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handlePurchaseMap(map.id, map.name, 'view-access')}
                                                className="flex-1"
                                            >
                                                <Monitor className="h-3 w-3 mr-1" />
                                                View Access
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => handlePurchaseMap(map.id, map.name, 'print-rights')}
                                                className="flex-1"
                                            >
                                                <Printer className="h-3 w-3 mr-1" />
                                                Print Rights
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}