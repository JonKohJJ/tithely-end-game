import { getUserSubscriptionTier } from '@/server/db/subscription'
import { auth } from '@clerk/nextjs/server'
import PageHeader from '../_components/PageHeader'
import SubcriptionPlans from '@/components/SubscriptionPlans'
import { canCreateAccount, canCreateCard, canCreateCategory, canCreateTransaction } from '@/server/permissions'
import { InsightCard } from '@/components/InsightCard'
import { Progress } from '@/components/ui/progress'
import { Percent, Tally5 } from 'lucide-react'
import Link from 'next/link'
import MyButton from '@/components/MyButton'

export default async function SubscriptionPage() {

    const { userId, redirectToSignIn } = await auth()
    if (userId == null) return redirectToSignIn()
    const { name } = await getUserSubscriptionTier(userId)

    const { maxNumberOfCategories, categoriesCount } = await canCreateCategory(userId)
    const { maxNumberOfTransactions, transactionsCount } = await canCreateTransaction(userId)
    const { maxNumberOfCards, cardsCount } = await canCreateCard(userId)
    const { maxNumberOfAccounts, accountsCount } = await canCreateAccount(userId)

    return (
        <div className='subscription-page flex flex-col gap-8 h-full'>
        
            <PageHeader title='Your Subscription' description='Manage your subscription and plan'>
            </PageHeader>

            <div className="subscription-insight-cards flex flex-col md:flex-row gap-4">
                <InsightCard 
                        title="Number of Transactions" 
                        description="Upgrade to the paid tier to add more transactions." 
                        content={
                            <div className="flex flex-col gap-2">
                                <p>{transactionsCount} / {maxNumberOfTransactions} transactions created</p>
                                <Progress value={(transactionsCount/maxNumberOfTransactions)*100} className="bg-color-muted-text" additionalClasses="bg-color-text" />
                            </div>
                        }
                        icon={<Tally5 className="w-4 h-4 text-neutral-500" />}
                    />
                <InsightCard
                    title="Number of Categories" 
                    description="Upgrade to the paid tier to add more category" 
                    content={
                        <div className="flex flex-col gap-2">
                            <p>{categoriesCount} / {maxNumberOfCategories} categories created</p>
                            <Progress value={(categoriesCount/maxNumberOfCategories)*100} className="bg-color-muted-text" additionalClasses="bg-color-text" />
                        </div>
                    }
                    icon={<Percent className="w-4 h-4 text-neutral-500" />}
                />
                <InsightCard
                    title="Number of Cards" 
                    description="Upgrade to the paid tier to add more cards" 
                    content={
                        name === "Free" ? <UpgradeButton /> :
                        <div className="flex flex-col gap-2">
                            <p>{cardsCount} / {maxNumberOfCards} cards created</p>
                            <Progress value={(cardsCount/maxNumberOfCards)*100} className="bg-color-muted-text" additionalClasses="bg-color-text" />
                        </div>
                    }
                    icon={<Percent className="w-4 h-4 text-neutral-500" />}
                />
                <InsightCard
                    title="Number of Accounts" 
                    description="Upgrade to the paid tier to add more accounts" 
                    content={
                        name === "Free" ? <UpgradeButton /> :
                        <div className="flex flex-col gap-2">
                            <p>{accountsCount} / {maxNumberOfAccounts} cards created</p>
                            <Progress value={(accountsCount/maxNumberOfAccounts)*100} className="bg-color-muted-text" additionalClasses="bg-color-text" />
                        </div>
                    }
                    icon={<Percent className="w-4 h-4 text-neutral-500" />}
                />
            </div>

            <SubcriptionPlans 
                currentPlanName={name} 
            />
        </div>
    )
}

function UpgradeButton() {
    return (
        <MyButton>
            <Link href="/subscription">
                <p className='fs-base'>Upgrade Account</p>
            </Link>
        </MyButton>
    )
}
