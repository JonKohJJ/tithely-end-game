"use client"

import { useState } from "react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { TChartBar } from "@/server/db/analytics"

const chartConfig = {} satisfies ChartConfig

export const mockData: TChartBar[] = [
    { label: 'January', value: 45 },
    { label: 'February', value: 60 },
    { label: 'March', value: 75 },
    { label: 'April', value: 50 },
    { label: 'May', value: 90 },
    { label: 'June', value: 40 },
    { label: 'July', value: 80 },
    { label: 'August', value: 55 },
    { label: 'September', value: 70 },
    { label: 'October', value: 65 },
    { label: 'November', value: 85 },
    { label: 'December', value: 95 },
];

export function ExpensesTrendBarChart(
{
    allExpensesTrendDaily,
    allExpensesTrendWeekly,
    allExpensesTrendMonthly,
    allExpensesTrendYearly,
} : {
    allExpensesTrendDaily: TChartBar[]
    allExpensesTrendWeekly: TChartBar[]
    allExpensesTrendMonthly: TChartBar[]
    allExpensesTrendYearly: TChartBar[]
}
) {
    const [showLabels, setShowLabels] = useState(true)

    return (
        <Card className="w-full shadow-none border-color-border">

            <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle><p className="fs-h3">Expenses (Trend)</p></CardTitle>
                        <CardDescription><p>Track your spending over time</p></CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="show-labels" checked={showLabels} onCheckedChange={setShowLabels} />
                        <Label htmlFor="show-labels"><p>Show amount labels</p></Label>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="days" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-color-muted-text">
                        <TabsTrigger value="days">Days</TabsTrigger>
                        <TabsTrigger value="weeks">Weeks</TabsTrigger>
                        <TabsTrigger value="months">Months</TabsTrigger>
                        <TabsTrigger value="years">Years</TabsTrigger>
                    </TabsList>

                    <TabsContent value="days">
                        <ExpensesChart data={allExpensesTrendDaily} showLabels={showLabels} />
                    </TabsContent>

                    <TabsContent value="weeks">
                        <ExpensesChart data={allExpensesTrendWeekly} showLabels={showLabels} />
                    </TabsContent>

                    <TabsContent value="months">
                        <ExpensesChart data={allExpensesTrendMonthly} showLabels={showLabels} />
                    </TabsContent>

                    <TabsContent value="years">
                        <ExpensesChart data={allExpensesTrendYearly} showLabels={showLabels} />
                    </TabsContent>
                </Tabs>
            </CardContent>

        </Card>
    )
}

function ExpensesChart({
    data,
    showLabels,
}: {
    data: TChartBar[]
    showLabels: boolean
}) {
    // Custom tick renderer for both months and weeks views
    const renderCustomTick = ({ 
        x, y, payload 
    } : {
        x: number, y: number, payload: { value: string }
    }) => (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="middle" fill="currentColor" className="text-xs">
                {payload.value.split("\n")[0]}
            </text>
            <text x={0} y={0} dy={34} textAnchor="middle" fill="currentColor" className="text-xs text-muted-foreground">
                {payload.value.split("\n")[1]}
            </text>
        </g>
    )

    return (
        <ChartContainer config={chartConfig} className="h-[300px] mt-4 w-full">
            <BarChart
                accessibilityLayer
                data={data}
                margin={{
                    top: 20,
                }}
            >
                <CartesianGrid vertical={false} stroke="var(--color-muted-text)" />

                <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    height={50}
                    tick={renderCustomTick}
                />

                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value}`} />

                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            className="bg-color-bg border-none"
                            formatter={(value) => `$${value}`}
                        />
                    }
                />

                <Bar dataKey="value" fill="var(--color-text)" radius={0}>
                    {showLabels && (
                        <LabelList
                            position="top"
                            fill="var(--color-text)"
                            formatter={(value: number) => (value > 0 ? `$${value}` : `$${value}`)}
                        />
                    )}
                </Bar>

            </BarChart>
        </ChartContainer>
    )
}