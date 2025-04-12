"use server"

import { TInsertNewTransaction, TransactionSchema } from "@/zod/transaction"
import { TDatabaseResponse } from "../db/shared"
import { canCreateTransactions } from "../permissions"
import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import {
    addTransaction as addTransactionDb,
    updateTransaction as updateTransactionDb,
    deleteTransaction as deleteTransactionDb,
    deleteBulkTransactions as deleteBulkTransactionsDb,
} from '../db/transactions'

export async function addTransaction(
    unsafeData: TInsertNewTransaction
): Promise<TDatabaseResponse> {

    const { userId } = await auth()
    const { success, data } = TransactionSchema.safeParse(unsafeData)
    const { canCreateTransaction } = await canCreateTransactions(userId)
    if (!success || userId == null || !canCreateTransaction) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error adding your transaction" }
    }

    revalidatePath('/dashboard') 
    return await addTransactionDb({ ...data, clerkUserId: userId })
}

export async function updateTransaction(
    transactionId: string,
    unsafeData: TInsertNewTransaction
) {
    const { userId } = await auth()
    const { success, data } = TransactionSchema.safeParse(unsafeData)

    if (!success || userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error updating your transaction" }
    }

    revalidatePath('/dashboard')
    return await updateTransactionDb(data, { transactionId, userId })
}

export async function deleteTransaction(transactionId: string) {
    const { userId } = await auth()

    if (userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error deleting your transaction" }
    }

    revalidatePath('/dashboard') 
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
