import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Settings } from "lucide-react";
import { buyerInfo } from "../mock";

export default function Page() {
    return (
        <div className="flex-1 outline-none space-y-6 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Account Information
                    </CardTitle>
                    <CardDescription>Update your personal and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">First Name</label>
                            <div className="mt-1 p-2 bg-muted rounded border">{buyerInfo.firstName}</div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Last Name</label>
                            <div className="mt-1 p-2 bg-muted rounded border">{buyerInfo.lastName}</div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Email Address</label>
                            <div className="mt-1 p-2 bg-muted rounded border">{buyerInfo.email}</div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Phone Number</label>
                            <div className="mt-1 p-2 bg-muted rounded border">{buyerInfo.phone}</div>
                        </div>
                        {buyerInfo.organization && (
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium">Organization</label>
                                <div className="mt-1 p-2 bg-muted rounded border">{buyerInfo.organization}</div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-border">
                        <Button className="gap-2">
                            <Settings className="h-4 w-4" />
                            Update Account Info
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Methods
                    </CardTitle>
                    <CardDescription>Manage your saved payment methods</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No saved payment methods</p>
                        <Button variant="outline" className="mt-3">
                            Add Payment Method
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}