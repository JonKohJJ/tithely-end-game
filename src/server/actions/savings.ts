"use server"

import { SavingSchema, TInsertSaving } from "@/zod/savings"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import {
    addSaving as addSavingDb,
    updateSaving as updateSavingDb,
    deleteSaving as deleteSavingDb
} from '../db/savings'
import { canCreateSavings } from "../permissions"
import { TDatabaseResponse } from "../db/shared"
import { checkDuplicateName } from "./shared"


export async function addSaving(
    unsafeData: TInsertSaving
): Promise<TDatabaseResponse> {
    
    const { userId } = await auth()
    const { success, data } = SavingSchema.safeParse(unsafeData)
    const { canCreateSaving } = await canCreateSavings(userId)

    if (!success || userId == null || !canCreateSaving) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error adding your saving goal" }
    }

    if (await checkDuplicateName(userId, data.savingName, "saving")) {
        return { success: false, dbResponseMessage: "No duplicated saving goal name allowed. Please add a different one." }
    }

    revalidatePath('/dashboard')
    return await addSavingDb({ ...data, clerkUserId: userId })
}

export async function updateSaving(
    savingId: string,
    unsafeData: TInsertSaving
) {

    const { userId } = await auth()
    const { success, data } = SavingSchema.safeParse(unsafeData)
    if (!success || userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error updating your saving goal" }
    }

    revalidatePath('/dashboard')
    return await updateSavingDb(data, { savingId, userId })
}

export async function deleteSaving(
    savingId: string
) {
    
    const { userId } = await auth()
    if (userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error deleting your saving goal" }
    }

    revalidatePath('/dashboard') 
    return await deleteSavingDb({ savingId, userId })
}