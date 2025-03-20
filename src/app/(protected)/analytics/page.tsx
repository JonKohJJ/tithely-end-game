import { HasPermission } from '@/components/HasPermission'
import { canAccessAnalyticsPage } from '@/server/permissions'
import PageHeader from '../_components/PageHeader'
import { auth } from '@clerk/nextjs/server'
import { Suspense } from 'react'
import FetchExpensesBudgetPieChart from './_components/Expenses/budget/FetchExpensesBudgetPieChart'
import FetchExpensesActual from './_components/Expenses/actual/FetchExpensesActual'
import ExpensesBudgetSkeleton from './_components/Expenses/budget/ExpensesBudgetSkeleton'
import ExpensesActualSkeleton from './_components/Expenses/actual/ExpensesActualSkeleton'
import InsightCardSkeleton from '@/components/InsightCardSkeleton'
import ExpensesTrendBarChartSkeleton from './_components/Expenses/trend/ExpensesTrendBarChartSkeleton'
import FetchExpensesTrendBarChart from './_components/Expenses/trend/FetchExpensesTrendBarChart'


export default async function AnalyticsPage({
    searchParams
} : {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

    const { userId, redirectToSignIn } = await auth()
    if (userId == null) return redirectToSignIn()

    return (
        <div className='analytics-page flex flex-col gap-8 h-full'>

            <PageHeader title='Analytics' description='Get insights to your financials' />

            <HasPermission
                permission={canAccessAnalyticsPage}
                renderFallback
            >
                
                <div className="flex flex-col gap-4">
                    
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="lg:w-[40%] h-fit lg:sticky lg:top-4">
                            <Suspense
                                fallback={<ExpensesBudgetSkeleton />}
                            >
                                <FetchExpensesBudgetPieChart
                                    userId={userId}
                                />
                            </Suspense>
                        </div>

                        <div className="lg:w-[60%]">
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
                        </div>
                    </div>

                    <Suspense fallback={<ExpensesTrendBarChartSkeleton />}>
                        <FetchExpensesTrendBarChart 
                            userId={userId}
                        />
                    </Suspense>
                    
                </div>
            </HasPermission>
            
        </div>
    )
}
