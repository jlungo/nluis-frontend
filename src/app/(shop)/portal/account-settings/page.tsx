import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Settings } from "lucide-react";
import { buyerInfo } from "../mock";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
                            <Label className="text-sm">First Name</Label>
                            <Input readOnly value={buyerInfo.firstName} className="mt-1 bg-muted cursor-default" />
                        </div>
                        <div>
                            <Label className="text-sm">Last Name</Label>
                            <Input readOnly value={buyerInfo.lastName} className="mt-1 bg-muted cursor-default" />
                        </div>
                        <div>
                            <Label className="text-sm">Email Address</Label>
                            <Input readOnly value={buyerInfo.email} className="mt-1 bg-muted cursor-default" />
                        </div>
                        <div>
                            <Label className="text-sm">Phone Number</Label>
                            <Input readOnly value={buyerInfo.phone} className="mt-1 bg-muted cursor-default" />
                        </div>
                        {buyerInfo.organization && (
                            <div className="md:col-span-2">
                                <Label className="text-sm">Organization</Label>
                                <Input readOnly value={buyerInfo.organization} className="mt-1 bg-muted cursor-default" />
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