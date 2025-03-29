import ExpensesBudgetPieChart from "./ExpensesBudgetPieChart"
import { getAllExpenseBudget, TFetchedAllExpensesBudget } from "@/server/db/analytics"

export default async function FetchExpensesBudgetPieChart({
    userId
} : {
    userId: string
}) {

    let errorMessage: null | string = null
    let allExpensesBudget: TFetchedAllExpensesBudget[] = []

    // Fetch data here to make suspense work
    try {

        allExpensesBudget = await getAllExpenseBudget(userId)

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
                    <div className={`FetchExpensesBudgetPieChart`}>
                        <ExpensesBudgetPieChart 
                            allExpensesBudget={allExpensesBudget}
                        />
                    </div>
                )
            }
        </>
    )
}
