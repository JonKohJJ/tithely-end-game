import { getAllIncome, TFetchedIncome } from "@/server/db/income"
import IncomeSankeyDiagram from "./IncomeSankeyDiagram"
import { getAllSavings, TFetchedSaving } from "@/server/db/savings"
import { getAllBudgetedFixedExpenses, getAllBudgetedVariableExpenses, TFetchedBudgetedExpense } from "@/server/db/expenses"

export default async function FetchIncomeSankeyDiagramData({
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
                    <div className="FetchIncomeSankeyDiagramData">
                        <IncomeSankeyDiagram
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
