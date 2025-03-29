"use client"

import * as React from "react"
import { CircleAlert, Dot, ThumbsUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MonthYearFilter } from "@/components/MonthYearFilter"
import { TFetchedAllExpensesActual } from "@/server/db/analytics"


export default function ExpensesActual({
    allExpensesActual
} : {
    allExpensesActual: TFetchedAllExpensesActual[]
}) {

    const totalBudget = React.useMemo(() => {
        return allExpensesActual.reduce((acc, curr) => acc + curr.expenseBudget, 0)
    }, [allExpensesActual])

    const totalActual = React.useMemo(() => {
        return allExpensesActual.reduce((acc, curr) => acc + curr.expenseActual, 0)
    }, [allExpensesActual])

    const statusPercentage = (totalBudget === 0 && totalActual === 0)
        ? 0
        : Math.round((totalActual / totalBudget) * 100)

    const getStatusColor = (percentage: number) => {
        if (percentage <= 85) return "green-500"
        if (percentage <= 100) return "amber-500"
        return "red-500"
    }

    return (
        <Card className={`shadow-none border-color-border flex flex-col gap-4 h-full`}>

            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle><p className="fs-h3">Expenses (Actual)</p></CardTitle>
                    <CardDescription><p>Actual monthly expense breakdown by category</p></CardDescription>
                </div>
                <MonthYearFilter />
            </CardHeader>

            <CardContent className="flex flex-col gap-8 flex-1">
                <div className="flex items-center justify-between">
                    <div>
                        <p>Total Spent</p>
                        <p className="fs-h3">${totalActual}</p>
                    </div>
                    <div>
                        <p>Status</p>
                        <p className={`fs-h3 font-semibold text-${getStatusColor(statusPercentage)}`}>{statusPercentage}%</p>
                    </div>
                </div>

                <div className="space-y-6 h-full flex flex-col items-center justify-center">
                    {allExpensesActual.length > 0 
                        ? allExpensesActual.map((item) => {

                            const budgetedAmount = item.expenseBudget
                            const actualAmount = item.expenseActual
                            const actualPercentage = item.expenseActualPercentage

                            return (
                                <div key={item.categoryId} className="space-y-2 w-full">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: item.fill }}
                                            />
                                            <span className="capitalize">{item.expenseName}</span>
                                            <Dot className="inline h-3 w-3" />
                                            <p>{actualPercentage}%</p>
                                        </div>

                                        <div className="flex items-center">
                                            <span className={`text-${getStatusColor(actualPercentage)} flex gap-1 items-center`}>
                                                <p>${actualAmount} / ${budgetedAmount}</p>
                                                <Dot className="inline h-3 w-3" />
                                                <p>{actualPercentage > 100
                                                    ? `$${actualAmount - budgetedAmount} exceeded`
                                                    : `$${Math.abs(actualAmount - budgetedAmount)} remaining`
                                                }</p>
                                            </span>
                                        </div>
                                    </div>

                                    <Progress 
                                        value={actualPercentage > 100 ? 100 : actualPercentage}
                                        className="bg-color-muted-text" 
                                        additionalClasses="bg-color-text"
                                        // additionalClasses={`bg-${getStatusColor(actualPercentage)}`}
                                        // additionalClasses={actualPercentage > 100 
                                        //     ? `bg-${getStatusColor(actualPercentage)}`
                                        //     : "bg-color-text"
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