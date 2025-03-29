import { HasPermission } from '@/components/HasPermission'
import { auth } from '@clerk/nextjs/server'
import { Suspense } from 'react'
import FetchExpensesBudgetPieChart from './_components/Expenses/budget/FetchExpensesBudgetPieChart'
import FetchExpensesActual from './_components/Expenses/actual/FetchExpensesActual'
import ExpensesBudgetSkeleton from './_components/Expenses/budget/ExpensesBudgetSkeleton'
import ExpensesActualSkeleton from './_components/Expenses/actual/ExpensesActualSkeleton'
import InsightCardSkeleton from '@/components/InsightCardSkeleton'
import ExpensesTrendBarChartSkeleton from './_components/Expenses/trend/ExpensesTrendBarChartSkeleton'
import FetchExpensesTrendBarChart from './_components/Expenses/trend/FetchExpensesTrendBarChart'
import FetchSavingsGrowthLineChart from './_components/Savings/growth/FetchSavingsGrowthLineChart'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './_components/CustomTabs'
import FetchSavingsGoalsData from './_components/Savings/goals/FetchSavingsGoalsData'
import { canViewExpenses_Actual, canViewExpenses_Budget, canViewExpenses_Trend, canViewSavings_Goals, canViewSavings_Growth } from '@/server/permissions'
import SectionHeaders from '../planner/_components/SectionHeaders'
import SavingsGrowthLineChartSkeleton from './_components/Savings/growth/SavingsGrowthLineChartSkeleton'
import SavingsGoalsSkeleton from './_components/Savings/goals/SavingsGoalsSkeleton'


export default async function AnalyticsPage({
    searchParams
} : {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

    const { userId, redirectToSignIn } = await auth()
    if (userId == null) return redirectToSignIn()

    return (
        <div className='analytics-page flex flex-col gap-8 h-full'>

            <div className='tabs-container'>
                <Tabs defaultValue="expenses">

                    <TabsList className='w-full h-[unset] rounded-none mb-8 border-b-[1px] border-color-muted-text p-0 flex justify-start'>
                        <TabsTrigger value="income" className='fs-base'>Income</TabsTrigger>
                        <TabsTrigger value="savings" className='fs-base'>Savings</TabsTrigger>
                        <TabsTrigger value="expenses" className='fs-base'>Expenses</TabsTrigger>
                        <TabsTrigger value="cards_and_accounts" className='fs-base'>Cards & Accounts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="income">
                        <p>In Developement</p>
                    </TabsContent>

                    <TabsContent value="savings">
                        <div className="dashboard-savings flex flex-col gap-8">

                                <div className="savings-overview">
                                    <div className='flex justify-between items-center mb-4'>
                                        <SectionHeaders title="Savings Overview" description="Your savings journey at a glance" />
                                    </div>
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
                                        <SectionHeaders title="Savings Goals" description="Monitor your saving goals" />
                                    </div>
                                    <HasPermission 
                                        permission={canViewSavings_Goals} 
                                        renderFallback
                                    >
                                        <Suspense fallback={<SavingsGoalsSkeleton />}>
                                            <FetchSavingsGoalsData 
                                                userId={userId}
                                            />
                                        </Suspense>
                                    </HasPermission>
                                </div>

                        </div>
                    </TabsContent>

                    <TabsContent value="expenses">
                        <div className="dashboard-expenses flex flex-col gap-4">
                
                            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                                <div className="lg:w-[60%]">
                                    <div className='flex justify-between items-center mb-4'>
                                        <SectionHeaders title="Expenses Summary" description="Track your balance, spending, and bills." />
                                    </div>
                                    <HasPermission 
                                        permission={canViewExpenses_Actual}
                                        renderFallback
                                        fallbackActionText='manage your cards'
                                    >
                                        <Suspense
                                            fallback={
                                                <div className='flex flex-col gap-4'>
                                                    <InsightCardSkeleton />
                                                    <ExpensesActualSkeleton />
                                                </div>
                                            }
                                            key={JSON.stringify(await searchParams)}
                                        >
                                            <FetchExpensesActual
                                                userId={userId}
                                                searchParams={await searchParams}
                                            />
                                        </Suspense>
                                    </HasPermission>
                                </div>

                                <div className="lg:w-[40%] h-fit lg:sticky lg:top-4">
                                    <div className='flex justify-between items-center mb-4'>
                                        <SectionHeaders title="Expenses (Budgeted)" description="Monthly expense budget breakdown by category" />
                                    </div>
                                    <HasPermission
                                        permission={canViewExpenses_Budget}
                                        renderFallback
                                    >
                                        <Suspense fallback={<ExpensesBudgetSkeleton />}>
                                            <FetchExpensesBudgetPieChart
                                                userId={userId}
                                            />
                                        </Suspense>
                                    </HasPermission>
                                </div>
                            </div>

                            <div>
                                <div className='flex justify-between items-center mb-4'>
                                    <SectionHeaders title="Expenses (Trend)" description="Track your spending over time" />
                                </div>
                            
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

                    <TabsContent value="cards_and_accounts">
                        <p>In Developement</p>
                    </TabsContent>

                </Tabs>
            </div>
            
        </div>
    )
}
