import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState } from "react";
import { LocalityProjects } from "../project-chart/locality-projects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectChart, { type TabProps } from "@/components/project-chart";
import type { ModuleTypes } from "@/types/modules";

const landUseTabs: TabProps[] = [
    { value: "", label: "All" },
    { value: "village-land-use", label: "Village" },
    { value: "district-land-use", label: "District" },
    { value: "regional-land-use", label: "Regional" },
    { value: "zonal-land-use", label: "Zonal" },
    { value: "national-land-use", label: "National" },
]

export default function Dashboard({ module, title }: { module: ModuleTypes; title: string }) {
    const { setPage } = usePageStore();

    const [tab, setTab] = useState<TabProps>({ value: "", label: "All" });

    useLayoutEffect(() => {
        setPage({
            module: module,
            title: title,
        });
    }, [module, setPage, title]);

    let tabs: TabProps[] = [{ value: "", label: "All" }]
    if (module === "land-uses") tabs = landUseTabs

    return (
        <div className="space-y-4 2xl:space-y-6 mb-20">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-4">
                {tabs.map(tab => <LocalityProjects key={tab.value} tab={tab} />)}
            </div>

            <Tabs
                value={tab.value}
                onValueChange={e => setTab(tabs.find(t => t.value === e) ?? tabs[0])}
                className="w-full"
            >
                <TabsList className="rounded-full w-full">
                    {tabs.map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="rounded-full text-xs md:text-sm lg:text-xs xl:text-sm"
                        >
                            {tab.label}<span className="hidden lg:inline"> Projects</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
                <TabsContent value={tab.value}>
                    <ProjectChart tab={tab} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
