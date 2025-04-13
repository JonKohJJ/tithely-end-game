import { HasPermission } from '@/components/HasPermission'
import { auth } from '@clerk/nextjs/server'
import { Suspense } from 'react'
import ExpensesBudgetSkeleton from './_components/Expenses/budget/ExpensesBudgetSkeleton'
import ExpensesActualSkeleton from './_components/Expenses/actual/ExpensesActualSkeleton'
import ExpensesTrendBarChartSkeleton from './_components/Expenses/trend/ExpensesTrendBarChartSkeleton'
import FetchExpensesTrendBarChart from './_components/Expenses/trend/FetchExpensesTrendBarChart'
import FetchSavingsGrowthLineChart from './_components/Savings/growth/FetchSavingsGrowthLineChart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './_components/CustomTabs'
import { canCreateAccounts, canCreateCards, canCreateExpenses, canCreateIncomes, canCreateSavings, canCreateTransactions, canViewAccounts, canViewCards, canViewExpenses_Trend, canViewSavings_Growth } from '@/server/permissions'
import SectionHeaders from '../_components/SectionHeader'
import SavingsGrowthLineChartSkeleton from './_components/Savings/growth/SavingsGrowthLineChartSkeleton'
import SavingsGoalsSkeleton from './_components/Savings/goals/SavingsGoalsSkeleton'
import SavingForm from './_components/Savings/goals/SavingForm'
import ExpenseForm from './_components/Expenses/budget/ExpenseForm'
import FetchBudgetedExpenses from './_components/Expenses/budget/FetchBudgetedExpenses'
import FetchActualExpenses from './_components/Expenses/actual/FetchActualExpenses'
import FetchSavingsGoals from './_components/Savings/goals/FetchSavingsGoals'
import IncomeForm from './_components/Income/IncomeForm'
import FetchIncomeStreams from './_components/Income/FetchIncomeStreams'
import FetchAllCards from './_components/Cards/FetchAllCards'
import CardForm from './_components/Cards/CardForm'
import FetchAllAccounts from './_components/Accounts/FetchAllAccounts'
import AccountForm from './_components/Accounts/AccountForm'
import FetchAllTransactions from './_components/Transaction/FetchAllTransactions'
import FetchExpensesInsights from './_components/Expenses/insights/FetchExpensesInsights'
import FetchTransactionsInsights from './_components/Transaction/insights/FetchTransactionInsights'
import Link from 'next/link'

