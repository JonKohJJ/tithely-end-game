import { getAllTransactions, TFetchedAllTransactions } from "@/server/db/transactions"
import { getAllCategories, TFetchedAllCategories } from "@/server/db/categories";
import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress";
import { InsightCard } from "@/components/InsightCard";
import { PiggyBank, CreditCard, HandCoins } from "lucide-react";
  

export default async function DashboardList({
    userId,
    searchParams
} : {
    userId: string
    searchParams: { [key: string]: string | string[] | undefined }
}) {

    const month = Number(searchParams.month) || new Date().getMonth() + 1
    const year = Number(searchParams.year) || new Date().getFullYear()

    let errorMessage: null | string = null
    let allTransactions: TFetchedAllTransactions = []
    let allCategories: TFetchedAllCategories = []
    let dashboardData: TDashboardData = []

    // Insight Card Data
    let DebitAccountBalanceString = ""
    let CreditCardChargesString = ""
    let DifferenceString = ""

    try {

        allTransactions = await getAllTransactions(userId, month, year)
        const result = await getAllCategories(userId)
        allCategories = result.allCategories
        dashboardData = calculateDashboardData(allTransactions, allCategories)

        // Insight Cards Data
        const InsightCardsData = calculateInsightCardsValues(allTransactions)
        DebitAccountBalanceString = InsightCardsData.DebitAccountBalanceString
        CreditCardChargesString = InsightCardsData.CreditCardChargesString
        DifferenceString = InsightCardsData.DifferenceString


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
                    <div className="dashboard-list flex flex-col gap-8">

                        <div className="insight-cards-container flex gap-4 flex-col lg:flex-row">
                            <InsightCard 
                                title="Available Funds" 
                                description="Ensure you have enough balance to cover your credit card payments." 
                                content={DebitAccountBalanceString}
                                icon={<PiggyBank className="w-4 h-4 text-neutral-500" />}
                            />
                            <InsightCard 
                                title="Credit Card Spending" 
                                description="Keep an eye on your charges to stay within budget." 
                                content={CreditCardChargesString}
                                icon={<CreditCard className="w-4 h-4 text-neutral-500" />}
                            />
                            <InsightCard 
                                title="Bill Payment Readiness" 
                                description="Can you cover your upcoming credit card bill? Check your status." 
                                content={DifferenceString}
                                icon={<HandCoins className="w-4 h-4 text-neutral-500" />}
                            />
                        </div>

                        <div className="transaction-tables-container flex flex-col gap-8">
                            {dashboardData.map(type => {
                                return (
                                    <Card key={type.type} className="!shadow-none border-color-border">
                                        <p className="p-6 fs-base font-medium">{type.type}</p>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="flex gap-2 items-center justify-between px-4 border-color-border">
                                                    <TableHead className={`w-5/12 md:w-3/12 font-light fs-caption`}>Category</TableHead>
                                                    <TableHead className={`w-1/12 hidden md:block font-light fs-caption`}>Tracked</TableHead>
                                                    <TableHead className={`w-1/12 hidden md:block font-light fs-caption`}>Budgeted</TableHead>
                                                    <TableHead className={`w-7/12 md:w-6/12 px-6 text-center font-light fs-caption`}>% Completed</TableHead>
                                                    <TableHead className={`w-1/12 text-right hidden md:block font-light fs-caption`}>Remaining</TableHead>
                                                    <TableHead className={`w-1/12 text-right hidden md:block font-light fs-caption`}>Excess</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>

                                            {type.categoriesData.length === 0 &&
                                                <TableRow className="flex gap-2 items-center justify-center px-6 py-4 border-color-border">
                                                    <TableCell>No categories or transactions found</TableCell>
                                                </TableRow>
                                            }

                                            {type.categoriesData.map((category, index) => (
                                                <TableRow key={index} className="flex gap-2 items-center justify-between px-4 py-2 border-color-border">
                                                    <TableCell className={`w-5/12 md:w-3/12`}><p className="line-clamp-1">{category.name}</p></TableCell>
                                                    <TableCell className={`w-1/12 hidden md:block`}>${category.tracked}</TableCell>
                                                    <TableCell className={`w-1/12 hidden md:block`}>${category.budgeted}</TableCell>
                                                    <TableCell className={`w-7/12 md:w-6/12 px-6 text-center relative flex items-center justify-center`}>
                                                        <Progress value={category.percentage} className="w-full h-[10px] bg-color-border" 
                                                            additionalClasses={type.type === "Expenses" 
                                                                ?
                                                                    category.percentage > 100
                                                                    ? "bg-red-500"
                                                                    : "bg-blue-500"
                                                                : "bg-blue-500"
                                                            } 
                                                        />
                                                        <p className="absolute left-1/2 text-color-text text-[8px]">{Math.round(category.percentage)}%</p>
                                                    </TableCell>
                                                    <TableCell className={`w-1/12 text-right hidden md:block`}>${category.remaining}</TableCell>
                                                    <TableCell className={`w-1/12 text-right hidden md:block`}>${category.excess}</TableCell>
                                                </TableRow>
                                            ))}
                                            </TableBody>
                                            <TableFooter className="border-color-border">
                                                <TableRow className="flex gap-2 items-center justify-between px-4 py-2">
                                                    <TableCell className={`w-5/12 md:w-3/12`}>Total</TableCell>
                                                    <TableCell className={`w-1/12 hidden md:block`}>${type.footerData.tracked}</TableCell>
                                                    <TableCell className={`w-1/12 hidden md:block`}>${type.footerData.budgeted}</TableCell>
                                                    <TableCell className={`w-7/12 md:w-6/12 px-6 text-center relative flex items-center justify-center`}>
                                                        <Progress value={type.footerData.percentage} className="w-full h-[10px] bg-color-border" 
                                                            additionalClasses={type.type === "Expenses" 
                                                                ?
                                                                    type.footerData.percentage > 100
                                                                    ? "bg-red-500"
                                                                    : "bg-blue-500"
                                                                : "bg-blue-500"
                                                            } 
                                                        />
                                                        <p className="absolute left-1/2 text-color-text text-[8px]">{Math.round(type.footerData.percentage)}%</p>
                                                    </TableCell>
                                                    <TableCell className={`w-1/12 text-right hidden md:block`}>${type.footerData.remaining}</TableCell>
                                                    <TableCell className={`w-1/12 text-right hidden md:block`}>${type.footerData.excess}</TableCell>
                                                </TableRow>
                                            </TableFooter>
                                        </Table>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                )
            }
        </>
    )
}

type TDashboardData = {
    type: "Income" | "Savings" | "Expenses"
    categoriesData: TDashboardRowData[]
    footerData: TDashboardRowData
}[]

type TDashboardRowData = {
    name: string
    budgeted: number
    tracked: number
    percentage: number
    remaining: number
    excess: number
}

function calculateDashboardData(
    allTransactions: TFetchedAllTransactions,
    allCategories: TFetchedAllCategories
): TDashboardData {

    const data = allCategories.map(eachType => {

        const DashboardCategoryData = eachType.categories.map(category => {
            
            const budgeted = category.categoryBudget
            const tracked = calculateTrackedAmount(category.categoryId, allTransactions)
            const { percentage, remaining, excess } = calculate_percentage_remaining_excess(tracked, budgeted)

            return {
                name: category.categoryName,
                budgeted,
                tracked,
                percentage, 
                remaining, 
                excess
            }

        })

        const footerData = calculateFooterData(DashboardCategoryData)   

        return {
            type: eachType.type,
            categoriesData: DashboardCategoryData,
            footerData
        }

    })

    return data
}

function calculateTrackedAmount(
    categoryId: string, 
    allTransactions: TFetchedAllTransactions
): number {

    let trackedAmount = 0

    if (allTransactions.length === 0) {
        return trackedAmount
    }

    allTransactions.map(transaction => {
        if (transaction.user_categories.categoryId === categoryId) {
            trackedAmount = trackedAmount + transaction.user_transactions.transactionAmount
        }
    })

    return roundTo(trackedAmount, 2)
}

type TPercentageRemainingExcessDashboardData = Pick<TDashboardRowData, "percentage" | 'remaining' | 'excess'>
function calculate_percentage_remaining_excess(
    tracked: number,
    budgeted: number
): TPercentageRemainingExcessDashboardData {

    let percentage = 0
    let remaining = 0
    let excess = 0

    if (tracked === 0) {
        return { percentage, remaining, excess }
    }

    percentage = roundTo((tracked/budgeted)*100, 2)
    remaining = roundTo((((budgeted-tracked)<0) ? 0 : (budgeted-tracked)), 2)
    excess = roundTo((((tracked-budgeted)>0) ? (tracked-budgeted) : 0), 2)

    return { percentage, remaining, excess }
}

function calculateFooterData(
    DashboardCategoryData: 
    TDashboardRowData[]
): TDashboardRowData {

    let totalTracked = 0
    let totalBudgeted = 0
    let totalPercentage = 0
    let totalRemaining = 0
    let totalExcess = 0

    if (DashboardCategoryData.length === 0) {
        return {
            name: "Total",
            budgeted: 0,
            tracked: 0,
            percentage: 0,
            remaining: 0,
            excess: 0
        }
    }

    DashboardCategoryData.map(category => {
        totalTracked = totalTracked + category.tracked
        totalBudgeted = totalBudgeted + category.budgeted
    })

    const { percentage, remaining, excess } = calculate_percentage_remaining_excess(totalTracked, totalBudgeted)

    totalPercentage = percentage
    totalRemaining = remaining
    totalExcess = excess

    return {
        name: "Total",
        budgeted: totalBudgeted,
        tracked: totalTracked,
        percentage: totalPercentage,
        remaining: totalRemaining,
        excess: totalExcess
    }

}

// For Dashboard Insight Card details
// 01 Debit Account Balance (Income - Savings - Debit Expenses)
// 02 Credit Card Charges
// 03 Amount Left
function calculateInsightCardsValues(allTransactions: TFetchedAllTransactions) {

    let DebitAccountBalanceString = ""
    let CreditCardChargesString = ""
    let DifferenceString = ""

    if (allTransactions.length === 0) {
        DebitAccountBalanceString = "No Transactions Found"
        CreditCardChargesString = "No Transactions Found"
        DifferenceString = "$0"
        return { DebitAccountBalanceString, CreditCardChargesString, DifferenceString }
    }

    let totalIncome = 0
    let totalSavings = 0
    let totalDebitExpenses = 0
    let totalCreditCharges = 0

    allTransactions.map(transaction => {
        if (transaction.user_transactions.transactionType === "Income") {
            totalIncome = totalIncome + transaction.user_transactions.transactionAmount
        }

        if (transaction.user_transactions.transactionType === "Savings") {
            totalSavings = totalSavings + transaction.user_transactions.transactionAmount
        }

        if (transaction.user_transactions.transactionType === "Expenses" && transaction.user_transactions.transactionCreditOrDebit === "Debit") {
            totalDebitExpenses = totalDebitExpenses + transaction.user_transactions.transactionAmount
        }

        if (transaction.user_transactions.transactionType === "Expenses" && transaction.user_transactions.transactionCreditOrDebit === "Credit") {
            totalCreditCharges = totalCreditCharges + transaction.user_transactions.transactionAmount
        }
    })

    const debitAccountBalance = totalIncome - totalSavings - totalDebitExpenses
    DebitAccountBalanceString = debitAccountBalance > 0 ? `$${debitAccountBalance}` : "$0"
    CreditCardChargesString = `$${totalCreditCharges}`

    const difference = debitAccountBalance - totalCreditCharges
    if (difference > 0) {
        DifferenceString = `You are all set! $${roundTo(difference, 2)} left after covering your credit card bills.`
    }
    if (difference < 0) {
        DifferenceString = `Oops! You are $${roundTo((Math.abs(difference)), 2)} short—time to top up your account.`
    }
    if (difference === 0) {
        DifferenceString = "Perfect! You have just enough to cover your credit card bills."
    }
    if (totalIncome === 0) {
        DifferenceString = "You have no income yet, try adding some."
    }



    return { DebitAccountBalanceString, CreditCardChargesString, DifferenceString }
}

function roundTo(value: number, precision: number) {
    const factor = Math.pow(10, precision)
    return Math.round(value * factor) / factor
}
