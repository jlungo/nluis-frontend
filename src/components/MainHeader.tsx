import { ArrowLeft, Bell, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ThemeTogglePopover } from "./ToggleTheme";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { usePageStore } from "@/store/pageStore";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "@/store/auth";
import { LogoutButton } from "./LogoutButton";
import logo from "@/assets/nluis.png"

interface MainHeaderProps {
  showLogo?: boolean;
  sidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

export function MainHeader({ showLogo = false, sidebarOpen, toggleSidebar }: MainHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation()
  const { page } = usePageStore();
  const { user } = useAuth()

  return (
    <header className="sticky top-0 flex-shrink-0 h-14 bg-card border-b border-border flex items-center justify-between px-4 z-20">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Back to Home */}
        {location.pathname === "/board" ? (
          <Button variant="outline" size="sm" onClick={() => navigate('/', { replace: true })}>
            <ArrowLeft />
            Home
          </Button>
        ) : null}

        {/* Logo - Switch Board */}
        {showLogo ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded flex items-center justify-center">
              <img src={logo} alt="NLUIS Logo" className="w-full h-full scale-150" />
            </div>
            <span className="font-semibold text-sidebar-foreground">NLUIS</span>
          </div>
        ) : null}

        {/* Hamburger Menu - Mobile */}
        {sidebarOpen !== undefined && showLogo === false && toggleSidebar ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="lg:hidden text-foreground hover:bg-accent"
                  aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
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
          <Button variant="outline" size="sm" onClick={() => {
            if (user?.modules && user.modules.length === 1) navigate('/', { replace: true })
            else navigate('/board', { replace: true })
          }}>
            <ArrowLeft />
            {user?.modules && user.modules.length === 1 ? (
              <span>
                <span className="block lg:inline">
                  Back to
                </span>
                <span className="hidden lg:inline">
                  Home
                </span>
              </span>
            ) : (
              <span>
                <span className="block lg:inline">
                  {page.backButton.split(" ")[0] + " "}
                </span>
                <span className="hidden lg:inline">
                  {page.backButton.split(" ").slice(1).join(" ")}
                </span>
              </span>
            )}
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

      <div className="flex items-center gap-2 md:gap-4">

        <ThemeTogglePopover />

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
              <p className="text-sm font-medium text-foreground">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-muted-foreground">{user?.role?.name}</p>
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
                      <AvatarFallback className="bg-primary text-primary-foreground dark:text-white">
                        {`${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase()}
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
                    <AvatarFallback className="bg-primary text-primary-foreground dark:text-white">
                      {`${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>View Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
