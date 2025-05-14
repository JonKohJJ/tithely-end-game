import React from 'react'
import { ExpensesTrendBarChart } from './ExpensesTrendBarChart'
import { getExpensesTrendDaily, getExpensesTrendMonthly, getExpensesTrendWeekly, getExpensesTrendYearly, TChartBar } from '@/server/db/expenses'

export default async function FetchExpensesTrendBarChart({
    userId,
    searchParams
} : {
    userId: string
    searchParams: { [key: string]: string | string[] | undefined }
}) {

    const showClaimables = searchParams.showClaimables === "true" ? true : false

    let errorMessage: null | string = null

    let allExpensesTrendDaily: TChartBar[] = []
    let allExpensesTrendWeekly: TChartBar[] = []
    let allExpensesTrendMonthly: TChartBar[] = []
    let allExpensesTrendYearly: TChartBar[] = []
    

    // Fetch data here to make suspense work
    try {
        
        allExpensesTrendDaily = await getExpensesTrendDaily(userId, showClaimables)
        allExpensesTrendWeekly = await getExpensesTrendWeekly(userId, showClaimables)
        allExpensesTrendMonthly = await getExpensesTrendMonthly(userId, showClaimables)
        allExpensesTrendYearly = await getExpensesTrendYearly(userId, showClaimables)

    } catch (error) {
        if (error instanceof Error) {
            errorMessage = error.message
        }
    }

    return (
        <>
            {errorMessage
                ? (
                    <p>Oh no! Something went wrong. ISSUE: {errorMessage}</p>
                )
                : (
                    <div className={`FetchExpensesTrendBarChart`}>
                        <ExpensesTrendBarChart
                            allExpensesTrendDaily={allExpensesTrendDaily}
                            allExpensesTrendWeekly={allExpensesTrendWeekly}
                            allExpensesTrendMonthly={allExpensesTrendMonthly}
                            allExpensesTrendYearly={allExpensesTrendYearly}
                        />
                    </div>
                )
            }
        </>
    )
}
