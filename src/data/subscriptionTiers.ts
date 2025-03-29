export type TierNames = keyof typeof SubscriptionTiers
export type PaidTierNames = Exclude<TierNames, "Free">

export type TSubscriptionTier = {
  name:                     TierNames
  priceInCents:             number
  originalPriceInCents?:    number
  isMonthlyPlan?:           boolean
  isLifetimePlan?:          boolean
  isPopular?:               boolean

  // Categories Page
  canAccessCardsPage:       boolean
  canAccessAccountsPage:    boolean

  // Analytics Page
  canViewExpenses_Actual:   boolean
  canViewExpenses_Budget:   boolean
  canViewExpenses_Trend:    boolean
  //
  canViewSavings_Goals:     boolean
  canViewSavings_Growth:    boolean


  maxNumberOfCategories:    number
  maxNumberOfTransactions:  number
  maxNumberOfCards:         number
  maxNumberOfAccounts:      number

  stripePriceId:            string | undefined
}

export const SubscriptionTiers = {
  Free: {
    name: "Free",
    priceInCents: 0,

    canAccessCardsPage: false,
    canAccessAccountsPage: false,

    canViewExpenses_Actual:   true,
    canViewExpenses_Budget:   false,
    canViewExpenses_Trend:    false,

    canViewSavings_Goals:     false,
    canViewSavings_Growth:    false,

    maxNumberOfCategories: 6,
    maxNumberOfTransactions: 100,
    maxNumberOfCards: 0,
    maxNumberOfAccounts: 0,

    stripePriceId: undefined
  },
  "Pro Monthly": {
    name: "Pro Monthly",
    priceInCents: 2499,
    originalPriceInCents: 3000,
    isMonthlyPlan: true,

    canAccessCardsPage: true,
    canAccessAccountsPage: true,

    canViewExpenses_Actual:   true,
    canViewExpenses_Budget:   true,
    canViewExpenses_Trend:    true,

    canViewSavings_Goals:     true,
    canViewSavings_Growth:    true,

    maxNumberOfCategories: 12,
    maxNumberOfTransactions: 300,
    maxNumberOfCards: 3,
    maxNumberOfAccounts: 3,

    stripePriceId: process.env.STRIPE_PRO_MONTHLY_STRIPE_PRICE_ID,
  },
  "Pro Lifetime": {
    name: "Pro Lifetime",
    priceInCents: 25000,
    originalPriceInCents: 30000,
    isLifetimePlan: true,
    isPopular: true,

    canAccessCardsPage: true,
    canAccessAccountsPage: true,

    canViewExpenses_Actual:   true,
    canViewExpenses_Budget:   true,
    canViewExpenses_Trend:    true,

    canViewSavings_Goals:     true,
    canViewSavings_Growth:    true,

    maxNumberOfCategories: 15,
    maxNumberOfTransactions: 1000,
    maxNumberOfCards: 5,
    maxNumberOfAccounts: 5,

    stripePriceId: process.env.STRIPE_PRO_OTP_STRIPE_PRICE_ID,
  },
} as const

export const SubscriptionTiersInOrder = [
  SubscriptionTiers["Free"],
  SubscriptionTiers["Pro Monthly"],
  SubscriptionTiers["Pro Lifetime"],
] as const

export function getTierByPriceId(stripePriceId: string) {
  return Object.values(SubscriptionTiers).find(
    tier => tier.stripePriceId === stripePriceId
  )
}