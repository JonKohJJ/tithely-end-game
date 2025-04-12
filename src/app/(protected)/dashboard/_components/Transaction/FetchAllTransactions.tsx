import { TSelectOption } from "./TransactionForm"
import { getIncomeDropdownOptions } from "@/server/db/income"
import { getSavingsDropdownOptions } from "@/server/db/savings"
import { getExpensesDropdownOptions } from "@/server/db/expenses"
import { getAccountsDropdownOptions } from "@/server/db/accounts"
import { getCardsDropdownOptions } from "@/server/db/cards"
import { getAllTransactions, TFetchedTransaction } from "@/server/db/transactions"
import AllTransactions from "./AllTransactions"

export default async function FetchAllTransactions({

    userId,
    searchParams,

    canCreateTransaction,
    maxNumberOfTransactions,

    maxNumberOfCards,
    maxNumberOfAccounts

} : {

    userId: string
    searchParams: { [key: string]: string | string[] | undefined }

    canCreateTransaction: boolean
    maxNumberOfTransactions: number | "Unlimited"

    maxNumberOfCards: number
    maxNumberOfAccounts: number

}) {

    const month = Number(searchParams.month) || new Date().getMonth() + 1
    const year = Number(searchParams.year) || new Date().getFullYear()

    // All Fetched Required Data
    let incomeDropdownOptions: TSelectOption[] = []
    let savingsDropdownOptions: TSelectOption[] = []
    let expensesDropdownOptions: TSelectOption[] = []
    let accountsDropdownOptions: TSelectOption[] = []
    let cardsDropdownOptions: TSelectOption[] = []
    let allTransactions: TFetchedTransaction[] = []

    let errorMessage: null | string = null

    try {

        incomeDropdownOptions = await getIncomeDropdownOptions(userId)
        savingsDropdownOptions = await getSavingsDropdownOptions(userId)
        expensesDropdownOptions = await getExpensesDropdownOptions(userId)
        accountsDropdownOptions = await getAccountsDropdownOptions(userId)
        cardsDropdownOptions = await getCardsDropdownOptions(userId)
        allTransactions = await getAllTransactions(userId, month, year)

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
                    <div className="FetchAllTransactions">
                    
                        <AllTransactions
                            data={allTransactions}

                            incomeDropdownOptions={incomeDropdownOptions}
                            savingsDropdownOptions={savingsDropdownOptions}
                            expensesDropdownOptions={expensesDropdownOptions}
                            accountsDropdownOptions={accountsDropdownOptions}
                            cardsDropdownOptions={cardsDropdownOptions}

                            // For Add Button
                            canCreateTransaction={canCreateTransaction}
                            maxNumberOfTransactions={maxNumberOfTransactions}

                            // For Transaction Form
                            maxNumberOfCards={maxNumberOfCards}
                            maxNumberOfAccounts={maxNumberOfAccounts}
                        />
                    </div>
                )
            }
        </>
    )
}
