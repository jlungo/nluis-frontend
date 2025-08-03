import { Outlet } from "react-router";

export default function Layout() {
    return (
        <div className="bg-background min-h-screen">
            <Outlet />
        </div>
    )
}