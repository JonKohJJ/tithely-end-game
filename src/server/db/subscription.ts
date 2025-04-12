import { SubscriptionTiers } from "@/data/subscriptionTiers";
import { db } from "@/drizzle/db";
import { ExpensesTable, IncomeTable, SavingsTable, UserSubscriptionTable } from "@/drizzle/schema";
import { eq, SQL } from "drizzle-orm";
import { deleteAllCards } from "./cards";
import { deleteAllAccounts } from "./accounts";
import { TDatabaseResponse } from "./shared";

export async function createUserSubscription(
    data: typeof UserSubscriptionTable.$inferInsert
) {
    await db
        .insert(UserSubscriptionTable)
        .values(data)
        .onConflictDoNothing({ target: UserSubscriptionTable.clerkUserId })
    // console.log('DB/User Created/', data)
}

export async function deleteUserSubscription(
    clerkUserId: string
) {
    await db
        .delete(UserSubscriptionTable)
        .where(eq(UserSubscriptionTable.clerkUserId, clerkUserId))

    await db
        .delete(IncomeTable)
        .where(eq(IncomeTable.clerkUserId, clerkUserId))

    await db
        .delete(SavingsTable)
        .where(eq(SavingsTable.clerkUserId, clerkUserId))

    await db
        .delete(ExpensesTable)
        .where(eq(ExpensesTable.clerkUserId, clerkUserId))

    await deleteAllCards(clerkUserId)
    await deleteAllAccounts(clerkUserId)
}

export async function getUserSubscription(
    clerkUserId: string
) {
    const [userSubscription] = await db
        .select()
        .from(UserSubscriptionTable)
        .where(
            eq(UserSubscriptionTable.clerkUserId, clerkUserId),
        )
    
    return userSubscription
}

export async function getUserSubscriptionTier(
    clerkUserId: string
) {
    const userSubscription = await getUserSubscription(clerkUserId)
    if (userSubscription === null) { throw new Error("User has no subscription") }
    return SubscriptionTiers[userSubscription.tier]
}
 
export async function updateUserSubscription(
    where: SQL,
    data: Partial<typeof UserSubscriptionTable.$inferInsert>
): Promise<TDatabaseResponse> {

    try {
        const [ updatedSubscription ] = await db
            .update(UserSubscriptionTable)
            .set(data)
            .where(where)
            .returning()

        return { success: true, dbResponseMessage: `Current Tier: ${updatedSubscription.tier}`}

    } catch (error) {

        if (error instanceof Error) {
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }
    }
}