import { InsightCard } from '@/components/InsightCard'
import { TFetchedBudgetedExpense } from '@/server/db/expenses'
import { TFetchedIncome } from '@/server/db/income'
import { TFetchedSaving } from '@/server/db/savings'
import { Target } from 'lucide-react'
import React from 'react'

export default function IncomeInsights({

    allIncome,
    allSavings, 
    allExpensesBudget_Fixed,
    allExpensesBudget_Variable,

} : {

    allIncome: TFetchedIncome[]
    allSavings: TFetchedSaving[]
    allExpensesBudget_Fixed: TFetchedBudgetedExpense[]
    allExpensesBudget_Variable: TFetchedBudgetedExpense[]

}) {

    const totalIncome = calculateTotalIncome(allIncome)
    const totalSavings = calculateTotalSavings(allSavings)
    const totalFixedExpenses = calculateTotalFixedExpenses(allExpensesBudget_Fixed)
    const totalVariableExpenses = calculateTotalVariableExpenses(allExpensesBudget_Variable)


    return (
        <div className="IncomeInsights !h-full flex flex-col gap-4 lg:flex-row">
            <InsightCard 
                title="Zero-Based Indicator" 
                description="Ensure all income is accounted for." 
                content={generateZeroBasedIndicatorString(totalIncome, totalSavings, totalFixedExpenses, totalVariableExpenses)}
                icon={<Target className="w-4 h-4 text-neutral-500" />}
            />
        </div>
    )
}


function generateZeroBasedIndicatorString(

    totalIncome: number,
    totalSavings: number,
    totalFixedExpenses: number,
    totalVariableExpenses: number

): string {

    const difference = totalIncome - totalSavings - totalFixedExpenses - totalVariableExpenses
    let zeroBasedIndicatorString = ""

    if (difference < 0) {
        // Deficit: you've planned to spend/save more than you earn
        zeroBasedIndicatorString = `Budget Deficit - You are over budget by $${Math.abs(difference).toFixed(2)}`
    } 
    
    if (difference > 0) {
        // Unallocated: you still have money left to plan
        zeroBasedIndicatorString = `Unallocated Funds - You have $${difference.toFixed(2)} left to assign`
    }

    if (difference === 0) {
        // Balanced: income equals planned expenses and savings
        zeroBasedIndicatorString = "Zero-Based Budget Achieved."
    }

    return zeroBasedIndicatorString
}


// Calculate Totals
export function calculateTotalIncome(allIncome: TFetchedIncome[]): number {
    return allIncome.reduce((sum, income) => sum + income.incomeMonthlyContribution, 0)
}
export function calculateTotalSavings(allSavings: TFetchedSaving[]): number {
    return allSavings.reduce((sum, saving) => sum + saving.savingMonthlyContribution, 0)
}
export function calculateTotalFixedExpenses(allExpensesBudget_Fixed: TFetchedBudgetedExpense[]): number {
    return allExpensesBudget_Fixed.reduce((sum, fixed) => sum + fixed.expenseMonthlyBudget, 0)
}
export function calculateTotalVariableExpenses(allExpensesBudget_Variable: TFetchedBudgetedExpense[]): number {
    return allExpensesBudget_Variable.reduce((sum, variable) => sum + variable.expenseMonthlyBudget, 0)
}