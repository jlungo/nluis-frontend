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
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router";
import { usePageStore } from "@/store/pageStore";
import { cn } from "@/lib/utils";
import { getNavigationItems, type NavigationGroup, type NavigationItem } from "./items";

interface NavigationSidebarProps {
    collapsed?: boolean;
}

export default function NavigationSidebar({
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
        const parts = id.split("/");
        if (parts[0] === page.module) return `/${parts.slice(0).join("/")}`;
        return `/${page.module}/${id}`
    };

    const navigationItems = getNavigationItems(page);

    const renderNavigationItem = (item: NavigationItem, group?: NavigationGroup) => {
        const link = group ? group.id === item.id ? group.id : `${group.id}/${item.id}` : item.id
        const parts = link.split("/");
        const isPathnameActive = parts[0] === page?.module ? pathname.endsWith(page.module) : pathname.includes(link)

        const buttonContent = (
            <Link
                key={item.id}
                to={navigateTo(link)}
                className={cn(
                    buttonVariants({ variant: isPathnameActive ? "default" : "ghost" }),
                    `w-full ${collapsed
                        ? "px-2 justify-center"
                        : group
                            ? "justify-start px-4"
                            : "justify-start px-3"
                    } h-8 ${isPathnameActive
                        ? "bg-sidebar-primary/80 dark:bg-sidebar-primary/50 hover:bg-sidebar-primary dark:hover:bg-sidebar-primary text-white"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    } ${item.hidden ? "hidden" : ""}`
                )}
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
            </Link>
        );

        if (collapsed) {
            return (
                <TooltipProvider key={item.id}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className={`relative ${item.hidden ? "hidden" : ""}`}>{buttonContent}</div>
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
                                        } ${group.hidden ? "hidden" : ""}`}
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
                                                } ${item.hidden ? "hidden" : ""}`
                                            )}
                                            to={navigateTo(group.id === item.id ? group.id : `${group.id}/${item.id}`)}
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
                            ? `${isOpen ? 'bg-sidebar-primary/60 dark:bg-sidebar-primary/20' : 'bg-sidebar-primary/80 dark:hover:bg-sidebar-primary/90'} hover:bg-sidebar-primary dark:hover:bg-sidebar-primary text-white hover:text-white`
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            } ${group.hidden ? "hidden" : ""}`}
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
                    {group.items.map(item => renderNavigationItem(item, group))}
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