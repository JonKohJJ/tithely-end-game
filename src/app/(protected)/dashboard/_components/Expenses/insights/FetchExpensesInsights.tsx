import { getAvailableFunds, getTotalCreditByTime, getTotalIncomeByTime } from '@/server/db/expenses'
import React from 'react'
import ExpensesInsights from './ExpensesInsights'

export default async function FetchExpensesInsights({
    userId,
    searchParams
} : {
    userId: string
    searchParams: { [key: string]: string | string[] | undefined }
}) {

    const month = Number(searchParams.month) || new Date().getMonth() + 1
    const year = Number(searchParams.year) || new Date().getFullYear()
    const showClaimables = searchParams.showClaimables === "true" ? true : false

    let availableFunds: number = 0
    let totalCreditCardSpending: number = 0
    let totalIncome: number = 0
    let billPaymentReadiness: string = ""

    let errorMessage: null | string = null

    // Fetch data here to make suspense work
    try {

        availableFunds = await getAvailableFunds(userId, month, year)
        totalCreditCardSpending = await getTotalCreditByTime(userId, month, year, showClaimables)
        totalIncome = await getTotalIncomeByTime(userId, month, year)
        billPaymentReadiness = calculateBillPaymentReadiness(availableFunds, totalCreditCardSpending, totalIncome)

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
                    <div className="FetchExpensesInsights">
                        <ExpensesInsights 
                            availableFunds={availableFunds}
                            totalCreditCardSpending={totalCreditCardSpending}
                            billPaymentReadiness={billPaymentReadiness}
                        />
                    </div>
                )
            }
        </>
    )
}

function calculateBillPaymentReadiness(   
    availableFunds: number, 
    totalCreditCardSpending: number,
    totalIncome: number
): string {

    const difference = availableFunds - totalCreditCardSpending
    let result = ""

    if (difference > 0) {
        result = `All set! $${roundTo(difference, 2)} left.`
    }
    if (difference < 0) {
        result = `Short by $${roundTo(Math.abs(difference), 2)}.`
    }
    if (difference === 0) {
        result = "Just enough to pay!"
    }
    if (totalIncome === 0) {
        result = "No income. Add funds."
    }

    return result
}

export function roundTo(value: number, precision: number) {
    const factor = Math.pow(10, precision)
    return Math.round(value * factor) / factor
}