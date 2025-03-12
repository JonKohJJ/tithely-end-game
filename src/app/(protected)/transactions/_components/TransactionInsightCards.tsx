import { InsightCard } from "@/components/InsightCard";
import { Progress } from "@/components/ui/progress";
import { calculateTotalClaims, getLastTransactionSummary } from "@/server/db/transactions";
import { CalendarDays, SwitchCamera, Tally5 } from "lucide-react";

export default async function TransactionInsightCards({
    userId,
    searchParams,
    transactionsCount,
    maxNumberOfTransactions
} : {
    userId: string
    searchParams: { [key: string]: string | string[] | undefined }
    transactionsCount: number
    maxNumberOfTransactions: number
}) {

    const month = Number(searchParams.month) || new Date().getMonth() + 1
    const year = Number(searchParams.year) || new Date().getFullYear()

    let errorMessage: null | string = null
    let lastTransactionSummary: string = ""
    let totalClaims: string = ""
    
    try {
        
        lastTransactionSummary = await getLastTransactionSummary(userId)
        totalClaims = await calculateTotalClaims(userId, month, year)
    
    } catch (error) {
        if (error instanceof Error) {
            errorMessage = error.message
        }
    }

    return (
        <>
            {errorMessage
                ? (
                    <p>Oh no! Something went wrong. ISSUE: {errorMessage}</p>
                )
                : (
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
                                    <p>{transactionsCount} / {maxNumberOfTransactions} transactions created</p>
                                    <Progress value={(transactionsCount/maxNumberOfTransactions)*100} className="bg-color-muted-text" additionalClasses="bg-color-text" />
                                </div>
                            }
                            icon={<Tally5 className="w-4 h-4 text-neutral-500" />}
                        />
                    </div>
                )
            }
        </>
    )
}
