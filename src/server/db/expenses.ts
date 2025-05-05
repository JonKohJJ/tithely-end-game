import { ExpensesTable, TransactionsTable } from "@/drizzle/schema"
import { db } from "@/drizzle/db"
import { eq, and, asc, count, sum, sql } from "drizzle-orm";
import { TInsertExpense } from "@/zod/expenses";
import { TSelectOption } from "@/app/(protected)/dashboard/_components/Transaction/TransactionForm";
import { getChildTransactionsCount, TDatabaseResponse, allocatedColors } from "./shared";


export async function addExpense(
    values: typeof ExpensesTable.$inferInsert
) : Promise<TDatabaseResponse> {

    try {

        const [ insertedExpense ] = await db
            .insert(ExpensesTable)
            .values(values)
            .returning()

        return { success: true, dbResponseMessage: `Expense '${insertedExpense.expenseName}' successfully added`}

    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` };
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" };
    }
}
export async function updateExpense(
    values: TInsertExpense,
    { expenseId, userId } : { expenseId: string, userId: string }
) : Promise<TDatabaseResponse> {

    try {

        const [ updatedExpense ] = await db
            .update(ExpensesTable)
            .set(values)
            .where(
                and(
                    eq(ExpensesTable.clerkUserId, userId), 
                    eq(ExpensesTable.expenseId, expenseId)
                )
            )
            .returning()

        return { success: true, dbResponseMessage: `Expense '${updatedExpense.expenseName}' successfully updated`}

    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }
    }
}
export async function deleteExpense({
    expenseId, 
    userId
} : {
    expenseId: string, 
    userId: string
}) : Promise<TDatabaseResponse> {

    try {

        // on delete, it will cascade down to their respective child transactions

        const [ deletedExpense ] = await db
            .delete(ExpensesTable)
            .where(
                and(
                    eq(ExpensesTable.clerkUserId, userId), 
                    eq(ExpensesTable.expenseId, expenseId)
                )
            )
            .returning()
            
        return { success: true, dbResponseMessage: `Expense '${deletedExpense.expenseName}' successfully deleted`}

    } catch (error) {
        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }
    }
}

// const OPERATION_DELAY = 5000
// await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

export type TFetchedBudgetedExpense = typeof ExpensesTable.$inferSelect & {
    expenseBudgetPercentage: number
    fill: string
    childTransactionCount: number
}
export type TFetchedActualExpense = TFetchedBudgetedExpense & {
    expenseActualAmount: number
    expenseActualPercentage: number
}

// Budgeted Expenses
export async function getAllBudgetedExpenses(
    userId: string
): Promise<TFetchedBudgetedExpense[]> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const result = await db
        .select()
        .from(ExpensesTable)
        .where(
            eq(ExpensesTable.clerkUserId, userId)
        )
        .orderBy(asc(ExpensesTable.createdAt))

    
    let total = 0
    result.map(item => { total += item.expenseMonthlyBudget })

    // calculate budgeted percentage & add color (fill) & child transaction count
    const allExpensesBudget = await Promise.all(
        result.map(async (item, index) => {

            const childTransactionCount = await getChildTransactionsCount(userId, item.expenseId, "Expenses")

            return ({
                ...item,
                expenseBudgetPercentage: total > 0 
                    ? Number((Number(item.expenseMonthlyBudget) / total * 100).toFixed(0)) 
                    : 0,
                fill: allocatedColors[index % allocatedColors.length],
                childTransactionCount
            })
        })
    )

    return allExpensesBudget
}
export async function getAllExpenseNames(
    userId: string,
) {
    
    const allExpenseNames: string[] = []

    const result = await db
        .select({
            name: ExpensesTable.expenseName
        })
        .from(ExpensesTable)
        .where(
            eq(ExpensesTable.clerkUserId, userId)
        )
    
    result.map(item => {
        allExpenseNames.push(item.name)
    })
    
    return allExpenseNames
}
export async function getExpensesCount(
    userId: string
) {
    const [ result ] = await db
        .select(
            { count: count() }
        )
        .from(ExpensesTable)
        .where(
            eq(ExpensesTable.clerkUserId, userId)
        )
        
    return result.count
}

// Actual Expenses
export async function getAllActualExpense(
    userId: string,
    month: number,
    year: number,
): Promise<TFetchedActualExpense[]> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const allBudgetedExpenses = await getAllBudgetedExpenses(userId)

    const allExpensesActual = await Promise.all(
        allBudgetedExpenses.map(async (item) => {

            const expenseActualAmount = await calculateActualExpense(item.expenseId, month, year)

            const expenseActualPercentage = expenseActualAmount > 0 
                ? Number(((expenseActualAmount / item.expenseMonthlyBudget) * 100).toFixed(1))
                : 0


            return ({
                ...item,
                expenseActualAmount,
                expenseActualPercentage,
            })
        })
    )

    return allExpensesActual
}
export async function calculateActualExpense(
    expenseId: string,
    month: number,
    year: number,
): Promise<number> {

    const [ result ] = await db
        .select({
            actualExpense: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.transactionExpenseIdFK, expenseId),
                sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`
            )
        )

    return result.actualExpense === null 
        ? 0 
        : Number(result.actualExpense)
}

