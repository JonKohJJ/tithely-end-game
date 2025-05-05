import { db } from "@/drizzle/db";
import { CardsTable, TransactionsTable } from "@/drizzle/schema"
import { eq, count, asc, and, sum, sql } from "drizzle-orm";
import { TInsertCard } from "@/zod/cards";
import { TSelectOption } from "@/app/(protected)/dashboard/_components/Transaction/TransactionTable/TransactionForm";
import { getChildTransactionsCount, TDatabaseResponse } from "./shared";
import { getTransactionsIdByCardId, resetTransactionCardId } from "./transactions";


export async function addCard(
    values: typeof CardsTable.$inferInsert
) : Promise<TDatabaseResponse> {

    try {

        const [ insertedCard ] = await db
            .insert(CardsTable)
            .values(values)
            .returning()

        return { success: true, dbResponseMessage: `Credit Card '${insertedCard.cardName}' successfully added`}

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
            .where(
                and(
                    eq(CardsTable.clerkUserId, userId), 
                    eq(CardsTable.cardId, cardId)
                )
            )
            .returning()

        return { success: true, dbResponseMessage: `Credit Card '${updatedCard.cardName}' successfully updated`}

    } catch (error) {
        if (error instanceof Error) {
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
        
        console.log("CARD start - ", respectiveTransactions)

        const [ deletedCard ] = await db
            .delete(CardsTable)
            .where(
                and(
                    eq(CardsTable.clerkUserId, userId), 
                    eq(CardsTable.cardId, cardId)
                )
            )
            .returning()
            
        console.log("CARD end deletedCard - ", deletedCard)

        return { success: true, dbResponseMessage: `Credit Card '${deletedCard.cardName}' successfully deleted`}

    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }
    }
}

// const OPERATION_DELAY = 5000
// await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

export type TFetchedCard = typeof CardsTable.$inferSelect & {
    cardMonthlyCharge: number
    childTransactionCount: number
}
export async function getAllCards(
    userId: string,
    month: number,
    year: number,
): Promise<TFetchedCard[]> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const result = await db
        .select()
        .from(CardsTable)
        .where(
            eq(CardsTable.clerkUserId, userId),
        )
        .orderBy(asc(CardsTable.createdAt))

    // Calculate cardMonthlyCharge & child transaction count
    const allCards = await Promise.all(
        result.map(async (item) => {

            const cardMonthlyCharge = await getCardMonthlyCharge(item.cardId, month, year)
            const childTransactionCount = await getChildTransactionsCount(userId, item.cardId, "Cards")

            return ({
                ...item,
                cardMonthlyCharge,
                childTransactionCount,
            })
        })
    )

    return allCards
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
export async function getCardMonthlyCharge(
    cardId: string,
    month: number,
    year: number,
): Promise<number> {

    const [ result ] = await db
        .select({
            cardMonthlyCharge: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.transactionCardIdFK, cardId),
                sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`
            )
        )

    return result.cardMonthlyCharge === null 
        ? 0 
        : Number(result.cardMonthlyCharge)
}


// For Transaction Form
export async function getCardsDropdownOptions(
    userId: string,
): Promise<TSelectOption[]> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const result = await db
        .select({
            label: CardsTable.cardName,
            value: CardsTable.cardId
        })
        .from(CardsTable)
        .where(
            and(
                eq(CardsTable.clerkUserId, userId)
            )
        )
        .orderBy(asc(CardsTable.createdAt))

    return result
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