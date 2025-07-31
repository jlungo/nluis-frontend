import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    MapIcon,
    Shield,
    BarChart3,
    AlertTriangle,
    FileText,
    Users,
    Settings,
    Activity,
    ArrowRight,
    Home
} from 'lucide-react';

interface ModuleTile {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    roles: string[];
    color: string;
    bgColor: string;
}

export default function Page() {
    const userRole = "admin"

    const modules: ModuleTile[] = [
        {
            id: 'dashboard',
            title: 'System Dashboard',
            description: 'Overview and monitoring across all system modules',
            icon: <Home className="h-8 w-8" />,
            roles: ['admin', 'manager', 'planner', 'land-officer', 'compliance-officer', 'legal-officer'],
            color: 'text-primary',
            bgColor: 'bg-primary/10'
        },
        {
            id: 'land-use',
            title: 'Land Use Planning',
            description: 'Village, regional, and district land use management',
            icon: <MapIcon className="h-8 w-8" />,
            roles: ['admin', 'planner', 'land-officer'],
            color: 'text-chart-2',
            bgColor: 'bg-chart-2/10'
        },
        {
            id: 'ccro-management',
            title: 'CCRO Management',
            description: 'Certificate of Customary Right of Occupancy',
            icon: <Shield className="h-8 w-8" />,
            roles: ['admin', 'legal-officer', 'land-officer'],
            color: 'text-chart-4',
            bgColor: 'bg-chart-4/10'
        },
        {
            id: 'compliance',
            title: 'Compliance Monitoring',
            description: 'Environmental and regulatory compliance tracking',
            icon: <AlertTriangle className="h-8 w-8" />,
            roles: ['admin', 'compliance-officer', 'environmental-officer'],
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10'
        },
        {
            id: 'management-evaluation',
            title: 'Management & Evaluation',
            description: 'Project monitoring, evaluation, and reporting',
            icon: <BarChart3 className="h-8 w-8" />,
            roles: ['admin', 'manager', 'evaluator'],
            color: 'text-progress-completed',
            bgColor: 'bg-progress-completed/10'
        },
        {
            id: 'reports',
            title: 'Reports & Analytics',
            description: 'Comprehensive reporting and data analytics',
            icon: <FileText className="h-8 w-8" />,
            roles: ['admin', 'manager', 'analyst'],
            color: 'text-chart-2',
            bgColor: 'bg-chart-2/10'
        },
        {
            id: 'user-management',
            title: 'User Management',
            description: 'User accounts, roles, and permissions',
            icon: <Users className="h-8 w-8" />,
            roles: ['admin'],
            color: 'text-chart-3',
            bgColor: 'bg-chart-3/10'
        },
        {
            id: 'system-settings',
            title: 'System Administration',
            description: 'System configuration and maintenance',
            icon: <Settings className="h-8 w-8" />,
            roles: ['admin', 'system-admin'],
            color: 'text-muted-foreground',
            bgColor: 'bg-muted/20'
        },
        {
            id: 'audit-trail',
            title: 'Audit & Activity',
            description: 'System audit logs and user activity tracking',
            icon: <Activity className="h-8 w-8" />,
            roles: ['admin', 'auditor'],
            color: 'text-chart-5',
            bgColor: 'bg-chart-5/10'
        }
    ];

    // Filter modules based on user role
    const visibleModules = modules.filter(module =>
        module.roles.includes(userRole) || userRole === 'admin'
    );

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <header className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                        <Home className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <h1 className="text-3xl font-semibold text-foreground">Tanzania NLUIS</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    National Land Use Information System - Select a module to begin working with land use planning and management tools
                </p>
            </header>

            {/* Module Tiles Grid */}
            <main className="space-y-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-foreground mb-2">Available Modules</h2>
                    <p className="text-muted-foreground">Click on any module to access its dedicated workspace</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {visibleModules.map((module) => (
                        <TooltipProvider key={module.id}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Card
                                        className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 border-2 hover:border-primary/20"
                                    // onClick={() => onModuleSelect(module.id)}
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
                                                <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
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
                                                    className="text-xs text-primary group-hover:text-primary hover:text-primary group-hover:bg-primary/10 hover:bg-primary/20 w-full"
                                                >
                                                    Access Module
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                    <div className="text-center">
                                        <p className="font-medium">{module.title}</p>
                                        <p className="text-sm text-muted-foreground">{module.description}</p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ))}
                </div>
            </main>

            {/* Role Information */}
            <footer className="text-center mt-8">
                <p className="text-sm text-muted-foreground">
                    Logged in as: <span className="font-medium capitalize">
                        {/* {userRole.replace('-', ' ')} */}Admin
                    </span> •
                    {visibleModules.length} of {modules.length} modules available
                </p>
            </footer>
        </div>
    );
}