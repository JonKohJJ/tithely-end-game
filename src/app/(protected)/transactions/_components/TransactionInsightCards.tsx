import { InsightCard } from "@/components/InsightCard";
import { calculateTotalClaims, getLastTransactionDate } from "@/server/db/transactions";
import { CalendarDays, SwitchCamera, Tally5 } from "lucide-react";

export default async function TransactionInsightCards({
    userId,
    searchParams
} : {
    userId: string
    searchParams: { [key: string]: string | string[] | undefined }
}) {

    const month = Number(searchParams.month) || new Date().getMonth() + 1
    const year = Number(searchParams.year) || new Date().getFullYear()

    let errorMessage: null | string = null
    let lastTransactionDate: string = ""
    let daysSinceLastTransaction: string = ""
    let totalClaims: string = ""

    try {

        const result = await getLastTransactionDate(userId)
        lastTransactionDate = result.lastTransactionDate
        daysSinceLastTransaction = result.daysSinceLastTransaction

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
                            title="Date Of Last Transaction" 
                            description="Just FYI." 
                            content={lastTransactionDate}
                            icon={<CalendarDays className="w-4 h-4 text-neutral-500" />}
                        />
                        <InsightCard 
                            title="Days Since Last Transaction" 
                            description="Don't lose track of tracking your finances." 
                            content={daysSinceLastTransaction}
                            icon={<Tally5 className="w-4 h-4 text-neutral-500" />}
                        />
                        <InsightCard 
                            title="Total Claimables" 
                            description="Ensure that is exact amount is claimed." 
                            content={totalClaims}
                            icon={<SwitchCamera className="w-4 h-4 text-neutral-500" />}
                        />
                    </div>
                )
            }
        </>
    )
}
