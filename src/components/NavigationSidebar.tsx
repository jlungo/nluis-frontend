import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Home,
  MapIcon,
  Users,
  Building,
  Shield,
  BarChart3,
  AlertTriangle,
  FileText,
  Settings,
  Activity,
  User,
  ChevronDown,
  ChevronRight,
  ClipboardPenLine,
  LayoutTemplate,
  List,
  ClipboardList,
  ClipboardPlus
} from "lucide-react";
import type { Page } from "@/types/page";
import { Link, useLocation } from "react-router";
import { usePageStore } from "@/store/pageStore";
import { cn } from "@/lib/utils";

interface NavigationItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavigationGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: NavigationItem[];
  defaultOpen?: boolean;
}

interface StandaloneNavigationItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  type: "standalone";
}

interface NavigationSidebarProps {
  collapsed?: boolean;
  // navigationItems: (NavigationGroup | StandaloneNavigationItem)[];
}

export function NavigationSidebar({
  collapsed = false,
}: NavigationSidebarProps) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    new Set(["land-uses"])
  );

  const { page } = usePageStore();

  const location = useLocation();
  const pathname = location.pathname;

  const toggleGroup = (groupId: string) => {
    if (collapsed) return; // Don't allow expanding when collapsed

    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(groupId)) {
      newOpenGroups.delete(groupId);
    } else {
      newOpenGroups.add(groupId);
    }
    setOpenGroups(newOpenGroups);
  };

  const navigateTo = (id: string, label: string) => {
    if (!page || !page?.module) return "";
    if (label === "Dashboard") {
      return `/${page.module}`;
    }
    return `/${page.module}/${id}`;
  };

  // Get module-specific navigation or default navigation
  const getNavigationItems = (): (
    | StandaloneNavigationItem
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
              icon: <Home className="h-4 w-4" />,
              type: "standalone",
            },
          ];
        case "land-uses":
          return [
            {
              id: "land-uses-overview",
              label: "Land Uses Overview",
              icon: <MapIcon className="h-4 w-4" />,
              type: "standalone",
            },
            {
              id: "national-land-use",
              label: "National Land Use",
              icon: <Building className="h-4 w-4" />,
              badge: "3",
              type: "standalone",
            },
            {
              id: "zonal-land-use",
              label: "Zonal Land Use",
              icon: <Building className="h-4 w-4" />,
              badge: "7",
              type: "standalone",
            },
            {
              id: "regional-land-use",
              label: "Regional Land Use",
              icon: <Building className="h-4 w-4" />,
              type: "standalone",
            },
            {
              id: "district-land-use",
              label: "District Land Use",
              icon: <Building className="h-4 w-4" />,
              type: "standalone",
            },
            {
              id: "village-land-use",
              label: "Village Land Use",
              icon: <Users className="h-4 w-4" />,
              badge: "12",
              type: "standalone",
            },
          ];
        case "ccro-management":
          return [
            {
              id: "overview",
              label: "CCRO Overview",
              icon: <Shield className="h-4 w-4" />,
              badge: "8",
              type: "standalone",
            },
            {
              id: "land-formalization",
              label: "Land Formalization",
              icon: <FileText className="h-4 w-4" />,
              type: "standalone",
            },
            {
              id: "reports",
              label: "CCRO Reports",
              icon: <FileText className="h-4 w-4" />,
              type: "standalone",
            },
          ];
        case "compliance":
          return [
            {
              id: "overview",
              label: "Compliance Overview",
              icon: <AlertTriangle className="h-4 w-4" />,
              type: "standalone",
            },
            {
              id: "reports",
              label: "Compliance Reports",
              icon: <FileText className="h-4 w-4" />,
              type: "standalone",
            },
          ];
        case "management-evaluation":
          return [
            {
              id: "overview",
              label: "M&E Dashboard",
              icon: <BarChart3 className="h-4 w-4" />,
              badge: "5",
              type: "standalone",
            },
            {
              id: "reports",
              label: "M&E Reports",
              icon: <FileText className="h-4 w-4" />,
              type: "standalone",
            },
          ];
        case "reports":
          return [
            // {
            //     id: "reports",
            //     label: "Reports Dashboard",
            //     icon: <FileText className="h-4 w-4" />,
            //     type: "standalone",
            // },
          ];
        case "user-management":
          return [
            // {
            //     id: "user-management",
            //     label: "User Management",
            //     icon: <User className="h-4 w-4" />,
            //     type: "standalone",
            // },
          ];
        case "system-settings":
          return [
            {
              id: "form-management",
              label: "Form Management",
              icon: <ClipboardPenLine className="h-4 w-4" />,
              items: [
                {
                  id: "builder",
                  label: "Quick Build",
                  icon: <ClipboardPlus className="h-4 w-4" />
                },
                {
                  id: "module-levels",
                  label: "Module Levels",
                  icon: <List className="h-4 w-4" />
                },
                {
                  id: "level-sections",
                  label: "Level Sections",
                  icon: <LayoutTemplate className="h-4 w-4" />
                },
                {
                  id: "form-builder",
                  label: "Form Builder",
                  icon: <ClipboardList className="h-4 w-4" />
                }
              ],
            },
          ];
        case "audit-trail":
          return [
            // {
            //     id: "audit-trail",
            //     label: "Audit Trail",
            //     icon: <Activity className="h-4 w-4" />,
            //     type: "standalone",
            // },
          ];
        default:
          return [];
      }
    }

    // Default navigation when not in a module context
    return [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <Home className="h-4 w-4" />,
        items: [
          {
            id: "dashboard",
            label: "System Overview",
            icon: <Home className="h-4 w-4" />,
          },
        ],
      },
      {
        id: "land-uses",
        label: "Land Use",
        icon: <MapIcon className="h-4 w-4" />,
        defaultOpen: true,
        items: [
          {
            id: "land-uses-overview",
            label: "Land Uses Overview",
            icon: <MapIcon className="h-4 w-4" />,
          },
          {
            id: "national-land-use",
            label: "National Land Use",
            icon: <Building className="h-4 w-4" />,
            badge: "3",
          },
          {
            id: "zonal-land-use",
            label: "Zonal Land Use",
            icon: <Building className="h-4 w-4" />,
            badge: "7",
          },
          {
            id: "regional-land-use",
            label: "Regional Land Use",
            icon: <Building className="h-4 w-4" />,
          },
          {
            id: "district-land-use",
            label: "District Land Use",
            icon: <Building className="h-4 w-4" />,
          },
          {
            id: "village-land-use",
            label: "Village Land Use",
            icon: <Users className="h-4 w-4" />,
            badge: "12",
          },
        ],
      },
      {
        id: "ccro-management",
        label: "CCRO Management",
        icon: <Shield className="h-4 w-4" />,
        items: [
          {
            id: "overview",
            label: "CCRO Overview",
            icon: <Shield className="h-4 w-4" />,
            badge: "8",
          },
          {
            id: "land-formalization",
            label: "Land Formalization",
            icon: <FileText className="h-4 w-4" />,
          },
          {
            id: "reports",
            label: "CCRO Reports",
            icon: <FileText className="h-4 w-4" />,
          },
        ],
      },
      {
        id: "compliance",
        label: "Compliance",
        icon: <AlertTriangle className="h-4 w-4" />,
        type: "standalone",
      },
      {
        id: "management-evaluation",
        label: "Management & Evaluation",
        icon: <BarChart3 className="h-4 w-4" />,
        badge: "5",
        type: "standalone",
      },
      {
        id: "reports",
        label: "Reports",
        icon: <FileText className="h-4 w-4" />,
        type: "standalone",
      },
      {
        id: "administration",
        label: "Administration",
        icon: <Settings className="h-4 w-4" />,
        items: [
          {
            id: "user-management",
            label: "User Management",
            icon: <User className="h-4 w-4" />,
          },
          {
            id: "audit-trail",
            label: "Audit Trail",
            icon: <Activity className="h-4 w-4" />,
          },
          {
            id: "system-settings",
            label: "System Settings",
            icon: <Settings className="h-4 w-4" />,
          },
        ],
      },
    ];
  };

  const navigationItems = getNavigationItems();

  const renderNavigationItem = (item: NavigationItem, group?: string) => {
    const isActive = pathname.includes(item.id);

    const buttonContent = (
      <Link
        key={item.id}
        className={cn(
          buttonVariants({ variant: isActive ? "default" : "ghost" }),
          `w-full ${collapsed
            ? "px-2 justify-center"
            : group
              ? "justify-start px-4"
              : "justify-start px-3"
          } h-8 ${isActive
            ? "bg-sidebar-primary/80 dark:bg-sidebar-primary/50 hover:bg-sidebar-primary dark:hover:bg-sidebar-primary text-white"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          }`
        )}
        to={navigateTo(group ? `${group}/${item.id}` : item.id, item.label)}
      >
        <div className="flex items-center gap-3 w-full">
          <div className="flex-shrink-0">{item.icon}</div>
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate text-sm">
                {item.label}
              </span>
              {item.badge && (
                <Badge
                  variant="secondary"
                  className={`ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs bg-sidebar-accent text-sidebar-accent-foreground ${isActive ? "text-white dark:text-white" : null
                    }`}
                >
                  {item.badge}
                </Badge>
              )}
            </>
          )}
          {collapsed && item.badge && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-destructive text-white/90"
            >
              {item.badge}
            </Badge>
          )}
        </div>
      </Link>
    );

    if (collapsed) {
      return (
        <TooltipProvider key={item.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">{buttonContent}</div>
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="flex items-center gap-2 text-white"
            >
              {item.label}
              {item.badge && (
                <Badge variant="secondary" className="h-4 w-4 p-0 text-xs">
                  {item.badge}
                </Badge>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return buttonContent;
  };

  const renderNavigationGroup = (group: NavigationGroup) => {
    const isOpen = openGroups.has(group.id);
    const hasActiveItem = group.items.some((item) =>
      pathname.includes(item.id)
    );

    if (collapsed) {
      // In collapsed mode, show group icon with tooltip containing all items
      return (
        <TooltipProvider key={group.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="relative">
                <Button
                  variant="ghost"
                  className={`w-full px-2 justify-center h-8 ${hasActiveItem
                    ? "bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-primary-foreground hover:bg-sidebar-primary/90 dark:hover:bg-sidebar-primary/90"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                >
                  {group.icon}
                  {group.items.some((item) => item.badge) && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-destructive text-white/90"
                    >
                      {group.items.reduce(
                        (total, item) =>
                          total + (item.badge ? parseInt(item.badge) : 0),
                        0
                      )}
                    </Badge>
                  )}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="p-0 max-w-60 text-white">
              <div className="p-2">
                <div className="font-medium text-sm mb-2 ml-3">
                  {group.label}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.id}
                      className={cn(
                        buttonVariants({
                          variant: pathname.includes(`${group.id}/${item.id}`)
                            ? "default"
                            : "ghost",
                          size: "sm",
                        }),
                        `w-full justify-start h-8 ${pathname.includes(item.id)
                          ? "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                          : "hover:bg-accent"
                        }`
                      )}
                      to={navigateTo(`${group.id}/${item.id}`, item.label)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        {item.icon}
                        <span className="text-xs">{item.label}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="ml-auto h-4 w-4 p-0 text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Full width mode with collapsible groups
    return (
      <Collapsible
        key={group.id}
        open={isOpen}
        onOpenChange={() => toggleGroup(group.id)}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={`w-full justify-start px-3 h-8 ${hasActiveItem
              ? "bg-sidebar-primary/60 dark:bg-sidebar-primary/20 hover:bg-sidebar-primary dark:hover:bg-sidebar-primary text-white hover:text-white"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
          >
            <div className="flex items-center gap-3 w-full">
              {group.icon}
              <span className="flex-1 text-left text-sm font-medium truncate">
                {group.label}
              </span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 pl-1">
          {group.items.map((item) => renderNavigationItem(item, group.id))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  const renderStandaloneItem = (item: StandaloneNavigationItem) => {
    return renderNavigationItem(item);
  };

  const renderNavigationElement = (
    element: NavigationGroup | StandaloneNavigationItem
  ) => {
    if ("type" in element && element.type === "standalone") {
      return renderStandaloneItem(element);
    } else {
      return renderNavigationGroup(element as NavigationGroup);
    }
  };

  return (
    <nav className="p-3 space-y-1">
      {/* {page && page?.module
        ? renderNavigationItem({
          id: page.module,
          label: "Dashboard",
          icon: <Home className="h-4 w-4" />,
        })
        : null} */}
      {navigationItems.map(renderNavigationElement)}
    </nav>
  );
}
