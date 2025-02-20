import { getAllTransactions, TFetchedAllTransactions } from "@/server/db/transactions"
import { TransactionDataTable } from "@/app/(protected)/transactions/_components/TransactionDataTable";
import { getAllCategories, getAllCategoryNames, TFetchedAllCategories } from "@/server/db/categories";
import { getAllCardNames, getAllCards, TFetchedCard } from "@/server/db/cards";
import { getAllAccountNames, getAllAccounts, TFetchedAccount } from "@/server/db/accounts";
import { getUserSubscriptionTier } from "@/server/db/subscription";

export default async function TransactionList({
    userId,
    searchParams,
    canCreate
} : {
    userId: string
    searchParams: { [key: string]: string | string[] | undefined }
    canCreate: boolean
}) {

    const { name } = await getUserSubscriptionTier(userId)
    console.log('name - ', name)

    const month = Number(searchParams.month) || new Date().getMonth() + 1
    const year = Number(searchParams.year) || new Date().getFullYear()

    let errorMessage: null | string = null

    // For Data Table and Form
    let allTransactions: TFetchedAllTransactions = []
    let allCategories: TFetchedAllCategories = []
    let allCards: TFetchedCard[] = [];
    let allAccounts: TFetchedAccount[] = [];

    // For Filters
    let allCategoryNames: string[] = []
    let allCardNames: string[] = []
    let allAccountNames: string[] = []

    try {

        allTransactions = await getAllTransactions(userId, month, year)
        const result = await getAllCategories(userId)
        allCategories = result.allCategories
        allCards = await getAllCards(userId)
        allAccounts = await getAllAccounts(userId)

        allCategoryNames = await getAllCategoryNames(userId)
        allCardNames = await getAllCardNames(userId)
        allAccountNames = await getAllAccountNames(userId)

    } catch (error) {
        if (error instanceof Error) {
            errorMessage = error.message
        }
    }

    // console.log('allTransactions - ', allTransactions)
    
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
                                allCards={allCards} 
                                allAccounts={allAccounts}

                                allCategoryNames={allCategoryNames}
                                allCardNames={allCardNames}
                                allAccountNames={allAccountNames}
                                canCreate={canCreate}

                                planName={name}
                            />
                        </div>
                    </div>
                )
            }
        </>
    )
}