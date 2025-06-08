import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, NavLink, Outlet } from 'react-router';
import { buyerInfo, mockPurchaseHistory } from './mock';

export default function Layout() {
    const activeViewAccess = mockPurchaseHistory.filter(p => p.purchaseType === 'view-access' && p.status === 'active').length;
    const activePrintRights = mockPurchaseHistory.filter(p => p.purchaseType === 'print-rights' && p.status === 'active').length;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <Card className='lg:sticky lg:top-[6.8rem]'>
                        <CardHeader className="text-center pb-4">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-lg">{buyerInfo.firstName} {buyerInfo.lastName}</CardTitle>
                            <CardDescription>{buyerInfo.organization || 'Individual Customer'}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="font-semibold text-lg text-primary">{buyerInfo.totalPurchases}</div>
                                    <div className="text-xs text-muted-foreground">Total Orders</div>
                                </div>
                                <div>
                                    <div className="font-semibold text-lg text-primary">TZS {buyerInfo.totalSpent.toLocaleString()}</div>
                                    <div className="text-xs text-muted-foreground">Total Spent</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center pt-2">
                                <div>
                                    <div className="font-semibold text-sm text-chart-2">{activeViewAccess}</div>
                                    <div className="text-xs text-muted-foreground">View Access</div>
                                </div>
                                <div>
                                    <div className="font-semibold text-sm text-chart-3">{activePrintRights}</div>
                                    <div className="text-xs text-muted-foreground">Print Rights</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border">
                                <div className="text-xs text-muted-foreground">Member Since</div>
                                <div className="text-sm font-medium">{new Date(buyerInfo.joinDate).toLocaleDateString()}</div>
                            </div>

                            {/* Quick Actions */}
                            <div className="pt-4 border-t border-border">
                                <Link
                                    to='/mapshop'
                                    className={cn(buttonVariants({ variant: 'outline' }), "w-full gap-2")}
                                >
                                    <Store className="h-4 w-4" />
                                    Browse All Maps
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div data-slot="tabs" className="flex flex-col gap-2 w-full">
                        <div className='sticky top-[4rem] lg:top-[4.8rem] -mt-6 lg:-mt-8 bg-background h-14 lg:h-[4.2rem] flex items-end px-1 -mx-1 rounded-b-2xl'>
                            <div
                                data-slot="tabs-list"
                                className="bg-accent shadow text-accent-foreground h-9 items-center justify-center rounded-full p-[3px] grid w-full grid-cols-4">
                                <NavLink
                                    to="/portal"
                                    end
                                    data-slot="tabs-trigger"
                                    className={({ isActive, isPending }) => cn(buttonVariants({ size: 'sm', variant: isActive ? 'default' : 'ghost' }), `${isPending ? 'animate-pulse' : null}`, "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-full border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 dark:text-white/80")}
                                >
                                    Overview
                                </NavLink>
                                <NavLink
                                    to="/portal/browse-maps"
                                    end
                                    data-slot="tabs-trigger"
                                    className={({ isActive, isPending }) => cn(buttonVariants({ size: 'sm', variant: isActive ? 'default' : 'ghost' }), `${isPending ? 'animate-pulse' : null}`, "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-full border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 dark:text-white/80")}
                                >
                                    Browse<span className='sr-only md:not-sr-only'> Maps</span>
                                </NavLink>
                                <NavLink
                                    to="/portal/my-maps"
                                    end
                                    data-slot="tabs-trigger"
                                    className={({ isActive, isPending }) => cn(buttonVariants({ size: 'sm', variant: isActive ? 'default' : 'ghost' }), `${isPending ? 'animate-pulse' : null}`, "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-full border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 dark:text-white/80")}
                                >
                                    My Maps
                                </NavLink>
                                <NavLink
                                    to="/portal/account-settings"
                                    end
                                    data-slot="tabs-trigger"
                                    className={({ isActive, isPending }) => cn(buttonVariants({ size: 'sm', variant: isActive ? 'default' : 'ghost' }), `${isPending ? 'animate-pulse' : null}`, "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-full border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 dark:text-white/80")}
                                >
                                    Account<span className='sr-only md:not-sr-only'> Settings</span>
                                </NavLink>
                            </div>
                        </div>

                        <Outlet />

                    </div>
                </div>
            </div>
        </div>
    );
}