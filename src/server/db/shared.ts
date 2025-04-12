import { db } from "@/drizzle/db"
import { TransactionsTable } from "@/drizzle/schema"
import { and, count, eq } from "drizzle-orm"

export type TDatabaseResponse = {
    success: boolean
    dbResponseMessage: string
}

export const allocatedColors = [
    "#0047FF", // Deep Electric Blue  
    "#FF8C00", // Dark Fiery Orange  
    "#009E60", // Strong Emerald Green  
    "#D00000", // Intense Crimson Red  
    "#0081A7", // Bold Teal  
    "#E5007D", // Neon Fuchsia  
    "#1B1B3A", // Midnight Navy  
    "#008F11", // Vibrant Neon Green  
    "#B00020", // Dark Cherry Red  
    "#5A189A", // Royal Purple
    "#FFB000", // Deep Golden Yellow  
    "#00509D", // Cobalt Blue  
    "#B61A6D", // Vivid Plum (Replaces Striking Magenta)  
    "#7D00FF", // Electric Violet  
    "#007F5F", // Rich Deep Green  
]

export async function getChildTransactionsCount(
    userId: string, 
    id: string,
    forWhat: "Income" | "Savings" | "Expenses" | "Cards" | "Accounts"
) {
    if (forWhat === "Income") {
        const [result] = await db
            .select({ count: count() })
            .from(TransactionsTable)
            .where(
                and(
                    eq(TransactionsTable.clerkUserId, userId),
                    eq(TransactionsTable.transactionIncomeIdFK, id)
                )
            );
        return result.count
    }

    if (forWhat === "Savings") {
        const [result] = await db
            .select({ count: count() })
            .from(TransactionsTable)
            .where(
                and(
                    eq(TransactionsTable.clerkUserId, userId),
                    eq(TransactionsTable.transactionSavingIdFK, id)
                )
            );
        return result.count
    }

    if (forWhat === "Expenses") {
        const [result] = await db
            .select({ count: count() })
            .from(TransactionsTable)
            .where(
                and(
                    eq(TransactionsTable.clerkUserId, userId),
                    eq(TransactionsTable.transactionExpenseIdFK, id)
                )
            );
        return result.count
    }

    if (forWhat === "Cards") {
        const [result] = await db
            .select({ count: count() })
            .from(TransactionsTable)
            .where(
                and(
                    eq(TransactionsTable.clerkUserId, userId),
                    eq(TransactionsTable.transactionCardIdFK, id)
                )
            );
        return result.count
    }

    if (forWhat === "Accounts") {
        const [result] = await db
            .select({ count: count() })
            .from(TransactionsTable)
            .where(
                and(
                    eq(TransactionsTable.clerkUserId, userId),
                    eq(TransactionsTable.transactionAccountIdFK, id)
                )
            );
        return result.count
    }

    throw new Error("Invalid transaction type")
}

