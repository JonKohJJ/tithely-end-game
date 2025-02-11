import { SubscriptionTiers } from "@/data/subscriptionTiers";
import { db } from "@/drizzle/db";
import { CategoriesTable, UserSubscriptionTable } from "@/drizzle/schema";
import { eq, SQL } from "drizzle-orm";

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

    // Delete user's categories, and on cascade, their transactions as well
    await db
        .delete(CategoriesTable)
        .where(eq(CategoriesTable.clerkUserId, clerkUserId))
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
) {
    await db
        .update(UserSubscriptionTable)
        .set(data)
        .where(where)
}