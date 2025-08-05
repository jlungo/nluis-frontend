import { MainHeader } from "@/components/MainHeader";
import { Outlet } from "react-router";

export default function Layout() {
    return (
        <div className="min-h-screen bg-gradient-to-b dark:from-background from-primary/5 dark:to-background to-primary/10">
            <MainHeader />
            <div className="container mx-auto px-4 py-8">
                <Outlet />
            </div>
        </div>
    )
}