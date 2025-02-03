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


export async function addCategory(
    unsafeData: TInsertCategory
): Promise<TDatabaseResponse> {
    const { userId } = await auth()
    const { success, data } = CategorySchema.safeParse(unsafeData)

    // const canAdd = await canAddTodo(userId)
    // if (!success || userId == null || !canAdd) {
    //     return {error: true, message: "There was an error adding your todo"}
    // }

    if (!success || userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error adding your category" }
    }

    // Check for duplicate category name
    const hasDuplicatedName = await hasDuplicateName(userId, data.categoryName)
    if (hasDuplicatedName) {
        return { success: false, dbResponseMessage: "No duplicated category name allowed. Please add a different one." }
    }

    revalidatePath('/planner') 
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

    revalidatePath('/planner') 
    return await updateCategoryDb(data, { categoryId, userId })
}

export async function deleteCategory(categoryId: string) {
    const { userId } = await auth()

    if (userId == null) {
        return { success: false, dbResponseMessage: "SS Validation - There was an error deleting your category" }
    }

    revalidatePath('/planner') 
    return await deleteCategoryDb({ categoryId, userId })
}

async function hasDuplicateName(
    userId: string,
    nameToBeChecked: string
) {
    const allCategoryNames = await getAllCategoryNames(userId)

    if (allCategoryNames.includes(nameToBeChecked)) {
        return true
    }

    return false
}