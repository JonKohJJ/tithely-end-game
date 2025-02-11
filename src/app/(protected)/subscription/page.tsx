import { getUserSubscriptionTier } from '@/server/db/subscription'
import PricingCard from './_components/PricingCard'
import { SubscriptionTiersInOrder } from '@/data/subscriptionTiers'
import { auth } from '@clerk/nextjs/server'

export default async function SubscriptionPage() {

    const { userId, redirectToSignIn } = await auth()
    if (userId == null) return redirectToSignIn()
    const { name } = await getUserSubscriptionTier(userId)

    return (
        <div>
            <div className="flex flex-col gap-4 lg:flex-row">
                {SubscriptionTiersInOrder.map(tier => (
                    <PricingCard key={tier.name} currentTierName={name} {...tier} />
                ))}
            </div>
        </div>
    )
}
