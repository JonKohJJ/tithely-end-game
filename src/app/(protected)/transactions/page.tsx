import { auth } from '@clerk/nextjs/server'
import React, { Suspense } from 'react'
import TransactionList from './_components/TransactionList'
import { MonthYearFilter } from '../../../components/MonthYearFilter'
import TransactionInsightCards from './_components/TransactionInsightCards'
import TransactionSkeleton from './_components/TransactionSkeleton'
import InsightCardSkeleton from '@/components/InsightCardSkeleton'
import { canCreateTransaction } from '@/server/permissions'
import PageHeader from '../_components/PageHeader'

export default async function TransactionsPage({
  searchParams
} : {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {

  const { userId, redirectToSignIn } = await auth()
  if (userId == null) return redirectToSignIn()
  const { canCreate, maxNumberOfTransactions, transactionsCount } = await canCreateTransaction(userId)

  return (
    <div className='transaction-page flex flex-col gap-8'>
      
      <PageHeader title='Transactions' description='List all your transactions here'>
        <MonthYearFilter />
      </PageHeader>

      <Suspense fallback={<InsightCardSkeleton />}>
        <TransactionInsightCards userId={userId} searchParams={await searchParams} transactionsCount={transactionsCount} maxNumberOfTransactions={maxNumberOfTransactions}/>
      </Suspense>

      <Suspense 
        fallback={<TransactionSkeleton />}
        key={JSON.stringify(await searchParams)}
      >
        <TransactionList userId={userId} searchParams={await searchParams} canCreate={canCreate} />
      </Suspense>

    </div>
  )
}
