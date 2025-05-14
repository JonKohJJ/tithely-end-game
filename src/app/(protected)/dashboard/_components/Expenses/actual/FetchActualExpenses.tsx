import { getAllActualExpense, TFetchedActualExpense } from "@/server/db/expenses"
import ActualExpenses from "./ActualExpenses"

export default async function FetchActualExpenses({
    userId,
    searchParams
} : {
    userId: string
    searchParams: { [key: string]: string | string[] | undefined }
}) {

    const month = Number(searchParams.month) || new Date().getMonth() + 1
    const year = Number(searchParams.year) || new Date().getFullYear()
    const showClaimables = searchParams.showClaimables === "true" ? true : false

    let errorMessage: null | string = null
    let allActualExpenses: TFetchedActualExpense[] = []

    // Fetch data here to make suspense work
    try {

        allActualExpenses = await getAllActualExpense(userId, month, year, showClaimables)

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
                    <div className="FetchActualExpenses h-full">
                        <ActualExpenses
                            allActualExpenses={allActualExpenses}
                        />
                    </div>
                )
            }
        </>
    )
}
