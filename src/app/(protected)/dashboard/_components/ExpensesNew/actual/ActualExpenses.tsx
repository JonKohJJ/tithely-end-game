"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { TFetchedActualExpense } from "@/server/db/expenses"
import { Dot, CircleAlert, ThumbsUp } from "lucide-react"
import { useMemo } from "react"
import { Progress } from "@/components/ui/progress"

export default function ActualExpenses({
    allActualExpenses
} : {
    allActualExpenses: TFetchedActualExpense[]
}) {

    const totalBudget = useMemo(() => {
        return allActualExpenses.reduce((acc, curr) => acc + curr.expenseMonthlyBudget, 0)
    }, [allActualExpenses])

    const totalActual = useMemo(() => {
        return allActualExpenses.reduce((acc, curr) => acc + curr.expenseActualAmount, 0)
    }, [allActualExpenses])

    const statusPercentage = (totalBudget === 0 && totalActual === 0)
        ? 0
        : Math.round((totalActual / totalBudget) * 100)

    const getStatusColor = (percentage: number) => {
        if (percentage <= 85) return "green-500"
        if (percentage <= 100) return "red-500"
        return "red-500"
    }

    return (
        <Card className={`shadow-none border-color-border flex flex-col h-full`}>
            
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <p>Total Spent</p>
                        <p className="fs-h3">${totalActual.toFixed(2)}</p>
                    </div>
                    <div>
                        <p>Status</p>
                        <p className={`fs-h3 font-semibold text-${getStatusColor(statusPercentage)}`}>{statusPercentage}%</p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-8 flex-1">
                <div className="h-full flex flex-col gap-6 items-center justify-start">
                    {allActualExpenses.length > 0 
                        ? allActualExpenses.map((item) => {

                            const budgetedAmount = item.expenseMonthlyBudget
                            const actualAmount = item.expenseActualAmount
                            const actualPercentage = item.expenseActualPercentage

                            return (
                                <div key={item.expenseId} className="space-y-2 w-full">
                                    <div className="flex items-center justify-between">

                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`h-3 w-3 rounded-full`}
                                                style={{ backgroundColor: item.fill }}
                                            />
                                            <p>{item.expenseName}</p>
                                            <Dot className="h-3 w-3" />
                                            <p>{actualPercentage}%</p>
                                        </div>

                                        <div className="flex items-center">
                                            <span className={`text-${getStatusColor(actualPercentage)} flex gap-1 items-center`}>
                                                <p>${actualAmount} / ${budgetedAmount}</p>
                                                <Dot className="inline h-3 w-3" />
                                                <p>{actualPercentage > 100
                                                    ? `$${(actualAmount - budgetedAmount).toFixed(2)} exceeded`
                                                    : `$${(Math.abs(actualAmount - budgetedAmount)).toFixed(2)} remaining`
                                                }</p>
                                            </span>
                                        </div>
                                    </div>

                                    <Progress 
                                        value={actualPercentage > 100 ? 100 : actualPercentage}
                                        className="bg-color-muted-text"
                                        additionalClasses="bg-color-text"
                                    />
                                </div>
                            )
                        })
                        : <p className="text-center">No Expenses Found.</p>
                    }
                </div>
            </CardContent>

            <CardFooter>
                <div>
                    {totalActual > totalBudget ? (
                        <p className="fs-caption flex items-center gap-1 text-red-500">
                            <CircleAlert className="h-4 w-4" />
                            Over budget by ${(totalActual - totalBudget).toLocaleString()}
                        </p>
                    ) : (
                        <p className="flex items-center gap-1 text-green-500">
                            <ThumbsUp className="h-4 w-4" />
                            Under budget by ${(totalBudget - totalActual).toLocaleString()}
                        </p>
                    )}
                </div>
            </CardFooter>

        </Card>
    )
}