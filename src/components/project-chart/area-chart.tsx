import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

interface Props {
    className?: string;
    chartConfig: ChartConfig;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    xAxis: { name: string; type: 'date' | 'string' | 'number' | 'percent' }
    yAxis?: { name?: string; type?: 'date' | 'string' | 'number' | 'percent' }
}

export default function AreaChartComponent({ className, chartConfig, data, xAxis, yAxis = { type: 'string' } }: Props) {
    return (
        <ChartContainer
            config={chartConfig}
            className={cn("aspect-auto h-[250px] w-full", className)}
        >
            <AreaChart data={data}>
                <defs>
                    {Object.entries(chartConfig).map(([key, value]) => (
                        <linearGradient key={key} id={`fill${value.label}`} x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor={`var(--color-${key})`}
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor={`var(--color-${key})`}
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey={xAxis.name}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={xAxis.type === 'date' ? (value) => {
                        const date = new Date(value)
                        return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })
                    } : xAxis.type === 'percent' ? (value) => `${value}%` : undefined}
                />
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            labelFormatter={yAxis.type === 'date' ? (value) => {
                                return new Date(value).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            } : yAxis.type === 'percent' ? (value) => `${value}%` : undefined}
                            indicator="dot"
                        />
                    }
                />
                {Object.entries(chartConfig).map(([key, value]) => (
                    <Area
                        key={key}
                        dataKey={key}
                        type="natural"
                        fill={`url(#fill${value.label})`}
                        stroke={`var(--color-${key})`}
                        stackId="a"
                    />
                ))}
                <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
        </ChartContainer>
    )
}