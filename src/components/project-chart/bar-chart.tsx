import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

interface Props {
    className?: string;
    chartConfig: ChartConfig;
    data: any;
    xAxis: { name: string; type?: 'date' | 'string' | 'number' | 'percent' }
    yAxis?: { name?: string; type?: 'date' | 'string' | 'number' | 'percent' }
}

export default function BarChartComponent({ className, chartConfig, data, xAxis, yAxis = { type: 'string' } }: Props) {
    return (
        <ChartContainer
            config={chartConfig}
            className={cn("aspect-auto h-[250px] w-full", className)}
        >
            <BarChart
                accessibilityLayer
                data={data}
                margin={{
                    left: 12,
                    right: 12,
                }}
            >
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
                    content={
                        <ChartTooltipContent
                            className="w-[150px]"
                            labelFormatter={yAxis.type === 'date' ? (value) => {
                                return new Date(value).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })
                            } : yAxis.type === 'percent' ? (value) => `${value}%` : undefined}
                        />
                    }
                />
                {Object.entries(chartConfig).map(([key]) => (
                    <Bar
                        key={key}
                        dataKey={key}
                        fill={`var(--color-${key})`}
                    />
                ))}
                <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
        </ChartContainer>
    )
}