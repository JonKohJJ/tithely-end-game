"use server"

import { CardSchema, TInsertCard } from "@/zod/cards"
import { TDatabaseResponse } from "../db/categories"
import { auth } from "@clerk/nextjs/server"
import { canCreateCard } from "../permissions"
import { revalidatePath } from "next/cache"
import {
    addCard as addCardDb,
    updateCard as updateCardDb,
    deleteCard as deleteCardDb,
    getAllCardNames,
} from '../db/cards'

export async function addCard(
    unsafeData: TInsertCard
): Promise<TDatabaseResponse> {
    const { userId } = await auth()
    const { success, data } = CardSchema.safeParse(unsafeData)

    const { canCreate } = await canCreateCard(userId)
    if (!success || userId == null || !canCreate) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error adding your card" }
    }

    // Check for duplicate card name
    const hasDuplicatedCardName = await hasDuplicateCardName(userId, data.cardName)
    if (hasDuplicatedCardName) {
        return { success: false, dbResponseMessage: "No duplicated card name allowed. Please add a different one." }
    }

    revalidatePath('/planner') 
    return await addCardDb({ 
        ...data, 
        cardCurrentCharge: 0,
        clerkUserId: userId 
    })
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

    revalidatePath('/planner')
    return await updateCardDb(data, { cardId, userId })
}

export async function deleteCard(cardId: string) {
    const { userId } = await auth()

    if (userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error deleting your card" }
    }

    revalidatePath('/planner') 
    return await deleteCardDb({ cardId, userId })
}

async function hasDuplicateCardName(
    userId: string,
    nameToBeChecked: string
) {
    const allCardNames = await getAllCardNames(userId)

    if (allCardNames.includes(nameToBeChecked)) {
        return true
    }

    return false
}