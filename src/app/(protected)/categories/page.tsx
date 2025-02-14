import React, { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import CategoryList from './_components/CategoryList'
import CategoryForm from './_components/CategoryForm'
import InsightCardSkeleton from '@/components/InsightCardSkeleton'
import CategoryListSkeleton from './_components/CategoryListSkeleton'
import Link from 'next/link'
import MyButton from '@/components/MyButton'
import { canCreateCategory } from '@/server/permissions'
import PageHeader from '../_components/PageHeader'

export default async function CategoriesPage() {

  const { userId, redirectToSignIn } = await auth()
  if (userId == null) return redirectToSignIn()
  const { canCreate, maxNumberOfCategories, categoriesCount } = await canCreateCategory(userId)

  return (
    <div className='categories-page flex flex-col gap-8 h-full'>

        <PageHeader title='Categories' description='Budget your income, savings and expenses categories here'>
          <div className='hidden md:block'>
            {canCreate
              ? <CategoryForm /> 
              : <MyButton>
                  <Link href="/subscription">
                    <p className="">Upgrade to Add Categories</p>
                  </Link>
                </MyButton> 
            }
          </div>
        </PageHeader>


        
        <Suspense fallback={
          <>
            <InsightCardSkeleton />
            <CategoryListSkeleton />
          </>
        }>
          <CategoryList userId={userId} categoriesCount={categoriesCount} maxNumberOfCategories={maxNumberOfCategories} />
        </Suspense>

    </div>
  )
}
