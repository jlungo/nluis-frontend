import { usePageStore } from "@/store/pageStore"
import { useLayoutEffect } from "react"
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { useModulesQuery } from "@/queries/useModuleQuery";
import { Spinner } from "@/components/ui/spinner";
import { useQuestionnairesQuery, questionnaireQueryKey, type QuestionnaireProps } from "@/queries/useQuestionnaireQuery";
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
    const [page, setPage] = useState(1)
    const limit = 20;
    const offset = (page - 1) * limit;

    useLayoutEffect(() => {
        PageData({
            module: 'system-settings',
            title: "Questionnaire Management",

        })
    }, [PageData])

    const { mutateAsync } = useMutation({
        mutationFn: (slug: string) => api.delete(
            '/flows/' + slug,
            // TODO add delete questionnaire endpoint
        ),
        onSuccess: () =>
            queryClient.invalidateQueries({
                refetchType: "active",
                queryKey: [questionnaireQueryKey],
            }),
        onError: (e) => {
            console.log(e);
        },
    });

    const { data: questionnaires, isLoading: isLoadingQuestionnaires } = useQuestionnairesQuery(limit, offset, keyword, filterModule, '', '')
    const { data: modules, isLoading: isLoadingModules } = useModulesQuery()

    return (
        <div className="space-y-4">
            {/* Quick Actions Header */}
            <div className="flex justify-between">
                <div>
                    <h1 className="text-xl lg:text-2xl font-semibold">Questionnaire Management</h1>
                    <p className="text-muted-foreground">Create, edit, and manage all your questionnaires</p>
                </div>
                <Link to="/system-settings/form-management/questionnaires/questionnaire-builder" className={cn(buttonVariants({ size: 'sm' }), "gap-2")}>
                    <Plus className="h-4 w-4" />
                    Create<span className="hidden sm:inline"> Questionnaire</span>
                </Link>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full md:w-1/2">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search questionnaire..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="w-full md:w-1/2">
                            <Select
                                value={filterModule}
                                onValueChange={(e) => {
                                    setPage(1)
                                    setFilterModule(() => {
                                        if (e === "all") return ""
                                        else return e
                                    })
                                }}
                            >
                                <SelectTrigger className="w-full lg:w-1/2">
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
                        </div>
                    </div>
                </CardContent>
            </Card>

            <DataTable<QuestionnaireProps, unknown>
                columns={Columns}
                data={questionnaires?.results || []}
                isLoading={isLoadingQuestionnaires}
                showRowNumbers
                enableGlobalFilter={false}
                onRowClick={(e) => navigate(`/system-settings/form-management/questionnaires/${e.slug}`)}
                initialPageSize={10}
                pageSizeOptions={[5, 10, 20, 50]}
                rowActions={(row) => (
                    <ActionButtons
                        entity={row}
                        entityName="Questionnaire"
                        onView={e => navigate(`/system-settings/form-management/questionnaires/${e.slug}`)}
                        onEdit={e => navigate(`/system-settings/form-management/questionnaires/${e.slug}/edit`)}
                        deleteFunction={() => mutateAsync(row.slug)}
                    />
                )}
            />
        </div>
    );
}