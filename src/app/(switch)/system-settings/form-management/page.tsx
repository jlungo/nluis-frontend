import { usePageStore } from "@/store/pageStore"
import { useLayoutEffect } from "react"
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Plus,
    Search,
    Edit,
    FileText,
    Eye,
    Delete
} from 'lucide-react';
import { useLevelsQuery } from "@/queries/useLevelQuery";
import { useModulesQuery } from "@/queries/useModuleQuery";
import { Spinner } from "@/components/ui/spinner";
import { useWorkflowsQuery } from "@/queries/useWorkflowQuery";
import { Link } from "react-router";
import { cn } from "@/lib/utils";

export default function Page() {
    const { setPage: PageData } = usePageStore()

    const [activeTab, setActiveTab] = useState('');
    const [keyword, setKeyword] = useState('');
    const [filterModule, setFilterModule] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [page, setPage] = useState(1)
    const limit = 20;
    const offset = (page - 1) * limit;

    useLayoutEffect(() => {
        PageData({
            module: 'system-settings',
            title: "Form Workflows",
            backButton: 'Modules'
        })
    }, [PageData])

    const { data: workflows, isLoading: isLoadingWorkflows } = useWorkflowsQuery(limit, offset, keyword, filterModule, filterLevel, activeTab)
    const { data: levels, isLoading: isLoadingLevels } = useLevelsQuery(1000, 0, '', '')
    const { data: modules, isLoading: isLoadingModules } = useModulesQuery()

    return (
        <div className="space-y-6">
            {/* Quick Actions Header */}
            <div className="flex justify-between">
                <div>
                    <h1 className="text-xl lg:text-2xl font-semibold">Form Workflows Management</h1>
                    <p className="text-muted-foreground">Create, edit, and manage all your forms</p>
                </div>
                <Link to="/system-settings/form-management/workflow-builder" className={cn(buttonVariants({ size: 'sm' }), "gap-2")}>
                    <Plus className="h-4 w-4" />
                    Create<span className="hidden sm:inline"> Workflow</span>
                </Link>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full lg:w-1/2 2xl:w-1/3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search workflow..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-1/2 2xl:w-2/3">
                            <Select
                                value={filterModule}
                                onValueChange={(e) => {
                                    setPage(1)
                                    setFilterLevel("")
                                    setFilterModule(() => {
                                        if (e === "all") return ""
                                        else return e
                                    })
                                }}
                            >
                                <SelectTrigger className="w-full lg:w-48">
                                    <SelectValue placeholder="All Modules" />
                                </SelectTrigger>
                                <SelectContent>
                                    {modules && modules.length > 0 ? (
                                        <>
                                            <SelectItem value="all">All Modules</SelectItem>
                                            {modules.map((module) => (
                                                <SelectItem key={module.slug} value={module.slug}>
                                                    {module.name}
                                                </SelectItem>
                                            ))}
                                        </>
                                    ) : (
                                        <div className="h-24 flex items-center justify-center">
                                            {isLoadingModules ? (
                                                <Spinner />
                                            ) : (<p className="text-muted-foreground text-sm text-center">No modules found!</p>)}
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filterLevel}
                                onValueChange={(e) => {
                                    setPage(1)
                                    setFilterLevel(() => {
                                        if (e === "all") return ""
                                        else return e
                                    })
                                }}
                                disabled={!filterModule || filterModule === "all" || filterModule === ""}
                            >
                                <SelectTrigger className="w-full lg:w-48">
                                    <SelectValue placeholder="Module Level" />
                                </SelectTrigger>
                                <SelectContent>
                                    {levels && levels?.results && levels.results.length > 0 && levels.results.filter(l => l.module_slug === filterModule).length > 0 ? (
                                        <>
                                            <SelectItem value="all">All Levels</SelectItem>
                                            {levels.results
                                                .filter(l => l.module_slug === filterModule)
                                                .map(l => (
                                                    <SelectItem key={l.slug} value={String(l.slug)}>
                                                        {l.name}
                                                    </SelectItem>
                                                ))}
                                        </>
                                    ) : (
                                        <div className="h-24 flex items-center justify-center">
                                            {isLoadingLevels ? (
                                                <Spinner />
                                            ) : (<p className="text-muted-foreground text-sm text-center">No levels found!</p>)}
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Form Tabs and List */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 rounded-full mb-4">
                    <TabsTrigger value="" className="rounded-full cursor-pointer">All Forms</TabsTrigger>
                    <TabsTrigger value="1" className="rounded-full cursor-pointer">Active</TabsTrigger>
                    <TabsTrigger value="0" className="rounded-full cursor-pointer">Inactive</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                    {isLoadingWorkflows ? (
                        <Card>
                            <CardContent className="h-68 text-center flex flex-col items-center justify-center">
                                <Spinner />
                                <p className="text-muted-foreground mt-4">Loading workflows...</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {workflows && workflows?.results && workflows.results.length === 0 ? (
                                <Card>
                                    <CardContent className="p-12 text-center">
                                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">No form workflows found</h3>
                                        <p className="text-muted-foreground mb-4">
                                            {keyword || filterLevel.length > 0 || filterModule.length > 0 ? 'Try adjusting your search criteria' : 'Get started by creating your first workflow'}
                                        </p>
                                        <Link
                                            to="/system-settings/form-management/workflow-builder"
                                            className={cn(buttonVariants(), "gap-2")}
                                        >
                                            <Plus className="h-4 w-4" />
                                            Create Your First Form
                                        </Link>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {workflows?.results && workflows.results.map((workflow) => (
                                        <Card key={workflow.slug} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                                            <FileText className="h-6 w-6" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <h3 className="font-medium">{workflow.name}</h3>
                                                                {/* <Badge
                                                                    variant="outline"
                                                                    className={`text-xs ${getStatusColor(workflow.)}`}
                                                                >
                                                                    {workflow.status}
                                                                </Badge>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {workflow.type === 'advanced' ? 'Advanced' : 'Simple'}
                                                                </Badge> */}
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                <span>{workflow.module_name}</span>
                                                                <span>•</span>
                                                                <span>{workflow.sections_count} sections</span>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-1">
                                                                    {/* <Clock className="h-3 w-3" />
                                                                    {new Date(workflow.lastModified).toLocaleDateString()} */}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            // onClick={() => handleViewForm(form.id)}
                                                            className="gap-2"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Preview
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            // onClick={() => handleEditForm(form.id)}
                                                            className="gap-2"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            // onClick={() => handleEditForm(form.id)}
                                                            className="gap-2"
                                                        >
                                                            <Delete className="h-4 w-4" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}