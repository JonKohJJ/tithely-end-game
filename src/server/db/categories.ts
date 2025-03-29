import { db } from "@/drizzle/db";
import { CategoriesTable, TransactionsTable, TypeEnum } from "@/drizzle/schema";
import { TInsertCategory } from "@/zod/categories";
import { eq, and, count, asc } from "drizzle-orm";

const IterateTypes = TypeEnum.enumValues

export type TDatabaseResponse = {
    success: boolean
    dbResponseMessage: string
}

export type TFetchedCategory = typeof CategoriesTable.$inferSelect
export type TFetchedCategoryWithChildTransactionCount = TFetchedCategory & {
    childTransactionsCount: number
}

export type TFetchedAllCategories = {
    type: "Income" | "Savings" | "Expenses";
    categories: TFetchedCategoryWithChildTransactionCount[];
    sum: number;
}[]

// const OPERATION_DELAY = 2000
// await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

export async function getAllCategories(
    userId: string
) {

    // await new Promise((resolve) => setTimeout(resolve, OPERATION_DELAY))

    const allCategories = []

    // Array to Calculate Zero Based Indicator 
    const sumsArray = []

    for (const type of IterateTypes) {
        const categories = await getIndividualCategories(userId, type)
        const sum = calculateSum(categories)
        allCategories.push({
            type,
            categories,
            sum
        })
        sumsArray.push({
            type,
            sum
        })
    }

    const zeroBasedIndicatorString = calculateZeroBased(sumsArray)
    const fixedVariableRatioString = calculateFixedVariableRatio(allCategories)
    
    return { allCategories, zeroBasedIndicatorString, fixedVariableRatioString }
}

export async function getCategoriesCount(
    userId: string
) {
    const [ result ] = await db
        .select(
            { count: count() }
        )
        .from(CategoriesTable)
        .where(
            eq(CategoriesTable.clerkUserId, userId)
        )
    return result.count
}

async function getIndividualCategories(
    userId: string, 
    type: "Income" | "Savings" | "Expenses",
) : Promise<TFetchedCategoryWithChildTransactionCount[]> {
    const categories = await db
        .select()
        .from(CategoriesTable)
        .where(
            and(
                eq(CategoriesTable.clerkUserId, userId),
                eq(CategoriesTable.categoryType, type)
            )
        )
        .orderBy(asc(CategoriesTable.createdAt))

    // Fetch transaction count for each category and add it to the result
    const categoriesWithChildTransactionCount = await Promise.all(
        categories.map(async (category) => {
            const count = await getChildTransactionsCount(userId, category.categoryId)
            return {
                ...category,
                childTransactionsCount: count
            }
        })
    )

    return categoriesWithChildTransactionCount
}

function calculateSum(
    categories: TFetchedCategory[]
): number {
    let sum: number = 0
    categories.forEach(category => { sum = sum + category.categoryBudget })
    return sum
}

export async function addCategory(
    values: typeof CategoriesTable.$inferInsert
) : Promise<TDatabaseResponse> {

    try {

        const [insertedCategory] = await db
            .insert(CategoriesTable)
            .values(values)
            .returning()

        return { success: true, dbResponseMessage: `Category '${insertedCategory.categoryName}' successfully added`}

    } catch (error) {

        if (error instanceof Error) {
            let errorMessage = ""
            switch (error.message) {
                case `duplicate key value violates unique constraint "user_categories_clerk_user_id_category_name_pk"`:
                    errorMessage = "Cannot add the duplicate category, please change your category name."
                    break
            }
            return { success: false, dbResponseMessage: `DB ERROR - ${errorMessage}` };
        }
        
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" };
    }
}

export async function updateCategory(
    values: TInsertCategory,
    { categoryId, userId } : { categoryId: string, userId: string }
) : Promise<TDatabaseResponse> {

    try {

        const [updatedCategory] = await db
            .update(CategoriesTable)
            .set(values)
            .where(and(eq(CategoriesTable.clerkUserId, userId), eq(CategoriesTable.categoryId, categoryId)))
            .returning()

        return { success: true, dbResponseMessage: `Category '${updatedCategory.categoryName}' successfully updated`}

    } catch (error) {

        if (error instanceof Error) {
            // TODO: Handle any update failures
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }
    }
}

