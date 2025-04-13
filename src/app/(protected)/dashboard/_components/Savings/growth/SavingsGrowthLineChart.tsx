"use client"

import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { renderCustomLabel } from "../../Expenses/trend/ExpensesTrendBarChart"
import { TSavingGrowth } from "@/server/db/savings"

export function SavingsGrowthLineChart({
    allSavingsGrowthData
} : {
    allSavingsGrowthData: TSavingGrowth
}) {

    const { totalSavingsAmount, past12MonthsData, savingRate } = allSavingsGrowthData
    
    // Caculate savings change from past month
    const { savingsDifferenceAmount, isPositiveChange, savingsDifferencePercent } = calculateSavingsDifference(past12MonthsData[past12MonthsData.length - 1].value, past12MonthsData[past12MonthsData.length - 2].value)

    return (
        <Card className={`shadow-none border-color-border pt-12`}>

            <CardContent className="flex flex-col gap-12 items-stretch justify-between md:flex-row">

                <div className="flex flex-col gap-7 w-full md:w-[unset]">

                    <div>
                        <p>Total Savings Balance</p>
                        <p className="fs-h2">${totalSavingsAmount.toLocaleString()}</p>
                    </div>

                    <div>
                        <p>Change from Last Month</p>

                        {savingsDifferenceAmount === 0
                            ? <p className="fs-h3">No change</p>
                            : 
                            <div className="flex gap-3">
                                <div className={`fs-h2 ${isPositiveChange ? "text-green-500" : "text-red-500"}`}>
                                    {isPositiveChange ? "+" : "-"}
                                    ${Math.abs(savingsDifferenceAmount).toLocaleString()}
                                </div>
    
                                <div className={`flex items-center ${isPositiveChange ? "text-green-500" : "text-red-500"}`}>
                                    {isPositiveChange ? (
                                        <ArrowUpRight className="h-4 w-4 mr-1" />
                                    ) : (
                                        <ArrowDownRight className="h-4 w-4 mr-1" />
                                    )}
                                    {Math.abs(savingsDifferencePercent).toFixed(1)}%
                                </div>
                            </div>
                        }

                    </div>

                    <div>
                        <p>Actual Saving Rate (Average)</p>
                        <p className="fs-h3">{savingRate}</p>
                    </div>
                </div>

                {/* Growth Curve Chart */}
                <div className="w-full md:flex-1 md:max-w-[900px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={past12MonthsData}
                            margin={{
                                top: 20,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/>

                            <XAxis 
                                dataKey="label"
                                height={50}
                                tick={renderCustomLabel}
                                stroke="var(--color-border)"
                            />

                            <YAxis 
                                stroke="var(--color-border)"
                            />


                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="custom-tooltip bg-color-bg p-4 rounded-xl border border-color-border">
                                                <p className="label">{`${label}`}</p>
                                                <p className="value" style={{ color: "#3b82f6" }}>{`Savings: $${payload[0].value}`}</p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />

                            <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

            </CardContent>

            <CardFooter className="flex flex-col items-end">
                <p>Showing total savings growth for the last 12 months</p>
            </CardFooter>

        </Card>
    )
}

function calculateSavingsDifference(
    totalSavingsThisMonth: number,
    totalSavingsLastMonth: number,
) {

    const savingsDifferenceAmount = totalSavingsThisMonth - totalSavingsLastMonth
    const isPositiveChange = savingsDifferenceAmount > 0
    const savingsDifferencePercent = isNaN((savingsDifferenceAmount / totalSavingsThisMonth) * 100) 
        ? 0 
        : (savingsDifferenceAmount / totalSavingsThisMonth) * 100

    return {
        savingsDifferenceAmount,
        isPositiveChange,
        savingsDifferencePercent
    }

}