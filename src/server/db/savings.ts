import { IncomeTable, SavingsTable, TransactionsTable } from "@/drizzle/schema"
import { db } from "@/drizzle/db"
import { eq, and, asc, count, sum } from "drizzle-orm";
import { TInsertSaving } from "@/zod/savings";
import { TSelectOption } from "@/app/(protected)/dashboard/_components/Transaction/TransactionForm";
import { getTotalSavingsByTime, TChartBar } from "./expenses";
import { getChildTransactionsCount, TDatabaseResponse, allocatedColors } from "./shared";


export async function addSaving(
    values: typeof SavingsTable.$inferInsert
) : Promise<TDatabaseResponse> {

    try {

        const [ insertedSaving ] = await db
            .insert(SavingsTable)
            .values(values)
            .returning()

        return { success: true, dbResponseMessage: `Saving Goal '${insertedSaving.savingName}' successfully added`}

    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` };
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" };
    }
}
export async function updateSaving(
    values: TInsertSaving,
    { savingId, userId } : { savingId: string, userId: string }
) : Promise<TDatabaseResponse> {

    try {

        const [ updatedSaving ] = await db
            .update(SavingsTable)
            .set(values)
            .where(
                and(
                    eq(SavingsTable.clerkUserId, userId), 
                    eq(SavingsTable.savingId, savingId)
                )
            )
            .returning()

        return { success: true, dbResponseMessage: `Saving Goal '${updatedSaving.savingName}' successfully updated`}

    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }
    }
}
export async function deleteSaving({
    savingId, 
    userId
} : {
    savingId: string, 
    userId: string
}) : Promise<TDatabaseResponse> {

    try {

        // on delete, it will cascade down to their respective child transactions

        const [ deletedSaving ] = await db
            .delete(SavingsTable)
            .where(
                and(
                    eq(SavingsTable.clerkUserId, userId), 
                    eq(SavingsTable.savingId, savingId)
                )
            )
            .returning()
            
        return { success: true, dbResponseMessage: `Saving Goal '${deletedSaving.savingName}' successfully deleted`}

    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }
    }
}

// const OPERATION_DELAY = 5000
// await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))


// Savings Growth
export type TSavingGrowth = {
    totalSavingsAmount: number,
    past12MonthsData: TChartBar[],
    savingRate: string,
}
export async function getSavingsGrowthData(
    userId: string
): Promise<TSavingGrowth> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const totalSavingsAmount = await getTotalSavings(userId)
    const past12MonthsData = await getPast12MonthsTotalSavedAmountByMonth(userId)
    const savingRate = await getSavingRate(userId)

    return {
        totalSavingsAmount,
        past12MonthsData,
        savingRate,
    }
    
}
export async function getTotalSavings(
    userId: string
) {
    
    const [ result ] = await db
        .select({
            total: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId),
                eq(TransactionsTable.transactionType, "Savings"),
            )
        )

    return result.total === null 
        ? 0 
        : Number(result.total)

}
async function getPast12MonthsTotalSavedAmountByMonth(
    userId: string
): Promise<TChartBar[]> {

    const past12MonthsData = []

    for (let i = 0; i < 12; i++) {
        // Start with a fresh date each iteration to avoid mutation issues
        const date = new Date();
        
        // Set the date to the first day of the month to prevent overflow
        date.setDate(1);
    
        // Move to the correct month
        date.setMonth(date.getMonth() - i);
    
        const month = date.getMonth() + 1; // Month is 0-indexed
        const year = date.getFullYear();
    
        // console.log(month, year);
    
        const totalSavedAmountByMonth = await getTotalSavingsByTime(userId, month, year);
    
        const monthLabel = date.toLocaleString("en-US", { month: "short" });
        const yearLabel = date.getFullYear().toString().slice(-2);
    
        past12MonthsData.push({
            label: `${monthLabel}\n'${yearLabel}`,
            value: totalSavedAmountByMonth
        });
    }

    return past12MonthsData.reverse()

}
async function getSavingRate(
    userId: string
): Promise<string> {

    const totalActualIncome = await getTotalActualIncome(userId)
    const totalActualSavings = await getTotalActualSavings(userId)
    const totalBudgetedIncome = await getTotalBudgetedIncome(userId)
    const totalBudgetedSavings = await getTotalBudgetedSavings(userId)

    if (totalActualIncome <= 0) {
        return "You have no actual income, try adding some."
    }

    if (totalBudgetedIncome <= 0) {
        return "You have no budgeted income, try adding some."
    }

    const actualSavingsRate = ((totalActualSavings / totalActualIncome) * 100).toFixed(2)
    const targetSavingsRate = ((totalBudgetedSavings / totalBudgetedIncome) * 100).toFixed(2)
    const trendIndicator = actualSavingsRate >= targetSavingsRate ? " ✅" : "❗";

    return `${actualSavingsRate}%${trendIndicator} / Target: ${targetSavingsRate}% 🎯`;

}
async function getTotalActualSavings(
    userId: string
) {

    const [ result ] = await db
        .select({
            total: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId),
                eq(TransactionsTable.transactionType, "Savings")
            )
        )

    return result.total === null 
        ? 0 
        : Number(result.total)
    
}
async function getTotalActualIncome(
    userId: string
) {

    const [ result ] = await db
        .select({
            total: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId),
                eq(TransactionsTable.transactionType, "Income")
            )
        )

    return result.total === null 
        ? 0 
        : Number(result.total)
    
}
async function getTotalBudgetedSavings(
    userId: string
) {

    const [ result ] = await db
        .select({
            total: sum(SavingsTable.savingGoal)
        })
        .from(SavingsTable)
        .where(
            and(
                eq(SavingsTable.clerkUserId, userId),
            )
        )

    return result.total === null 
        ? 0 
        : Number(result.total)
    
}
async function getTotalBudgetedIncome(
    userId: string
) {

    const [ result ] = await db
        .select({
            total: sum(IncomeTable.incomeMonthlyContribution)
        })
        .from(IncomeTable)
        .where(
            and(
                eq(IncomeTable.clerkUserId, userId),
            )
        )

    return result.total === null 
        ? 0 
        : Number(result.total)
    
}


