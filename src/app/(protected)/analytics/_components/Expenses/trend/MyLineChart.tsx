"use client"

import { useState } from "react"
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for different timeframes
const yearlyData = [
    { period: "2020", income: 48000, savings: 12000, expenses: 35000 },
    { period: "2021", income: 52000, savings: 14000, expenses: 38000 },
    { period: "2022", income: 58000, savings: 16000, expenses: 42000 },
    { period: "2023", income: 63000, savings: 18000, expenses: 45000 },
    { period: "2024", income: 68000, savings: 20000, expenses: 48000 },
];

const monthlyData = [
    { period: "Jan 2024", income: 5700, savings: 2000, expenses: 3700 },
    { period: "Feb 2024", income: 5800, savings: 2100, expenses: 3700 },
    { period: "Mar 2024", income: 5900, savings: 2200, expenses: 4100 },
    { period: "Apr 2024", income: 6000, savings: 1900, expenses: 4400 },
    { period: "May 2024", income: 5800, savings: 2000, expenses: 4200 },
    { period: "Jun 2024", income: 5900, savings: 2100, expenses: 4500 },
    { period: "Jul 2024", income: 6000, savings: 1800, expenses: 4600 },
    { period: "Aug 2024", income: 6100, savings: 1900, expenses: 5000 },
    { period: "Sep 2024", income: 5900, savings: 1700, expenses: 5200 },
    { period: "Oct 2024", income: 6100, savings: 2000, expenses: 4900 },
    { period: "Nov 2024", income: 6000, savings: 1900, expenses: 5300 },
    { period: "Dec 2024", income: 6200, savings: 2100, expenses: 5800 },
];

const weeklyData = [
    { period: "Week 1", income: 1450, savings: 500, expenses: 950 },
    { period: "Week 2", income: 1500, savings: 520, expenses: 1100 },
    { period: "Week 3", income: 1550, savings: 540, expenses: 980 },
    { period: "Week 4", income: 1500, savings: 500, expenses: 1300 },
    { period: "Week 5", income: 1480, savings: 480, expenses: 1250 },
    { period: "Week 6", income: 1520, savings: 500, expenses: 1400 },
    { period: "Week 7", income: 1490, savings: 460, expenses: 1150 },
    { period: "Week 8", income: 1510, savings: 480, expenses: 1350 },
    { period: "Week 9", income: 1500, savings: 470, expenses: 1200 },
    { period: "Week 10", income: 1550, savings: 510, expenses: 1450 },
];

const dailyData = [
    { period: "Mar 1", income: 200, savings: 70, expenses: 130 },
    { period: "Mar 2", income: 210, savings: 75, expenses: 160 },
    { period: "Mar 3", income: 215, savings: 80, expenses: 120 },
    { period: "Mar 4", income: 220, savings: 85, expenses: 200 },
    { period: "Mar 5", income: 230, savings: 90, expenses: 180 },
    { period: "Mar 6", income: 225, savings: 85, expenses: 210 },
    { period: "Mar 7", income: 210, savings: 80, expenses: 150 },
    { period: "Mar 8", income: 215, savings: 75, expenses: 220 },
    { period: "Mar 9", income: 220, savings: 80, expenses: 170 },
    { period: "Mar 10", income: 230, savings: 90, expenses: 250 },
    { period: "Mar 11", income: 215, savings: 75, expenses: 190 },
    { period: "Mar 12", income: 225, savings: 85, expenses: 240 },
    { period: "Mar 13", income: 230, savings: 90, expenses: 260 },
    { period: "Mar 14", income: 240, savings: 95, expenses: 300 },
];

const timeframeOptions = [
    { value: "yearly", label: "Yearly" },
    { value: "monthly", label: "Monthly" },
    { value: "weekly", label: "Weekly" },
    { value: "daily", label: "Daily" },
]

const timeframeDescriptions = {
    yearly: "2020 - 2024",
    monthly: "January - December 2024",
    weekly: "Last 10 Weeks",
    daily: "Last 14 Days (March 1-14, 2024)",
}

const chartConfig = {
    income: {
        label: "Income",
        color: "green",
    },
    savings: {
        label: "Savings",
        color: "blue",
    },
    expenses: {
        label: "Expenses",
        color: "red",
    },
} satisfies ChartConfig


