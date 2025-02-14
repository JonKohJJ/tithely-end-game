import { getUserSubscriptionTier } from '@/server/db/subscription'
import { auth } from '@clerk/nextjs/server'
import PageHeader from '../_components/PageHeader'
import SubcriptionPlans from '@/components/SubcriptionPlans'

export default async function SubscriptionPage() {

    const { userId, redirectToSignIn } = await auth()
    if (userId == null) return redirectToSignIn()
    const { name } = await getUserSubscriptionTier(userId)

    return (
        <div className='subscription-page flex flex-col gap-8 h-full'>
        
            <PageHeader title='Your Subscription' description='Manage your subscription and plan'>
            </PageHeader>

            <SubcriptionPlans 
                currentPlanName={name} 
            />
        </div>
    )
}
