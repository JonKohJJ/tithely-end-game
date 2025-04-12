import { calculateTotalClaims, getLastTransactionSummary } from "@/server/db/transactions"
import TransactionInsights from "./TransactionInsights"


export default async function FetchTransactionsInsights({
    userId,
    searchParams,
    maxNumberOfTransactions,
    transactionsCount,
} : {
    userId: string
    searchParams: { [key: string]: string | string[] | undefined }
    maxNumberOfTransactions: number | "Unlimited"
    transactionsCount: number
}) {

    const month = Number(searchParams.month) || new Date().getMonth() + 1
    const year = Number(searchParams.year) || new Date().getFullYear()

    // All Fetched Required Data
    let lastTransactionSummary: string = ""
    let totalClaims: string = ""
    let errorMessage: null | string = null

    try {

        lastTransactionSummary = await getLastTransactionSummary(userId)
        totalClaims = await calculateTotalClaims(userId, month, year)

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
                    <TransactionInsights
                        lastTransactionSummary={lastTransactionSummary}
                        totalClaims={totalClaims}
                        maxNumberOfTransactions={maxNumberOfTransactions}
                        transactionsCount={transactionsCount}
                    />
                )
            }
        </>
    )
}
