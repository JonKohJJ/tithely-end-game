import SavingsGoals from "./SavingsGoals"
import { getAllSavings, TFetchedSaving } from "@/server/db/savings"

export default async function FetchSavingsGoals({
    userId,
    maxNumberOfSavings,
} : {
    userId: string
    maxNumberOfSavings: number
}) {

    let errorMessage: null | string = null
    let allSavings: TFetchedSaving[] = []

    // Fetch data here to make suspense work
    try {

        allSavings = await getAllSavings(userId)
       
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
                    <div className="FetchSavingsGoals">
                        <SavingsGoals
                            allSavings={allSavings}
                            maxNumberOfSavings={maxNumberOfSavings}
                        />
                    </div>
                )
            }
        </>
    )
}
