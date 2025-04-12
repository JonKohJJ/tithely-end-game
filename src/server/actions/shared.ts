import { getAllAccountNames } from "@/server/db/accounts"
import { getAllCardNames } from "@/server/db/cards"
import { getAllExpenseNames } from "@/server/db/expenses"
import { getAllIncomeNames } from "@/server/db/income"
import { getAllSavingNames } from "@/server/db/savings"

export async function checkDuplicateName(
    userId: string,
    nameToBeChecked: string,
    tableName: "income" | "saving" | "expense" | "card" | "account"
) {
    
    // This function handles
    // whitespace from both the start and end of a string
    // & is case-sensitive

    const formattedNameToBeChecked = nameToBeChecked.trim().toLowerCase()

    let allNames: string[] = []

    if (tableName === "income") {
        allNames = await getAllIncomeNames(userId)
    }

    if (tableName === "saving") {
        allNames = await getAllSavingNames(userId)
    }

    if (tableName === "expense") {
        allNames = await getAllExpenseNames(userId)
    }

    if (tableName === "card") {
        allNames = await getAllCardNames(userId)
    }

    if (tableName === "account") {
        allNames = await getAllAccountNames(userId)
    }

    if (allNames
        .map(name => { return name.toLowerCase() })
        .includes(formattedNameToBeChecked)
    ) {
        return true
    }

    return false
}