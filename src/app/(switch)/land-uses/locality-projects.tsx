import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectsQuery } from "@/queries/useProjectQuery";
import { useAuth } from "@/store/auth"
import type { ProjectI } from "@/types/projects";
import { useEffect } from "react";
import { create } from "zustand";

interface LocalityState {
    count: number;
    res: ProjectI[];
    offset: number;
}

interface ActionsProps {
    localities: Record<string, LocalityState>;
    setCount: (level: string, count: number) => void;
    addResponse: (level: string, res: ProjectI[]) => void;
    setOffset: (level: string, offset: number) => void;
}

const useDataStore = create<ActionsProps>()((set) => ({
    localities: {},
    setCount: (level, count) =>
        set((state) => ({
            localities: {
                ...state.localities,
                [level]: { ...(state.localities[level] ?? { res: [], offset: 0 }), count },
            },
        })),
    addResponse: (level, res) =>
        set((state) => {
            const prev = state.localities[level] ?? { res: [], offset: 0, count: 0 };
            return {
                localities: {
                    ...state.localities,
                    [level]: { ...prev, res: [...prev.res, ...res] },
                },
            };
        }),
    setOffset: (level, offset) =>
        set((state) => {
            const prev = state.localities[level] ?? { res: [], count: 0, offset: 0 };
            return {
                localities: {
                    ...state.localities,
                    [level]: { ...prev, offset },
                },
            };
        }),
}));

type Props = {
    localityLevel: string;
    title: string;
}

export function LocalityProjects({ localityLevel, title }: Props) {
    const { user } = useAuth()

    const { localities, setOffset, setCount, addResponse } = useDataStore()
    const state = localities[localityLevel] ?? { res: [], count: 0, offset: 0 };

    const { res, count, offset } = state;

    const { data, isLoading, isError } = useProjectsQuery({
        limit: 20,
        offset: offset,
        organization: user?.organization?.id,
        module_level: localityLevel,
        status: '',
        search: '',
        // approval_status: string,
        // registration_date: string,
        // authorization_date: string,
    })

    useEffect(() => {
        if (data) {
            if (data?.count) setCount(localityLevel, data.count);
            if (data?.results) {
                const last20 = res.slice(-20);
                const isAlreadyFetched = data.results.every((item: ProjectI) =>
                    last20.some((existingItem) => existingItem.created_at === item.created_at)
                );
                if (!isAlreadyFetched) addResponse(localityLevel, data.results);
            }
            if (data?.next && data.next.length > 0) setOffset(localityLevel, offset + 20);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offset, data])

    if (isError)
        return (
            <div className='flex flex-col items-center justify-center h-60'>
                <p className="text-muted-foreground mt-4">Error loading projects</p>
            </div>
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
                <CardTitle className="text-sm font-medium text-muted-foreground">{title} Projects</CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-4">
                <div className="text-2xl font-semibold">{count === 0 && isLoading ? "" : count}</div>
            </CardContent>
        </Card>
    )
}