export default async function DashboardPage({
    searchParams
} : {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

    const { userId, redirectToSignIn } = await auth()
    if (userId == null) return redirectToSignIn()

    const { canCreateIncome, maxNumberOfIncome } = await canCreateIncomes(userId)
    const { canCreateSaving, maxNumberOfSavings } = await canCreateSavings(userId)
    const { canCreateExpense, maxNumberOfExpenses } = await canCreateExpenses(userId)
    const { canCreateCard, maxNumberOfCards } = await canCreateCards(userId)
    const { canCreateAccount, maxNumberOfAccounts } = await canCreateAccounts(userId)
    const { canCreateTransaction, maxNumberOfTransactions, transactionsCount } = await canCreateTransactions(userId)

    return (
        <div className='dashboard-page flex flex-col gap-8 h-full'>
            <div className="mycontainer !max-w-[1500px]">
                <div className='tabs-container'>
                    <Tabs defaultValue="expenses">

                        <TabsList className='rounded-none border-b border-color-muted-text'>
                            <TabsTrigger value="income" className='fs-base'>Income</TabsTrigger>
                            <TabsTrigger value="savings" className='fs-base'>Savings</TabsTrigger>
                            <TabsTrigger value="expenses" className='fs-base'>Expenses</TabsTrigger>
                            <TabsTrigger value="cards-and-accounts" className='fs-base'>Cards & Accounts</TabsTrigger>
                            <TabsTrigger value="transactions" className='fs-base'>Transactions</TabsTrigger>
                        </TabsList>


                        <TabsContent value="income">
                            <div className="dashboard-income flex flex-col gap-8">

                                <SectionHeaders
                                    title="Income Summary"
                                    description="Income streams breakdown and category"
                                />

                                <div className="income-streams">
                                    <div className='flex justify-between items-center mb-4'>
                                        <p className="fs-h3">Income Streams</p>
                                        {canCreateIncome
                                            ? <IncomeForm />
                                            : <p>Max {maxNumberOfIncome} income streams reached. <Link href="/subscription" className='underline'>Upgrade</Link> to add more.</p>
                                        }
                                    </div>
                                    <Suspense fallback={<p>Loading income...</p>}>
                                        <FetchIncomeStreams
                                            userId={userId}
                                        />
                                    </Suspense>
                                </div>

                            </div>
                        </TabsContent>


                        <TabsContent value="savings">
                            <div className="dashboard-savings flex flex-col gap-8">
                                <SectionHeaders
                                    title="Savings Overview"
                                    description="Your savings journey at a glance"
                                />

                                <div className="savings-growth">
                                    <p className="fs-h3 mb-4">Savings Growth</p>
                                    <HasPermission 
                                        permission={canViewSavings_Growth} 
                                        renderFallback
                                    >
                                        <Suspense fallback={<SavingsGrowthLineChartSkeleton />}>
                                            <FetchSavingsGrowthLineChart
                                                userId={userId}
                                            />
                                        </Suspense>
                                    </HasPermission>
                                </div>

                                <div className="savings-goals">

                                    <div className='flex justify-between items-center mb-4'>
                                        <p className="fs-h3">Savings Goals</p>
                                        {canCreateSaving
                                            ? <SavingForm />
                                            : <p>Max {maxNumberOfSavings} saving goals reached. <Link href="/subscription" className='underline'>Upgrade</Link> to add more.</p>
                                        }
                                    </div>

                                    <Suspense fallback={<SavingsGoalsSkeleton />}>
                                        <FetchSavingsGoals
                                            userId={userId}
                                            maxNumberOfSavings={maxNumberOfSavings}
                                        />
                                    </Suspense>

                                </div>

                            </div>
                        </TabsContent>


                        <TabsContent value="expenses">
                            <div className="dashboard-expenses flex flex-col gap-8">
                                <SectionHeaders
                                    title='Expense Summary'
                                    description='Your expenses summary at a glance'
                                    showFilter={true}
                                />

                                <div className="flex flex-col gap-8 lg:flex-row">

                                    <div className="expenses-budget lg:w-[40%] flex flex-col">
                                        <div className='flex items-center justify-between mb-4'>
                                            <p className="fs-h3">Budgeted Expenses</p>
                                            {canCreateExpense
                                                ? <ExpenseForm />
                                                : <p>Max {maxNumberOfExpenses} expenses reached. <Link href="/subscription" className='underline'>Upgrade</Link> to add more.</p>
                                            }
                                        </div>
                                        <Suspense fallback={<ExpensesBudgetSkeleton />}>
                                            <FetchBudgetedExpenses
                                                userId={userId}
                                            />
                                        </Suspense>
                                    </div>

                                    <div className="lg:w-[60%] flex flex-col gap-8">
                                        <div className='expenses-insights flex flex-col'>
                                            <p className="fs-h3 mb-5">Expenses Insights</p>
                                            <Suspense
                                                fallback={ <ExpensesActualSkeleton /> }
                                                key={JSON.stringify(await searchParams)}
                                            >
                                                <FetchExpensesInsights 
                                                    userId={userId}
                                                    searchParams={await searchParams}
                                                />
                                            </Suspense>
                                        </div>

                                        <div className='expenses-actual flex flex-col h-full'>
                                            <p className="fs-h3 mb-4">Actual Expenses</p>
                                            <Suspense
                                                fallback={ <ExpensesActualSkeleton /> }
                                                key={JSON.stringify(await searchParams)}
                                            >
                                                <FetchActualExpenses 
                                                    userId={userId}
                                                    searchParams={await searchParams}
                                                />
                                            </Suspense>
                                        </div>
                                    </div>

                                </div>

                                <div className='expenses-trend'>
                                    <p className="fs-h3 mb-4">Trending Expenses</p>
                                    <HasPermission 
                                        permission={canViewExpenses_Trend}
                                        renderFallback
                                    >
                                        <Suspense fallback={<ExpensesTrendBarChartSkeleton />}>
                                            <FetchExpensesTrendBarChart 
                                                userId={userId}
                                            />
                                        </Suspense>
                                    </HasPermission>
                                </div>
                            </div>
                        </TabsContent>


                        <TabsContent value="cards-and-accounts">
                            <div className="dashboard-cards-and-accounts flex flex-col gap-8">
                                <SectionHeaders 
                                    title="Your Cards & Accounts"
                                    description="Card spending & debit account balance breakdown by month" 
                                    showFilter={true}
                                />

                                <div className="flex flex-col gap-8 lg:flex-row">
                                    <div className="w-full">
                                        <div className='flex items-center justify-between mb-4'>
                                            <p className='fs-h3'>Your Cards</p>
                                            <HasPermission 
                                                permission={canViewCards}
                                            >
                                                {canCreateCard
                                                    ? <CardForm />
                                                    : <p>Max {maxNumberOfCards} cards reached. <Link href="/subscription" className='underline'>Upgrade</Link> to add more.</p>
                                                }
                                            </HasPermission>
                                        </div>
                                        <HasPermission 
                                            permission={canViewCards}
                                            renderFallback
                                        >
                                            <Suspense fallback={<p>Loading Cards...</p>}>
                                                <FetchAllCards
                                                    userId={userId}
                                                    searchParams={await searchParams}
                                                />
                                            </Suspense>
                                        </HasPermission>
                                    </div>

                                    <div className="w-full">
                                        <div className='flex items-center justify-between mb-4'>
                                            <div className="fs-h3">Your Accounts</div>
                                            <HasPermission 
                                                permission={canViewAccounts}
                                            >
                                                {canCreateAccount
                                                    ? <AccountForm />
                                                    : <p>Max {maxNumberOfAccounts} accounts reached. <Link href="/subscription" className='underline'>Upgrade</Link> to add more.</p>
                                                }
                                            </HasPermission>
                                        </div>
                                        <HasPermission 
                                            permission={canViewAccounts}
                                            renderFallback
                                        >
                                            <Suspense fallback={<p>Loading Accounts...</p>}>
                                                <FetchAllAccounts
                                                    userId={userId}
                                                    searchParams={await searchParams}
                                                />
                                            </Suspense>
                                        </HasPermission>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>


                        <TabsContent value="transactions">
                            <div className="dashboard-transactions flex flex-col gap-8">
                                <SectionHeaders
                                    title="Your Transactions" 
                                    description="List all your transactions here" 
                                    showFilter={true}
                                />

                                <FetchTransactionsInsights
                                    userId={userId}
                                    searchParams={await searchParams}
                                    maxNumberOfTransactions={maxNumberOfTransactions}
                                    transactionsCount={transactionsCount}
                                />

                                <FetchAllTransactions
                                    userId={userId}
                                    searchParams={await searchParams}

                                    // For Add Button
                                    canCreateTransaction={canCreateTransaction}
                                    maxNumberOfTransactions={maxNumberOfTransactions}

                                    // For Transaction Form
                                    maxNumberOfCards={maxNumberOfCards}
                                    maxNumberOfAccounts={maxNumberOfAccounts}
                                />
                            </div>
                        </TabsContent>

                    </Tabs>
                </div>
            </div>
        </div>
    )
}
