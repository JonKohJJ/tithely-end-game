"use server"

import { CategorySchema, TInsertCategory } from "@/zod/categories"
import { auth } from "@clerk/nextjs/server"
import {
    addCategory as addCategoryDb,
    updateCategory as updateCategoryDb,
    deleteCategory as deleteCategoryDb,
    TDatabaseResponse,
    getAllCategoryNames
} from '../db/categories'
import { revalidatePath } from "next/cache"
import { canCreateCategory } from "../permissions"


export async function addCategory(
    unsafeData: TInsertCategory
): Promise<TDatabaseResponse> {
    const { userId } = await auth()
    const { success, data } = CategorySchema.safeParse(unsafeData)

    const { canCreate } = await canCreateCategory(userId)
    if (!success || userId == null || !canCreate) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error adding your category" }
    }

    // Check for duplicate category name
    const hasDuplicatedName = await hasDuplicateCategoryName(userId, data.categoryName)
    if (hasDuplicatedName) {
        return { success: false, dbResponseMessage: "No duplicated category name allowed. Please add a different one." }
    }

    revalidatePath('/categories') 
    return await addCategoryDb({ ...data, clerkUserId: userId })
}

export async function updateCategory(
    categoryId: string,
    unsafeData: TInsertCategory
) {
    const { userId } = await auth()
    const { success, data } = CategorySchema.safeParse(unsafeData)

    if (!success || userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error updating your category" }
    }

    revalidatePath('/categories') 
    return await updateCategoryDb(data, { categoryId, userId })
}

export async function deleteCategory(categoryId: string) {
    const { userId } = await auth()

    if (userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error deleting your category" }
    }

    revalidatePath('/categories') 
    return await deleteCategoryDb({ categoryId, userId })
}

async function hasDuplicateCategoryName(
    userId: string,
    nameToBeChecked: string
) {
    const allCategoryNames = await getAllCategoryNames(userId)

    if (allCategoryNames.includes(nameToBeChecked)) {
        return true
    }

    return false
}