import type { TabProps } from "@/components/project-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectsQuery } from "@/queries/useProjectQuery";
import { useAuth } from "@/store/auth"
import type { ProjectI } from "@/types/projects";
import { useEffect } from "react";
import { useDataStore } from "./useDataStore";

export function LocalityProjects({ tab }: { tab: TabProps }) {
    const { user } = useAuth()

    const { localities, setOffset, setCount, addResponse } = useDataStore()
    const state = localities[tab.value] ?? { res: [], count: 0, offset: 0 };

    const { res, count, offset } = state;

    const { data, isLoading, isError } = useProjectsQuery({
        limit: 20,
        offset: offset,
        organization: user?.organization?.id,
        module_level: tab.value,
        status: '',
        search: '',
        // approval_status: string,
        // registration_date: string,
        // authorization_date: string,
    })

    useEffect(() => {
        if (data) {
            if (data?.count) setCount(tab.value, data.count);
            if (data?.results) {
                const last20 = res.slice(-20);
                const isAlreadyFetched = data.results.every((item: ProjectI) =>
                    last20.some((existingItem) => existingItem.created_at === item.created_at)
                );
                if (!isAlreadyFetched) addResponse(tab.value, data.results);
            }
            if (data?.next && data.next.length > 0) setOffset(tab.value, offset + 20);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offset, data])

    if (isError)
        return (
            <Card className="py-4 md:py-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 md:px-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Failed to fetch</CardTitle>
                </CardHeader>
                <CardContent className="px-4 md:px-4">
                    <div className="text-2xl font-semibold opacity-75 text-destructive">Error</div>
                </CardContent>
            </Card>
        )

    if (count === 0 && isLoading)
        return (
            <Card className="py-4 md:py-4 animate-pulse bg-muted dark:bg-input/30 border-border/30 dark:border-input/30 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 md:px-4">
                    <CardTitle className="text-sm font-medium text-muted-foreground opacity-0">.</CardTitle>
                </CardHeader>
                <CardContent className="px-4 md:px-4">
                    <div className="text-2xl font-semibold opacity-0">0</div>
                </CardContent>
            </Card>
        )

    return (
        <Card className="py-4 md:py-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 md:px-4">
                <CardTitle className="text-sm font-medium text-muted-foreground">{tab.label} Projects</CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-4">
                <div className="text-2xl font-semibold">{count === 0 && isLoading ? "" : count}</div>
            </CardContent>
        </Card>
    )
}
