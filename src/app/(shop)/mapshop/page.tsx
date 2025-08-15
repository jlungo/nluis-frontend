import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Eye, Map, Filter, X, ChevronLeft, ChevronRight, User, LogIn, Monitor, Printer } from 'lucide-react';
import MapPurchaseFlow from './MapPurchaseFlow';
import ElegantMapViewer from '@/components/ElegantMapViewer';
import { Link, useNavigate } from 'react-router';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/auth';

// Enhanced MapItem interface with geospatial data
interface MapItem {
    id: string;
    villageName: string;
    ward: string;
    district: string;
    region: string;
    landUseType: 'Village' | 'District' | 'Regional' | 'Zonal' | 'National' | 'Special Area';
    scale: string;
    accuracy: string;
    softcopyPrice: number;
    hardcopyPrice: number;
    downloadCount: number;
    lastUpdated: string;
    coordinatesCenter: [number, number]; // [longitude, latitude]
    boundingBox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
    shapefileUrl: string; // URL to actual shapefile data
    previewImageUrl?: string; // Fallback preview image
    totalArea: number; // in hectares
    landUseZones: string[]; // e.g., ['Residential', 'Agricultural', 'Commercial', 'Forest']
    gazettementStatus: 'Gazetted' | 'Under Review' | 'Draft';
    surveyDate: string;
    surveyor: string;
}

// Mock geospatial data with actual Tanzanian locations and realistic shapefiles
const mockMapData: MapItem[] = [
    {
        id: 'vlup-001',
        villageName: 'Nghanje',
        ward: 'Chamwino',
        district: 'Dodoma',
        region: 'Dodoma',
        landUseType: 'Village',
        scale: '1:10,000',
        accuracy: 'Survey Grade',
        softcopyPrice: 15000,
        hardcopyPrice: 25000,
        downloadCount: 234,
        lastUpdated: '2024-12-15',
        coordinatesCenter: [35.7418, -6.1730],
        boundingBox: [35.7300, -6.1850, 35.7536, -6.1610],
        shapefileUrl: '/shapefiles/nghanje_village.shp',
        totalArea: 1245.6,
        landUseZones: ['Residential', 'Agricultural', 'Grazing', 'Forest Reserve'],
        gazettementStatus: 'Gazetted',
        surveyDate: '2024-08-15',
        surveyor: 'Tanzania Land Survey Department'
    },
    {
        id: 'vlup-002',
        villageName: 'Makutupora',
        ward: 'Makutupora',
        district: 'Dodoma',
        region: 'Dodoma',
        landUseType: 'Village',
        scale: '1:10,000',
        accuracy: 'Survey Grade',
        softcopyPrice: 15000,
        hardcopyPrice: 25000,
        downloadCount: 189,
        lastUpdated: '2024-11-28',
        coordinatesCenter: [35.7834, -6.1456],
        boundingBox: [35.7700, -6.1580, 35.7968, -6.1332],
        shapefileUrl: '/shapefiles/makutupora_village.shp',
        totalArea: 987.3,
        landUseZones: ['Residential', 'Agricultural', 'Commercial', 'Public Utilities'],
        gazettementStatus: 'Gazetted',
        surveyDate: '2024-07-22',
        surveyor: 'Tanzania Land Survey Department'
    },
    {
        id: 'dlup-001',
        villageName: 'Dodoma District',
        ward: '',
        district: 'Dodoma',
        region: 'Dodoma',
        landUseType: 'District',
        scale: '1:50,000',
        accuracy: 'Planning Grade',
        softcopyPrice: 75000,
        hardcopyPrice: 125000,
        downloadCount: 89,
        lastUpdated: '2024-10-12',
        coordinatesCenter: [35.7500, -6.1700],
        boundingBox: [35.4000, -6.5000, 36.1000, -5.8000],
        shapefileUrl: '/shapefiles/dodoma_district.shp',
        totalArea: 41311.0,
        landUseZones: ['Urban', 'Rural Residential', 'Agricultural', 'Industrial', 'Conservation'],
        gazettementStatus: 'Under Review',
        surveyDate: '2024-06-10',
        surveyor: 'District Planning Office'
    },
    {
        id: 'rlup-001',
        villageName: 'Dodoma Region',
        ward: '',
        district: '',
        region: 'Dodoma',
        landUseType: 'Regional',
        scale: '1:100,000',
        accuracy: 'Strategic Planning',
        softcopyPrice: 150000,
        hardcopyPrice: 250000,
        downloadCount: 45,
        lastUpdated: '2024-09-05',
        coordinatesCenter: [35.7500, -6.1700],
        boundingBox: [34.5000, -7.5000, 37.0000, -4.5000],
        shapefileUrl: '/shapefiles/dodoma_region.shp',
        totalArea: 41311000.0,
        landUseZones: ['Urban Development', 'Agricultural Zones', 'Livestock', 'Mining', 'Conservation'],
        gazettementStatus: 'Gazetted',
        surveyDate: '2024-03-15',
        surveyor: 'Regional Planning Office'
    },
    {
        id: 'vlup-003',
        villageName: 'Msimbazi',
        ward: 'Msimbazi',
        district: 'Kinondoni',
        region: 'Dar es Salaam',
        landUseType: 'Village',
        scale: '1:5,000',
        accuracy: 'High Resolution Survey',
        softcopyPrice: 20000,
        hardcopyPrice: 35000,
        downloadCount: 456,
        lastUpdated: '2024-12-01',
        coordinatesCenter: [39.2083, -6.7924],
        boundingBox: [39.1950, -6.8050, 39.2216, -6.7798],
        shapefileUrl: '/shapefiles/msimbazi_village.shp',
        totalArea: 456.8,
        landUseZones: ['High Density Residential', 'Commercial', 'Mixed Use', 'Public Services'],
        gazettementStatus: 'Gazetted',
        surveyDate: '2024-09-20',
        surveyor: 'Urban Planning Commission'
    },
    {
        id: 'nlup-001',
        villageName: 'Tanzania National Land Use Framework',
        ward: '',
        district: '',
        region: 'National',
        landUseType: 'National',
        scale: '1:250,000',
        accuracy: 'Policy Framework',
        softcopyPrice: 500000,
        hardcopyPrice: 850000,
        downloadCount: 12,
        lastUpdated: '2024-08-30',
        coordinatesCenter: [35.0000, -6.3690],
        boundingBox: [29.3400, -11.7450, 40.4430, -0.9900],
        shapefileUrl: '/shapefiles/tanzania_national.shp',
        totalArea: 94730000.0,
        landUseZones: ['Agricultural Development', 'Urban Growth', 'Conservation Areas', 'Mining Zones', 'Tourism Development'],
        gazettementStatus: 'Gazetted',
        surveyDate: '2024-01-15',
        surveyor: 'National Land Use Planning Commission'
    }
];

