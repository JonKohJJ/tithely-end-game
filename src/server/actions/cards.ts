"use server"

import { CardSchema, TInsertCard } from "@/zod/cards"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import {
    addCard as addCardDb,
    updateCard as updateCardDb,
    deleteCard as deleteCardDb,
} from '../db/cards'
import { canCreateCards } from "../permissions"
import { TDatabaseResponse } from "../db/shared"
import { checkDuplicateName } from "./shared"


export async function addCard(
    unsafeData: TInsertCard
): Promise<TDatabaseResponse> {

    const { userId } = await auth()
    const { success, data } = CardSchema.safeParse(unsafeData)
    const { canCreateCard } = await canCreateCards(userId)
    if (!success || userId == null || !canCreateCard) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error adding your card" }
    }

    if (await checkDuplicateName(userId, data.cardName, "card")) {
        return { success: false, dbResponseMessage: "No duplicated card name allowed. Please add a different one." }
    }

    revalidatePath('/dashboard') 
    return await addCardDb({ ...data, clerkUserId: userId })
}

export async function updateCard(
    cardId: string,
    unsafeData: TInsertCard
) {
    const { userId } = await auth()
    const { success, data } = CardSchema.safeParse(unsafeData)

    if (!success || userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error updating your card" }
    }

    revalidatePath('/dashboard')
    return await updateCardDb(data, { cardId, userId })
}

export async function deleteCard(
    cardId: string
) {
    const { userId } = await auth()

    if (userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error deleting your card" }
    }

    revalidatePath('/dashboard') 
    return await deleteCardDb({ cardId, userId })
}
