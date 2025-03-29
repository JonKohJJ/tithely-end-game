import { getSavingsGoalsData, TSavingGoal } from "@/server/db/analytics"
import SavingsGoals from "./SavingsGoals"

export default async function FetchSavingsGoalsData({
    userId
} : {
    userId: string
}) {

    let errorMessage: null | string = null
    let allSavingsGoalsData: TSavingGoal[] = []

    // Fetch data here to make suspense work
    try {

        allSavingsGoalsData = await getSavingsGoalsData(userId)

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
                    <div className={`FetchSavingsGoalsData`}>
                        <SavingsGoals 
                            allSavingsGoalsData={allSavingsGoalsData} 
                        />
                    </div>
                )
            }
        </>
    )
}
