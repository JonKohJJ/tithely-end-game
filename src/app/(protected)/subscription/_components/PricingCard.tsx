import MyButton from '@/components/MyButton'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { TierNames, TSubscriptionTier,  } from '@/data/subscriptionTiers'
import { createCancelSessionSubscription, createCheckoutSession } from '@/server/actions/stripe'

type TPricingCardProps = TSubscriptionTier & {
    currentTierName: TierNames
}

export default function PricingCard({
    name,
    isOneTimePurchase,
    priceInCents,
    originalPriceInCents,
    canAccessDashboardPage,
    canAccessAnalyticsPage,
    canAccessCardsPage,
    canAccessAccountsPage,
    maxNumberOfCategories,
    maxNumberOfTransactions,
    maxNumberOfCards,
    maxNumberOfAccounts,
    currentTierName
}: TPricingCardProps) {

    const isCurrent = currentTierName === name
    const isOnOneTimePurchasePlan = currentTierName === "Pro (One Time Purchase)"

    return (
        <Card className="w-full shadow-none border-color-border">

            <CardHeader>
                <div className="fs-h3 font-semibold mb-8">{name}</div>
                <CardTitle className="fs-base font-bold flex gap-2">
                    {originalPriceInCents && 
                        <p className='text-color-muted-text line-through font-normal'>${originalPriceInCents/100}</p>
                    }
                    ${priceInCents/100}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <form 
                    action={
                        name === "Free"
                        ? createCancelSessionSubscription
                        : createCheckoutSession.bind(null, name, isOneTimePurchase)
                    }
                >
                    <MyButton disabled={isOnOneTimePurchasePlan || isCurrent} additionalClasses='w-full'>
                        <p>
                            {isOnOneTimePurchasePlan
                                ? "You Have All Access!"
                                : (isCurrent
                                    ? "Current"
                                    : (isOneTimePurchase
                                        ? "Buy Now!"
                                        : "Swap"
                                    )
                                )
                            }
                        </p>
                    </MyButton>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-8 items-start">

                <div className='flex flex-col gap-4'>
                    <p><strong>{maxNumberOfCategories}</strong> Max Categories</p>
                    <p><strong>{maxNumberOfTransactions}</strong> Max Transactions</p>
                    <p>Access Dashboard Page: {canAccessDashboardPage}</p>
                </div>

                <div className='flex flex-col gap-4'>
                    <p><strong>{maxNumberOfCards}</strong> Max Cards</p>
                    <p><strong>{maxNumberOfAccounts}</strong> Max Accounts</p>
                    <p>Access Cards Page: {canAccessCardsPage}</p>
                    <p>Access Account Page: {canAccessAccountsPage}</p>
                    <p>Access Analytics Page: {canAccessAnalyticsPage}</p>
                </div>



            </CardFooter>
        </Card>
    )
}

// function Feature({
//     children,
//     isPaidTier = false,
//     count,
//     hasPermission
// }: {
//     children: ReactNode,
//     isPaidTier?: boolean,
//     count?: number,
//     hasPermission?: boolean,
// }) {

//     return (
//         <div className={`flex gap-2`}>
//             {isPaidTier
//                 ? <CheckCheck />
//                 : count && count > 0 ? <CheckIcon /> : 
//                     hasPermission ?  <CheckIcon /> : <X />
                
//             }

//             <span>{children}</span>
//         </div>
//     )
// }


