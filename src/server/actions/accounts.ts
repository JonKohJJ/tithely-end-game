"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { AccountSchema, TInsertAccount } from "@/zod/accounts"
import { 
    addAccount as addAccountDb,
    updateAccount as updateAccountDb,
    deleteAccount as deleteAccountDb,
} from "../db/accounts"
import { canCreateAccounts } from "../permissions"
import { TDatabaseResponse } from "../db/shared"
import { checkDuplicateName } from "./shared"


export async function addAccount(
    unsafeData: TInsertAccount
): Promise<TDatabaseResponse> {

    const { userId } = await auth()
    const { success, data } = AccountSchema.safeParse(unsafeData)
    const { canCreateAccount } = await canCreateAccounts(userId)
    if (!success || userId == null || !canCreateAccount) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error adding your account" }
    }

    if (await checkDuplicateName(userId, data.accountName, "account")) {
        return { success: false, dbResponseMessage: "No duplicated account name allowed. Please add a different one." }
    }

    revalidatePath('/dashboard') 
    return await addAccountDb({ ...data, clerkUserId: userId })
}

export async function updateAccount(
    accountId: string,
    unsafeData: TInsertAccount
) {
    const { userId } = await auth()
    const { success, data } = AccountSchema.safeParse(unsafeData)

    if (!success || userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error updating your account" }
    }

    revalidatePath('/dashboard')
    return await updateAccountDb(data, { accountId, userId })
}

export async function deleteAccount(
    accountId: string
) {
    const { userId } = await auth()

    if (userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error deleting your account" }
    }

    revalidatePath('/dashboard') 
    return await deleteAccountDb({ accountId, userId })
}