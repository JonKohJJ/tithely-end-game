import { auth } from '@clerk/nextjs/server'
import React, { Suspense } from 'react'
import TransactionList from './_components/TransactionList'
import { MonthYearFilter } from '../../../components/MonthYearFilter'
import TransactionInsightCards from './_components/TransactionInsightCards'
import TransactionSkeleton from './_components/TransactionSkeleton'
import InsightCardSkeleton from '@/components/InsightCardSkeleton'

export default async function TransactionsPage({
  searchParams
} : {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

  const { userId, redirectToSignIn } = await auth()
  if (userId == null) return redirectToSignIn()

  return (
    <div className='transaction-page flex flex-col gap-8'>

      <div className='flex flex-col gap-6 md:flex-row md:justify-between md:items-center'>
          <div className='flex flex-col gap-1'>
            <p className='fs-h3 font-medium'>Transactions</p>
            <p className='fs-base font-light'>List all your transactions here</p>
          </div>
          <MonthYearFilter />
      </div>

      <Suspense fallback={<InsightCardSkeleton />}>
        <TransactionInsightCards userId={userId} searchParams={await searchParams} />
      </Suspense>

      <Suspense 
        fallback={<TransactionSkeleton />}
        key={JSON.stringify(await searchParams)}
      >
        <TransactionList userId={userId} searchParams={await searchParams} />
      </Suspense>

    </div>
  )
}