// Insights Expenses
export async function getTotalIncomeByTime(
    userId: string,
    month: number,
    year: number,
    day?: number
): Promise<number> {

    if (day) {

        // console.log("getTotalByType HAS DAY > ", day, month, year)

        const [ result ] = await db
            .select({
                total: sum(TransactionsTable.transactionAmount)
            })
            .from(TransactionsTable)
            .where(
                and(
                    eq(TransactionsTable.clerkUserId, userId),
                    eq(TransactionsTable.transactionType, "Income"),
                    sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                    sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`,
                    sql`EXTRACT(DAY FROM ${TransactionsTable.transactionDate}) = ${day}`,
                )
            )

        return result.total === null 
            ? 0 
            : Number(result.total)

    } else {

        // console.log("getTotalByType NO DAY > ")

        const [ result ] = await db
            .select({
                total: sum(TransactionsTable.transactionAmount)
            })
            .from(TransactionsTable)
            .where(
                and(
                    eq(TransactionsTable.clerkUserId, userId),
                    eq(TransactionsTable.transactionType, "Income"),
                    sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                    sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`,
                )
            )

        return result.total === null 
            ? 0 
            : Number(result.total)
    }
}
export async function getTotalSavingsByTime(
    userId: string,
    month: number,
    year: number,
    day?: number
): Promise<number> {

    if (day) {

        // console.log("getTotalByType HAS DAY > ", day, month, year)

        const [ result ] = await db
            .select({
                total: sum(TransactionsTable.transactionAmount)
            })
            .from(TransactionsTable)
            .where(
                and(
                    eq(TransactionsTable.clerkUserId, userId),
                    eq(TransactionsTable.transactionType, "Savings"),
                    sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                    sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`,
                    sql`EXTRACT(DAY FROM ${TransactionsTable.transactionDate}) = ${day}`,
                )
            )

        return result.total === null 
            ? 0 
            : Number(result.total)

    } else {

        // console.log("getTotalByType NO DAY > ")

        const [ result ] = await db
            .select({
                total: sum(TransactionsTable.transactionAmount)
            })
            .from(TransactionsTable)
            .where(
                and(
                    eq(TransactionsTable.clerkUserId, userId),
                    eq(TransactionsTable.transactionType, "Savings"),
                    sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                    sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`,
                )
            )

        return result.total === null 
            ? 0 
            : Number(result.total)
    }
}
export async function getTotalCreditByTime(
    userId: string,
    month: number,
    year: number,
): Promise<number> {

    const [ result ] = await db
        .select({
            totalCreditCardSpend: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId),
                eq(TransactionsTable.transactionCreditOrDebit, "Credit"),
                sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`
            )
        )

    return result.totalCreditCardSpend === null 
        ? 0 
        : Number(result.totalCreditCardSpend)
}
export async function getTotalDebitByTime(
    userId: string,
    month: number,
    year: number,
): Promise<number> {

    const [ result ] = await db
        .select({
            totalCreditCardSpend: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId),
                eq(TransactionsTable.transactionCreditOrDebit, "Debit"),
                sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`
            )
        )

    return result.totalCreditCardSpend === null 
        ? 0 
        : Number(result.totalCreditCardSpend)
}
export async function getAvailableFunds(
    userId: string,
    month: number,
    year: number,
): Promise<number> {

    // income - savings - expenses (debit)

    const income = await getTotalIncomeByTime(userId, month, year)
    const savings = await getTotalSavingsByTime(userId, month, year)
    const expensesDebit = await getTotalDebitByTime(userId, month, year)
    const availableFunds = income - savings - expensesDebit

    return availableFunds > 0 
        ? availableFunds
        : 0

}

