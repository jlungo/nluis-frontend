import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner"
import ReactQueryContext from "@/context/react-query";

export default function Layout() {
    return (
        <ReactQueryContext>
            <div className="bg-background min-h-screen">
                <Outlet />
            </div>
            <Toaster />
        </ReactQueryContext>
    )
}