export default function MyLineChart() {

    const [visibleLines, setVisibleLines] = useState({
        income: true,
        savings: true,
        expenses: true,
    })

    const [showLabels, setShowLabels] = useState(true)
    const [timeframe, setTimeframe] = useState("monthly")

    const toggleLine = (line: keyof typeof visibleLines) => {
        setVisibleLines((prev) => ({
            ...prev,
            [line]: !prev[line],
        }))
    }

    // Get the appropriate data based on the selected timeframe
    const getTimeframeData = () => {
        switch (timeframe) {
            case "yearly":
            return yearlyData
            case "monthly":
            return monthlyData
            case "weekly":
            return weeklyData
            case "daily":
            return dailyData
            default:
            return monthlyData
        }
    }

    // Format X-axis ticks based on timeframe
    const formatXAxisTick = (value: string) => {
        switch (timeframe) {
            case "yearly":
            return value // Show full year
            case "monthly":
            return value.slice(0, 3) // Show abbreviated month
            case "weekly":
            return value.replace("Week ", "W") // Shorten "Week X" to "WX"
            case "daily":
            return value // Show full day
            default:
            return value
        }
    }

    // Format currency values
    const formatCurrency = (value: number) => {
        return `$${value.toLocaleString()}`
    }


    return (
        <Card className="shadow-none border-color-border">
            <CardHeader>
                <div className="flex flex-col justify-between items-start gap-4">
                    <div>
                        <CardTitle>
                            <p className="fs-h3">Financial Overview - {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}</p>
                        </CardTitle>

                        <CardDescription>
                            <p>{timeframeDescriptions[timeframe as keyof typeof timeframeDescriptions]}</p>
                        </CardDescription>
                    </div>

                    <div className="w-full">
                        <Select value={timeframe} onValueChange={setTimeframe}>

                            <SelectTrigger className="shadow-none">
                                <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>

                            <SelectContent className="bg-color-bg">
                                {timeframeOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>

                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <ChartContainer config={chartConfig}>
                    <LineChart
                        accessibilityLayer
                        data={getTimeframeData()}
                        margin={{
                            top: 20,
                            left: 20,
                            right: 20,
                            bottom: 20,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={formatXAxisTick} />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent className="bg-color-bg" indicator="line" formatter={(value) => formatCurrency(value as number)} />}
                        />
        
                        {visibleLines.income && (
                            <Line
                                dataKey="income"
                                type="natural"
                                stroke="var(--color-income)"
                                strokeWidth={2}
                                dot={{
                                    fill: "var(--color-income)",
                                }}
                                activeDot={{
                                    r: 5,
                                }}
                            >
                                {showLabels && (
                                    <LabelList
                                        position="top"
                                        offset={12}
                                        className="fs-caption"
                                        formatter={(value: number) => `$${value}`}
                                    />
                                )}
                            </Line>
                        )}
            
                        {visibleLines.savings && (
                            <Line
                                dataKey="savings"
                                type="natural"
                                stroke="var(--color-savings)"
                                strokeWidth={2}
                                dot={{
                                    fill: "var(--color-savings)",
                                }}
                                activeDot={{
                                    r: 6,
                                }}
                            >
                            {showLabels && (
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fs-caption"
                                    formatter={(value: number) => `$${value}`}
                                />
                            )}
                            </Line>
                        )}
            
                        {visibleLines.expenses && (
                            <Line
                                dataKey="expenses"
                                type="natural"
                                stroke="var(--color-expenses)"
                                strokeWidth={2}
                                // dot={{
                                //     fill: "var(--color-expenses)",
                                // }}
                                // activeDot={{
                                //     r: 6,
                                // }}
                            >
                            {showLabels && (
                                <LabelList
                                    position="top"
                                    offset={12}
                                    className="fs-caption"
                                    formatter={(value: number) => `$${value}`}
                                />
                            )}
                            </Line>
                        )}
                    </LineChart>
                </ChartContainer>
            </CardContent>

            <CardFooter className="flex flex-col items-center gap-4 pt-4">
                <div className="flex justify-center gap-6">
                    {Object.entries(chartConfig).map(([key, config]) => (
                        <div key={key} className="flex gap-1 items-center">
                            <Checkbox
                                id={`filter-${key}`}
                                checked={visibleLines[key as keyof typeof visibleLines]}
                                onCheckedChange={() => toggleLine(key as keyof typeof visibleLines)}
                            />
                            <Label htmlFor={`filter-${key}`} className="flex items-center gap-1">
                                {config.label}
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                            </Label>
                        </div>
                    ))}
                </div>
    
                <Separator className="w-full bg-color-muted-text" />
    
                <div className="flex items-center space-x-2">
                    <Checkbox id="show-labels" checked={showLabels} onCheckedChange={() => setShowLabels(!showLabels)} />
                    <Label htmlFor="show-labels">Show Amount Labels</Label>
                </div>
    
            </CardFooter>
        </Card>
    )
}
