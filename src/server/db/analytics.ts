// Analytics Page

import { db } from "@/drizzle/db"
import { CategoriesTable, TransactionsTable } from "@/drizzle/schema"
import { and, asc, eq, sql, sum } from "drizzle-orm"

// const OPERATION_DELAY = 1000
// await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

export type TChartBar = {
    label: string
    value: number
}

const allocatedColors = [
    "#0047FF", // Deep Electric Blue  
    "#FF8C00", // Dark Fiery Orange  
    "#5A189A", // Royal Purple  
    "#009E60", // Strong Emerald Green  
    "#D00000", // Intense Crimson Red  
    "#0081A7", // Bold Teal  
    "#E5007D", // Neon Fuchsia  
    "#1B1B3A", // Midnight Navy  
    "#008F11", // Vibrant Neon Green  
    "#B00020", // Dark Cherry Red  
    "#FFB000", // Deep Golden Yellow  
    "#00509D", // Cobalt Blue  
    "#B61A6D", // Vivid Plum (Replaces Striking Magenta)  
    "#7D00FF", // Electric Violet  
    "#007F5F", // Rich Deep Green  
]

// Expenses Budget
export async function getAllExpenseBudget(
    userId: string
) {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const result = await db
        .select({
            expenseName: CategoriesTable.categoryName,
            expenseBudget: CategoriesTable.categoryBudget,
            categoryId: CategoriesTable.categoryId
        })
        .from(CategoriesTable)
        .where(
            and(
                eq(CategoriesTable.clerkUserId, userId),
                eq(CategoriesTable.categoryType, "Expenses")
            )
        )
        .orderBy(asc(CategoriesTable.createdAt))
    
    // Calculate total expense amount
    let totalExpenseAmount = 0
    result.map(item => {
        totalExpenseAmount += item.expenseBudget
    })

    // calculate percentage & add colour (fill)
    const allExpensesBudget = result.map((item, index) => {
        return ({
            ...item,
            expenseBudgetPercentage: totalExpenseAmount > 0 
                ? Number((Number(item.expenseBudget) / totalExpenseAmount * 100).toFixed(1)) 
                : 0
            ,
            fill: allocatedColors[index % allocatedColors.length]
        })
    })

    return allExpensesBudget
}

// Expenses Actual
export async function getAllExpenseActual(
    userId: string,
    month: number,
    year: number,
) {
    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const allExpensesBudget = await getAllExpenseBudget(userId)

    const allExpensesActual = await Promise.all(
        allExpensesBudget.map(async (item) => {

            const trackedAmount = await getExpenseTrackedAmount(item.categoryId, month, year)
            const trackedAmountPercentage = trackedAmount > 0 
                ? Number(((trackedAmount / item.expenseBudget) * 100).toFixed(1))
                : 0

            return ({
                ...item,
                expenseActual: trackedAmount,
                expenseActualPercentage: trackedAmountPercentage,
            })
        })
    )

    return allExpensesActual
}
export async function getExpenseTrackedAmount(
    categoryId: string,
    month: number,
    year: number,
): Promise<number> {

    const [ result ] = await db
        .select({
            trackedAmount: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.transactionCategoryIdFK, categoryId),
                sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`
            )
        )

    return result.trackedAmount === null 
        ? 0 
        : Number(result.trackedAmount)
}
export async function getAvailableFunds(
    userId: string,
    month: number,
    year: number,
): Promise<number> {

    // income - savings - expenses (debit)

    const income = await getTotalByType(userId, month, year, "Income")
    const savings = await getTotalByType(userId, month, year, "Savings")
    const expensesDebit = await getTotalByCreditOrDebit(userId, month, year, "Debit")
    const availableFunds = income - savings - expensesDebit

    return availableFunds > 0 
        ? availableFunds
        : 0

}
export async function getTotalByType(
    userId: string,
    month: number,
    year: number,
    type: "Income" | "Savings" | "Expenses",
    day?: number
): Promise<number> {

    if (day) {

        console.log("getTotalByType has day - ", month, year, day)

        const [ result ] = await db
            .select({
                total: sum(TransactionsTable.transactionAmount)
            })
            .from(TransactionsTable)
            .where(
                and(
                    eq(TransactionsTable.clerkUserId, userId),
                    eq(TransactionsTable.transactionType, type),
                    sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                    sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`,
                    sql`EXTRACT(DAY FROM ${TransactionsTable.transactionDate}) = ${day}`,
                )
            )

        return result.total === null 
            ? 0 
            : Number(result.total)

    } else {

        console.log("getTotalByType no day - ", month, year)

        const [ result ] = await db
            .select({
                total: sum(TransactionsTable.transactionAmount)
            })
            .from(TransactionsTable)
            .where(
                and(
                    eq(TransactionsTable.clerkUserId, userId),
                    eq(TransactionsTable.transactionType, type),
                    sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                    sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`,
                )
            )

        return result.total === null 
            ? 0 
            : Number(result.total)
    }
}
export async function getTotalByCreditOrDebit(
    userId: string,
    month: number,
    year: number,
    creditOrDebit: "Credit" | "Debit"
): Promise<number> {

    const [ result ] = await db
        .select({
            totalCreditCardSpend: sum(TransactionsTable.transactionAmount)
        })
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId),
                eq(TransactionsTable.transactionCreditOrDebit, creditOrDebit),
                sql`EXTRACT(YEAR FROM ${TransactionsTable.transactionDate}) = ${year}`,
                sql`EXTRACT(MONTH FROM ${TransactionsTable.transactionDate}) = ${month}`
            )
        )

    return result.totalCreditCardSpend === null 
        ? 0 
        : Number(result.totalCreditCardSpend)
}

// Expenses Trend
export async function getExpensesTrendDaily(
    userId: string,
) {

    const trendData = []

    for (let i = 0; i < 30; i++) {

        const date = new Date()
        date.setDate(date.getDate() - i)

        const day = date.getDate()
        const month = date.getMonth() + 1
        const year = date.getFullYear()

        const expenses = await getTotalByType(userId, month, year, "Expenses", day)

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

        const expenses = await getExpenseTotalByWeek(userId, formattedStartDate, formattedEndDate)

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

        console.log("getExpensesTrendMonthly START - ", i)
        
        const date = new Date()
        date.setMonth(date.getMonth() - i)

        const month = date.getMonth() + 1
        const year = date.getFullYear()
        const expenses = await getTotalByType(userId, month, year, "Expenses")

        const monthLabel = date.toLocaleString("en-US", { month: "short" })
        const yearLabel = date.getFullYear().toString().slice(-2)

        trendData.push({
            label: `${monthLabel}\n'${yearLabel}`,
            value: expenses
        })

        console.log("getExpensesTrendMonthly END - ", i)
    }

    return trendData.reverse()

}
export async function getExpensesTrendYearly(
    userId: string,
) {

    const trendData = []

    for (let i = 0; i < 6; i++) {
        
        const date = new Date()
        const year = (date.getFullYear() - i).toFixed()

        const expenses = await getExpenseTotalByYear(userId, year)

        trendData.push({
            label: `${year}`,
            value: expenses
        })
    }

    return trendData.reverse()

}
async function getExpenseTotalByYear(
    userId: string,
    year: string,
) {
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
async function getExpenseTotalByWeek(
    userId: string,
    startDate: string,
    endDate: string,
) {

    // console.log(startDate, endDate)

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


