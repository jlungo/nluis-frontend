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
  ChevronDown,
  ChevronRight,
  ClipboardPenLine,
  LayoutTemplate,
  List,
  ClipboardPlus,
  LayoutDashboard,
  User
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
}

interface NavigationSidebarProps {
  collapsed?: boolean;
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
    if (collapsed) return;

    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(groupId)) newOpenGroups.delete(groupId);
    else newOpenGroups.add(groupId)
    setOpenGroups(newOpenGroups);
  };

  const navigateTo = (id: string) => {
    if (!page || !page?.module) return "";
    return `/${page.module}/${id}`;
  };

  // Get module-specific navigation or default navigation
  const getNavigationItems = (): (
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
              id: "land-uses-overview",
              label: "Land Uses Overview",
              icon: <MapIcon className="h-4 w-4" />
            },
            {
              id: "national-land-use",
              label: "National Land Use",
              icon: <Building className="h-4 w-4" />,
              badge: "3"
            },
            {
              id: "zonal-land-use",
              label: "Zonal Land Use",
              icon: <Building className="h-4 w-4" />,
              badge: "7"
            },
            {
              id: "regional-land-use",
              label: "Regional Land Use",
              icon: <Building className="h-4 w-4" />
            },
            {
              id: "district-land-use",
              label: "District Land Use",
              icon: <Building className="h-4 w-4" />
            },
            {
              id: "village-land-use",
              label: "Village Land Use",
              icon: <Users className="h-4 w-4" />,
              badge: "12"
            },
          ];
        case "ccro-management":
          return [
            {
              id: "overview",
              label: "CCRO Overview",
              icon: <Shield className="h-4 w-4" />,
              badge: "8"
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
              label: "M&E Dashboard",
              icon: <BarChart3 className="h-4 w-4" />,
              badge: "5"
            },
            {
              id: "reports",
              label: "M&E Reports",
              icon: <FileText className="h-4 w-4" />
            },
          ];
        case "reports":
          return [];
        case "user-management":
          return [];
        case "system-settings":
          return [
            {
              id: "form-management",
              label: "Form Management",
              icon: <ClipboardPenLine className="h-4 w-4" />,
              items: [
                {
                  id: "forms-dashboard",
                  label: "Forms Dashboard",
                  icon: <LayoutDashboard className="h-4 w-4" />
                },
                {
                  id: "form-builder",
                  label: "Form Builder",
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
              ],
            },
            {
              id: "user-management",
              label: "User Management",
              icon: <User className="h-4 w-4" />,
              items: [
                {
                  id: "users-dashboard",
                  label: "Users Dashboard",
                  icon: <LayoutDashboard className="h-4 w-4" />
                },
                // {
                //   id: "form-builder",
                //   label: "Form Builder",
                //   icon: <ClipboardPlus className="h-4 w-4" />
                // },
                // {
                //   id: "module-levels",
                //   label: "Module Levels",
                //   icon: <List className="h-4 w-4" />
                // },
                // {
                //   id: "level-sections",
                //   label: "Level Sections",
                //   icon: <LayoutTemplate className="h-4 w-4" />
                // },
              ],
            },
          ];
        case "audit-trail":
          return [];
        default:
          return [];
      }
    }
    return []
  };

  const navigationItems = getNavigationItems();

  const renderNavigationItem = (item: NavigationItem, group?: string) => {
    const isActive = pathname.endsWith(item.id);

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
        to={navigateTo(group ? `${group}/${item.id}` : item.id)}
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
                    ? "bg-sidebar-primary/80 text-white/80 hover:text-white hover:bg-sidebar-primary/90 dark:hover:bg-sidebar-primary/90"
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
                <div className="font-medium text-sm mb-2 ml-1">
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
                      to={navigateTo(`${group.id}/${item.id}`)}
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

  const renderNavigationElement = (
    element: NavigationGroup | NavigationItem
  ) => {
    if ("items" in element) return renderNavigationGroup(element as NavigationGroup);
    else return renderNavigationItem(element);
  };

  return (
    <nav className="p-3 space-y-1">
      {navigationItems.map(renderNavigationElement)}
    </nav>
  );
}
