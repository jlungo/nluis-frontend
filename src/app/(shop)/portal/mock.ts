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
