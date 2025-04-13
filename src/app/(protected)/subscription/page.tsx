import { getUserSubscriptionTier } from '@/server/db/subscription'
import { auth } from '@clerk/nextjs/server'
import SubcriptionPlans from '@/components/SubscriptionPlans'
import { canCreateAccounts, canCreateCards, canCreateExpenses, canCreateIncomes, canCreateSavings, canCreateTransactions } from '@/server/permissions'
import { InsightCard } from '@/components/InsightCard'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CreditCard, DollarSign, HandCoins, Landmark, PiggyBank, Tally5 } from 'lucide-react'
import Link from 'next/link'
import SectionHeader from '../_components/SectionHeader'

export default async function SubscriptionPage() {

    const { userId, redirectToSignIn } = await auth()
    if (userId == null) return redirectToSignIn()
    const { name } = await getUserSubscriptionTier(userId)

    const { maxNumberOfIncome, incomeCount } = await canCreateIncomes(userId)
    const { maxNumberOfSavings, savingsCount } = await canCreateSavings(userId)
    const { maxNumberOfExpenses, expensesCount } = await canCreateExpenses(userId)
    const { maxNumberOfCards, cardsCount } = await canCreateCards(userId)
    const { maxNumberOfAccounts, accountsCount } = await canCreateAccounts(userId)
    const { maxNumberOfTransactions, transactionsCount } = await canCreateTransactions(userId)

    const subscriptionInsightItems = [
        {
          title: "Number of Income Categories",
          description: "Upgrade to the paid tier to add more income categories.",
          count: incomeCount,
          maxCount: maxNumberOfIncome,
          itemLabel: "income streams",
          icon: <HandCoins className="w-4 h-4 text-neutral-500" />,
        },
        {
          title: "Number of Saving Goals",
          description: "Upgrade to the paid tier to add more saving goals.",
          count: savingsCount,
          maxCount: maxNumberOfSavings,
          itemLabel: "saving goals",
          icon: <PiggyBank className="w-4 h-4 text-neutral-500" />,
        },
        {
          title: "Number of Expense Categories",
          description: "Upgrade to the paid tier to add more expense categories.",
          count: expensesCount,
          maxCount: maxNumberOfExpenses,
          itemLabel: "expense categories",
          icon: <DollarSign className="w-4 h-4 text-neutral-500" />,
        },
        {
          title: "Number of Cards",
          description: "Upgrade to the paid tier to add more cards.",
          count: cardsCount,
          maxCount: maxNumberOfCards,
          itemLabel: "cards",
          icon: <CreditCard className="w-4 h-4 text-neutral-500" />,
        },
        {
          title: "Number of Accounts",
          description: "Upgrade to the paid tier to add more accounts.",
          count: accountsCount,
          maxCount: maxNumberOfAccounts,
          itemLabel: "accounts",
          icon: <Landmark className="w-4 h-4 text-neutral-500" />,
        },
        {
            title: "Number of Transactions",
            description: "Upgrade to the paid tier to add more transactions.",
            count: transactionsCount,
            maxCount: maxNumberOfTransactions,
            itemLabel: "transactions",
            icon: <Tally5 className="w-4 h-4 text-neutral-500" />,
        },
    ]

    return (
        <div className="mysection subscription">
            <div className="mycontainer">
                <div className='subscription-page flex flex-col gap-8 h-full'>
                
                    <div className='flex flex-col'>
                        <Link href="/dashboard" className='pt-6 flex items-center gap-1 group'>
                            <ArrowLeft className='w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1'/>
                            Back to Dashboard
                        </Link>
                        <SectionHeader title='Your Subscription' description='Manage your subscription and plan' />
                    </div>

                    <div className="subscription-insight-cards grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-2 gap-4">
                        {subscriptionInsightItems.map((item, index) => (
                            <InsightCard
                                key={index}
                                title={item.title}
                                description={item.description}
                                content={
                                    <div className="flex flex-col gap-2">
                                        {item.maxCount !== "Unlimited"
                                            ? item.maxCount === 0
                                                ? <p>Can’t add {item.itemLabel.toLowerCase()} on this plan.</p>
                                                : <>
                                                    <p>{item.count} / {item.maxCount} {item.itemLabel} created</p>
                                                    <Progress
                                                        value={(item.count / item.maxCount) * 100}
                                                        className="bg-color-muted-text"
                                                        additionalClasses="bg-color-text"
                                                    />
                                                </>
                                            : <p>You can create unlimited {item.itemLabel.toLowerCase()}.</p>
                                        }
                                    </div>
                                }
                                icon={item.icon}
                            />
                        ))}
                    </div>

                    <div className="mt-4">
                        <p className='fs-h3 mb-4'>Your Subscription Plan</p>
                        <SubcriptionPlans currentPlanName={name} />
                    </div>
                    
                </div>
            </div>
        </div>
    )
}
