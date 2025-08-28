import { useAuth } from "@/store/auth";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export default function Layout() {
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            if (user?.modules && Array.isArray(user.modules) && user.modules.length > 1)
                navigate("/board", { replace: true });
            else if (user?.modules && Array.isArray(user.modules) && user.modules.length === 1)
                navigate(`/${user.modules[0].slug}`, { replace: true });
            else
                navigate(`/portal`, { replace: true });
        }
    }, [navigate, user])

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center p-4">
            <Outlet />
        </div>
    )
}