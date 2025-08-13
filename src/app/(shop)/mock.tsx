import { CheckCircle, Clock } from "lucide-react";

interface PurchaseHistory {
  id: string;
  orderNumber: string;
  mapName: string;
  mapType: "Village" | "District" | "Regional" | "Zonal" | "National";
  purchaseType: "view-access" | "print-rights";
  price: number;
  status: "active" | "processing" | "expired";
  orderDate: string;
  accessUrl?: string;
  expiryDate?: string;
}

// Updated mock purchase history data with new business model
export const mockPurchaseHistory: PurchaseHistory[] = [
  {
    id: "order-001",
    orderNumber: "MAP-2025-001234",
    mapName: "Nghanje Village Land Use Map",
    mapType: "Village",
    purchaseType: "view-access",
    price: 15000,
    status: "active",
    orderDate: "2025-01-15",
    accessUrl: "/viewer/nghanje-village",
    expiryDate: "2026-01-15",
  },
  {
    id: "order-002",
    orderNumber: "MAP-2025-001235",
    mapName: "Dodoma District Land Use Plan",
    mapType: "District",
    purchaseType: "print-rights",
    price: 125000,
    status: "active",
    orderDate: "2025-01-10",
  },
  {
    id: "order-003",
    orderNumber: "MAP-2025-001236",
    mapName: "Msimbazi Village Land Use Map",
    mapType: "Village",
    purchaseType: "view-access",
    price: 20000,
    status: "active",
    orderDate: "2025-01-20",
    accessUrl: "/viewer/msimbazi-village",
    expiryDate: "2026-01-20",
  },
  {
    id: "order-004",
    orderNumber: "MAP-2025-001237",
    mapName: "Dodoma Region Land Use Framework",
    mapType: "Regional",
    purchaseType: "print-rights",
    price: 250000,
    status: "processing",
    orderDate: "2025-01-22",
  },
];

export const buyerInfo = {
  id: "Id",
  firstName: "Johnson",
  lastName: "Doeson",
  email: "johndoe@gmail.com",
  phone: "+255700000012",
  organization: "NLUPC",
  joinDate: new Date(),
  totalPurchases: 20,
  totalSpent: 255000,
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 dark:bg-green-800 text-green-800 border-green-200 dark:border-green-800";
    case "processing":
      return "bg-yellow-100 dark:bg-yellow-700 text-yellow-800 border-yellow-200 dark:border-yellow-700";
    case "expired":
      return "bg-red-100 dark:bg-red-950 text-red-800 border-red-200 dark:border-red-950";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 border-gray-200 dark:border-gray-800";
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-3 w-3" />;
    case "processing":
      return <Clock className="h-3 w-3" />;
    case "expired":
      return <Clock className="h-3 w-3" />;
    default:
      return <Clock className="h-3 w-3" />;
  }
};
