import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Eye, Monitor, Printer, ShoppingBag, Store } from "lucide-react";
import { Link } from "react-router";
import { getStatusColor, getStatusIcon } from "../mock";


interface PurchaseHistory {
    id: string;
    orderNumber: string;
    mapName: string;
    mapType: 'Village' | 'District' | 'Regional' | 'Zonal' | 'National';
    purchaseType: 'view-access' | 'print-rights';
    price: number;
    status: 'active' | 'processing' | 'expired';
    orderDate: string;
    accessUrl?: string;
    expiryDate?: string;
}

// Updated mock purchase history data with new business model
const mockPurchaseHistory: PurchaseHistory[] = [
    {
        id: 'order-001',
        orderNumber: 'MAP-2025-001234',
        mapName: 'Nghanje Village Land Use Map',
        mapType: 'Village',
        purchaseType: 'view-access',
        price: 15000,
        status: 'active',
        orderDate: '2025-01-15',
        accessUrl: '/viewer/nghanje-village',
        expiryDate: '2026-01-15'
    },
    {
        id: 'order-002',
        orderNumber: 'MAP-2025-001235',
        mapName: 'Dodoma District Land Use Plan',
        mapType: 'District',
        purchaseType: 'print-rights',
        price: 125000,
        status: 'active',
        orderDate: '2025-01-10'
    },
    {
        id: 'order-003',
        orderNumber: 'MAP-2025-001236',
        mapName: 'Msimbazi Village Land Use Map',
        mapType: 'Village',
        purchaseType: 'view-access',
        price: 20000,
        status: 'active',
        orderDate: '2025-01-20',
        accessUrl: '/viewer/msimbazi-village',
        expiryDate: '2026-01-20'
    },
    {
        id: 'order-004',
        orderNumber: 'MAP-2025-001237',
        mapName: 'Dodoma Region Land Use Framework',
        mapType: 'Regional',
        purchaseType: 'print-rights',
        price: 250000,
        status: 'processing',
        orderDate: '2025-01-22'
    }
];

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
    const handleViewMap = (accessUrl: string, mapName: string) => {
        console.log(`Opening map viewer for: ${mapName} at ${accessUrl}`);
        alert(`Opening map viewer for ${mapName}...\n\nThis would open the interactive map viewer in a real application.`);
    };

    const handlePrintMap = (mapName: string) => {
        console.log(`Opening print dialog for: ${mapName}`);
        alert(`Opening print options for ${mapName}...\n\nThis would open the print dialog with various format options in a real application.`);
    };

    const handlePurchaseMap = (mapId: string, mapName: string, purchaseType: 'view-access' | 'print-rights') => {
        const accessType = purchaseType === 'view-access' ? 'View Access' : 'Print Rights';
        console.log(`Purchasing ${mapName} with ${accessType} and id ${mapId}`);
        alert(`Adding ${mapName} (${accessType}) to cart...\n\nThis would redirect to the purchase flow in a real application.`);
    };

    const activeViewAccess = mockPurchaseHistory.filter(p => p.purchaseType === 'view-access' && p.status === 'active').length;
    const activePrintRights = mockPurchaseHistory.filter(p => p.purchaseType === 'print-rights' && p.status === 'active').length;

    return (
        <div className="flex-1 outline-none space-y-6 mt-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recent Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">View Access</CardTitle>
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeViewAccess}</div>
                        <p className="text-xs text-muted-foreground">Active subscriptions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Print Rights</CardTitle>
                        <Printer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activePrintRights}</div>
                        <p className="text-xs text-muted-foreground">Available to print</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest map purchases and access</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {mockPurchaseHistory.slice(0, 3).map((purchase) => (
                            <div key={purchase.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        {purchase.purchaseType === 'view-access' ?
                                            <Monitor className="h-5 w-5 text-primary" /> :
                                            <Printer className="h-5 w-5 text-primary" />
                                        }
                                    </div>
                                    <div>
                                        <div className="font-medium">{purchase.mapName}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(purchase.orderDate).toLocaleDateString()} • {purchase.orderNumber}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={getStatusColor(purchase.status)}>
                                        {getStatusIcon(purchase.status)}
                                        <span className="ml-1 capitalize">{purchase.status}</span>
                                    </Badge>
                                    {purchase.status === 'active' && (
                                        <>
                                            {purchase.purchaseType === 'view-access' && purchase.accessUrl && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleViewMap(purchase.accessUrl!, purchase.mapName)}
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    View Map
                                                </Button>
                                            )}
                                            {purchase.purchaseType === 'print-rights' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handlePrintMap(purchase.mapName)}
                                                >
                                                    <Printer className="h-3 w-3 mr-1" />
                                                    Print
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Browse Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                Continue Shopping
                            </CardTitle>
                            <CardDescription>Browse new maps available for purchase</CardDescription>
                        </div>
                        <Link to='/portal/browse-maps' className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
                            View All Maps
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mockAvailableMaps.slice(0, 2).map((map) => (
                            <div key={map.id} className="border border-border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-medium">{map.name}</h4>
                                        <p className="text-sm text-muted-foreground">{map.region} • {map.type} Level</p>
                                    </div>
                                    <Badge variant="outline">{map.type}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">{map.description}</p>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <span className="font-medium">From TZS {map.viewPrice.toLocaleString()}</span>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handlePurchaseMap(map.id, map.name, 'view-access')}
                                    >
                                        <ShoppingBag className="h-3 w-3 mr-1" />
                                        Buy Access
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}