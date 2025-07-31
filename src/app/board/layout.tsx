import { Outlet } from "react-router";

export default function Layout() {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <Outlet />
            </div>
        </div>
    )
}