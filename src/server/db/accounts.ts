import { db } from "@/drizzle/db";
import { AccountsTable, TransactionsTable } from "@/drizzle/schema"
import { eq, count, asc, and, sql, sum } from "drizzle-orm";
import { TInsertAccount } from "@/zod/accounts";
import { TSelectOption } from "@/app/(protected)/dashboard/_components/Transaction/TransactionForm";
import { getChildTransactionsCount, TDatabaseResponse } from "./shared";
import { getTransactionsIdByAccountId, resetTransactionAccountId } from "./transactions";


export async function addAccount(
    values: typeof AccountsTable.$inferInsert
) : Promise<TDatabaseResponse> {

    try {

        const [insertedAccount] = await db
            .insert(AccountsTable)
            .values(values)
            .returning()

        return { success: true, dbResponseMessage: `Account '${insertedAccount.accountName}' successfully added`}

    } catch (error) {

        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` };
        }
        
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" };
    }
}
export async function updateAccount(
    values: TInsertAccount,
    { accountId, userId } : { accountId: string, userId: string }
) : Promise<TDatabaseResponse> {

    try {

        const [updatedAccount] = await db
            .update(AccountsTable)
            .set(values)
            .where(and(
                    eq(AccountsTable.clerkUserId, userId), 
                    eq(AccountsTable.accountId, accountId)
                )
            )
            .returning()

        return { success: true, dbResponseMessage: `Account '${updatedAccount.accountName}' successfully updated`}

    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }
    }
}
export async function deleteAccount({
    accountId, 
    userId
} : {
    accountId: string, 
    userId: string
}) : Promise<TDatabaseResponse> {

    try {

        // Get child transaction with the accountIdFK, and reset accountIdFK to null
        const respectiveTransactions = await getTransactionsIdByAccountId(accountId, userId)
        await Promise.all(
            respectiveTransactions.map(async (transaction) => {
                await resetTransactionAccountId(transaction.id, userId)
            })
        )
        
        console.log("ACCOUNT start - ", respectiveTransactions)
        const [deletedAccount] = await db
            .delete(AccountsTable)
            .where(and(eq(AccountsTable.clerkUserId, userId), eq(AccountsTable.accountId, accountId)))
            .returning()
        
        console.log("ACCOUNT end deletedAccount - ", deletedAccount)
        return { success: true, dbResponseMessage: `Account '${deletedAccount.accountName}' successfully deleted`}

    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }
    }
}

// const OPERATION_DELAY = 2000
// await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

export type TFetchedAccount = typeof AccountsTable.$inferSelect & {
    accountMonthlyBalance: number
    childTransactionCount: number
}
export async function getAllAccounts(
    userId: string,
    month: number,
    year: number,
): Promise<TFetchedAccount[]> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const result = await db
        .select()
        .from(AccountsTable)
        .where(
            eq(AccountsTable.clerkUserId, userId),
        )
        .orderBy(
            asc(AccountsTable.createdAt)
        )

    // Calculate accountMonthlyBalance & child transaction count
    const allAccounts = await Promise.all(
        result.map(async (item) => {

            const accountMonthlyBalance = await getAccountMonthlyBalance(item.accountId, month, year)
            const childTransactionCount = await getChildTransactionsCount(userId, item.accountId, "Accounts")

            return ({
                ...item,
                accountMonthlyBalance,
                childTransactionCount,
            })
        })
    )

    return allAccounts
}
export async function getAllAccountNames(
    userId: string, 
) {
    
    const allNames: string[] = []

    const data = await db
        .select({
            name: AccountsTable.accountName
        })
        .from(AccountsTable)
        .where(
            eq(AccountsTable.clerkUserId, userId)
        )
    
    data.map(item => {
        allNames.push(item.name)
    })
    
    return allNames
}
export async function getAccountsCount(
    userId: string
) {
    const [ result ] = await db
        .select(
            { count: count() }
        )
        .from(AccountsTable)
        .where(
            eq(AccountsTable.clerkUserId, userId)
        )
    return result.count
}
export async function getAccountMonthlyBalance(
    accountId: string,
    month: number,
    year: number,
): Promise<number> {

    // total monthly income - total monthly savings - total monthly expenses
    const totalMonthlyIncome = await getTotalMonthlyIncomeByAccountId(accountId, month, year)
    const totalMonthlySavings = await getTotalMonthlySavingsByAccountId(accountId, month, year)
    const totalMonthlyExpenses = await getTotalMonthlyExpensesByAccountId(accountId, month, year)

    const accountMonthlyBalance = totalMonthlyIncome - totalMonthlySavings - totalMonthlyExpenses
    return accountMonthlyBalance
}
async function getTotalMonthlyIncomeByAccountId(    
    accountId: string,
    month: number,
    year: number
) {

    const [ result ] = await db
        .select({
            total: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.transactionType, "Income"),
                eq(TransactionsTable.transactionAccountIdFK, accountId),
                sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`
            )
        )

    return result.total === null 
        ? 0 
        : Number(result.total)
}
async function getTotalMonthlySavingsByAccountId(    
    accountId: string,
    month: number,
    year: number
) {

    const [ result ] = await db
        .select({
            total: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.transactionType, "Savings"),
                eq(TransactionsTable.transactionAccountIdFK, accountId),
                sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`
            )
        )

    return result.total === null 
        ? 0 
        : Number(result.total)
}
async function getTotalMonthlyExpensesByAccountId(    
    accountId: string,
    month: number,
    year: number
) {

    const [ result ] = await db
        .select({
            total: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.transactionType, "Expenses"),
                eq(TransactionsTable.transactionAccountIdFK, accountId),
                sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`
            )
        )

    return result.total === null 
        ? 0 
        : Number(result.total)
}


// For Transaction Form
export async function getAccountsDropdownOptions(
    userId: string,
): Promise<TSelectOption[]> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const result = await db
        .select({
            label: AccountsTable.accountName,
            value: AccountsTable.accountId
        })
        .from(AccountsTable)
        .where(
            and(
                eq(AccountsTable.clerkUserId, userId)
            )
        )
        .orderBy(asc(AccountsTable.createdAt))

    return result
}


// For user subscription cancellation
export async function deleteAllAccounts(userId: string) {

    // Find all accounts associated with this userId
    const respectiveAccounts = await db
        .select({ id: AccountsTable.accountId })
        .from(AccountsTable)
        .where(
            eq(AccountsTable.clerkUserId, userId),
        )

    await Promise.all(
        respectiveAccounts.map(async (account) => {
            const accountId = account.id
            deleteAccount({accountId, userId})
        })
    )
}