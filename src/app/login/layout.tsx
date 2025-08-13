import { Outlet } from "react-router";

export default function Layout() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/20 flex items-start lg:items-center justify-center p-4">
            <Outlet />
        </div>
    )
}