import { ArrowLeft, Bell, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ToggleTheme } from "./ToggleTheme";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { usePageStore } from "@/store/pageStore";
import { useNavigate } from "react-router";

interface MainHeaderProps {
  sidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

export function MainHeader({ sidebarOpen, toggleSidebar }: MainHeaderProps) {
  const router = useNavigate();
  const { page } = usePageStore();

  return (
    <header className="sticky top-0 flex-shrink-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-20">
      <div className="flex items-center gap-4">
        {/* Hamburger Menu - Mobile */}
        {sidebarOpen !== undefined && toggleSidebar ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="lg:hidden text-foreground hover:bg-accent"
                >
                  {sidebarOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-white">
                <p>{sidebarOpen ? "Close menu" : "Open menu"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}

        {/* Back Button */}
        {page && page?.backButton ? (
          <Button variant="outline" size="sm" onClick={() => router(-1)}>
            <ArrowLeft />
            {page.backButton}
          </Button>
        ) : null}

        {/* Page Title */}
        {page &&
          page?.showPageHeader !== undefined &&
          page.showPageHeader &&
          page?.title && (
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {page.title}
              </h1>
            </div>
          )}
      </div>

      <div className="flex items-center gap-4">
        {/* Page Actions */}
        {page && page?.pageActions && (
          <div className="flex items-center gap-2">{page.pageActions}</div>
        )}

        <ToggleTheme />

        {/* Top Bar Actions */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-foreground hover:bg-accent"
                >
                  <Bell className="h-4 w-4" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-destructive">
                    3
                  </Badge>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Notifications (3)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User Profile - Desktop */}
          <div className="hidden md:flex items-center gap-3 ml-2">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">John Doe</p>
              <p className="text-xs text-muted-foreground">Land Use Planner</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    // onClick={() => onPageChange('profile')}
                    className="p-1"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/api/placeholder/32/32" alt="User" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        JD
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>View Profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Mobile User Avatar */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  // onClick={() => onPageChange('profile')}
                  className="md:hidden p-1"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/api/placeholder/32/32" alt="User" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      JD
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>View Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