// Expenses Trend
export type TChartBar = {
    label: string
    value: number
}
export async function getExpensesTrendDaily(
    userId: string,
) {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const trendData = []

    for (let i = 0; i < 30; i++) {

        // console.log("getExpensesTrendDaily START --- ", i)

        const date = new Date()
        date.setDate(date.getDate() - i)

        const day = date.getDate()
        const month = date.getMonth() + 1
        const year = date.getFullYear()

        const expenses = await getTotalExpenseByTime(userId, month, year, day)

        const monthLabel = date.toLocaleString("en-US", { month: "short" })

        trendData.push({
            label: `${day}\n${monthLabel}`,
            value: expenses
        });

    }

    return trendData.reverse()

}
export async function getExpensesTrendWeekly(
    userId: string
) {
    const trendData = []
    const now = new Date();
    
    // Get the most recent Monday (start of the current week)
    const currentDayOfWeek = now.getDay();
    const daysToLastMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - daysToLastMonday);
    
    // Generate data for the past 12 weeks
    for (let i = 0; i < 12; i++) {

        // console.log("getExpensesTrendWeekly START --- ", i)

        const weekStartDate = new Date(startDate);
        weekStartDate.setDate(startDate.getDate() - i * 7);
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 6);

        // Format the dates as strings in the format "YYYY-MM-DD"
        const formattedStartDate = weekStartDate.toISOString().split('T')[0];
        const formattedEndDate = weekEndDate.toISOString().split('T')[0];
        
        const month = weekStartDate.toLocaleDateString("en-US", { month: "short" });
        const year = weekStartDate.getFullYear();

        // Find the first Monday of the month
        const firstDayOfMonth = new Date(year, weekStartDate.getMonth(), 1);
        const firstMonday = new Date(firstDayOfMonth);
        const dayOfWeek = firstDayOfMonth.getDay();
        if (dayOfWeek !== 1) {
            firstMonday.setDate(firstDayOfMonth.getDate() + (dayOfWeek === 0 ? 1 : 8 - dayOfWeek));
        }

        // Calculate the week number in the month
        let weekNumber = 1;
        const iterMonday = new Date(firstMonday);
        while (iterMonday <= weekStartDate) {
            if (iterMonday.getDate() !== firstMonday.getDate()) {
                weekNumber++;
            }
            iterMonday.setDate(iterMonday.getDate() + 7);
        }

        // Ensure valid week numbering (limit to 4 or 5 weeks per month)
        const lastDayOfMonth = new Date(year, weekStartDate.getMonth() + 1, 0);
        const lastMonday = new Date(lastDayOfMonth);
        lastMonday.setDate(lastDayOfMonth.getDate() - ((lastDayOfMonth.getDay() + 6) % 7));
        const maxWeeks = Math.ceil((lastMonday.getDate() - firstMonday.getDate()) / 7) + 1;
        weekNumber = Math.min(weekNumber, maxWeeks);

        const expenses = await getTotalExpenseByWeek(userId, formattedStartDate, formattedEndDate)

        trendData.push({
            label: `W${weekNumber}\n${month}`,
            value: expenses,
        });

    }

    return trendData.reverse();
}
export async function getExpensesTrendMonthly(
    userId: string,
) {

    const trendData = []

    for (let i = 0; i < 6; i++) {
        
        // console.log("getExpensesTrendMonthly START --- ", i)

        const date = new Date()
        date.setMonth(date.getMonth() - i)

        const month = date.getMonth() + 1
        const year = date.getFullYear()
        const expenses = await getTotalExpenseByTime(userId, month, year)

        const monthLabel = date.toLocaleString("en-US", { month: "short" })
        const yearLabel = date.getFullYear().toString().slice(-2)

        trendData.push({
            label: `${monthLabel}\n'${yearLabel}`,
            value: expenses
        })

    }

    return trendData.reverse()

}
export async function getExpensesTrendYearly(
    userId: string,
) {

    const trendData = []

    for (let i = 0; i < 6; i++) {

        // console.log("getExpensesTrendYearly START --- ", i)
        
        
        const date = new Date()
        const year = (date.getFullYear() - i).toFixed()

        const expenses = await getTotalExpenseByYear(userId, year)

        trendData.push({
            label: `${year}`,
            value: expenses
        })

    }

    return trendData.reverse()

}
async function getTotalExpenseByYear(
    userId: string,
    year: string,
) {

    // console.log("getExpenseTotalByYear > ", year)
    
    const [ result ] = await db
        .select({
            total: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId),
                eq(TransactionsTable.transactionType, "Expenses"),
                sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
            )
        )

    return result.total === null 
        ? 0 
        : Number(result.total)
}
async function getTotalExpenseByWeek(
    userId: string,
    startDate: string,
    endDate: string,
) {

    // console.log("getExpenseTotalByWeek > ", startDate, endDate)

    const [ result ] = await db
        .select({
            total: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId),
                eq(TransactionsTable.transactionType, "Expenses"),
                sql`(${TransactionsTable.transactionDate} BETWEEN ${startDate} AND ${endDate})`
            )
        )

    return result.total === null 
        ? 0 
        : Number(result.total)
}
export async function getTotalExpenseByTime(
    userId: string,
    month: number,
    year: number,
    day?: number
): Promise<number> {

    if (day) {

        // console.log("getTotalByType HAS DAY > ", day, month, year)

        const [ result ] = await db
            .select({
                total: sum(TransactionsTable.transactionAmount)
            })
            .from(TransactionsTable)
            .where(
                and(
                    eq(TransactionsTable.clerkUserId, userId),
                    eq(TransactionsTable.transactionType, "Expenses"),
                    sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                    sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`,
                    sql`EXTRACT(DAY FROM ${TransactionsTable.transactionDate}) = ${day}`,
                )
            )

        return result.total === null 
            ? 0 
            : Number(result.total)

    } else {

        // console.log("getTotalByType NO DAY > ")

        const [ result ] = await db
            .select({
                total: sum(TransactionsTable.transactionAmount)
            })
            .from(TransactionsTable)
            .where(
                and(
                    eq(TransactionsTable.clerkUserId, userId),
                    eq(TransactionsTable.transactionType, "Expenses"),
                    sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                    sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`,
                )
            )

        return result.total === null 
            ? 0 
            : Number(result.total)
    }
}

