import { getAllIncome, TFetchedIncome } from "@/server/db/income"
import IncomeStreams from "./IncomeStreams"

export default async function FetchIncomeStreams({
    userId,
} : {
    userId: string
}) {

    let errorMessage: null | string = null
    let allIncome: TFetchedIncome[] = []

    // Fetch data here to make suspense work
    try {

        allIncome = await getAllIncome(userId)
       
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
                    <div className="FetchIncomeStreams">
                        <IncomeStreams
                            allIncome={allIncome}
                        />
                    </div>
                )
            }
        </>
    )
}
