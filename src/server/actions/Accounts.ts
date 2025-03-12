"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { TDatabaseResponse } from "../db/categories"
import { canCreateAccount } from "../permissions"
import { AccountSchema, TInsertAccount } from "@/zod/Accounts"
import { 
    addAccount as addAccountDb,
    updateAccount as updateAccountDb,
    deleteAccount as deleteAccountDb,
    getAllAccountNames 
} from "../db/accounts"

export async function addAccount(
    unsafeData: TInsertAccount
): Promise<TDatabaseResponse> {
    const { userId } = await auth()
    const { success, data } = AccountSchema.safeParse(unsafeData)

    const { canCreate } = await canCreateAccount(userId)
    if (!success || userId == null || !canCreate) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error adding your card" }
    }

    // Check for duplicate card name
    const hasDuplicatedCardName = await hasDuplicateAccountName(userId, data.accountName)
    if (hasDuplicatedCardName) {
        return { success: false, dbResponseMessage: "No duplicated account name allowed. Please add a different one." }
    }

    revalidatePath('/planner') 
    return await addAccountDb({ 
        ...data, 
        accountBalance: 0,
        clerkUserId: userId
    })
}

export async function updateAccount(
    accountId: string,
    unsafeData: TInsertAccount
) {
    const { userId } = await auth()
    const { success, data } = AccountSchema.safeParse(unsafeData)

    if (!success || userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error updating your card" }
    }

    revalidatePath('/planner')
    return await updateAccountDb(data, { accountId, userId })
}

export async function deleteAccount(accountId: string) {
    const { userId } = await auth()

    if (userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error deleting your card" }
    }

    revalidatePath('/planner') 
    return await deleteAccountDb({ accountId, userId })
}

async function hasDuplicateAccountName(
    userId: string,
    nameToBeChecked: string
) {
    const allAccountNames = await getAllAccountNames(userId)

    if (allAccountNames.includes(nameToBeChecked)) {
        return true
    }

    return false
}