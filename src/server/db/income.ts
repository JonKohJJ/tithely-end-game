import { IncomeTable } from "@/drizzle/schema";
import { db } from "@/drizzle/db"
import { eq, and, asc, count } from "drizzle-orm";
import { TInsertIncome } from "@/zod/income";
import { TSelectOption } from "@/app/(protected)/dashboard/_components/Transaction/TransactionTable/TransactionForm";
import { getChildTransactionsCount, TDatabaseResponse } from "./shared";


export async function addIncome(
    values: typeof IncomeTable.$inferInsert
) : Promise<TDatabaseResponse> {

    try {

        const [ insertedIncome ] = await db
            .insert(IncomeTable)
            .values(values)
            .returning()

        return { success: true, dbResponseMessage: `Income Stream '${insertedIncome.incomeName}' successfully added`}

    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` };
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" };
    }
}
export async function updateIncome(
    values: TInsertIncome,
    { incomeId, userId } : { incomeId: string, userId: string }
) : Promise<TDatabaseResponse> {

    try {

        const [ updatedIncome ] = await db
            .update(IncomeTable)
            .set(values)
            .where(
                and(
                    eq(IncomeTable.clerkUserId, userId), 
                    eq(IncomeTable.incomeId, incomeId)
                )
            )
            .returning()

        return { success: true, dbResponseMessage: `Income Stream '${updatedIncome.incomeName}' successfully updated`}

    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }
    }
}
export async function deleteIncome({
    incomeId, 
    userId
} : {
    incomeId: string, 
    userId: string
}) : Promise<TDatabaseResponse> {

    try {

        // on delete, it will cascade down to their respective child transactions

        const [ deletedIncome ] = await db
            .delete(IncomeTable)
            .where(
                and(
                    eq(IncomeTable.clerkUserId, userId), 
                    eq(IncomeTable.incomeId, incomeId)
                )
            )
            .returning()
            
        return { success: true, dbResponseMessage: `Income Stream '${deletedIncome.incomeName}' successfully deleted`}

    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }
    }
}

// const OPERATION_DELAY = 5000
// await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

export type TFetchedIncome = typeof IncomeTable.$inferSelect & {
    childTransactionCount: number
}
export async function getAllIncome(
    userId: string
): Promise<TFetchedIncome[]> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const result = await db
        .select()
        .from(IncomeTable)
        .where(
            and(
                eq(IncomeTable.clerkUserId, userId)
            )
        )
        .orderBy(asc(IncomeTable.createdAt))

    // Calculate child transaction count
    const allIncome = await Promise.all(
        result.map(async (item) => {

            const childTransactionCount = await getChildTransactionsCount(userId, item.incomeId, "Income")

            return ({
                ...item,
                childTransactionCount
            })
        })
    )

    return allIncome
}
export async function getAllIncomeNames(
    userId: string,
) {
    
    const allIncomeNames: string[] = []

    const result = await db
        .select({
            name: IncomeTable.incomeName
        })
        .from(IncomeTable)
        .where(
            eq(IncomeTable.clerkUserId, userId)
        )
    
    result.map(item => {
        allIncomeNames.push(item.name)
    })
    
    return allIncomeNames
}
export async function getIncomeCount(
    userId: string
) {
    const [ result ] = await db
        .select(
            { count: count() }
        )
        .from(IncomeTable)
        .where(
            eq(IncomeTable.clerkUserId, userId)
        )
        
    return result.count
}


// For Transaction Form
export async function getIncomeDropdownOptions(
    userId: string,
): Promise<TSelectOption[]> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const result = await db
        .select({
            label: IncomeTable.incomeName,
            value: IncomeTable.incomeId
        })
        .from(IncomeTable)
        .where(
            and(
                eq(IncomeTable.clerkUserId, userId)
            )
        )
        .orderBy(asc(IncomeTable.createdAt))

    return result
}