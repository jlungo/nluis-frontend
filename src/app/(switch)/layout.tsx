import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import {
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Outlet, useNavigate } from 'react-router';
import logo from "@/assets/nluis.png"
import { MainHeader } from '@/components/MainHeader';
import { usePageStore } from '@/store/pageStore';
import { LogoutButton } from '@/components/LogoutButton';
import { useEffect } from "react";
import { useAuth } from '@/store/auth';
import DynamicBreadcrums from '@/components/DynamicBreadcrums';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { page } = usePageStore()
  const navigate = useNavigate();
  const { user } = useAuth()

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

  useEffect(() => {
    if (!user) navigate(`/auth/signin`, { replace: true })
    else if (!user?.modules || !Array.isArray(user?.modules) || user?.modules?.length === 0) navigate(`/portal`, { replace: true })
    else if (page?.module && !user.modules.some(m => m.slug === page.module)) navigate(`/board`, { replace: true })
  }, [navigate, page?.module, user])

  if (!user) return null
  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Main Sidebar - FIXED */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'w-14' : 'w-60 sm:w-80 lg:w-54 2xl:w-60'} transition-all duration-300 ease-in-out fixed left-0 top-0 h-full z-40 lg:relative lg:translate-x-0 lg:flex-shrink-0`}>
        <div className="h-full bg-sidebar border-r border-sidebar-border flex flex-col">
          {/* Sidebar Header - FIXED */}
          <div className="flex-shrink-0 p-3 h-14 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded flex items-center justify-center">
                    <img src={logo} alt="NLUIS Logo" className="w-full h-full scale-150" />
                  </div>
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
                          className="text-sidebar-foreground hover:bg-sidebar-accent hidden lg:block"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className='text-white'>
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
                      <TooltipContent side="right" className='text-white'>
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
            <NavigationSidebar collapsed={sidebarCollapsed} />
          </div>

          {/* User Section - FIXED */}
          {!sidebarCollapsed && (
            <div className="flex-shrink-0 p-3 border-t border-sidebar-border">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/api/placeholder/32/32" alt="User" />
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                    {`${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">
                    {user?.role?.name}
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
                        // onClick={() => onPageChange('profile')}
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
                        // onClick={() => onPageChange('system-settings')}
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

                <LogoutButton />
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
        />

        {/* Page Content - SCROLLABLE */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {page && page?.isFormPage !== undefined && page.isFormPage
              ? <Outlet />
              : (
                <div className="px-4 md:px-6 py-4 md:py-4 space-y-6">
                  {/* Module Context Header */}
                  <div className="border-b border-border pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(-1)}
                          className="gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back
                        </Button>
                        <div className="h-4 w-px bg-border -ml-3" />
                        {page && page.showBreadcrums !== false && <DynamicBreadcrums />}
                        {page ?
                          <p className="text-base lg:text-lg font-semibold text-primary line-clamp-1 lg:-ml-4">
                            {page.title}
                          </p>
                          : null}
                      </div>
                      {/* <div className="text-sm text-muted-foreground hidden xl:block">
                        Module Dashboard
                      </div> */}
                    </div>
                  </div>
                  <Outlet />
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}