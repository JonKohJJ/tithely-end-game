import { db } from "@/drizzle/db";
import { CardsTable, TransactionsTable } from "@/drizzle/schema"
import { eq, count, asc, and } from "drizzle-orm";
import { TDatabaseResponse } from "./categories";
import { TInsertCard } from "@/zod/cards";
import { getTransactionsIdByCardId, resetTransactionCardId } from "./transactions";

export type TFetchedCard = typeof CardsTable.$inferSelect
export type TFetchedCardWithChildTransactionCount = TFetchedCard & {
    childTransactionsCount: number
}

export async function getAllCards(
    userId: string
) {

    const allCards = await db
        .select()
        .from(CardsTable)
        .where(
            eq(CardsTable.clerkUserId, userId),
        )
        .orderBy(
            asc(CardsTable.createdAt)
        )

    // Get X transactions tied to this card
    const allCardsWithChildTransactionsCount = await Promise.all(
        allCards.map(async (card) => {
            const count = await getChildTransactionsCount(userId, card.cardId)
            return {
                ...card,
                childTransactionsCount: count
            }
        })
    )

    return allCardsWithChildTransactionsCount
}

export async function getCardsCount(
    userId: string
) {
    const [ result ] = await db
        .select(
            { count: count() }
        )
        .from(CardsTable)
        .where(
            eq(CardsTable.clerkUserId, userId)
        )
    return result.count
}

export async function addCard(
    values: typeof CardsTable.$inferInsert
) : Promise<TDatabaseResponse> {

    try {

        const [insertedCard] = await db
            .insert(CardsTable)
            .values(values)
            .returning()

        return { success: true, dbResponseMessage: `Card '${insertedCard.cardName}' successfully added`}

    } catch (error) {

        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` };
        }
        
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" };
    }
}

export async function updateCard(
    values: TInsertCard,
    { cardId, userId } : { cardId: string, userId: string }
) : Promise<TDatabaseResponse> {

    try {

        const [updatedCard] = await db
            .update(CardsTable)
            .set(values)
            .where(and(eq(CardsTable.clerkUserId, userId), eq(CardsTable.cardId, cardId)))
            .returning()

        return { success: true, dbResponseMessage: `Card '${updatedCard.cardName}' successfully updated`}

    } catch (error) {

        if (error instanceof Error) {
            // TODO: Handle any update failures
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }
    }
}

export async function deleteCard({
    cardId, 
    userId
} : {
    cardId: string, 
    userId: string
}) : Promise<TDatabaseResponse> {

    try {

        // Get child transaction with the cardIdFK, and reset cardIdFK to null
        const respectiveTransactions = await getTransactionsIdByCardId(cardId, userId)
        await Promise.all(    
            respectiveTransactions.map(async (transaction) => {
                await resetTransactionCardId(transaction.id, userId)
            })
        )

        const [deletedCard] = await db
            .delete(CardsTable)
            .where(and(eq(CardsTable.clerkUserId, userId), eq(CardsTable.cardId, cardId)))
            .returning()
            
        return { success: true, dbResponseMessage: `Card '${deletedCard.cardName}' successfully deleted`}

    } catch (error) {

        if (error instanceof Error) {
            // TODO: Handle any delete failures
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }

    }
}

export async function getAllCardNames(
    userId: string, 
) {
    
    const allNames: string[] = []

    const data = await db
        .select({
            name: CardsTable.cardName
        })
        .from(CardsTable)
        .where(
            eq(CardsTable.clerkUserId, userId)
        )
    
    data.map(item => {
        allNames.push(item.name)
    })
    
    return allNames
}

export async function getChildTransactionsCount(userId: string, cardId: string) {

    const [ result ] = await db
        .select(
            { count: count() }
        )
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId),
                eq(TransactionsTable.transactionCardIdFK, cardId)
            )
        )
    
    return result.count
}

// For user subscription cancellation
export async function deleteAllCards(userId: string) {

    // Find all cards associated with this userId
    const respectiveCards = await db
        .select({ id: CardsTable.cardId })
        .from(CardsTable)
        .where(
            eq(CardsTable.clerkUserId, userId),
        )

    await Promise.all(
        respectiveCards.map(async (card) => {
            const cardId = card.id
            deleteCard({cardId, userId})
        })
    )
}
