import { getAllIncome, TFetchedIncome } from "@/server/db/income"
import IncomeInsights from "./IncomeInsights"
import { getAllSavings, TFetchedSaving } from "@/server/db/savings"
import { getAllBudgetedFixedExpenses, getAllBudgetedVariableExpenses, TFetchedBudgetedExpense } from "@/server/db/expenses"

export default async function FetchIncomeInsights({
    userId,
} : {
    userId: string
}) {

    let errorMessage: null | string = null
    let allIncome: TFetchedIncome[] = []
    let allSavings: TFetchedSaving[] = []
    let allExpensesBudget_Fixed: TFetchedBudgetedExpense[] = []
    let allExpensesBudget_Variable: TFetchedBudgetedExpense[] = []

    // Fetch data here to make suspense work
    try {

        allIncome = await getAllIncome(userId)
        allSavings = await getAllSavings(userId)
        allExpensesBudget_Fixed = await getAllBudgetedFixedExpenses(userId)
        allExpensesBudget_Variable = await getAllBudgetedVariableExpenses(userId)
       
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
                    <div className="FetchIncomeInsights">
                        <IncomeInsights 
                            allIncome={allIncome}
                            allSavings={allSavings}
                            allExpensesBudget_Fixed={allExpensesBudget_Fixed}
                            allExpensesBudget_Variable={allExpensesBudget_Variable}
                        />
                    </div>
                )
            }
        </>
    )
}
