import { type ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

export default function LineChartComponent({ chartConfig, data }: { chartConfig: ChartConfig; data: any }) {
    return (
        <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
        >
            <LineChart
                accessibilityLayer
                data={data}
                margin={{
                    left: 12,
                    right: 12,
                }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tickFormatter={(value) => {
                        const date = new Date(value)
                        return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        })
                    }}
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            className="w-[150px]"
                            nameKey="views"
                            labelFormatter={(value) => {
                                return new Date(value).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })
                            }}
                        />
                    }
                />
                {Object.entries(chartConfig).map(([key]) => (
                    <Line
                        key={key}
                        dataKey={key}
                        type="monotone"
                        stroke={`var(--color-${key})`}
                        strokeWidth={2}
                        dot={false}
                    />
                ))}
                <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
        </ChartContainer>
    )
}