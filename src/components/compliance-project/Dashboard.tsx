import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState } from "react";
import { LocalityProjects } from "../project-chart/locality-projects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectChart, { type TabProps } from "@/components/project-chart";
import type { ModuleTypes } from "@/types/modules";
import { useDataStore } from "../project-chart/useDataStore";

const landUseTabs: TabProps[] = [
    // { value: "", label: "All" },
    { value: "village-land-use-compliance", label: "Village" },
    { value: "district-land-use-compliance", label: "District" },
    { value: "regional-land-use-compliance", label: "Regional" },
    { value: "zonal-land-use-compliance", label: "Zonal" },
    { value: "national-land-use-compliance", label: "National" },
    { value: "ccro-projects-compliance", label: "CCRO Compliance" },
]

export default function Dashboard({ module, title }: { module: ModuleTypes; title: string }) {
    const { setPage } = usePageStore();
    const { clearLocalities } = useDataStore();

    const [tab, setTab] = useState<TabProps>({ value: "village-land-use-compliance", label: "Village" });

    useLayoutEffect(() => {
        // Clear data store when mounting to ensure only compliance data is displayed
        clearLocalities();
        setPage({
            module: "compliance",
            title: title,
        });
    }, [module, setPage, title, clearLocalities]);

    let tabs: TabProps[] = [{ value: "village-land-use-compliance", label: "Village" }]
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
