import { getAllAccounts, TFetchedAccount } from "@/server/db/accounts"
import AllAccounts from "./AllAccounts"


export default async function FetchAllAccounts({
    userId,
    searchParams
} : {
    userId: string
    searchParams: { [key: string]: string | string[] | undefined }
}) {

    const month = Number(searchParams.month) || new Date().getMonth() + 1
    const year = Number(searchParams.year) || new Date().getFullYear()

    let errorMessage: null | string = null
    let allAccounts: TFetchedAccount[] = []

    try {
        allAccounts = await getAllAccounts(userId, month, year)

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
                    <div className="FetchAllAccounts">
                        <AllAccounts
                            allAccounts={allAccounts}
                        />
                    </div>
                )
            }
        </>
    )
}