export async function deleteCategory({
    categoryId, 
    userId
} : {
    categoryId: string, 
    userId: string
}) : Promise<TDatabaseResponse> {

    try {

        // on category delete, it will cascade down to their respective child transactions

        const [deletedCategory] = await db
            .delete(CategoriesTable)
            .where(and(eq(CategoriesTable.clerkUserId, userId), eq(CategoriesTable.categoryId, categoryId)))
            .returning()
            
        return { success: true, dbResponseMessage: `Category '${deletedCategory.categoryName}' successfully deleted`}

    } catch (error) {

        if (error instanceof Error) {
            // TODO: Handle any delete failures
            return { success: false, dbResponseMessage: `DB ERROR - ${error.message}` }
        }
        
        return { success: false, dbResponseMessage: "DB ERROR - An unexpected error occurred" }

    }
} 

function calculateZeroBased(sumsArray: TSumsArray) {
    const income = sumsArray.find(item => item.type === "Income")?.sum || 0;
    const savings = sumsArray.find(item => item.type === "Savings")?.sum || 0;
    const expenses = sumsArray.find(item => item.type === "Expenses")?.sum || 0;
    const zeroBasedIndicator = income - (savings + expenses);

    if (zeroBasedIndicator === 0) {
        return "All funds perfectly balanced."
    }

    if (zeroBasedIndicator > 0) {
        return `$${zeroBasedIndicator} Not Allocated.`
    } 

    if (zeroBasedIndicator < 0) {
        return `$${Math.abs(zeroBasedIndicator)} Exceeded.`
    } 

    return ''
}

type TSumsArray = {
    type: "Income" | "Savings" | "Expenses";
    sum: number;
}[]

function calculateFixedVariableRatio(allCategories: {
    type: "Income" | "Savings" | "Expenses";
    categories: {
        categoryId: string;
        clerkUserId: string;
        categoryName: string;
        categoryBudget: number;
        categoryType: "Income" | "Savings" | "Expenses";
        expenseMethod: "Fixed" | "Variable" | null;
        createdAt: Date;
    }[];
    sum: number;
}[]) {
    // Find the "Expenses" entry
    const expensesData = allCategories.find(item => item.type === "Expenses");

    if (!expensesData || !expensesData.categories.length) {
        return `Fixed: 0%, Variable: 0%`
    }

    // Calculate the total budgets for Fixed and Variable expenses
    const fixedSum = expensesData.categories
        .filter(category => category.expenseMethod === "Fixed")
        .reduce((sum, category) => sum + category.categoryBudget, 0);

    const variableSum = expensesData.categories
        .filter(category => category.expenseMethod === "Variable")
        .reduce((sum, category) => sum + category.categoryBudget, 0);

    // Total expenses
    const totalExpenses = fixedSum + variableSum;

    // Avoid division by zero
    if (totalExpenses === 0) {
        return `Fixed: 0%, Variable: 0%`;
    }

    // Calculate percentages
    const fixedPercentage = ((fixedSum / totalExpenses) * 100).toFixed(2);
    const variablePercentage = ((variableSum / totalExpenses) * 100).toFixed(2);

    // Return the formatted string
    return `Fixed: ${fixedPercentage}%, Variable: ${variablePercentage}%`;
}

export async function getAllCategoryNames(
    userId: string, 
) {
    
    const allNames: string[] = []

    const data = await db
        .select({
            name: CategoriesTable.categoryName
        })
        .from(CategoriesTable)
        .where(
            eq(CategoriesTable.clerkUserId, userId)
        )
    
    data.map(item => {
        allNames.push(item.name)
    })
    
    return allNames
}

export async function getChildTransactionsCount(userId: string, categoryId: string) {

    const [ result ] = await db
        .select(
            { count: count() }
        )
        .from(TransactionsTable)
        .where(
            and(
                eq(TransactionsTable.clerkUserId, userId),
                eq(TransactionsTable.transactionCategoryIdFK, categoryId)
            )
        )
    
    return result.count
}