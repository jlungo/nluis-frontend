import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowLeft, LogIn, User } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import nlupcLogo from '@/assets/nluis.png';
import tanzaniaCoatOfArms from '@/assets/bibi_na_bwana.png';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ThemeTogglePopover } from "@/components/ToggleTheme";
import { useAuth } from "@/store/auth";
import { LogoutButton } from "@/components/LogoutButton";

export default function Layout() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card sticky top-0 z-50">
                <div className="xl:container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 lg:gap-6">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(location.pathname === '/mapshop' ? '/' : '/mapshop', { replace: true })}
                                className="gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                <span className="sr-only lg:not-sr-only">{location.pathname === '/mapshop' ? "Back to Home" : "Back to MapShop"}</span>
                            </Button>
                            <div className="h-6 w-px bg-border" />

                            {/* Official Branding */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <img src={tanzaniaCoatOfArms} alt="Tanzania Coat of Arms" className="h-8 w-8" />
                                    <img src={nlupcLogo} alt="NLUPC Logo" className="h-10 w-10" />
                                </div>
                                <div className="hidden lg:block">
                                    <h1 className="font-semibold text-primary">Tanzania MapShop</h1>
                                    <p className="text-sm text-muted-foreground">
                                        {location.pathname === '/mapshop' ? 'Official Land Use Maps & Shapefiles' : 'Customer Dashboard'}
                                    </p>
                                </div>
                            </div>
                        </div>


                        <div className="flex items-center gap-3">

                            <ThemeTogglePopover />

                            {/* User Status Indicator */}
                            {!user ? (
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-muted-foreground hidden lg:flex">
                                        <User className="h-3 w-3 mr-1" />
                                        Guest Mode
                                    </Badge>
                                    <Link to="/signin" className={cn(buttonVariants(), "gap-2")}>
                                        <LogIn className="h-4 w-4 hidden lg:block" />
                                        Login<span className="sr-only lg:not-sr-only"> for Full Access</span>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {location.pathname === '/mapshop' ? (
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-green-100 dark:bg-green-800/20 text-green-800 border-green-200 dark:border-green-800  hidden lg:flex">
                                                <User className="h-3 w-3 mr-1" />
                                                Buyer Account
                                            </Badge>
                                            <Link to="/portal" className={cn(buttonVariants({ variant: 'outline' }))}>
                                                My Account
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="text-right hidden md:block">
                                                <div className="text-sm font-medium">{user?.first_name} {user?.last_name}</div>
                                                <div className="text-xs text-muted-foreground">{user?.email}</div>
                                            </div>
                                            <LogoutButton />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Outlet />

        </div>
    )
}