import { db } from "@/drizzle/db";
import { CategoriesTable, UserSubscriptionTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

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