import ExpensesActual from "./ExpensesActual"
import { getAllExpenseActual, getAvailableFunds, getTotalByCreditOrDebit, getTotalByType, TFetchedAllExpensesActual } from "@/server/db/analytics"
import { InsightCard } from "@/components/InsightCard"
import { PiggyBank, CreditCard, HandCoins } from "lucide-react"

export default async function FetchExpensesActual({
    userId,
    searchParams
} : {
    userId: string
    searchParams: { [key: string]: string | string[] | undefined }
}) {

    const month = Number(searchParams.month) || new Date().getMonth() + 1
    const year = Number(searchParams.year) || new Date().getFullYear()

    let errorMessage: null | string = null
    let allExpensesActual: TFetchedAllExpensesActual[] = []
    let availableFunds: number = 0
    let totalCreditCardSpending: number = 0
    let totalIncome: number = 0

    // Fetch data here to make suspense work
    try {
        
        allExpensesActual = await getAllExpenseActual(userId, month, year)
        totalCreditCardSpending = await getTotalByCreditOrDebit(userId, month, year, "Credit")
        availableFunds = await getAvailableFunds(userId, month, year)
        totalIncome = await getTotalByType(userId, month, year, "Income")

    } catch (error) {
        if (error instanceof Error) {
            errorMessage = error.message
        }
    }

    const billPaymentReadiness = calculateBillPaymentReadiness(availableFunds, totalCreditCardSpending, totalIncome)

    return (
        <>
            {errorMessage
                ? (
                    <p>Oh no! Something went wrong. ISSUE: {errorMessage}</p>
                )
                : (
                    <div className={`FetchExpensesActual flex flex-col gap-4`}>

                        <div className="insight-cards-container flex gap-4 flex-col lg:flex-row">
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
                                content={billPaymentReadiness}
                                icon={<HandCoins className="w-4 h-4 text-neutral-500" />}
                            />
                        </div>

                        <ExpensesActual
                            allExpensesActual={allExpensesActual}
                        />
                    </div>
                )
            }
        </>
    )
}

function calculateBillPaymentReadiness(   
    availableFunds: number, 
    totalCreditCardSpending: number,
    totalIncome: number
): string {

    const difference = availableFunds - totalCreditCardSpending
    let result = ""

    if (difference > 0) {
        result = `You are all set! $${roundTo(difference, 2)} left after covering your credit card bills.`
    }
    if (difference < 0) {
        result = `Oops! You are $${roundTo((Math.abs(difference)), 2)} short — time to top up your account.`
    }
    if (difference === 0) {
        result = "Perfect! You have just enough to cover your credit card bills."
    }
    if (totalIncome === 0) {
        result = "You have no income yet, try adding some."
    }

    return result
}
function roundTo(value: number, precision: number) {
    const factor = Math.pow(10, precision)
    return Math.round(value * factor) / factor
}