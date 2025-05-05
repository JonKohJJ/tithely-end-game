export type TierNames = keyof typeof SubscriptionTiers
export type PaidTierNames = Exclude<TierNames, "Free">

export type TSubscriptionTier = {

  // Tier Information
  name:                     TierNames
  priceInCents:             number
  originalPriceInCents?:    number
  isMonthlyPlan?:           boolean
  isLifetimePlan?:          boolean
  isPopular?:               boolean
  stripePriceId:            string | undefined

  // Dashboard Views - Income
  canViewIncome_Streams:    boolean
  canViewIncome_Flow:       boolean
  // Dashboard Views - Savings
  canViewSavings_Goals:     boolean
  canViewSavings_Growth:    boolean
  // Dashboard Views - Expenses
  canViewExpenses_Budget:   boolean
  canViewExpenses_Insights: boolean
  canViewExpenses_Actual:   boolean
  canViewExpenses_Trend:    boolean
  // Dashboard Views - Cards & Accounts
  canViewCards:             boolean
  canViewAccounts:          boolean
  // Dashboard Views - Transactions
  canViewTransactions:      boolean

  // Max Number
  maxNumberOfIncome:        number
  maxNumberOfSavings:       number
  maxNumberOfExpenses:      number
  maxNumberOfCards:         number
  maxNumberOfAccounts:      number
  maxNumberOfTransactions:  number | "Unlimited"
}

export const SubscriptionTiers = {
  Free: {
    name:                     "Free",
    priceInCents:             0,
    stripePriceId:            undefined,

    canViewIncome_Streams:    true,
    canViewIncome_Flow:       false, 
    canViewSavings_Goals:     true,
    canViewSavings_Growth:    false,
    canViewExpenses_Budget:   true,
    canViewExpenses_Insights: true,
    canViewExpenses_Actual:   true,
    canViewExpenses_Trend:    false,
    canViewCards:             false,
    canViewAccounts:          false,
    canViewTransactions:      true,

    maxNumberOfIncome:        1,
    maxNumberOfSavings:       1,
    maxNumberOfExpenses:      5,
    maxNumberOfCards:         0,
    maxNumberOfAccounts:      0,
    maxNumberOfTransactions:  100,
  },

  "Pro Monthly": {
    name:                     "Pro Monthly",
    priceInCents:             1999,
    originalPriceInCents:     2499,
    isMonthlyPlan:            true,
    stripePriceId:            process.env.STRIPE_PRO_MONTHLY_STRIPE_PRICE_ID,

    canViewIncome_Streams:    true, 
    canViewIncome_Flow:       true, 
    canViewSavings_Goals:     true,
    canViewSavings_Growth:    true,
    canViewExpenses_Budget:   true,
    canViewExpenses_Insights: true,
    canViewExpenses_Actual:   true,
    canViewExpenses_Trend:    true,
    canViewCards:             true,
    canViewAccounts:          true,
    canViewTransactions:      true,

    maxNumberOfIncome:        2,
    maxNumberOfSavings:       2,
    maxNumberOfExpenses:      10,
    maxNumberOfCards:         3,
    maxNumberOfAccounts:      3,
    maxNumberOfTransactions:  300,
  },

  "Pro Lifetime": {
    name:                     "Pro Lifetime",
    priceInCents:             19900,
    originalPriceInCents:     24900,
    isLifetimePlan:           true,
    isPopular:                true,    
    stripePriceId:            process.env.STRIPE_PRO_OTP_STRIPE_PRICE_ID,

    canViewIncome_Streams:    true,
    canViewIncome_Flow:       true, 
    canViewSavings_Goals:     true,
    canViewSavings_Growth:    true,
    canViewExpenses_Budget:   true,
    canViewExpenses_Insights: true,
    canViewExpenses_Actual:   true,
    canViewExpenses_Trend:    true,
    canViewCards:             true,
    canViewAccounts:          true,
    canViewTransactions:      true,

    maxNumberOfIncome:        4,
    maxNumberOfSavings:       4,
    maxNumberOfExpenses:      12,
    maxNumberOfCards:         5,
    maxNumberOfAccounts:      5,
    maxNumberOfTransactions:  "Unlimited",
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