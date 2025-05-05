"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TFetchedBudgetedExpense } from "@/server/db/expenses"
import ExpenseForm from "./ExpenseForm"

const chartConfig = {} satisfies ChartConfig

export default function BudgetedExpenses({
    allExpensesBudget
} : {
    allExpensesBudget: TFetchedBudgetedExpense[]
}) {

    // calculate total expense amount (budgeted)
    const totalBudget = React.useMemo(() => {
      return allExpensesBudget.reduce((acc, curr) => acc + curr.expenseMonthlyBudget, 0)
    }, [allExpensesBudget])

    const allExpensesBudget_Fixed = allExpensesBudget.filter(expense => expense.expenseMethod === "Fixed")
    const allExpensesBudget_Variable = allExpensesBudget.filter(expense => expense.expenseMethod === "Variable")

    return (
        <Card className={`shadow-none border-color-border h-full`}>
            <CardContent className="flex-1 p-0">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-full w-full">
                    {allExpensesBudget.length > 0 
                        ?
                            <PieChart>
                                <ChartTooltip cursor={false} content={<ChartTooltipContent className="bg-color-bg border-none" hideLabel />} />
                                <Pie
                                    className="myPie"
                                    data={allExpensesBudget}
                                    dataKey="expenseMonthlyBudget"
                                    nameKey="expenseName"
                                    innerRadius={65}
                                    outerRadius={100}
                                    label={({ cx, cy, midAngle, innerRadius, outerRadius, expenseName, expenseMonthlyBudget, expenseBudgetPercentage, fill }) => {

                                        const RADIAN = Math.PI / 180

                                        // Calculate the position for the label
                                        const radius = outerRadius + 50
                                        const x = cx + radius * Math.cos(-midAngle * RADIAN)
                                        const y = cy + radius * Math.sin(-midAngle * RADIAN)

                                        // Calculate line points
                                        const lineX1 = cx + (outerRadius) * Math.cos(-midAngle * RADIAN)
                                        const lineY1 = cy + (outerRadius) * Math.sin(-midAngle * RADIAN)

                                        // Determine text anchor based on position
                                        let textAnchor
                                        // Adjusted x or y value
                                        let adjustedX
                                        let adjustedY
                                        const spacing = 10

                                        if (Math.abs(Math.cos(-midAngle * RADIAN)) < 0.4) {
                                            // For labels near the top or bottom
                                            textAnchor = "middle"
                                            adjustedX = x
                                            adjustedY = y > cx
                                                ? y + spacing + 15
                                                : y - spacing - 15
                                        } else {
                                            // For labels on the left or right sides
                                            textAnchor = x > cx ? "start" : "end"
                                            adjustedX = x > cx 
                                                ? x + spacing
                                                : x - spacing
                                            adjustedY = y
                                        }

                                        // Calculate position for percentage label inside the pie segment
                                        const midRadius = (innerRadius + outerRadius) / 2
                                        const percentX = cx + midRadius * Math.cos(-midAngle * RADIAN)
                                        const percentY = cy + midRadius * Math.sin(-midAngle * RADIAN)

                                        return (
                                            <g>

                                                {/* Percentage label inside the pie segment */}
                                                <text
                                                    x={percentX}
                                                    y={percentY}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    fill="white"
                                                    className="fs-caption"
                                                >
                                                    {expenseBudgetPercentage}%
                                                </text>

                                                {/* Line from pie to label */}
                                                <line x1={lineX1} y1={lineY1} x2={x} y2={y} stroke={fill} strokeWidth={2} />

                                                {/* Label text */}
                                                <text
                                                    x={adjustedX}
                                                    y={adjustedY - 12}
                                                    textAnchor={textAnchor}
                                                    dominantBaseline="middle"
                                                    className="fs-base"
                                                    fill="var(--color-text)"
                                                >
                                                    {expenseName}
                                                </text>

                                                <text
                                                    x={adjustedX}
                                                    y={adjustedY + 12}
                                                    textAnchor={textAnchor}
                                                    dominantBaseline="middle"
                                                    className="fs-h3"
                                                    fill="var(--color-text)"
                                                >
                                                    ${expenseMonthlyBudget.toFixed(1)}
                                                </text>
                                            </g>
                                        )
                                    }}
                                >
                                    <Label
                                        content={({ viewBox }) => {
                                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle" fill="var(--color-text)">
                                                    <tspan x={viewBox.cx} y={viewBox.cy} className="fs-h2">
                                                        ${totalBudget.toLocaleString()}
                                                    </tspan>
                                                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24}>
                                                        Total Budget
                                                    </tspan>
                                                </text>
                                            )
                                            }
                                        }}
                                    />
                                </Pie>
                            </PieChart>
                        : 
                            <p className="h-full flex items-center justify-center fs-base">No Expenses Budgeted.</p>
                    }
                </ChartContainer>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-10">
                {allExpensesBudget_Fixed.length > 0
                    ? 
                    <ExpensesBudgetGroupSelection 
                        title="Fixed Expenses"
                        expenses={allExpensesBudget_Fixed}
                    />
                    : null
                }

                {allExpensesBudget_Variable.length > 0
                    ? 
                    <ExpensesBudgetGroupSelection 
                        title="Variable Expenses"
                        expenses={allExpensesBudget_Variable}
                    />
                    : null
                }
            </CardFooter>
        </Card>
    )
}

// Reusable component to remove duplicated code
function ExpensesBudgetGroupSelection({
    title,
    expenses,
} : {
    title: string,
    expenses: TFetchedBudgetedExpense[]
}) {
    return (
        <div className="fixed-budgeted-expenses w-full flex flex-col gap-2">
            <p>{title}</p>
            <div className="divider h-[1px] bg-color-muted-text w-full"></div>
            {expenses.map(expense => {
                return (
                    <div key={expense.expenseId} className="flex items-center justify-between w-full">
                        <div className="flex gap-2 items-center">
                            <div className={`h-3 w-3 rounded-full`} style={{ backgroundColor: expense.fill }} />
                            <p>{expense.expenseName}</p>
                        </div>
                        
                        <div className="flex gap-4 items-center">
                            <p>${expense.expenseMonthlyBudget}</p>
                            <ExpenseForm expenseTobeEdited={expense} />
                        </div>
                    </div>
                )
            })}
        </div>
    )
}   