// Saving Goals
export type TFetchedSaving = typeof SavingsTable.$inferSelect & {
    totalSavedAmount: number
    fill: string
    childTransactionCount: number
}
export async function getAllSavings(
    userId: string
): Promise<TFetchedSaving[]> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const result = await db
        .select()
        .from(SavingsTable)
        .where(
            eq(SavingsTable.clerkUserId, userId)
        )
        .orderBy(asc(SavingsTable.createdAt))

    // Calculate total saved amount & add color (fill) & child transaction count
    const allSavings = await Promise.all(
        result.map(async (item, index) => {
            
            const totalSavedAmount = await calculateTotalSavingsById(item.savingId)
            const childTransactionCount = await getChildTransactionsCount(userId, item.savingId, "Savings")

            return ({
                ...item,
                totalSavedAmount,
                fill: allocatedColors[index % allocatedColors.length],
                childTransactionCount
            })
        })
    )

    return allSavings
}
export async function getAllSavingNames(
    userId: string,
) {
    
    const allSavingNames: string[] = []

    const result = await db
        .select({
            name: SavingsTable.savingName
        })
        .from(SavingsTable)
        .where(
            eq(SavingsTable.clerkUserId, userId)
        )
    
    result.map(item => {
        allSavingNames.push(item.name)
    })
    
    return allSavingNames
}
export async function getSavingsCount(
    userId: string
) {
    const [ result ] = await db
        .select(
            { count: count() }
        )
        .from(SavingsTable)
        .where(
            eq(SavingsTable.clerkUserId, userId)
        )
        
    return result.count
}
export async function calculateTotalSavingsById(
    savingId: string,
): Promise<number> {

    const [ result ] = await db
        .select({
            actualExpense: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.transactionSavingIdFK, savingId)
            )
        )

    return result.actualExpense === null 
        ? 0 
        : Number(result.actualExpense)
}


// For Transaction Form
export async function getSavingsDropdownOptions(
    userId: string,
): Promise<TSelectOption[]> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const result = await db
        .select({
            label: SavingsTable.savingName,
            value: SavingsTable.savingId
        })
        .from(SavingsTable)
        .where(
            and(
                eq(SavingsTable.clerkUserId, userId)
            )
        )
        .orderBy(asc(SavingsTable.createdAt))

    return result
}