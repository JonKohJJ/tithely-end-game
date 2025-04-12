import { getAllBudgetedExpenses, TFetchedBudgetedExpense } from "@/server/db/expenses"
import BudgetedExpenses from "./BudgetedExpenses"

export default async function FetchBudgetedExpenses({
    userId
} : {
    userId: string
}) {

    let errorMessage: null | string = null
    let allExpensesBudget: TFetchedBudgetedExpense[] = []

    // Fetch data here to make suspense work
    try {

        allExpensesBudget = await getAllBudgetedExpenses(userId)

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
                    <div className="FetchBudgetedExpenses h-full">
                        <BudgetedExpenses
                            allExpensesBudget={allExpensesBudget}
                        />
                    </div>
                )
            }
        </>
    )
}
