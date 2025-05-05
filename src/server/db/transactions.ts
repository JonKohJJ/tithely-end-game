import { TransactionsTable } from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { eq, and, sql, desc, sum, count } from "drizzle-orm";
import { TInsertNewTransaction } from "@/zod/transaction";
import { TDatabaseResponse } from "./shared";

export async function addTransaction(
    values: typeof TransactionsTable.$inferInsert
) : Promise<TDatabaseResponse> {

    try {

        const [insertedTransaction] = await db
            .insert(TransactionsTable)
            .values(values)
            .returning()

        return { success: true, dbResponseMessage: `Transaction'${insertedTransaction.transactionDescription}' successfully added`}

    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` };
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" };
    }
}
export async function updateTransaction(
    values: TInsertNewTransaction,
    { transactionId, userId } : { transactionId: string, userId: string }
) : Promise<TDatabaseResponse> {

    try {

        const [updatedTransaction] = await db
            .update(TransactionsTable)
            .set(values)
            .where(and(eq(TransactionsTable.clerkUserId, userId), eq(TransactionsTable.transactionId, transactionId)))
            .returning()

        return { success: true, dbResponseMessage: `Transaction '${updatedTransaction.transactionDescription}' successfully updated`}

    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }
    }
}
export async function deleteTransaction({
    transactionId, 
    userId
} : {
    transactionId: string, 
    userId: string
}) : Promise<TDatabaseResponse> {

    try {

        const [deletedTransaction] = await db
            .delete(TransactionsTable)
            .where(and(eq(TransactionsTable.clerkUserId, userId), eq(TransactionsTable.transactionId, transactionId)))
            .returning()

        return { success: true, dbResponseMessage: `Transaction '${deletedTransaction.transactionDescription}' successfully deleted`}

    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }

    }
}
export async function deleteBulkTransactions({
    selectedTransactions, 
    userId
} : {
    selectedTransactions: Set<string>
    userId: string
}) : Promise<TDatabaseResponse> {

    try {

        const allDeleted: Set<string> = new Set()
        for (const transactionId of selectedTransactions) {
            const [ deleted ] = await db
                .delete(TransactionsTable)
                .where(and(eq(TransactionsTable.clerkUserId, userId), eq(TransactionsTable.transactionId, transactionId)))
                .returning()
            
            if (deleted) {
                allDeleted.add(deleted.transactionId)
            }
        }

        if (selectedTransactions.size === allDeleted.size) {
            return { success: true, dbResponseMessage: `All transactions successfully deleted`}
        }

        return { success: false, dbResponseMessage: `${allDeleted.size} transactions successfully deleted, but ${selectedTransactions.size - allDeleted.size} transactions were not deleted, please try again`}


    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }
    }
}


// const OPERATION_DELAY = 5000
// await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

export type TFetchedTransaction = typeof TransactionsTable.$inferSelect & {

}
export async function getAllTransactions(
    userId: string,
    month: number,
    year: number,
): Promise<TFetchedTransaction[]> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const allTransactions = await db
        .select()
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId),
                sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`
            )
        )
        .orderBy(
            desc(TransactionsTable.transactionDate),
            desc(TransactionsTable.createdAt),
        )

    return allTransactions
}
export async function getTransactionsCount(
    userId: string
) {
    const [ result ] = await db
        .select(
            { count: count() }
        )
        .from(TransactionsTable)
        .where(
            eq(TransactionsTable.clerkUserId, userId)
        )
    return result.count
}


// Insights Transactions
export async function getLastTransactionSummary(
    userId: string
) {

    // 01. Get date of last transaction
    const [result] = await db
        .select({
            transactionDate: TransactionsTable.transactionDate
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId)
            )
        )
        .orderBy(desc(TransactionsTable.transactionDate))
        .limit(1)

    // Handle if no transactions are found
    if (!result) {
        return "No transactions found"
    }

    // 02. Calculate the days difference between now and the transaction date
    const daysDifference = Math.floor((new Date().getTime() - new Date(result.transactionDate).getTime()) / (1000 * 3600 * 24))
    // Generate the dynamic string based on the days difference
    let daysSinceLastTransaction = ''
    if (daysDifference === 0) {
        daysSinceLastTransaction = "You are on track, good job!"
    } else if (daysDifference < 0) {
        daysSinceLastTransaction = `You are ${Math.abs(daysDifference)} day${Math.abs(daysDifference) > 1 ? 's' : ''} ahead of schedule!`
    } else {
        daysSinceLastTransaction = `${daysDifference} day${daysDifference > 1 ? 's' : ''} since last transaction`
    }

    return `Your last transaction was on ${new Date(result.transactionDate).toDateString()} - ${daysSinceLastTransaction}`
}
export async function calculateTotalClaims(
    userId: string,
    month: number,
    year: number,
): Promise<string> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const [ result ] = await db
        .select({
            totalClaims: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId),
                sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`,
                eq(TransactionsTable.isClaimable, true)
            )
        )

    return result.totalClaims ? `$${result.totalClaims}` : "$0"
}


// For Card deletion
export async function getTransactionsIdByCardId(    
    cardId: string, 
    userId: string
) {

    const respectiveTransactions = await db
        .select({ id: TransactionsTable.transactionId })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId),
                eq(TransactionsTable.transactionCardIdFK, cardId),
            )
        )

    return respectiveTransactions
}
export async function resetTransactionCardId(
    transactionId: string,
    userId: string
) {
    await db
        .update(TransactionsTable)
        .set({ transactionCardIdFK: null })
        .where(and(eq(TransactionsTable.clerkUserId, userId), eq(TransactionsTable.transactionId, transactionId)))
}


// For Account deletion
export async function getTransactionsIdByAccountId(    
    accountId: string, 
    userId: string
) {

    const respectiveTransactions = await db
        .select({ id: TransactionsTable.transactionId })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId),
                eq(TransactionsTable.transactionAccountIdFK, accountId),
            )
        )

    return respectiveTransactions
}
export async function resetTransactionAccountId(
    transactionId: string,
    userId: string
) {
    await db
        .update(TransactionsTable)
        .set({ transactionAccountIdFK: null })
        .where(and(eq(TransactionsTable.clerkUserId, userId), eq(TransactionsTable.transactionId, transactionId)))
}