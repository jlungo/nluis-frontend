import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useLayoutEffect } from 'react';
import { usePageStore } from '@/store/pageStore';
import { useAuth } from '@/store/auth';
import type { ModuleTypes } from '@/types/modules';
import { moduleTiles } from '@/components/module-tiles';

interface ModuleTile {
    id: ModuleTypes;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

export default function Page() {
    const navigate = useNavigate();
    const { setPage } = usePageStore();
    const { user } = useAuth()

    useLayoutEffect(() => {
        setPage(null)
    }, [setPage])

    // Filter modules based on user role
    const visibleModules: ModuleTile[] = moduleTiles.filter(module => {
        if (user?.modules) {
            // TODO: Remove 'management-evaluation' check after backend user module slugs are updated.
            if (module.id === 'monitoring-and-evaluation') {
                return user.modules.some(userModule =>
                    userModule.slug === 'monitoring-and-evaluation' || userModule.slug === 'management-evaluation'
                );
            }
            return user.modules.some(userModule => userModule.slug === module.id);
        }
        return false;
    });

    if (!user) {
        navigate('/', { replace: true })
        return null
    }
    if (!user.modules || !Array.isArray(user?.modules) || user?.modules?.length < 1) {
        navigate('/mapshop', { replace: true })
        return null
    }
    return (
        <div className="space-y-8 min-h-[calc(100vh-120px)] flex flex-col">
            {/* Module Tiles Grid */}
            <main className="space-y-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-foreground mb-2">Available Modules</h2>
                    <p className="text-muted-foreground">Click on any module to access its dedicated workspace</p>
                </div>

                <div className="flex flex-wrap justify-center gap-4 md:gap-6 md:w-fit max-w-[1500px] mx-auto">
                    {visibleModules.map((module) => (
                        <TooltipProvider key={module.id}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Card
                                        className="border w-full mx-auto sm:w-fit sm:min-w-[25rem] md:min-w-[22.25rem] lg:min-w-[25rem] xl:min-w-[22rem] group shadow-none hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 hover:border-primary/20"
                                        onClick={() => navigate(`/${module.id}`)}
                                    >
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className={`p-3 rounded-lg ${module.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                                                    <div className={module.color}>
                                                        {module.icon}
                                                    </div>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                                            </div>
                                            <div className="space-y-2">
                                                <CardTitle className="text-lg font-normal group-hover:text-primary transition-colors duration-300">
                                                    {module.title}
                                                </CardTitle>
                                                <CardDescription className="text-sm leading-relaxed">
                                                    {module.description}
                                                </CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0 mt-auto">
                                            <div className="flex items-center justify-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-xs text-primary group-hover:text-primary hover:text-primary group-hover:bg-primary/10 hover:bg-primary/20 hover:dark:bg-primary/20 w-full"
                                                >
                                                    Access Module
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                    <div className="text-center space-y-2">
                                        <p className="font-medium text-white">{module.title}</p>
                                        <p className="text-sm text-white/70">{module.description}</p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            </main>

            {/* Role Information */}
            <footer className="text-center mt-auto mb-0">
                <p className="text-sm text-muted-foreground">
                    Logged in as: <span className="font-medium capitalize">
                        {user?.role?.name}
                    </span> •{" "}
                    {user?.modules?.length} of {moduleTiles.length} modules available
                </p>
            </footer>
        </div>
    );
}