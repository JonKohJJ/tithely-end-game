import { getAccountsCount } from "./db/accounts"
import { getCardsCount } from "./db/cards"
import { getExpensesCount } from "./db/expenses"
import { getIncomeCount } from "./db/income"
import { getSavingsCount } from "./db/savings"
import { getUserSubscriptionTier } from "./db/subscription"
import { getTransactionsCount } from "./db/transactions"


// Dashboard Views

export async function canViewIncome_Streams(userId: string | null) {
    if (userId === null) return false
    const tier = await getUserSubscriptionTier(userId)
    return tier.canViewIncome_Streams
}
export async function canViewSavings_Goals(userId: string | null) {
    if (userId === null) return false
    const tier = await getUserSubscriptionTier(userId)
    return tier.canViewSavings_Goals
}
export async function canViewSavings_Growth(userId: string | null) {
    if (userId === null) return false
    const tier = await getUserSubscriptionTier(userId)
    return tier.canViewSavings_Growth
}
export async function canViewExpenses_Budget(userId: string | null) {
    if (userId === null) return false
    const tier = await getUserSubscriptionTier(userId)
    return tier.canViewExpenses_Budget
}
export async function canViewExpenses_Insights(userId: string | null) {
    if (userId === null) return false
    const tier = await getUserSubscriptionTier(userId)
    return tier.canViewExpenses_Insights
}
export async function canViewExpenses_Actual(userId: string | null) {
    if (userId === null) return false
    const tier = await getUserSubscriptionTier(userId)
    return tier.canViewExpenses_Actual
}
export async function canViewExpenses_Trend(userId: string | null) {
    if (userId === null) return false
    const tier = await getUserSubscriptionTier(userId)
    return tier.canViewExpenses_Trend
}
export async function canViewCards(userId: string | null) {
    if (userId === null) return false
    const tier = await getUserSubscriptionTier(userId)
    return tier.canViewCards
}
export async function canViewAccounts(userId: string | null) {
    if (userId === null) return false
    const tier = await getUserSubscriptionTier(userId)
    return tier.canViewAccounts
}
export async function canViewTransactions(userId: string | null) {
    if (userId === null) return false
    const tier = await getUserSubscriptionTier(userId)
    return tier.canViewTransactions
}



// Can Create?

export async function canCreateIncomes(userId: string | null) {
    if (userId === null) return { 
        canCreateIncome: false, 
        maxNumberOfIncome: 0, 
        incomeCount: 0 
    }
    const { maxNumberOfIncome } = await getUserSubscriptionTier(userId)
    const incomeCount = await getIncomeCount(userId)
    return { 
        canCreateIncome: incomeCount < maxNumberOfIncome,
        maxNumberOfIncome,
        incomeCount
    }
}
export async function canCreateSavings(userId: string | null) {
    if (userId === null) return { 
        canCreateSaving: false, 
        maxNumberOfSavings: 0, 
        savingsCount: 0 
    }
    const { maxNumberOfSavings } = await getUserSubscriptionTier(userId)
    const savingsCount = await getSavingsCount(userId)
    return { 
        canCreateSaving: savingsCount < maxNumberOfSavings,
        maxNumberOfSavings,
        savingsCount
    }
}
export async function canCreateExpenses(userId: string | null) {
    if (userId === null) return { 
        canCreateExpense: false, 
        maxNumberOfExpenses: 0, 
        expensesCount: 0 
    }
    const { maxNumberOfExpenses } = await getUserSubscriptionTier(userId)
    const expensesCount = await getExpensesCount(userId)
    return { 
        canCreateExpense: expensesCount < maxNumberOfExpenses,
        maxNumberOfExpenses,
        expensesCount
    }
}
export async function canCreateCards(userId: string | null) {
    if (userId === null) return { 
        canCreateCard: false, 
        maxNumberOfCards: 0, 
        cardsCount: 0 
    }
    const { maxNumberOfCards } = await getUserSubscriptionTier(userId)
    const cardsCount = await getCardsCount(userId)
    return { 
        canCreateCard: cardsCount < maxNumberOfCards,
        maxNumberOfCards,
        cardsCount
    }
}
export async function canCreateAccounts(userId: string | null) {
    if (userId === null) return { 
        canCreateAccount: false, 
        maxNumberOfAccounts: 0, 
        accountsCount: 0 
    }
    const { maxNumberOfAccounts } = await getUserSubscriptionTier(userId)
    const accountsCount = await getAccountsCount(userId)
    return { 
        canCreateAccount: accountsCount < maxNumberOfAccounts,
        maxNumberOfAccounts,
        accountsCount
    }
}
export async function canCreateTransactions(userId: string | null) {
    if (userId === null) return { 
        canCreateTransaction: false, 
        maxNumberOfTransactions: 0, 
        transactionsCount: 0 
    }
    const { maxNumberOfTransactions } = await getUserSubscriptionTier(userId)
    const transactionsCount = await getTransactionsCount(userId)

    return { 
        canCreateTransaction: maxNumberOfTransactions === "Unlimited" || transactionsCount < maxNumberOfTransactions,
        maxNumberOfTransactions,
        transactionsCount
    }
}