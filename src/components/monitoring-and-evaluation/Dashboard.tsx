import { usePageStore } from "@/store/pageStore";
import { useLayoutEffect, useState } from "react";
import { LocalityProjects } from "../project-chart/locality-projects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProjectChart, { type TabProps } from "@/components/project-chart";
import type { ModuleTypes } from "@/types/modules";
import { useDataStore } from "../project-chart/useDataStore";
import SatelliteChangeDetection from "./SatelliteChangeDetection";
import BeforeAfterAnalysis from "./BeforeAfterAnalysis";
import ProjectionAnalysis from "./ProjectionAnalysis";
import RealTimeMap from "./RealTimeMap";

const landUseTabs: TabProps[] = [
    // { value: "", label: "All" },
    { value: "village-land-use-mne", label: "Village" },
    { value: "district-land-use-mne", label: "District" },
    { value: "regional-land-use-mne", label: "Regional" },
    { value: "zonal-land-use-mne", label: "Zonal" },
    { value: "national-land-use-mne", label: "National" },
    { value: "ccro-projects-mne", label: "CCRO M&E" },
]

export default function Dashboard({ module, title }: { module: ModuleTypes; title: string }) {
    const { setPage } = usePageStore();
    const { clearLocalities } = useDataStore();

    const [tab, setTab] = useState<string>("village-land-use-mne");

    useLayoutEffect(() => {
        // Clear data store when mounting to ensure only M&E data is displayed
        clearLocalities();
        setPage({
            module: "monitoring-and-evaluation",
            title: title,
        });
    }, [module, setPage, title, clearLocalities]);

    let tabs: TabProps[] = [{ value: "village-land-use-mne", label: "Village" }]
    if (module === "land-uses") tabs = landUseTabs

    return (
        <div className="space-y-4 2xl:space-y-6 mb-20">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-4">
                {tabs.map(tab => <LocalityProjects key={tab.value} tab={tab} />)}
            </div>

            <Tabs
                value={tab}
                onValueChange={setTab}
                className="w-full"
            >
                <TabsList className="rounded-full w-full flex-wrap h-auto p-1">
                    {tabs.map(t => (
                        <TabsTrigger
                            key={t.value}
                            value={t.value}
                            className="rounded-full text-xs md:text-sm lg:text-xs xl:text-sm"
                        >
                            {t.label}<span className="hidden lg:inline"> Projects</span>
                        </TabsTrigger>
                    ))}
                    <TabsTrigger value="satellite-analysis" className="rounded-full text-xs md:text-sm lg:text-xs xl:text-sm">
                        Satellite Analysis
                    </TabsTrigger>
                    <TabsTrigger value="impact-analysis" className="rounded-full text-xs md:text-sm lg:text-xs xl:text-sm">
                        Impact Analysis
                    </TabsTrigger>
                    <TabsTrigger value="real-time-map" className="rounded-full text-xs md:text-sm lg:text-xs xl:text-sm">
                        Real-time Map
                    </TabsTrigger>
                </TabsList>

                {tabs.map(t => (
                    <TabsContent key={t.value} value={t.value}>
                        <ProjectChart tab={t} />
                    </TabsContent>
                ))}

                <TabsContent value="satellite-analysis" className="space-y-4">
                    <SatelliteChangeDetection />
                </TabsContent>

                <TabsContent value="impact-analysis" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <BeforeAfterAnalysis />
                        <ProjectionAnalysis />
                    </div>
                </TabsContent>

                <TabsContent value="real-time-map" className="space-y-4">
                    <RealTimeMap />
                </TabsContent>
            </Tabs>
        </div>
    );
}
