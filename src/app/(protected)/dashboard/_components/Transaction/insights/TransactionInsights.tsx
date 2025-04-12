import { InsightCard } from '@/components/InsightCard'
import { Progress } from '@/components/ui/progress'
import { CalendarDays, SwitchCamera, Tally5 } from 'lucide-react'
import React from 'react'

export default async function TransactionInsights({
    lastTransactionSummary,
    totalClaims,
    maxNumberOfTransactions,
    transactionsCount,
} : {
    lastTransactionSummary: string
    totalClaims: string
    maxNumberOfTransactions: number | "Unlimited"
    transactionsCount: number
}) {

    return (
        <div className="insight-cards-container flex gap-4 flex-col lg:flex-row">
            <InsightCard 
                title="Last Transaction Summary" 
                description="Stay on top of your finances." 
                content={lastTransactionSummary}
                icon={<CalendarDays className="w-4 h-4 text-neutral-500" />}
            />
            <InsightCard 
                title="Total Claimables" 
                description="Ensure that is exact amount is claimed." 
                content={totalClaims}
                icon={<SwitchCamera className="w-4 h-4 text-neutral-500" />}
            />
            <InsightCard 
                title="Number of Transactions" 
                description="Upgrade to the paid tier to add more transactions." 
                content={
                    <div className="flex flex-col gap-2">
                        {maxNumberOfTransactions !== "Unlimited" 
                            ? <>
                                <p>{transactionsCount} / {maxNumberOfTransactions} transactions created</p>
                                <Progress
                                    value={(transactionsCount / maxNumberOfTransactions) * 100}
                                    className="bg-color-muted-text"
                                    additionalClasses="bg-color-text"
                                />
                            </>
                            : <p>You can create unlimited transactions.</p>
                        }
                    </div>
                }
                icon={<Tally5 className="w-4 h-4 text-neutral-500" />}
            />
        </div>
    )
}
