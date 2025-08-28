import { MainHeader } from "@/components/MainHeader";
import { useAuth } from "@/store/auth";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export default function Layout() {
    const { user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) navigate(`/auth/signin`, { replace: true })
        else if (!user?.modules || !Array.isArray(user?.modules) || user?.modules?.length === 0) navigate(`/portal`, { replace: true })
    }, [navigate, user])

    if (!user || !user?.modules || !Array.isArray(user?.modules) || user?.modules?.length === 0) return null
    return (
        <div className="min-h-screen bg-gradient-to-b dark:from-background from-primary/5 dark:to-background to-primary/10">
            <MainHeader showLogo />
            <div className="xl:container mx-auto px-4 py-8">
                <Outlet />
            </div>
        </div>
    )
}