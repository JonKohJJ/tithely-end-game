import React, { Suspense } from 'react'
import { MonthYearFilter } from '../../../components/MonthYearFilter'
import { auth } from '@clerk/nextjs/server'
import DashboardList from './_components/DashboardList'
import InsightCardSkeleton from '@/components/InsightCardSkeleton'
import DashboardListSkeleton from './_components/DashboardListSkeleton'

export default async function DashboardPage({
  searchParams
} : {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  
    const { userId, redirectToSignIn } = await auth()
    if (userId == null) return redirectToSignIn()

  return (
    <div className='dashboard-page flex flex-col gap-8 h-full'>
  
      <div className='flex flex-col gap-6 md:flex-row md:justify-between md:items-center'>
          <div className='flex flex-col gap-1'>
            <p className='fs-h3 font-medium'>Dashboard</p>
            <p className='fs-base font-light'>All your categories & transactions in one place</p>
          </div>
          <MonthYearFilter />
      </div>

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