// Available land use types for filtering
const availableLandUseTypes = ['Village', 'District', 'Regional', 'Zonal', 'National', 'Special Area'];

// Available regions
const availableRegions = ['All', 'Dodoma', 'Dar es Salaam', 'Arusha', 'Mwanza', 'Morogoro', 'Tanga', 'Pwani', 'Kagera', 'Kilimanjaro', 'Manyara'];

// Available districts per region
const availableDistricts: Record<string, string[]> = {
    'Dodoma': ['All', 'Dodoma', 'Chamwino', 'Kongwa', 'Mpwapwa', 'Bahi'],
    'Dar es Salaam': ['All', 'Kinondoni', 'Ilala', 'Temeke', 'Ubungo', 'Kigamboni'],
    'Arusha': ['All', 'Arusha', 'Meru', 'Longido', 'Monduli', 'Ngorongoro'],
    'Mwanza': ['All', 'Mwanza', 'Ilemela', 'Nyamagana', 'Sengerema', 'Misungwi']
};

export default function MapShop() {

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('All');
    const [selectedDistrict, setSelectedDistrict] = useState('All');
    const [selectedLandUseType, setSelectedLandUseType] = useState('All');
    const [sortBy, setSortBy] = useState('popular');
    const [selectedMap, setSelectedMap] = useState<MapItem | null>(null);
    //   const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

    const { user } = useAuth()
    const navigate = useNavigate()

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const mapsPerPage = 6;

    // Purchase flow state
    const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);
    const [purchaseType, setPurchaseType] = useState<"softcopy" | 'print-rights'>('softcopy');
    const [purchaseMap, setPurchaseMap] = useState<MapItem | null>(null);

    // Get available districts based on selected region
    const getAvailableDistricts = () => {
        if (selectedRegion === 'All') return ['All'];
        return availableDistricts[selectedRegion] || ['All'];
    };

    // Filter and sort maps
    const getFilteredMaps = () => {
        const filtered = mockMapData.filter(map => {
            const matchesSearch = !searchTerm ||
                map.villageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                map.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                map.region.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRegion = selectedRegion === 'All' || map.region === selectedRegion;
            const matchesDistrict = selectedDistrict === 'All' || map.district === selectedDistrict;
            const matchesLandUseType = selectedLandUseType === 'All' || map.landUseType === selectedLandUseType;

            return matchesSearch && matchesRegion && matchesDistrict && matchesLandUseType;
        });

        // Sort maps
        switch (sortBy) {
            case 'popular':
                filtered.sort((a, b) => b.downloadCount - a.downloadCount);
                break;
            case 'recent':
                filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
                break;
            case 'price-low':
                filtered.sort((a, b) => a.softcopyPrice - b.softcopyPrice);
                break;
            case 'price-high':
                filtered.sort((a, b) => b.softcopyPrice - a.softcopyPrice);
                break;
            default:
                break;
        }

        return filtered;
    };

    const filteredMaps = getFilteredMaps();
    const totalPages = Math.ceil(filteredMaps.length / mapsPerPage);
    const paginatedMaps = filteredMaps.slice(
        (currentPage - 1) * mapsPerPage,
        currentPage * mapsPerPage
    );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedRegion, selectedDistrict, selectedLandUseType, sortBy]);

    const handlePurchase = (map: MapItem, type: 'softcopy' | 'print-rights') => {
        // For guest users, prompt to login first
        if (!user) {
            if (confirm('You need to login or create an account to purchase maps. Would you like to login now?')) {
                // onLogin();
            }
            return;
        }

        setPurchaseMap(map);
        setPurchaseType(type);
        setShowPurchaseFlow(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePurchaseComplete = (orderDetails: any) => {
        console.log('Purchase completed:', orderDetails);
        // In a real application, this would trigger the download or process the order
        setShowPurchaseFlow(false);
        setPurchaseMap(null);
    };

    const handlePreview = (map: MapItem) => {
        setSelectedMap(map);
        console.log(selectedMap)
    };

    return (
        <>
            <div className="xl:container mx-auto px-4 py-6">
                {/* Guest Mode Notice */}
                {!user && (
                    <div className="mb-6">
                        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-950 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-blue-600 dark:text-blue-800 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-medium text-blue-900 dark:text-blue-700 mb-1">Browsing as Guest</h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-800 mb-3">
                                        You can browse and preview all maps, but you'll need to create an account or login to make purchases.
                                    </p>
                                    <Link to="/auth/signin" className={cn(buttonVariants({ size: 'sm' }), "gap-2 dark:bg-blue-900")}>
                                        <LogIn className="h-3 w-3" />
                                        Create Account or Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Search & Filter Maps
                        </CardTitle>
                        <CardDescription>
                            Find official village, district, regional, and national land use maps with actual shapefile data
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search maps..."
                                        value={searchTerm}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                        className="pl-9 bg-muted"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Region</label>
                                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="All Regions" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableRegions.map(region => (
                                            <SelectItem key={region} value={region}>{region}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">District</label>
                                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="All Districts" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getAvailableDistricts().map(district => (
                                            <SelectItem key={district} value={district}>{district}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Land Use Type</label>
                                <Select value={selectedLandUseType} onValueChange={setSelectedLandUseType}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="All Land Use Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Land Use Types</SelectItem>
                                        {availableLandUseTypes.map(type => (
                                            <SelectItem key={type} value={type}>{type} Maps</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Sort By</label>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Sort by..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="popular">Most Popular</SelectItem>
                                        <SelectItem value="recent">Recently Updated</SelectItem>
                                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Clear Filters</label>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedRegion('All');
                                        setSelectedDistrict('All');
                                        setSelectedLandUseType('All');
                                    }}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Clear All
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="font-semibold dark:opacity-80">
                            {filteredMaps.length} Official Maps Found
                            {selectedLandUseType !== 'All' && ` • ${selectedLandUseType} Level`}
                            {selectedRegion !== 'All' && ` • ${selectedRegion} Region`}
                        </h2>
                    </div>
                </div>

                {/* Maps Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 mb-8">
                    {paginatedMaps.map((map) => (
                        <Card key={map.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg dark:opacity-80">{map.villageName}</CardTitle>
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-500 mt-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>
                                                {map.landUseType === 'Village'
                                                    ? `${map.district}, ${map.region}`
                                                    : map.landUseType === 'District'
                                                        ? `${map.district} District, ${map.region}`
                                                        : map.landUseType === 'Regional'
                                                            ? `${map.region} Region`
                                                            : 'National Coverage'
                                                }
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline" className="text-xs">
                                                {map.landUseType} Level
                                            </Badge>
                                            <Badge
                                                variant={map.gazettementStatus === 'Gazetted' ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {map.gazettementStatus}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-2 md:space-y-4">
                                {/* Enhanced Map Preview */}
                                <ElegantMapViewer
                                    title={`${map.villageName} - ${map.landUseType} Map`}
                                    center={map.coordinatesCenter}
                                    zoom={map.landUseType === 'Village' ? 14 : map.landUseType === 'District' ? 11 : 9}
                                    showControls={true}
                                    showLayerPanel={false}
                                    showFullScreenButton={true}
                                    isPreview={true}
                                    price={map.softcopyPrice}
                                    format="digital"
                                    onPurchase={() => handlePurchase(map, 'softcopy')}
                                    height="h-48"
                                    layers={[
                                        { id: 'base-map', name: 'Base Map', visible: true, type: 'base', opacity: 1 },
                                        { id: 'land-use', name: 'Land Use Zones', visible: true, type: 'data', opacity: 0.8 },
                                        { id: 'boundaries', name: 'Administrative Boundaries', visible: true, type: 'overlay', opacity: 0.9 },
                                        { id: 'infrastructure', name: 'Infrastructure', visible: false, type: 'overlay', opacity: 0.7 }
                                    ]}
                                />

                                {/* Shapefile Details */}
                                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-500">Scale:</span>
                                        <span className="font-medium dark:opacity-80">{map.scale}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-500">Total Area:</span>
                                        <span className="font-medium dark:opacity-80">{map.totalArea.toLocaleString()} ha</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-500">Survey Date:</span>
                                        <span className="font-medium dark:opacity-80">{new Date(map.surveyDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-500">Downloads:</span>
                                        <span className="font-medium dark:opacity-80">{map.downloadCount}</span>
                                    </div>
                                </div>

                                {/* Land Use Zones */}
                                <div>
                                    <p className="text-sm font-medium mb-2 dark:opacity-80">Land Use Zones:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {map.landUseZones.slice(0, 3).map((zone, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {zone}
                                            </Badge>
                                        ))}
                                        {map.landUseZones.length > 3 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{map.landUseZones.length - 3} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="space-y-2 pt-2 border-t">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium flex items-center gap-1 dark:opacity-80">
                                            <Monitor className="h-3 w-3" />
                                            View Access (1 year)
                                        </span>
                                        <span className="font-semibold text-primary">TZS {map.softcopyPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium flex items-center gap-1 dark:opacity-80">
                                            <Printer className="h-3 w-3" />
                                            Print Rights (unlimited)
                                        </span>
                                        <span className="font-semibold text-primary">TZS {map.hardcopyPrice.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 gap-2"
                                        onClick={() => handlePreview(map)}
                                    >
                                        <Eye className="h-3 w-3" />
                                        Preview
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="flex-1 gap-2"
                                        onClick={() => {
                                            if (!user) navigate('/auth/signin')
                                            else handlePurchase(map, 'softcopy')
                                        }}
                                    >
                                        <Monitor className="h-3 w-3" />
                                        {!user ? 'Login to Buy' : 'View Access'}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => handlePurchase(map, 'print-rights')}
                                        title={!user ? 'Login required to purchase' : 'Get print rights'}
                                    >
                                        <Printer className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-xs lg:text-sm text-muted-foreground">
                            Showing {((currentPage - 1) * mapsPerPage) + 1} to {Math.min(currentPage * mapsPerPage, filteredMaps.length)} of {filteredMaps.length} maps
                        </p>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="text-xs gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <Button
                                        key={page}
                                        variant={currentPage === page ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setCurrentPage(page)}
                                        className="w-8 h-8 p-0"
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="text-xs gap-2"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* No Results */}
                {filteredMaps.length === 0 && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-semibold mb-2">No Maps Found</h3>
                            <p className="text-muted-foreground mb-4">
                                Try adjusting your search criteria or clearing some filters.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedRegion('All');
                                    setSelectedDistrict('All');
                                    setSelectedLandUseType('All');
                                }}
                            >
                                Clear All Filters
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Purchase Flow Modal - Only show for authenticated buyers */}
            {showPurchaseFlow && purchaseMap && user && (
                <MapPurchaseFlow
                    selectedMap={purchaseMap}
                    purchaseType={purchaseType}
                    onClose={() => {
                        setShowPurchaseFlow(false);
                        setPurchaseMap(null);
                    }}
                    onComplete={handlePurchaseComplete}
                />
            )}
        </>
    );
}