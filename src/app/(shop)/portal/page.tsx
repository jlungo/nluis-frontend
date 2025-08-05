import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User,
    Eye,
    ShoppingBag,
    Clock,
    CheckCircle,
    MapPin,
    Receipt,
    Settings,
    CreditCard,
    Store,
    Search,
    Filter,
    Printer,
    Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';

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

export default function MapShopBuyerDashboard() {
    const buyerInfo = {
        id: 'Id',
        firstName: "Johnson",
        lastName: "Doeson",
        email: "johndoe@gmail.com",
        phone: "+255700000012",
        organization: "NLUPC",
        joinDate: new Date(),
        totalPurchases: 20,
        totalSpent: 255000,
    }

    const [selectedTab, setSelectedTab] = useState('overview');
    const [selectedMapType, setSelectedMapType] = useState<string>('all');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'expired': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="h-3 w-3" />;
            case 'processing': return <Clock className="h-3 w-3" />;
            case 'expired': return <Clock className="h-3 w-3" />;
            default: return <Clock className="h-3 w-3" />;
        }
    };

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

    const filteredMaps = selectedMapType === 'all'
        ? mockAvailableMaps
        : mockAvailableMaps.filter(map => map.type.toLowerCase() === selectedMapType);

    const activeViewAccess = mockPurchaseHistory.filter(p => p.purchaseType === 'view-access' && p.status === 'active').length;
    const activePrintRights = mockPurchaseHistory.filter(p => p.purchaseType === 'print-rights' && p.status === 'active').length;

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader className="text-center pb-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <User className="h-8 w-8 text-primary" />
                                </div>
                                <CardTitle className="text-lg">{buyerInfo.firstName} {buyerInfo.lastName}</CardTitle>
                                <CardDescription>{buyerInfo.organization || 'Individual Customer'}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="font-semibold text-lg text-primary">{buyerInfo.totalPurchases}</div>
                                        <div className="text-xs text-muted-foreground">Total Orders</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-lg text-primary">TZS {buyerInfo.totalSpent.toLocaleString()}</div>
                                        <div className="text-xs text-muted-foreground">Total Spent</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-center pt-2">
                                    <div>
                                        <div className="font-semibold text-sm text-chart-2">{activeViewAccess}</div>
                                        <div className="text-xs text-muted-foreground">View Access</div>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm text-chart-3">{activePrintRights}</div>
                                        <div className="text-xs text-muted-foreground">Print Rights</div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border">
                                    <div className="text-xs text-muted-foreground">Member Since</div>
                                    <div className="text-sm font-medium">{new Date(buyerInfo.joinDate).toLocaleDateString()}</div>
                                </div>

                                {/* Quick Actions */}
                                <div className="pt-4 border-t border-border">
                                    <Link
                                        to='/mapshop'
                                        className={cn(buttonVariants({ variant: 'outline' }), "w-full gap-2")}
                                    >
                                        <Store className="h-4 w-4" />
                                        Browse All Maps
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="browse">Browse Maps</TabsTrigger>
                                <TabsTrigger value="purchases">My Maps</TabsTrigger>
                                <TabsTrigger value="account">Account Settings</TabsTrigger>
                            </TabsList>

                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-6 mt-6">
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
                                            <Button onClick={() => setSelectedTab('browse')} variant="outline" size="sm">
                                                View All Maps
                                            </Button>
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
                            </TabsContent>

                            {/* Browse Maps Tab */}
                            <TabsContent value="browse" className="space-y-6 mt-6">
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
                            </TabsContent>

                            {/* My Maps Tab (formerly Purchase History) */}
                            <TabsContent value="purchases" className="space-y-6 mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>My Maps & Access</CardTitle>
                                        <CardDescription>All your map purchases and current access status</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {mockPurchaseHistory.map((purchase) => (
                                                <div key={purchase.id} className="border border-border rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h3 className="font-medium">{purchase.mapName}</h3>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                                <span>Order {purchase.orderNumber}</span>
                                                                <span>•</span>
                                                                <span>{new Date(purchase.orderDate).toLocaleDateString()}</span>
                                                                <span>•</span>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {purchase.mapType} Level
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-medium">TZS {purchase.price.toLocaleString()}</div>
                                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                                {purchase.purchaseType === 'view-access' ?
                                                                    <><Monitor className="h-3 w-3" /> View Access</> :
                                                                    <><Printer className="h-3 w-3" /> Print Rights</>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className={getStatusColor(purchase.status)}>
                                                                {getStatusIcon(purchase.status)}
                                                                <span className="ml-1 capitalize">{purchase.status}</span>
                                                            </Badge>
                                                            {purchase.expiryDate && purchase.status === 'active' && (
                                                                <span className="text-sm text-muted-foreground">
                                                                    Access until {new Date(purchase.expiryDate).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Button variant="outline" size="sm">
                                                                <Receipt className="h-3 w-3 mr-1" />
                                                                Receipt
                                                            </Button>
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
                                                                            Print Map
                                                                        </Button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Account Settings Tab */}
                            <TabsContent value="account" className="space-y-6 mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Settings className="h-5 w-5" />
                                            Account Information
                                        </CardTitle>
                                        <CardDescription>Update your personal and contact information</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium">First Name</label>
                                                <div className="mt-1 p-2 bg-muted rounded border">{buyerInfo.firstName}</div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Last Name</label>
                                                <div className="mt-1 p-2 bg-muted rounded border">{buyerInfo.lastName}</div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Email Address</label>
                                                <div className="mt-1 p-2 bg-muted rounded border">{buyerInfo.email}</div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Phone Number</label>
                                                <div className="mt-1 p-2 bg-muted rounded border">{buyerInfo.phone}</div>
                                            </div>
                                            {buyerInfo.organization && (
                                                <div className="md:col-span-2">
                                                    <label className="text-sm font-medium">Organization</label>
                                                    <div className="mt-1 p-2 bg-muted rounded border">{buyerInfo.organization}</div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-border">
                                            <Button className="gap-2">
                                                <Settings className="h-4 w-4" />
                                                Update Account Info
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CreditCard className="h-5 w-5" />
                                            Payment Methods
                                        </CardTitle>
                                        <CardDescription>Manage your saved payment methods</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-center py-8 text-muted-foreground">
                                            <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                            <p>No saved payment methods</p>
                                            <Button variant="outline" className="mt-3">
                                                Add Payment Method
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    );
}