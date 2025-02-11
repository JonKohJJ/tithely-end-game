export type TierNames = keyof typeof SubscriptionTiers
export type PaidTierNames = Exclude<TierNames, "Free">

export type TSubscriptionTier = {
  name: TierNames,
  isOneTimePurchase: boolean,
  priceInCents: number,
  originalPriceInCents: number,
  canAccessDashboardPage: boolean,
  canAccessAnalyticsPage: boolean,
  canAccessCardsPage: boolean,
  canAccessAccountsPage: boolean,
  maxNumberOfCategories: number,
  maxNumberOfTransactions: number,
  maxNumberOfCards: number,
  maxNumberOfAccounts: number,
  stripePriceId: string | undefined,
}

export const SubscriptionTiers = {
  Free: {
    name: "Free",
    isOneTimePurchase: false,
    priceInCents: 0,
    originalPriceInCents: 0,
    canAccessDashboardPage: true,
    canAccessAnalyticsPage: false,
    canAccessCardsPage: false,
    canAccessAccountsPage: false,
    maxNumberOfCategories: 6,
    maxNumberOfTransactions: 100,
    maxNumberOfCards: 0,
    maxNumberOfAccounts: 0,
    stripePriceId: undefined
  },
  "Pro (Monthly)": {
    name: "Pro (Monthly)",
    isOneTimePurchase: false,
    priceInCents: 1599,
    originalPriceInCents: 1999,
    canAccessDashboardPage: true,
    canAccessAnalyticsPage: true,
    canAccessCardsPage: true,
    canAccessAccountsPage: true,
    maxNumberOfCategories: 12,
    maxNumberOfTransactions: 300,
    maxNumberOfCards: 3,
    maxNumberOfAccounts: 3,
    stripePriceId: process.env.STRIPE_PRO_MONTHLY_STRIPE_PRICE_ID,
  },
  "Pro (One Time Purchase)": {
    name: "Pro (One Time Purchase)",
    isOneTimePurchase: true,
    priceInCents: 19900,
    originalPriceInCents: 25000,
    canAccessDashboardPage: true,
    canAccessAnalyticsPage: true,
    canAccessCardsPage: true,
    canAccessAccountsPage: true,
    maxNumberOfCategories: 15,
    maxNumberOfTransactions: 1000,
    maxNumberOfCards: 5,
    maxNumberOfAccounts: 5,
    stripePriceId: process.env.STRIPE_PRO_OTP_STRIPE_PRICE_ID,
  },
} as const

export const SubscriptionTiersInOrder = [
  SubscriptionTiers.Free,
  SubscriptionTiers["Pro (Monthly)"],
  SubscriptionTiers["Pro (One Time Purchase)"],
] as const

export function getTierByPriceId(stripePriceId: string) {
  return Object.values(SubscriptionTiers).find(
    tier => tier.stripePriceId === stripePriceId
  )
}