export type TierNames = keyof typeof subscriptionTiers
export type PaidTierNames = Exclude<TierNames, "Free">

export const subscriptionTiers = {
  Free: {
    name: "Free",
    priceInCents: 0,
    maxNumberOfTodos: 3,
    canAccessAnalytics: false,
    stripePriceId: null,
  },
  Basic: {
    name: "Basic",
    priceInCents: 499,
    maxNumberOfTodos: 5,
    canAccessAnalytics: false,
    // stripePriceId: env.STRIPE_BASIC_PLAN_STRIPE_PRICE_ID,
  },
  Standard: {
    name: "Standard",
    priceInCents: 999,
    maxNumberOfTodos: 7,
    canAccessAnalytics: true,
    // stripePriceId: env.STRIPE_STANDARD_PLAN_STRIPE_PRICE_ID,
  },
  Premium: {
    name: "Premium",
    priceInCents: 1999,
    maxNumberOfTodos: 10,
    canAccessAnalytics: true,
    // stripePriceId: env.STRIPE_PREMIUM_PLAN_STRIPE_PRICE_ID,
  },
} as const

export const subscriptionTiersInOrder = [
  subscriptionTiers.Free,
  subscriptionTiers.Basic,
  subscriptionTiers.Standard,
  subscriptionTiers.Premium,
] as const

// export function getTierByPriceId(stripePriceId: string) {
//   return Object.values(subscriptionTiers).find(
//     tier => tier.stripePriceId === stripePriceId
//   )
// }