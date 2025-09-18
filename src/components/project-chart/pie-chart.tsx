import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils";
import { Label, Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie";

interface Props {
    className?: string;
    chartConfig: ChartConfig;
    data: any;
    xAxis: { name: string; type?: 'date' | 'string' | 'number' | 'percent' }
    yAxis?: { name?: string; type?: 'date' | 'string' | 'number' | 'percent' }
}

export default function PieChartComponent({ className, chartConfig, data, xAxis, yAxis = { type: 'string' } }: Props) {
    return (
        <ChartContainer
            config={chartConfig}
            className={cn("aspect-auto h-[250px] w-full", className)}
        >
            <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
            >
                <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={data}
                        dataKey={yAxis?.name || Object.keys(chartConfig)[0]}
                        nameKey={xAxis.name}
                        innerRadius={60}
                        strokeWidth={5}
                        activeIndex={0}
                        activeShape={({
                            outerRadius = 0,
                            ...props
                        }: PieSectorDataItem) => (
                            <Sector {...props} outerRadius={outerRadius + 10} />
                        )}
                    >
                        <Label
                            content={({ viewBox }) => {
                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                    return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                className="fill-foreground text-3xl font-bold"
                                            >
                                                {/* {totalVisitors.toLocaleString()} */}2000
                                            </tspan>
                                            <tspan
                                                x={viewBox.cx}
                                                y={(viewBox.cy || 0) + 24}
                                                className="fill-muted-foreground"
                                            >
                                                Visitors
                                            </tspan>
                                        </text>
                                    )
                                }
                            }}
                        />
                    </Pie>
                </PieChart>
            </ChartContainer>
        </ChartContainer>
    )
}