// For Transaction Form
export async function getExpensesDropdownOptions(
    userId: string,
): Promise<TSelectOption[]> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const result = await db
        .select({
            label: ExpensesTable.expenseName,
            value: ExpensesTable.expenseId
        })
        .from(ExpensesTable)
        .where(
            and(
                eq(ExpensesTable.clerkUserId, userId)
            )
        )
        .orderBy(asc(ExpensesTable.createdAt))

    return result
}

// For Income Tab, possibly for Expenses Tab moving forward
export async function getAllBudgetedFixedExpenses(
    userId: string
): Promise<TFetchedBudgetedExpense[]> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const result = await db
        .select()
        .from(ExpensesTable)
        .where(
            and(
                eq(ExpensesTable.clerkUserId, userId),
                eq(ExpensesTable.expenseMethod, "Fixed")
            )
        )
        .orderBy(asc(ExpensesTable.createdAt))

    
    let total = 0
    result.map(item => { total += item.expenseMonthlyBudget })

    // calculate budgeted percentage & add color (fill) & child transaction count
    const allBudgetedFixedExpenses = await Promise.all(
        result.map(async (item, index) => {

            const childTransactionCount = await getChildTransactionsCount(userId, item.expenseId, "Expenses")

            return ({
                ...item,
                expenseBudgetPercentage: total > 0 
                    ? Number((Number(item.expenseMonthlyBudget) / total * 100).toFixed(0)) 
                    : 0,
                fill: allocatedColors[index % allocatedColors.length],
                childTransactionCount
            })
        })
    )

    return allBudgetedFixedExpenses
}
export async function getAllBudgetedVariableExpenses(
    userId: string
): Promise<TFetchedBudgetedExpense[]> {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const result = await db
        .select()
        .from(ExpensesTable)
        .where(
            and(
                eq(ExpensesTable.clerkUserId, userId),
                eq(ExpensesTable.expenseMethod, "Variable")
            )
        )
        .orderBy(asc(ExpensesTable.createdAt))

    
    let total = 0
    result.map(item => { total += item.expenseMonthlyBudget })

    // calculate budgeted percentage & add color (fill) & child transaction count
    const allBudgetedVariableExpenses = await Promise.all(
        result.map(async (item, index) => {

            const childTransactionCount = await getChildTransactionsCount(userId, item.expenseId, "Expenses")

            return ({
                ...item,
                expenseBudgetPercentage: total > 0 
                    ? Number((Number(item.expenseMonthlyBudget) / total * 100).toFixed(0)) 
                    : 0,
                fill: allocatedColors[index % allocatedColors.length],
                childTransactionCount
            })
        })
    )

    return allBudgetedVariableExpenses
}