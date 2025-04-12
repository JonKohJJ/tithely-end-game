"use server"

import { IncomeSchema, TInsertIncome } from "@/zod/income"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import {
    addIncome as addIncomeDb,
    updateIncome as updateIncomeDb,
    deleteIncome as deleteIncomeDb
} from '../db/income'
import { canCreateIncomes } from "../permissions"
import { TDatabaseResponse } from "../db/shared"
import { checkDuplicateName } from "./shared"


export async function addIncome(
    unsafeData: TInsertIncome
): Promise<TDatabaseResponse> {
    
    const { userId } = await auth()
    const { success, data } = IncomeSchema.safeParse(unsafeData)
    const { canCreateIncome } = await canCreateIncomes(userId)
    if (!success || userId == null || !canCreateIncome) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error adding your income stream" }
    }

    if (await checkDuplicateName(userId, data.incomeName, "income")) {
        return { success: false, dbResponseMessage: "No duplicated income stream name allowed. Please add a different one." }
    }

    revalidatePath('/dashboard')
    return await addIncomeDb({ ...data, clerkUserId: userId })
}

export async function updateIncome(
    incomeId: string,
    unsafeData: TInsertIncome
) {

    const { userId } = await auth()
    const { success, data } = IncomeSchema.safeParse(unsafeData)
    if (!success || userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error updating your income stream" }
    }

    revalidatePath('/dashboard')
    return await updateIncomeDb(data, { incomeId, userId })
}

export async function deleteIncome(
    incomeId: string
) {
    
    const { userId } = await auth()
    if (userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error deleting your income stream" }
    }

    revalidatePath('/dashboard') 
    return await deleteIncomeDb({ incomeId, userId })
}