import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Eye, Monitor, Printer, Receipt } from "lucide-react";
import { mockPurchaseHistory } from "../mock";

export default function Page() {
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

    return (
        <div className="flex-1 outline-none space-y-6 mt-6">
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
        </div>
    )
}