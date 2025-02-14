import React, { Suspense } from 'react'
import { MonthYearFilter } from '../../../components/MonthYearFilter'
import { auth } from '@clerk/nextjs/server'
import DashboardList from './_components/DashboardList'
import InsightCardSkeleton from '@/components/InsightCardSkeleton'
import DashboardListSkeleton from './_components/DashboardListSkeleton'
import PageHeader from '../_components/PageHeader'

export default async function DashboardPage({
  searchParams
} : {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  
    const { userId, redirectToSignIn } = await auth()
    if (userId == null) return redirectToSignIn()

  return (
    <div className='dashboard-page flex flex-col gap-8 h-full'>
  
      <PageHeader title='Dashboard' description='All your categories & transactions in one place'>
        <MonthYearFilter />
      </PageHeader>

      <Suspense 
        fallback={
          <>
            <InsightCardSkeleton />
            <DashboardListSkeleton />
          </>
        }
        key={JSON.stringify(await searchParams)}
      >
        <DashboardList userId={userId} searchParams={await searchParams} />
      </Suspense>

    </div>
  )
}
