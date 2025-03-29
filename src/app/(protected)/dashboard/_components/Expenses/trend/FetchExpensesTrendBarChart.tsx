import React from 'react'
import { ExpensesTrendBarChart } from './ExpensesTrendBarChart'
import { getExpensesTrendDaily, getExpensesTrendMonthly, getExpensesTrendWeekly, getExpensesTrendYearly, TChartBar } from '@/server/db/analytics'

export default async function FetchExpensesTrendBarChart({
    userId
} : {
    userId: string
}) {

    let errorMessage: null | string = null

    let allExpensesTrendDaily: TChartBar[] = []
    let allExpensesTrendWeekly: TChartBar[] = []
    let allExpensesTrendMonthly: TChartBar[] = []
    let allExpensesTrendYearly: TChartBar[] = []
    

    // Fetch data here to make suspense work
    try {
        
        allExpensesTrendDaily = await getExpensesTrendDaily(userId)
        allExpensesTrendWeekly = await getExpensesTrendWeekly(userId)
        allExpensesTrendMonthly = await getExpensesTrendMonthly(userId)
        allExpensesTrendYearly = await getExpensesTrendYearly(userId)

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
