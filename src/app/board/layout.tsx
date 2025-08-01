import { MainHeader } from "@/components/MainHeader";
import { Outlet } from "react-router";

export default function Layout() {
    return (
        <div className="min-h-screen bg-background">
            <MainHeader />
            <div className="container mx-auto px-4 py-8">
                <Outlet />
            </div>
        </div>
    )
}