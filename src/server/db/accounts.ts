import { db } from "@/drizzle/db";
import { AccountsTable, TransactionsTable } from "@/drizzle/schema"
import { eq, count, asc, and } from "drizzle-orm";
import { TDatabaseResponse } from "./categories";
import { TInsertAccount } from "@/zod/Accounts";
import { getTransactionsIdByAccountId, resetTransactionAccountId } from "./transactions";

export type TFetchedAccount = typeof AccountsTable.$inferSelect
export type TFetchedAccountWithChildTransactionCount = TFetchedAccount & {
    childTransactionsCount: number
}

// const OPERATION_DELAY = 2000
// await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

export async function getAllAccounts(
    userId: string
) {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const allAccounts = await db
        .select()
        .from(AccountsTable)
        .where(
            eq(AccountsTable.clerkUserId, userId),
        )
        .orderBy(
            asc(AccountsTable.createdAt)
        )

    // Get X transactions tied to this account
    const allAccountsWithChildTransactionsCount = await Promise.all(
        allAccounts.map(async (account) => {
            const count = await getChildTransactionsCount(userId, account.accountId)
            return {
                ...account,
                childTransactionsCount: count
            }
        })
    )

    return allAccountsWithChildTransactionsCount
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
            .where(and(eq(AccountsTable.clerkUserId, userId), eq(AccountsTable.accountId, accountId)))
            .returning()

        return { success: true, dbResponseMessage: `Account '${updatedAccount.accountName}' successfully updated`}

    } catch (error) {

        if (error instanceof Error) {
            // TODO: Handle any update failures
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
                resetTransactionAccountId(transaction.id, userId)
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
            // TODO: Handle any delete failures
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }

    }
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

export async function getChildTransactionsCount(userId: string, accountId: string) {

    const [ result ] = await db
        .select(
            { count: count() }
        )
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId),
                eq(TransactionsTable.transactionAccountIdFK, accountId)
            )
        )
    
    return result.count
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