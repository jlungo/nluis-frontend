import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
    ChevronRight
} from 'lucide-react';
import type { Page } from '@/types/page';

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
    type: 'standalone';
}

interface NavigationSidebarProps {
    currentPage: Page;
    onPageChange: (page: Page) => void;
    collapsed?: boolean;
    currentModule?: string | null;
}

export function NavigationSidebar({ currentPage, onPageChange, collapsed = false, currentModule = null }: NavigationSidebarProps) {
    const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['land-use']));

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

    // Get module-specific navigation or default navigation
    const getNavigationItems = (): (NavigationGroup | StandaloneNavigationItem)[] => {
        // If we're in a specific module context, show only that module's content
        if (currentModule) {
            switch (currentModule) {
                case 'dashboard':
                    return [
                        {
                            id: 'dashboard',
                            label: 'System Overview',
                            icon: <Home className="h-4 w-4" />,
                            type: 'standalone'
                        }
                    ];
                case 'land-use':
                    return [
                        {
                            id: 'land-uses',
                            label: 'Land Uses Overview',
                            icon: <MapIcon className="h-4 w-4" />,
                            type: 'standalone'
                        },
                        {
                            id: 'village-land-use',
                            label: 'Village Land Use',
                            icon: <Users className="h-4 w-4" />,
                            badge: '12',
                            type: 'standalone'
                        },
                        {
                            id: 'regional-land-use',
                            label: 'Regional Land Use',
                            icon: <Building className="h-4 w-4" />,
                            type: 'standalone'
                        },
                        {
                            id: 'district-land-use',
                            label: 'District Land Use',
                            icon: <Building className="h-4 w-4" />,
                            type: 'standalone'
                        },
                        {
                            id: 'land-use-planning',
                            label: 'Land Use Planning',
                            icon: <MapIcon className="h-4 w-4" />,
                            type: 'standalone'
                        },
                        {
                            id: 'land-use-plans',
                            label: 'Land Use Plans',
                            icon: <FileText className="h-4 w-4" />,
                            type: 'standalone'
                        }
                    ];
                case 'ccro-management':
                    return [
                        {
                            id: 'ccro-management',
                            label: 'CCRO Overview',
                            icon: <Shield className="h-4 w-4" />,
                            badge: '8',
                            type: 'standalone'
                        },
                        {
                            id: 'land-formalization',
                            label: 'Land Formalization',
                            icon: <FileText className="h-4 w-4" />,
                            type: 'standalone'
                        },
                        {
                            id: 'reports',
                            label: 'CCRO Reports',
                            icon: <FileText className="h-4 w-4" />,
                            type: 'standalone'
                        }
                    ];
                case 'compliance':
                    return [
                        {
                            id: 'compliance',
                            label: 'Compliance Overview',
                            icon: <AlertTriangle className="h-4 w-4" />,
                            type: 'standalone'
                        },
                        {
                            id: 'reports',
                            label: 'Compliance Reports',
                            icon: <FileText className="h-4 w-4" />,
                            type: 'standalone'
                        }
                    ];
                case 'management-evaluation':
                    return [
                        {
                            id: 'management-evaluation',
                            label: 'M&E Dashboard',
                            icon: <BarChart3 className="h-4 w-4" />,
                            badge: '5',
                            type: 'standalone'
                        },
                        {
                            id: 'reports',
                            label: 'M&E Reports',
                            icon: <FileText className="h-4 w-4" />,
                            type: 'standalone'
                        }
                    ];
                case 'reports':
                    return [
                        {
                            id: 'reports',
                            label: 'Reports Dashboard',
                            icon: <FileText className="h-4 w-4" />,
                            type: 'standalone'
                        }
                    ];
                case 'user-management':
                    return [
                        {
                            id: 'user-management',
                            label: 'User Management',
                            icon: <User className="h-4 w-4" />,
                            type: 'standalone'
                        }
                    ];
                case 'system-settings':
                    return [
                        {
                            id: 'system-settings',
                            label: 'System Settings',
                            icon: <Settings className="h-4 w-4" />,
                            type: 'standalone'
                        }
                    ];
                case 'audit-trail':
                    return [
                        {
                            id: 'audit-trail',
                            label: 'Audit Trail',
                            icon: <Activity className="h-4 w-4" />,
                            type: 'standalone'
                        }
                    ];
                default:
                    return [];
            }
        }

        // Default navigation when not in a module context
        return [
            {
                id: 'dashboard',
                label: 'Dashboard',
                icon: <Home className="h-4 w-4" />,
                type: 'standalone'
            },
            {
                id: 'land-use',
                label: 'Land Use',
                icon: <MapIcon className="h-4 w-4" />,
                defaultOpen: true,
                items: [
                    {
                        id: 'land-uses',
                        label: 'Land Uses Overview',
                        icon: <MapIcon className="h-4 w-4" />
                    },
                    {
                        id: 'village-land-use',
                        label: 'Village Land Use',
                        icon: <Users className="h-4 w-4" />,
                        badge: '12'
                    },
                    {
                        id: 'regional-land-use',
                        label: 'Regional Land Use',
                        icon: <Building className="h-4 w-4" />
                    },
                    {
                        id: 'district-land-use',
                        label: 'District Land Use',
                        icon: <Building className="h-4 w-4" />
                    },
                    {
                        id: 'land-use-planning',
                        label: 'Land Use Planning',
                        icon: <MapIcon className="h-4 w-4" />
                    },
                    {
                        id: 'land-use-plans',
                        label: 'Land Use Plans',
                        icon: <FileText className="h-4 w-4" />
                    },
                    {
                        id: 'ccro-management',
                        label: 'CCRO Management',
                        icon: <Shield className="h-4 w-4" />,
                        badge: '8'
                    },
                    {
                        id: 'land-formalization',
                        label: 'Land Formalization',
                        icon: <FileText className="h-4 w-4" />
                    }
                ]
            },
            {
                id: 'compliance',
                label: 'Compliance',
                icon: <AlertTriangle className="h-4 w-4" />,
                type: 'standalone'
            },
            {
                id: 'management-evaluation',
                label: 'Management & Evaluation',
                icon: <BarChart3 className="h-4 w-4" />,
                badge: '5',
                type: 'standalone'
            },
            {
                id: 'reports',
                label: 'Reports',
                icon: <FileText className="h-4 w-4" />,
                type: 'standalone'
            },
            {
                id: 'administration',
                label: 'Administration',
                icon: <Settings className="h-4 w-4" />,
                items: [
                    {
                        id: 'user-management',
                        label: 'User Management',
                        icon: <User className="h-4 w-4" />
                    },
                    {
                        id: 'audit-trail',
                        label: 'Audit Trail',
                        icon: <Activity className="h-4 w-4" />
                    },
                    {
                        id: 'system-settings',
                        label: 'System Settings',
                        icon: <Settings className="h-4 w-4" />
                    }
                ]
            }
        ];
    };

    const navigationItems = getNavigationItems();

    const renderNavigationItem = (item: NavigationItem, isSubItem = false) => {
        const isActive = currentPage === item.id;

        const buttonContent = (
            <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full ${collapsed ? 'px-2 justify-center' : isSubItem ? 'justify-start px-4' : 'justify-start px-3'} h-8 ${isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }`}
                onClick={() => onPageChange(item.id)}
            >
                <div className="flex items-center gap-3 w-full">
                    <div className="flex-shrink-0">
                        {item.icon}
                    </div>
                    {!collapsed && (
                        <>
                            <span className="flex-1 text-left truncate text-sm">{item.label}</span>
                            {item.badge && (
                                <Badge
                                    variant="secondary"
                                    className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs bg-sidebar-accent text-sidebar-accent-foreground"
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
            </Button>
        );

        if (collapsed) {
            return (
                <TooltipProvider key={item.id}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="relative">
                                {buttonContent}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="flex items-center gap-2">
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
        const hasActiveItem = group.items.some(item => item.id === currentPage);

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
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                        }`}
                                >
                                    {group.icon}
                                    {group.items.some(item => item.badge) && (
                                        <Badge
                                            variant="secondary"
                                            className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs bg-destructive text-white/90"
                                        >
                                            {group.items.reduce((total, item) => total + (item.badge ? parseInt(item.badge) : 0), 0)}
                                        </Badge>
                                    )}
                                </Button>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="p-0">
                            <div className="p-2">
                                <div className="font-medium text-sm mb-2">{group.label}</div>
                                <div className="space-y-1">
                                    {group.items.map(item => (
                                        <Button
                                            key={item.id}
                                            variant={currentPage === item.id ? "default" : "ghost"}
                                            size="sm"
                                            className={`w-full justify-start h-8 ${currentPage === item.id
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-accent'
                                                }`}
                                            onClick={() => onPageChange(item.id)}
                                        >
                                            <div className="flex items-center gap-2 w-full">
                                                {item.icon}
                                                <span className="text-xs">{item.label}</span>
                                                {item.badge && (
                                                    <Badge variant="secondary" className="ml-auto h-4 w-4 p-0 text-xs">
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </div>
                                        </Button>
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
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            }`}
                    >
                        <div className="flex items-center gap-3 w-full">
                            {group.icon}
                            <span className="flex-1 text-left text-sm font-medium">{group.label}</span>
                            {isOpen ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                        </div>
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pl-1">
                    {group.items.map(item => renderNavigationItem(item, true))}
                </CollapsibleContent>
            </Collapsible>
        );
    };

    const renderStandaloneItem = (item: StandaloneNavigationItem) => {
        return renderNavigationItem(item, false);
    };

    const renderNavigationElement = (element: NavigationGroup | StandaloneNavigationItem) => {
        if ('type' in element && element.type === 'standalone') {
            return renderStandaloneItem(element);
        } else {
            return renderNavigationGroup(element as NavigationGroup);
        }
    };

    return (
        <nav className="p-3 space-y-1">
            {navigationItems.map(renderNavigationElement)}
        </nav>
    );
}