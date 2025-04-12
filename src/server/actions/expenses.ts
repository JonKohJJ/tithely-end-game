"use server"

import { ExpenseSchema, TInsertExpense } from "@/zod/expenses"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import {
    addExpense as addExpenseDb,
    updateExpense as updateExpenseDb,
    deleteExpense as deleteExpenseDb
} from '../db/expenses'
import { canCreateExpenses } from "../permissions"
import { TDatabaseResponse } from "../db/shared"
import { checkDuplicateName } from "./shared"


export async function addExpense(
    unsafeData: TInsertExpense
): Promise<TDatabaseResponse> {
    
    const { userId } = await auth()
    const { success, data } = ExpenseSchema.safeParse(unsafeData)
    const { canCreateExpense } = await canCreateExpenses(userId)
    if (!success || userId == null || !canCreateExpense) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error adding your expense category" }
    }

    if (await checkDuplicateName(userId, data.expenseName, "expense")) {
        return { success: false, dbResponseMessage: "No duplicated expense name allowed. Please add a different one." }
    }

    revalidatePath('/dashboard')
    return await addExpenseDb({ ...data, clerkUserId: userId })
}

export async function updateExpense(
    expenseId: string,
    unsafeData: TInsertExpense
) {

    const { userId } = await auth()
    const { success, data } = ExpenseSchema.safeParse(unsafeData)
    if (!success || userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error updating your saving goal" }
    }

    revalidatePath('/dashboard')
    return await updateExpenseDb(data, { expenseId, userId })
}

export async function deleteExpense(
    expenseId: string
) {
    
    const { userId } = await auth()
    if (userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error deleting your expense" }
    }

    revalidatePath('/dashboard') 
    return await deleteExpenseDb({ expenseId, userId })
}