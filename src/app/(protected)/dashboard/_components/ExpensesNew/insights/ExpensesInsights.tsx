import { InsightCard } from '@/components/InsightCard'
import { CreditCard, HandCoins, PiggyBank } from 'lucide-react'
import React from 'react'

export default function ExpensesInsights({
    availableFunds,
    totalCreditCardSpending,
    billPaymentReadiness,
}: {
    availableFunds: number
    totalCreditCardSpending: number
    billPaymentReadiness: string
}) {

    return (
        <div className="insight-cards-container h-full flex gap-4 flex-col lg:flex-row">
            <InsightCard 
                title="Total Available Funds" 
                description="Ensure you have enough balance to cover your credit card payments." 
                content={`$${availableFunds}`}
                icon={<PiggyBank className="w-4 h-4 text-neutral-500" />}
            />
            <InsightCard 
                title="Total Card Spending"
                description="Keep an eye on your charges to stay within budget." 
                content={`$${totalCreditCardSpending}`}
                icon={<CreditCard className="w-4 h-4 text-neutral-500" />}
            />
            <InsightCard 
                title="Bill Payment Readiness" 
                description="Can you cover your upcoming credit card bill? Check your status." 
                content={`${billPaymentReadiness}`}
                icon={<HandCoins className="w-4 h-4 text-neutral-500" />}
            />
        </div>
    )
}
