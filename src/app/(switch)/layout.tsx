import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import {
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { Page } from '@/types/page';
import { Outlet } from 'react-router';
import logo from "@/assets/nlus.png"
import { MainHeader } from '@/components/MainHeader';

interface UniversalLayoutProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  onLogout: () => void;
  showPageHeader?: boolean;
  pageTitle?: string;
  pageActions?: React.ReactNode;
  backButton?: React.ReactNode;
  currentModule?: string | null;
}

export default function UniversalLayout({
  currentPage,
  onPageChange,
  onLogout,
  showPageHeader = true,
  pageTitle,
  pageActions,
  backButton,
  currentModule
}: UniversalLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    if (sidebarCollapsed) {
      setSidebarCollapsed(false);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const collapseSidebar = () => {
    setSidebarCollapsed(true);
    setSidebarOpen(true);
  };

  const expandSidebar = () => {
    setSidebarCollapsed(false);
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Main Sidebar - FIXED */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'w-14' : 'w-52'} transition-all duration-300 ease-in-out fixed left-0 top-0 h-full z-40 lg:relative lg:translate-x-0 lg:flex-shrink-0`}>
        <div className="h-full bg-sidebar border-r border-sidebar-border flex flex-col">
          {/* Sidebar Header - FIXED */}
          <div className="flex-shrink-0 p-3 h-14 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sidebar-primary/90 rounded flex items-center justify-center">
                    <img src={logo} alt="NLUIS Logo" className="w-full h-full ml-0.5 scale-105" />
                  </div>
                  {/* <div className="w-8 h-8 bg-sidebar-primary rounded flex items-center justify-center">
                    <span className="text-sidebar-primary-foreground font-semibold text-sm">NL</span>
                  </div> */}
                  <span className="font-semibold text-sidebar-foreground">NLUIS</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                {!sidebarCollapsed && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={collapseSidebar}
                          className="text-sidebar-foreground hover:bg-sidebar-accent"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Collapse sidebar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {sidebarCollapsed && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={expandSidebar}
                          className="text-sidebar-foreground hover:bg-sidebar-accent"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Expand sidebar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>

          {/* Navigation - SCROLLABLE */}
          <div className="flex-1 overflow-y-auto">
            <NavigationSidebar
              currentPage={currentPage}
              onPageChange={onPageChange}
              collapsed={sidebarCollapsed}
              currentModule={currentModule}
            />
          </div>

          {/* User Section - FIXED */}
          {!sidebarCollapsed && (
            <div className="flex-shrink-0 p-3 border-t border-sidebar-border">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" alt="User" />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    John Doe
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">
                    Land Use Planner
                  </p>
                </div>
              </div>

              <div className="flex gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPageChange('profile')}
                        className="flex-1 text-sidebar-foreground hover:bg-sidebar-accent"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Profile</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPageChange('system-settings')}
                        className="flex-1 text-sidebar-foreground hover:bg-sidebar-accent"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onLogout}
                        className="flex-1 text-sidebar-foreground hover:bg-sidebar-accent"
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Logout</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Overlay for Mobile - FIXED */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Bar - FIXED */}
        <MainHeader
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          backButton={backButton}
          pageTitle={pageTitle}
          showPageHeader={showPageHeader}
          pageActions={pageActions}
        />

        {/* Page Content - SCROLLABLE */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}