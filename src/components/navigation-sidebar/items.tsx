import type { PageMetadata } from "@/store/pageStore";
import {
  Home,
  Shield,
  BarChart3,
  AlertTriangle,
  FileText,
  List,
  LayoutDashboard,
  ClipboardPlus,
  ClipboardList,
  Flag,
  Map,
  LandPlot,
  Layers,
  Building2,
  FileQuestionMark,
  ListChecks,
  MapPin,
  TrendingUp,
  Satellite,
  LineChart,
} from "lucide-react";

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  hidden?: boolean;
}

export interface NavigationGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: NavigationItem[];
  hidden?: boolean;
}

export const getNavigationItems = (page: PageMetadata | null): (
  | NavigationItem
  | NavigationGroup
)[] => {
  // If we're in a specific module context, show only that module's content
  if (page && page?.module) {
    switch (page.module) {
      case "dashboard":
        return [
          {
            id: "dashboard",
            label: "System Overview",
            icon: <Home className="h-4 w-4" />
          },
        ];
      case "land-uses":
        return [
          {
            id: "land-uses",
            label: "Land Uses Overview",
            icon: <LayoutDashboard className="h-4 w-4" />
          },
          {
            id: "national-land-use",
            label: "National Land Use",
            icon: <Flag className="h-4 w-4" />,
            // badge: "3"
          },
          {
            id: "zonal-land-use",
            label: "Zonal Land Use",
            icon: <LandPlot className="h-4 w-4" />,
            // badge: "7"
          },
          {
            id: "regional-land-use",
            label: "Regional Land Use",
            icon: <Map className="h-4 w-4" />
          },
          {
            id: "district-land-use",
            label: "District Land Use",
            icon: <Layers className="h-4 w-4" />
          },
          {
            id: "village-land-use",
            label: "Village Land Use",
            icon: <Building2 className="h-4 w-4" />,
            // badge: "12"
          },
        ];
      case "ccro-management":
        return [
          {
            id: "ccro-management",
            label: "CCRO Overview",
            icon: <Shield className="h-4 w-4" />,
            // badge: "8"
          },
          {
            id: "land-formalization",
            label: "Land Formalization",
            icon: <FileText className="h-4 w-4" />
          },
          {
            id: "reports",
            label: "CCRO Reports",
            icon: <FileText className="h-4 w-4" />
          },
        ];
      case "compliance":
        return [
          {
            id: "overview",
            label: "Compliance Overview",
            icon: <AlertTriangle className="h-4 w-4" />
          },
          {
            id: "reports",
            label: "Compliance Reports",
            icon: <FileText className="h-4 w-4" />
          },
        ];
      case "management-evaluation":
        return [
          {
            id: "overview",
            label: "Dashboard",
            icon: <BarChart3 className="h-4 w-4" />,
            badge: "5"
          },
          {
            id: "indicators",
            label: "Indicators",
            icon: <ListChecks className="h-4 w-4" />
          },
          {
            id: "villages",
            label: "Village Tracking",
            icon: <MapPin className="h-4 w-4" />
          },
          {
            id: "reports",
            label: "M&E Reports",
            icon: <FileText className="h-4 w-4" />
          },
          {
            id: "analysis",
            label: "Data Analysis",
            icon: <TrendingUp className="h-4 w-4" />
          },
          {
            id: "satellite",
            label: "Satellite Monitoring",
            icon: <Satellite className="h-4 w-4" />
          },
          {
            id: "projections",
            label: "Projections",
            icon: <LineChart className="h-4 w-4" />
          }
        ];
      case "reports":
        return [];
      case "system-settings":
        return [
          {
            id: "system-settings",
            label: "Dashboard",
            icon: <LayoutDashboard className="h-4 w-4" />,
          },
          {
            id: "form-management",
            label: "Form Management",
            icon: <ClipboardList className="h-4 w-4" />,
            items: [
              {
                id: "form-management",
                label: "Form Management",
                icon: <ClipboardPlus className="h-4 w-4" />,
                hidden: true,
              },
              {
                id: "form-workflows",
                label: "Form Workflows",
                icon: <ClipboardPlus className="h-4 w-4" />
              },
              {
                id: "questionnaires",
                label: "Questionnaires",
                icon: <FileQuestionMark className="h-4 w-4" />
              },
              {
                id: "module-levels",
                label: "Module Levels",
                icon: <List className="h-4 w-4" />
              }
            ]
          },
          {
            id: "locality-management",
            label: "Locality Management",
            icon: <ClipboardList className="h-4 w-4" />,
            items: [
              {
                id: "locality-management",
                label: "Localities",
                icon: <ClipboardPlus className="h-4 w-4" />
              },
              {
                id: "locality-levels",
                label: "Locality Levels",
                icon: <List className="h-4 w-4" />
              }
            ]
          },
          {
            id: "user-management",
            label: "User Management",
            icon: <ClipboardList className="h-4 w-4" />,
            items: [
              {
                id: "user-management",
                label: "Users",
                icon: <ClipboardPlus className="h-4 w-4" />
              },
              {
                id: "user-roles",
                label: "User Roles",
                icon: <List className="h-4 w-4" />
              },
              {
                id: "permissions",
                label: "Permissions",
                icon: <List className="h-4 w-4" />
              },
              {
                id: "user-groups",
                label: "User Groups",
                icon: <List className="h-4 w-4" />
              }
            ]
          },
          {
            id: "organization-management",
            label: "Organization Management",
            icon: <ClipboardList className="h-4 w-4" />,
            items: [
              {
                id: "organization-management",
                label: "Organization Types",
                icon: <ClipboardPlus className="h-4 w-4" />
              }
            ]
          },
          {
            id: "land-use-management",
            label: "Land Use Management",
            icon: <ClipboardList className="h-4 w-4" />,
            items: [
              {
                id: "land-use-management",
                label: "Land Uses",
                icon: <ClipboardPlus className="h-4 w-4" />
              }
            ]
          },
        ];
      case "organizations":
        return [
          {
            id: "organizations",
            label: "Dashboard",
            icon: <LayoutDashboard className="h-4 w-4" />
          },
          {
            id: "organizations-list",
            label: "Organizations",
            icon: <List className="h-4 w-4" />
          },
        ];
      default:
        return [];
    }
  }
  return []
};