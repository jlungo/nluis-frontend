
import {
    MapIcon,
    Shield,
    BarChart3,
    AlertTriangle,
    FileText,
    Settings,
    Home,
    Building,
    Store,
    FolderOpen,
    Package,
    CreditCard,
} from 'lucide-react'
import type { ModuleTypes } from "@/types/modules"

interface ModuleTile {
    id: ModuleTypes;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

export const moduleTiles: ModuleTile[] = [
    {
        id: 'dashboard',
        title: 'System Dashboard',
        description: 'Overview and monitoring across all system modules',
        icon: <Home className="h-8 w-8" />,
        color: 'text-primary',
        bgColor: 'bg-primary/10'
    },
    {
        id: 'land-uses',
        title: 'Land Use Planning',
        description: 'Village, regional, and district land use management',
        icon: <MapIcon className="h-8 w-8" />,
        color: 'text-chart-2',
        bgColor: 'bg-chart-2/10'
    },
    {
        id: 'ccro-management',
        title: 'CCRO Management',
        description: 'Certificate of Customary Right of Occupancy',
        icon: <Shield className="h-8 w-8" />,
        color: 'text-chart-4',
        bgColor: 'bg-chart-4/10'
    },
    {
        id: 'compliance',
        title: 'Compliance Monitoring',
        description: 'Environmental and regulatory compliance tracking',
        icon: <AlertTriangle className="h-8 w-8" />,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10'
    },
    {
        id: 'monitoring-and-evaluation',
        title: 'Monitoring & Evaluation',
        description: 'Project monitoring, evaluation, and reporting',
        icon: <BarChart3 className="h-8 w-8" />,
        color: 'text-progress-completed',
        bgColor: 'bg-progress-completed/10'
    },
    {
        id: 'mapshop-management',
        title: 'MapShop Management',
        description: 'E-commerce operations, sales tracking, and billing management',
        icon: <Store className="h-8 w-8" />,
        color: 'text-chart-1',
        bgColor: 'bg-chart-1/10'
    },
    {
        id: 'reports',
        title: 'Reports & Analytics',
        description: 'Comprehensive reporting and data analytics',
        icon: <FileText className="h-8 w-8" />,
        color: 'text-chart-2',
        bgColor: 'bg-chart-2/10'
    },
    {
        id: 'organizations',
        title: 'Organizations',
        description: 'Organizational structure and management',
        icon: <Building className="h-8 w-8" />,
        color: 'text-chart-3',
        bgColor: 'bg-chart-3/10'
    },
    {
        id: 'system-settings',
        title: 'System Administration',
        description: 'System configuration and maintenance',
        icon: <Settings className="h-8 w-8" />,
        color: 'text-muted-foreground',
        bgColor: 'bg-muted/20'
    },
    {
        id: 'document-management',
        title: 'Document Management',
        description: 'Document storage, version control, and collaboration',
        icon: <FolderOpen className="h-8 w-8" />,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
    },
    {
        id: 'equipment-management',
        title: 'Inventory Tracking',
        description: 'Tool inventory management, checkout, and maintenance tracking',
        icon: <Package className="h-8 w-8" />,
        color: 'text-green-500',
        bgColor: 'bg-green-500/10'
    },
    {
        id: 'billing',
        title: 'Sales and Billing',
        description: 'Sales management, billing, payments, and financial reporting',
        icon: <CreditCard className="h-8 w-8" />,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10'
    }
]