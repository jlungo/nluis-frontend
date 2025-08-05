import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowLeft, LogIn, User } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import nlupcLogo from '@/assets/nluis.png';
import tanzaniaCoatOfArms from '@/assets/bibi_na_bwana.png';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ThemeTogglePopover } from "@/components/ToggleTheme";

export default function Layout() {
    const userType: 'guest' | 'buyer' = 'guest'
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                {location.pathname === '/mapshop' ? "Back to Home" : "Back to MapShop"}
                            </Button>
                            <div className="h-6 w-px bg-border" />

                            {/* Official Branding */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <img src={tanzaniaCoatOfArms} alt="Tanzania Coat of Arms" className="h-8 w-8" />
                                    <img src={nlupcLogo} alt="NLUPC Logo" className="h-8 w-8" />
                                </div>
                                <div>
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
                            {userType === 'guest' ? (
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-muted-foreground">
                                        <User className="h-3 w-3 mr-1" />
                                        Guest Mode
                                    </Badge>
                                    <Link to="/signin" className={cn(buttonVariants(), "gap-2")}>
                                        <LogIn className="h-4 w-4" />
                                        Login for Full Access
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {location.pathname === '/mapshop' ? (
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-green-100 text-green-800 border-green-200">
                                                <User className="h-3 w-3 mr-1" />
                                                Buyer Account
                                            </Badge>
                                            <Link to="/portal" className={cn(buttonVariants({ variant: 'outline' }))}>
                                                My Account
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                {/* <div className="text-sm font-medium">{buyerInfo.firstName} {buyerInfo.lastName}</div>
                                <div className="text-xs text-muted-foreground">{buyerInfo.email}</div> */}
                                            </div>
                                            <Button variant="outline" onClick={() => navigate('/', { replace: true })} size="sm">
                                                Logout
                                            </Button>
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