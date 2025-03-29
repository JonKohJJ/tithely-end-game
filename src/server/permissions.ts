import { getAccountsCount } from "./db/accounts"
import { getCardsCount } from "./db/cards"
import { getCategoriesCount } from "./db/categories"
import { getUserSubscriptionTier } from "./db/subscription"
import { getTransactionsCount } from "./db/transactions"


// Dashboard Page
export async function canViewExpenses_Actual(userId: string | null) {
    if (userId === null) return false
    const tier = await getUserSubscriptionTier(userId)
    return tier.canViewExpenses_Actual
}
export async function canViewExpenses_Budget(userId: string | null) {
    if (userId === null) return false
    const tier = await getUserSubscriptionTier(userId)
    return tier.canViewExpenses_Budget
}
export async function canViewExpenses_Trend(userId: string | null) {
    if (userId === null) return false
    const tier = await getUserSubscriptionTier(userId)
    return tier.canViewExpenses_Trend
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

// Categories Page
export async function canAccessCardsPage(userId: string | null) {
    if (userId === null) return false
    const tier = await getUserSubscriptionTier(userId)
    return tier.canAccessCardsPage
}

export async function canAccesssAccountsPage(userId: string | null) {
    if (userId === null) return false
    const tier = await getUserSubscriptionTier(userId)
    return tier.canAccessAccountsPage
}

export async function canCreateCategory(userId: string | null) {
    if (userId === null) return { 
        canCreate: false, 
        maxNumberOfCategories: 0, 
        categoriesCount: 0 
    }
    const { maxNumberOfCategories } = await getUserSubscriptionTier(userId)
    const categoriesCount = await getCategoriesCount(userId)
    return { 
        canCreate: categoriesCount < maxNumberOfCategories,
        maxNumberOfCategories,
        categoriesCount
    }
}

export async function canCreateTransaction(userId: string | null) {
    if (userId === null) return { 
        canCreate: false, 
        maxNumberOfTransactions: 0, 
        transactionsCount: 0 
    }
    const { maxNumberOfTransactions } = await getUserSubscriptionTier(userId)
    const transactionsCount = await getTransactionsCount(userId)
    return { 
        canCreate: transactionsCount < maxNumberOfTransactions,
        maxNumberOfTransactions,
        transactionsCount
    }
}

export async function canCreateCard(userId: string | null) {
    if (userId === null) return { 
        canCreate: false, 
        maxNumberOfCards: 0, 
        cardsCount: 0 
    }
    const { maxNumberOfCards } = await getUserSubscriptionTier(userId)
    const cardsCount = await getCardsCount(userId)
    return { 
        canCreate: cardsCount < maxNumberOfCards,
        maxNumberOfCards,
        cardsCount
    }
}

export async function canCreateAccount(userId: string | null) {
    if (userId === null) return { 
        canCreate: false, 
        maxNumberOfAccounts: 0, 
        accountsCount: 0 
    }
    const { maxNumberOfAccounts } = await getUserSubscriptionTier(userId)
    const accountsCount = await getAccountsCount(userId)
    return { 
        canCreate: accountsCount < maxNumberOfAccounts,
        maxNumberOfAccounts,
        accountsCount
    }
}