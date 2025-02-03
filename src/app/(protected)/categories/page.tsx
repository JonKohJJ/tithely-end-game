import React, { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import CategoryList from './_components/CategoryList'
import CategoryForm from './_components/CategoryForm'
import InsightCardSkeleton from '@/components/InsightCardSkeleton'
import CategoryListSkeleton from './_components/CategoryListSkeleton'

export default async function CategoriesPage() {

  const { userId, redirectToSignIn } = await auth()
  if (userId == null) return redirectToSignIn()

  return (
    <div className='categories-page flex flex-col gap-8 h-full'>

        <div className='flex flex-col gap-6 md:flex-row md:justify-between md:items-center'>
            <div className='flex flex-col gap-1'>
              <p className='fs-h3 font-medium'>Categories</p>
              <p className='fs-base font-light'>Budget your income, savings and expenses categories here</p>
            </div>
            <div className='hidden md:block'>
              <CategoryForm />
            </div>
        </div>
        
        <Suspense fallback={
          <>
            <InsightCardSkeleton />
            <CategoryListSkeleton />
          </>
        }>
          <CategoryList userId={userId} />
        </Suspense>

    </div>
  )
}
