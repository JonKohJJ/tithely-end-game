import { getAllTransactions, TFetchedAllTransactions } from "@/server/db/transactions"
import { TransactionDataTable } from "@/app/(protected)/transactions/_components/TransactionDataTable";
import { getAllCategories, getAllCategoryNames, TFetchedAllCategories } from "@/server/db/categories";

export default async function TransactionList({
    userId,
    searchParams,
    canCreate
} : {
    userId: string
    searchParams: { [key: string]: string | string[] | undefined }
    canCreate: boolean
}) {

    const month = Number(searchParams.month) || new Date().getMonth() + 1
    const year = Number(searchParams.year) || new Date().getFullYear()

    let errorMessage: null | string = null
    let allTransactions: TFetchedAllTransactions = []
    let allCategoryNames: string[] = []
    let allCategories: TFetchedAllCategories = []

    try {

        allTransactions = await getAllTransactions(userId, month, year)
        // For Category Filter
        allCategoryNames = await getAllCategoryNames(userId)
        // For Transaction Form
        const result = await getAllCategories(userId)
        allCategories = result.allCategories

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
                    <div className="transaction-list flex flex-col gap-8">
                        <div className="transaction-table-container">
                            <TransactionDataTable
                                data={allTransactions} 
                                allCategories={allCategories} 
                                allCategoryNames={allCategoryNames}
                                canCreate={canCreate}
                            />
                        </div>
                    </div>
                )
            }
        </>
    )
}