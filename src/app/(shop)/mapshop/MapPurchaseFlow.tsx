import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    ArrowLeft,
    Download,
    FileText,
    CreditCard,
    MapPin,
    Phone,
    Building2,
    CheckCircle,
    AlertCircle,
    Receipt,
    Shield,
    Clock,
    Truck
} from 'lucide-react';
import nlupcLogo from '@/assets/nluis.png';
import tanzaniaCoatOfArms from '@/assets/bibi_na_bwana.png';

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
    coordinatesCenter: [number, number];
    boundingBox: [number, number, number, number];
    shapefileUrl: string;
    totalArea: number;
    landUseZones: string[];
    gazettementStatus: 'Gazetted' | 'Under Review' | 'Draft';
    surveyDate: string;
    surveyor: string;
}

interface MapPurchaseFlowProps {
    selectedMap: MapItem;
    purchaseType: 'softcopy' | 'print-rights';
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onComplete: (orderDetails: any) => void;
}

type PurchaseStep = 'details' | 'customer' | 'payment' | 'confirmation' | 'receipt';

export default function MapPurchaseFlow({ selectedMap, purchaseType, onClose, onComplete }: MapPurchaseFlowProps) {
    const [currentStep, setCurrentStep] = useState<PurchaseStep>('details');
    const [customerData, setCustomerData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        organization: '',
        address: '',
        city: '',
        region: '',
        postalCode: '',
        purposeOfUse: '',
        institutionType: 'private'
    });

    const [paymentData, setPaymentData] = useState({
        paymentMethod: 'mobile_money',
        mobileNumber: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        bankAccount: '',
        bankName: ''
    });

    const [orderNumber, setOrderNumber] = useState('');
    const [processingPayment, setProcessingPayment] = useState(false);

    const price = purchaseType === 'softcopy' ? selectedMap.softcopyPrice : selectedMap.hardcopyPrice;
    const vatAmount = price * 0.18; // 18% VAT
    const serviceCharge = 2000; // TZS 2,000 service charge
    const totalAmount = price + vatAmount + serviceCharge;

    const handleCustomerSubmit = () => {
        if (customerData.firstName && customerData.lastName && customerData.email && customerData.phone) {
            setCurrentStep('payment');
        }
    };

    const handlePaymentSubmit = async () => {
        setProcessingPayment(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Generate order number
        const orderNum = `MAP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        setOrderNumber(orderNum);

        setProcessingPayment(false);
        setCurrentStep('confirmation');
    };

    const handleDownload = () => {
        // Simulate file download
        const orderDetails = {
            orderNumber,
            map: selectedMap,
            purchaseType,
            customer: customerData,
            payment: paymentData,
            totalAmount,
            timestamp: new Date().toISOString()
        };

        onComplete(orderDetails);
        setCurrentStep('receipt');
    };

    const steps = [
        { id: 'details', name: 'Review Details', completed: true },
        { id: 'customer', name: 'Customer Info', completed: currentStep !== 'details' },
        { id: 'payment', name: 'Payment', completed: ['confirmation', 'receipt'].includes(currentStep) },
        { id: 'confirmation', name: 'Confirmation', completed: currentStep === 'receipt' },
        { id: 'receipt', name: 'Receipt', completed: false }
    ];

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent aria-describedby={undefined} className="max-h-[90vh] overflow-y-auto max-w-screen sm:max-w-6xl">
                <DialogHeader className="border-b pb-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <img src={nlupcLogo} alt="NLUPC" className="h-10 w-10" />
                        </div>
                        <div>
                            <DialogTitle className="text-primary">Tanzania MapShop - Official Purchase</DialogTitle>
                            <DialogDescription>
                                Secure purchase of official government land use maps and shapefiles
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Progress Steps */}
                <div className="flex items-center justify-between flex-wrap lg:py-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center flex-col md:flex-row text-center md:text-start">
                            <div className={`shrink-0 flex items-center justify-center w-7 md:w-8 h-7 md:h-8 rounded-full border-2 ${step.completed
                                ? 'bg-primary border-primary text-primary-foreground'
                                : currentStep === step.id
                                    ? 'border-primary text-primary'
                                    : 'border-muted text-muted-foreground'
                                }`}>
                                {step.completed ? (
                                    <CheckCircle className="h-3 md:h-4 w-3 md:w-4" />
                                ) : (
                                    <span className="text-xs md:text-sm font-medium">{index + 1}</span>
                                )}
                            </div>
                            <span className={`ml-2 text-[9px] lg:text-sm ${step.completed || currentStep === step.id
                                ? 'text-foreground font-medium'
                                : 'text-muted-foreground'
                                }`}>
                                {step.name}
                            </span>
                            {index < steps.length - 1 && (
                                <div className={`w-8 h-px mx-4 ${step.completed ? 'bg-primary' : 'bg-muted'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                <Separator />

                {/* Step Content */}
                <div className="py-3 lg:py-6">
                    {currentStep === 'details' && (
                        <div className="space-y-3 lg:space-y-6">
                            <div className="flex items-start flex-col md:flex-row gap-3 lg:gap-6">
                                {/* Map Preview */}
                                <div className="flex-1 w-full">
                                    <h3 className="font-semibold mb-4">Map Details</h3>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <MapPin className="h-5 w-5" />
                                                {selectedMap.villageName}
                                            </CardTitle>
                                            <CardDescription>
                                                {selectedMap.landUseType === 'Village'
                                                    ? `${selectedMap.district}, ${selectedMap.region}`
                                                    : selectedMap.landUseType === 'District'
                                                        ? `${selectedMap.district} District, ${selectedMap.region}`
                                                        : selectedMap.landUseType === 'Regional'
                                                            ? `${selectedMap.region} Region`
                                                            : 'National Coverage'
                                                }
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {/* Shapefile Preview */}
                                            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 border">
                                                <div className="text-sm font-medium mb-2">Shapefile Preview</div>
                                                <div className="relative h-48 bg-white rounded border overflow-hidden">
                                                    {/* Simulated shapefile visualization */}
                                                    <svg viewBox="0 0 300 200" className="w-full h-full">
                                                        {/* Background terrain */}
                                                        <rect width="300" height="200" fill="#f0f9ff" />

                                                        {/* Land use zones based on map type */}
                                                        {selectedMap.landUseType === 'Village' && (
                                                            <>
                                                                {/* Residential areas */}
                                                                <polygon points="50,50 120,60 110,120 40,110" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
                                                                <polygon points="130,40 200,50 190,100 125,90" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />

                                                                {/* Agricultural areas */}
                                                                <polygon points="40,130 180,140 170,180 35,170" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />

                                                                {/* Forest/grazing */}
                                                                <polygon points="200,60 270,70 260,140 190,130" fill="#ecfdf5" stroke="#059669" strokeWidth="1" />

                                                                {/* Roads */}
                                                                <line x1="20" y1="100" x2="280" y2="110" stroke="#6b7280" strokeWidth="2" />
                                                                <line x1="150" y1="20" x2="160" y2="180" stroke="#6b7280" strokeWidth="1.5" />
                                                            </>
                                                        )}

                                                        {selectedMap.landUseType === 'District' && (
                                                            <>
                                                                {/* Urban areas */}
                                                                <polygon points="80,40 180,50 170,120 75,110" fill="#fee2e2" stroke="#dc2626" strokeWidth="1" />

                                                                {/* Rural residential */}
                                                                <polygon points="20,130 100,140 90,180 15,170" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
                                                                <polygon points="200,130 280,140 270,180 195,170" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />

                                                                {/* Agricultural zones */}
                                                                <polygon points="110,140 190,150 180,180 105,170" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" />

                                                                {/* Industrial */}
                                                                <polygon points="190,50 270,60 260,120 185,110" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1" />

                                                                {/* Major roads */}
                                                                <line x1="10" y1="90" x2="290" y2="100" stroke="#374151" strokeWidth="3" />
                                                                <line x1="140" y1="10" x2="150" y2="190" stroke="#374151" strokeWidth="2" />
                                                            </>
                                                        )}

                                                        {selectedMap.landUseType === 'Regional' && (
                                                            <>
                                                                {/* Multiple districts */}
                                                                <rect x="20" y="20" width="80" height="60" fill="#fee2e2" stroke="#dc2626" strokeWidth="1" opacity="0.7" />
                                                                <rect x="110" y="30" width="70" height="50" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" opacity="0.7" />
                                                                <rect x="190" y="25" width="85" height="55" fill="#dcfce7" stroke="#16a34a" strokeWidth="1" opacity="0.7" />

                                                                <rect x="30" y="90" width="75" height="70" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" opacity="0.7" />
                                                                <rect x="115" y="95" width="80" height="65" fill="#f3e8ff" stroke="#7c3aed" strokeWidth="1" opacity="0.7" />
                                                                <rect x="205" y="90" width="70" height="70" fill="#fff7ed" stroke="#ea580c" strokeWidth="1" opacity="0.7" />

                                                                {/* Regional boundaries */}
                                                                <rect x="15" y="15" width="270" height="155" fill="none" stroke="#1f2937" strokeWidth="2" strokeDasharray="5,5" />
                                                            </>
                                                        )}

                                                        {/* Coordinate grid */}
                                                        <defs>
                                                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d1d5db" strokeWidth="0.5" opacity="0.3" />
                                                            </pattern>
                                                        </defs>
                                                        <rect width="300" height="200" fill="url(#grid)" />

                                                        {/* Scale indicator */}
                                                        <g transform="translate(10, 180)">
                                                            <line x1="0" y1="0" x2="40" y2="0" stroke="#374151" strokeWidth="2" />
                                                            <line x1="0" y1="-3" x2="0" y2="3" stroke="#374151" strokeWidth="1" />
                                                            <line x1="40" y1="-3" x2="40" y2="3" stroke="#374151" strokeWidth="1" />
                                                            <text x="20" y="15" textAnchor="middle" fontSize="10" fill="#374151">
                                                                {selectedMap.scale === '1:10,000' ? '1km' :
                                                                    selectedMap.scale === '1:50,000' ? '5km' : '10km'}
                                                            </text>
                                                        </g>
                                                    </svg>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Scale:</span>
                                                    <span className="ml-2 font-medium">{selectedMap.scale}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Total Area:</span>
                                                    <span className="ml-2 font-medium">{selectedMap.totalArea.toLocaleString()} ha</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Survey Date:</span>
                                                    <span className="ml-2 font-medium">{new Date(selectedMap.surveyDate).toLocaleDateString()}</span>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Status:</span>
                                                    <Badge variant={selectedMap.gazettementStatus === 'Gazetted' ? 'default' : 'secondary'} className="ml-2">
                                                        {selectedMap.gazettementStatus}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-sm text-muted-foreground mb-2">Land Use Zones:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedMap.landUseZones.map((zone, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {zone}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Purchase Summary */}
                                <div className="w-full md:w-80">
                                    <h3 className="font-semibold mb-4">Purchase Summary</h3>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                {purchaseType === 'softcopy' ? <Download className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                                                {purchaseType === 'softcopy' ? 'Digital Shapefile' : 'Hardcopy Print'}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span>Base Price</span>
                                                    <span>TZS {price.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-muted-foreground">
                                                    <span>VAT (18%)</span>
                                                    <span>TZS {vatAmount.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-muted-foreground">
                                                    <span>Service Charge</span>
                                                    <span>TZS {serviceCharge.toLocaleString()}</span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between font-semibold text-lg">
                                                    <span>Total</span>
                                                    <span className="text-primary">TZS {totalAmount.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {purchaseType === 'softcopy' && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-1">
                                                        <Download className="h-4 w-4" />
                                                        Instant Download
                                                    </div>
                                                    <p className="text-xs text-green-600">
                                                        Files will be available immediately after payment confirmation
                                                    </p>
                                                </div>
                                            )}

                                            {purchaseType === 'print-rights' && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-1">
                                                        <Truck className="h-4 w-4" />
                                                        Physical Delivery
                                                    </div>
                                                    <p className="text-xs text-blue-600">
                                                        Professional print delivery within 5-7 business days
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={() => setCurrentStep('customer')} className="gap-2">
                                    Continue to Customer Information
                                    <ArrowLeft className="h-4 w-4 rotate-180" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {currentStep === 'customer' && (
                        <div className="space-y-6">
                            <h3 className="font-semibold">Customer Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name *</Label>
                                            <Input
                                                id="firstName"
                                                value={customerData.firstName}
                                                onChange={(e) => setCustomerData(prev => ({ ...prev, firstName: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name *</Label>
                                            <Input
                                                id="lastName"
                                                value={customerData.lastName}
                                                onChange={(e) => setCustomerData(prev => ({ ...prev, lastName: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={customerData.email}
                                            onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <Input
                                            id="phone"
                                            value={customerData.phone}
                                            onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="+255 XXX XXX XXX"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="organization">Organization</Label>
                                        <Input
                                            id="organization"
                                            value={customerData.organization}
                                            onChange={(e) => setCustomerData(prev => ({ ...prev, organization: e.target.value }))}
                                            placeholder="Company/Institution name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="institutionType">Institution Type</Label>
                                        <Select value={customerData.institutionType} onValueChange={(value) => setCustomerData(prev => ({ ...prev, institutionType: value }))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="government">Government Agency</SelectItem>
                                                <SelectItem value="private">Private Company</SelectItem>
                                                <SelectItem value="ngo">NGO/Non-Profit</SelectItem>
                                                <SelectItem value="academic">Academic Institution</SelectItem>
                                                <SelectItem value="individual">Individual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Textarea
                                            id="address"
                                            value={customerData.address}
                                            onChange={(e) => setCustomerData(prev => ({ ...prev, address: e.target.value }))}
                                            placeholder="Street address"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                value={customerData.city}
                                                onChange={(e) => setCustomerData(prev => ({ ...prev, city: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="region">Region</Label>
                                            <Input
                                                id="region"
                                                value={customerData.region}
                                                onChange={(e) => setCustomerData(prev => ({ ...prev, region: e.target.value }))}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="postalCode">Postal Code</Label>
                                        <Input
                                            id="postalCode"
                                            value={customerData.postalCode}
                                            onChange={(e) => setCustomerData(prev => ({ ...prev, postalCode: e.target.value }))}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="purposeOfUse">Purpose of Use</Label>
                                        <Textarea
                                            id="purposeOfUse"
                                            value={customerData.purposeOfUse}
                                            onChange={(e) => setCustomerData(prev => ({ ...prev, purposeOfUse: e.target.value }))}
                                            placeholder="How will you use this map data?"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setCurrentStep('details')}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button onClick={handleCustomerSubmit} disabled={!customerData.firstName || !customerData.lastName || !customerData.email || !customerData.phone}>
                                    Continue to Payment
                                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {currentStep === 'payment' && (
                        <div className="space-y-6">
                            <h3 className="font-semibold">Payment Information</h3>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="space-y-4">
                                        <Label>Payment Method</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <Button
                                                variant={paymentData.paymentMethod === 'mobile_money' ? 'default' : 'outline'}
                                                onClick={() => setPaymentData(prev => ({ ...prev, paymentMethod: 'mobile_money' }))}
                                                className="h-16 flex-col gap-1"
                                            >
                                                <Phone className="h-5 w-5" />
                                                Mobile Money
                                            </Button>
                                            <Button
                                                variant={paymentData.paymentMethod === 'card' ? 'default' : 'outline'}
                                                onClick={() => setPaymentData(prev => ({ ...prev, paymentMethod: 'card' }))}
                                                className="h-16 flex-col gap-1"
                                            >
                                                <CreditCard className="h-5 w-5" />
                                                Credit/Debit Card
                                            </Button>
                                            <Button
                                                variant={paymentData.paymentMethod === 'bank' ? 'default' : 'outline'}
                                                onClick={() => setPaymentData(prev => ({ ...prev, paymentMethod: 'bank' }))}
                                                className="h-16 flex-col gap-1"
                                            >
                                                <Building2 className="h-5 w-5" />
                                                Bank Transfer
                                            </Button>
                                        </div>
                                    </div>

                                    {paymentData.paymentMethod === 'mobile_money' && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="mobileNumber">Mobile Money Number</Label>
                                                <Input
                                                    id="mobileNumber"
                                                    value={paymentData.mobileNumber}
                                                    onChange={(e) => setPaymentData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                                                    placeholder="+255 XXX XXX XXX"
                                                />
                                            </div>
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                                                    <Shield className="h-4 w-4" />
                                                    Supported Mobile Money Services
                                                </div>
                                                <div className="text-sm text-blue-600 space-y-1">
                                                    <div>• M-Pesa (Vodacom)</div>
                                                    <div>• Tigo Pesa (Tigo)</div>
                                                    <div>• Airtel Money (Airtel)</div>
                                                    <div>• TTCL Pesa (TTCL)</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentData.paymentMethod === 'card' && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="cardNumber">Card Number</Label>
                                                <Input
                                                    id="cardNumber"
                                                    value={paymentData.cardNumber}
                                                    onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                                                    placeholder="1234 5678 9012 3456"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="expiryDate">Expiry Date</Label>
                                                    <Input
                                                        id="expiryDate"
                                                        value={paymentData.expiryDate}
                                                        onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                                                        placeholder="MM/YY"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="cvv">CVV</Label>
                                                    <Input
                                                        id="cvv"
                                                        value={paymentData.cvv}
                                                        onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                                                        placeholder="123"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {paymentData.paymentMethod === 'bank' && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="bankName">Bank Name</Label>
                                                <Select value={paymentData.bankName} onValueChange={(value) => setPaymentData(prev => ({ ...prev, bankName: value }))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select your bank" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="crdb">CRDB Bank</SelectItem>
                                                        <SelectItem value="nbc">National Bank of Commerce (NBC)</SelectItem>
                                                        <SelectItem value="nmb">NMB Bank</SelectItem>
                                                        <SelectItem value="stanbic">Stanbic Bank</SelectItem>
                                                        <SelectItem value="exim">EXIM Bank</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="bankAccount">Account Number</Label>
                                                <Input
                                                    id="bankAccount"
                                                    value={paymentData.bankAccount}
                                                    onChange={(e) => setPaymentData(prev => ({ ...prev, bankAccount: e.target.value }))}
                                                    placeholder="Your bank account number"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Card className="sticky top-4">
                                        <CardHeader>
                                            <CardTitle>Order Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Base Price</span>
                                                    <span>TZS {price.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>VAT (18%)</span>
                                                    <span>TZS {vatAmount.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Service Charge</span>
                                                    <span>TZS {serviceCharge.toLocaleString()}</span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between font-semibold text-lg">
                                                    <span>Total</span>
                                                    <span className="text-primary">TZS {totalAmount.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-yellow-700 text-sm font-medium mb-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    Payment Security
                                                </div>
                                                <p className="text-xs text-yellow-600">
                                                    All payments are processed securely through government-approved payment gateways.
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setCurrentStep('customer')}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button onClick={handlePaymentSubmit} disabled={processingPayment}>
                                    {processingPayment ? (
                                        <>
                                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                                            Processing Payment...
                                        </>
                                    ) : (
                                        <>
                                            Process Payment
                                            <CreditCard className="h-4 w-4 ml-2" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    {currentStep === 'confirmation' && (
                        <div className="space-y-6 text-center">
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-green-700">Payment Successful!</h3>
                                <p className="text-muted-foreground">
                                    Your order has been confirmed and is ready for {purchaseType === 'softcopy' ? 'download' : 'processing'}.
                                </p>
                            </div>

                            <Card className="max-w-md mx-auto">
                                <CardHeader>
                                    <CardTitle className="text-center">Order Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span>Order Number:</span>
                                        <span className="font-mono font-bold">{orderNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Map:</span>
                                        <span className="font-medium">{selectedMap.villageName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Type:</span>
                                        <span className="font-medium capitalize">{purchaseType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Amount Paid:</span>
                                        <span className="font-bold text-primary">TZS {totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Date:</span>
                                        <span>{new Date().toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {purchaseType === 'softcopy' ? (
                                <Button onClick={handleDownload} size="lg" className="gap-2">
                                    <Download className="h-5 w-5" />
                                    Download Files Now
                                </Button>
                            ) : (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                                    <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                                        <Truck className="h-4 w-4" />
                                        Processing Your Order
                                    </div>
                                    <p className="text-sm text-blue-600">
                                        Your hardcopy map is being prepared and will be delivered within 5-7 business days.
                                        You will receive tracking information via email.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {currentStep === 'receipt' && (
                        <div className="space-y-6">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                    <Receipt className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold">Purchase Complete!</h3>
                                <p className="text-muted-foreground">
                                    Thank you for your purchase. Your official receipt is shown below.
                                </p>
                            </div>

                            <Card className="max-w-2xl mx-auto">
                                <CardHeader className="text-center border-b">
                                    <div className="flex items-center justify-center gap-4 mb-4">
                                        <img src={nlupcLogo} alt="NLUPC" className="h-12 w-12" />
                                        <img src={tanzaniaCoatOfArms} alt="Tanzania" className="h-12 w-12" />
                                    </div>
                                    <CardTitle>Official Receipt</CardTitle>
                                    <CardDescription>
                                        National Land Use Planning Commission<br />
                                        United Republic of Tanzania
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Receipt No:</span>
                                                <div className="font-mono font-bold">{orderNumber}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Date:</span>
                                                <div>{new Date().toLocaleDateString()}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Customer:</span>
                                                <div>{customerData.firstName} {customerData.lastName}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Email:</span>
                                                <div>{customerData.email}</div>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <div className="font-medium mb-2">Purchased Item:</div>
                                            <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                                                <div className="font-medium">{selectedMap.villageName} Land Use Map</div>
                                                <div className="text-muted-foreground">
                                                    {selectedMap.landUseType} Level • {selectedMap.scale} • {purchaseType === 'softcopy' ? 'Digital Shapefile' : 'Hardcopy Print'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Base Price</span>
                                                <span>TZS {price.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>VAT (18%)</span>
                                                <span>TZS {vatAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Service Charge</span>
                                                <span>TZS {serviceCharge.toLocaleString()}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Total Paid</span>
                                                <span className="text-primary">TZS {totalAmount.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                            <div className="text-green-700 font-medium">Payment Status: PAID</div>
                                            <div className="text-xs text-green-600 mt-1">
                                                This is an official government receipt
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="text-center">
                                <Button onClick={onClose} variant="outline">
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}