import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner"

export default function Layout() {
    return (
        <>
            <div className="bg-background min-h-screen">
                <Outlet />
            </div>
            <Toaster />
        </>
    )
}