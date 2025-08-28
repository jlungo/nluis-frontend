import { Button, buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield } from "lucide-react";
import nlupcLogo from "@/assets/nluis.png";
import tanzaniaCoatOfArms from "@/assets/bibi_na_bwana.png";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "@/store/auth";
import { cn } from "@/lib/utils";
import { Outlet } from "react-router";

export default function Layout() {
    const navigate = useNavigate();
    const { loading, user } = useAuth()

    const onCancel = () => {
        navigate('/', { replace: true })
    };

    if (user) return null
    return (
        <div className="w-full h-full max-w-lg flex flex-col justify-between">

            {/* Official Header */}
            <div className="text-center mb-8 h-fit">
                <div className="flex justify-center items-center gap-4 mb-6">
                    <img
                        src={nlupcLogo}
                        alt="NLUPC Logo"
                        className="h-32 w-32 object-contain"
                    />
                </div>

                <Badge
                    variant="outline"
                    className="text-primary border-primary/30 bg-primary/10 px-4 py-2 mb-4"
                >
                    <Shield className="h-4 w-4 mr-2" />
                    Official Government System
                </Badge>

                <h1 className="text-2xl font-bold text-foreground mb-2">
                    NLUIS Login Portal
                </h1>
                {/* <p className="text-muted-foreground">
                    Access your account to purchase official land use maps
                    <br />
                    or continue as guest to browse our catalog
                </p> */}
            </div>

            <Card className="border-primary/10 shadow-lg">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="flex items-center justify-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        System Login
                    </CardTitle>
                    <CardDescription>
                        Enter your official credentials to access the NLUIS platform
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div data-slot="tabs" className="flex flex-col gap-2 w-full">
                        <div
                            data-slot="tabs-list"
                            className="bg-accent text-accent-foreground h-9 items-center justify-center p-[3px] grid w-full grid-cols-2 rounded-full mb-2"
                        >
                            <NavLink
                                to="/auth/signin"
                                end
                                data-slot="tabs-trigger"
                                className={({ isActive, isPending }) => cn(buttonVariants({ size: 'sm', variant: isActive ? 'default' : 'ghost' }), `${isPending ? 'animate-pulse' : null}`, isActive && "bg-white dark:bg-primary text-foreground hover:bg-white dark:hover:bg-primary", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-full border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 dark:text-white/80")}
                            >
                                Login
                            </NavLink>
                            <NavLink
                                to="/auth/signup"
                                end
                                data-slot="tabs-trigger"
                                className={({ isActive, isPending }) => cn(buttonVariants({ size: 'sm', variant: isActive ? 'default' : 'ghost' }), `${isPending ? 'animate-pulse' : null}`, isActive && "bg-white dark:bg-primary text-foreground hover:bg-white dark:hover:bg-primary", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-full border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 dark:text-white/80")}
                            >
                                Register
                            </NavLink>
                        </div>

                        <Outlet />
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 mt-4 pt-4 border-t border-border">
                        <Button
                            onClick={onCancel}
                            variant="outline"
                            className="w-full gap-2"
                            disabled={loading}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Government Footer */}
            <div className="text-center mt-8 space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <img src={tanzaniaCoatOfArms} alt="Tanzania" className="h-4 w-4" />
                    <span>Official Government MapShop</span>
                </div>
                <p className="text-xs text-muted-foreground">
                    Ministry of Lands, Housing and Human Settlements Development
                </p>
            </div>
        </div>
    )
}