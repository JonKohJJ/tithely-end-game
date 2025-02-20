"use server"

import { TInsertTransaction, TransactionSchema } from "@/zod/transactions"
import { TDatabaseResponse } from "../db/categories"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import {
    addTransaction as addTransactionDb,
    updateTransaction as updatedTransactionDb,
    deleteTransaction as deleteTransactionDb,
    deleteBulkTransactions as deleteBulkTransactionsDb
} from '../db/transactions'
import { canCreateTransaction } from "../permissions"

export async function addTransaction(
    unsafeData: TInsertTransaction
): Promise<TDatabaseResponse> {

    const { userId } = await auth()
    const { success, data } = TransactionSchema.safeParse(unsafeData)

    const { canCreate } = await canCreateTransaction(userId)
    if (!success || userId == null || !canCreate) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error adding your transaction" }
    }

    revalidatePath('/transactions')
    return await addTransactionDb({ ...data, clerkUserId: userId })
}

export async function updateTransaction(
    transactionId: string,
    unsafeData: TInsertTransaction
) {
    const { userId } = await auth()
    const { success, data } = TransactionSchema.safeParse(unsafeData)

    if (!success || userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error updating your transaction" }
    }

    revalidatePath('/transactions') 
    return await updatedTransactionDb(data, { transactionId, userId })
}

export async function deleteTransaction(transactionId: string) {
    const { userId } = await auth()

    if (userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error deleting your transaction" }
    }

    revalidatePath('/transactions') 
    return await deleteTransactionDb({ transactionId, userId })
}

export async function deleteBulkTransactions(selectedTransactions: Set<string>) {
    const { userId } = await auth()

    if (userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error bulk deleting your transactions" }
    }

    revalidatePath('/transactions') 
    return await deleteBulkTransactionsDb({ selectedTransactions, userId })
}