import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AreaChartComponent from "./area-chart";
import BarChartComponent from "./bar-chart";
import LineChartComponent from "./line-chart";
import { useEffect, useState } from "react";
import type { ChartConfig } from "../ui/chart";
import { useDataStore } from "./useDataStore";
import { dataProcessor } from "./dataProcessor";

type ChartModuleLevelProps = "" | "village-land-use" | "district-land-use" | "regional-land-use" | "zonal-land-use" | "national-land-use"
export type TabProps = { value: ChartModuleLevelProps; label: string; }

type ChartTypeProps = 'area' | 'bar' | 'line'
const chartType: ChartTypeProps[] = ['bar', 'area', 'line']

const chartConfig = {
    views: {
        label: "Project Progress",
    },
    progress: {
        label: "Progress",
        color: "var(--chart-1)",
    },
    localities: {
        label: "Localities",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export default function Index({ tab }: { tab: TabProps }) {
    const [type, setType] = useState<ChartTypeProps>('bar')

    const { localities } = useDataStore()
    const { res } = localities[tab.value] ?? { res: [], count: 0, offset: 0 };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [chartData, setChartData] = useState<any[]>([]);

    // const [timeRange, setTimeRange] = useState("90d")

    // const filteredData = chartData.filter((item) => {
    //     const date = new Date(item.date)
    //     const referenceDate = new Date()
    //     let daysToSubtract = 90
    //     if (timeRange === "360d") {
    //         daysToSubtract = 366
    //     } else if (timeRange === "270d") {
    //         daysToSubtract = 274
    //     } else if (timeRange === "180d") {
    //         daysToSubtract = 183
    //     } else if (timeRange === "90d") {
    //         daysToSubtract = 91
    //     } else if (timeRange === "60d") {
    //         daysToSubtract = 60
    //     } else if (timeRange === "30d") {
    //         daysToSubtract = 30
    //     } else if (timeRange === "14d") {
    //         daysToSubtract = 14
    //     } else if (timeRange === "7d") {
    //         daysToSubtract = 7
    //     } else if (timeRange === "2d") {
    //         daysToSubtract = 2
    //     }
    //     const startDate = new Date(referenceDate)
    //     startDate.setDate(startDate.getDate() - daysToSubtract)
    //     return date >= startDate
    // })

    // const total = useMemo(
    //     () => ({
    //         sales: filteredData.reduce((acc, curr) => acc + curr.sales, 0),
    //     }),
    //     [filteredData]
    // )

    useEffect(() => {
        const fetchData = async () => {
            const processedData = await dataProcessor(res);
            setChartData(processedData);
        };
        fetchData()
    }, [res]);

    return (
        <Card className="pt-0 md:pt-6">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 md:py-0 sm:flex-row">
                <div className="grid flex-1 gap-1">
                    <CardTitle>{tab.label} Projects</CardTitle>
                    <CardDescription>
                        Showing total visitors for the last 3 months
                    </CardDescription>
                </div>
                <div className="flex flex-col lg:flex-row gap-2">
                    <Select value={type} onValueChange={(e: ChartTypeProps) => setType(e)}>
                        <SelectTrigger
                            className="w-[160px] rounded-lg sm:ml-auto flex capitalize bg-background dark:bg-card"
                            aria-label="Select a value"
                        >
                            <SelectValue className="capitalize" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            {chartType.map(type => (
                                <SelectItem key={type} value={type} className="rounded-lg capitalize">
                                    {type} Chart
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {/* <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="w-[160px] rounded-lg sm:ml-auto flex bg-background dark:bg-card"
                            aria-label="Select a value"
                        >
                            <SelectValue placeholder="Last 3 months" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="90d" className="rounded-lg">
                                Last 3 months
                            </SelectItem>
                            <SelectItem value="30d" className="rounded-lg">
                                Last 30 days
                            </SelectItem>
                            <SelectItem value="7d" className="rounded-lg">
                                Last 7 days
                            </SelectItem>
                        </SelectContent>
                    </Select> */}
                </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {type === 'area' ?
                    <AreaChartComponent
                        chartConfig={chartConfig}
                        data={chartData}
                        xAxis={{ name: 'project', type: 'string' }}
                    />
                    : null
                }
                {type === 'bar' ?
                    <BarChartComponent
                        chartConfig={chartConfig}
                        data={chartData}
                        xAxis={{ name: 'project', type: 'string' }}
                    /> : null
                }
                {type === 'line' ?
                    <LineChartComponent
                        chartConfig={chartConfig}
                        data={chartData}
                        xAxis={{ name: 'project', type: 'string' }}
                    /> : null
                }
            </CardContent>
        </Card>
    )
}
