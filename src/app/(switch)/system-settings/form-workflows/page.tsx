import { usePageStore } from "@/store/pageStore"
import { useLayoutEffect } from "react"
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { useLevelsQuery } from "@/queries/useLevelQuery";
import { useModulesQuery } from "@/queries/useModuleQuery";
import { Spinner } from "@/components/ui/spinner";
import { useWorkflowsQuery, workflowQueryKey, type WorkflowProps } from "@/queries/useWorkflowQuery";
import { Link, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/DataTable";
import ActionButtons from "@/components/ActionButtons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Columns } from "./columns";

export default function Page() {
    const { setPage: PageData } = usePageStore()
    const queryClient = useQueryClient()
    const navigate = useNavigate()

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

        })
    }, [PageData])

    const { mutateAsync } = useMutation({
        mutationFn: (slug: string) => api.delete(`/form-management/workflows/${slug}/delete/`),
        onSuccess: () =>
            queryClient.invalidateQueries({
                refetchType: "active",
                queryKey: [workflowQueryKey],
            }),
        onError: (e) => {
            console.log(e);
        },
    });

    const { data: workflows, isLoading: isLoadingWorkflows } = useWorkflowsQuery(limit, offset, keyword, filterModule, filterLevel, '')
    const { data: levels, isLoading: isLoadingLevels } = useLevelsQuery(1000, 0, '', '')
    const { data: modules, isLoading: isLoadingModules } = useModulesQuery()

    return (
        <div className="space-y-4">
            {/* Quick Actions Header */}
            <div className="flex justify-between">
                <div>
                    <h1 className="text-xl lg:text-2xl font-semibold">Form Workflows Management</h1>
                    <p className="text-muted-foreground">Create, edit, and manage all your forms</p>
                </div>
                <Link to="/system-settings/form-workflows/workflow-builder" className={cn(buttonVariants({ size: 'sm' }), "gap-2")}>
                    <Plus className="h-4 w-4" />
                    Create<span className="hidden sm:inline"> Workflow</span>
                </Link>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full md:w-1/2 lg:w-1/3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search workflow..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="pl-10"
                            />
                        </div>
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
                            <SelectTrigger className="w-full md:w-1/4 lg:w-1/3">
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
                            <SelectTrigger className="w-full md:w-1/4 lg:w-1/3">
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
                </CardContent>
            </Card>

            <DataTable<WorkflowProps, unknown>
                columns={Columns}
                data={workflows?.results || []}
                isLoading={isLoadingWorkflows}
                showRowNumbers
                enableGlobalFilter={false}
                onRowClick={(e) => navigate(`/system-settings/form-workflows/${e.slug}`)}
                initialPageSize={10}
                pageSizeOptions={[5, 10, 20, 50]}
                rowActions={(row) => (
                    <ActionButtons
                        entity={row}
                        entityName="Form Workflow"
                        onView={e => navigate(`/system-settings/form-workflows/${e.slug}`)}
                        onEdit={e => navigate(`/system-settings/form-workflows/${e.slug}/edit`)}
                        deleteFunction={() => mutateAsync(row.slug)}
                    />
                )}
            />
        </div>
    );
}