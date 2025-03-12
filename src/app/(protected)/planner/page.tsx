import React, { Suspense } from 'react'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import MyButton from '@/components/MyButton'
import { canAccessCardsPage, canAccesssAccountsPage, canCreateCategory } from '@/server/permissions'
import SectionHeaders from './_components/SectionHeaders'
import CardList from './_components/Cards/CardList'
import { HasPermission } from '@/components/HasPermission'
import CategoryForm from './_components/Categories/CategoryForm'
import CategoryList from './_components/Categories/CategoryList'
import CategoryLoadingSkeleton from './_components/Categories/CategoryLoadingSkeleton'
import CardLoadingSkeleton from './_components/Cards/CardLoadingSkeleton'
import AccountList from './_components/Accounts/AccountList'

export default async function PlannerPage() {

  const { userId, redirectToSignIn } = await auth()
  if (userId == null) return redirectToSignIn()
  const { canCreate, maxNumberOfCategories, categoriesCount } = await canCreateCategory(userId)

  return (
    <div className="planner-page h-full flex flex-col gap-6 lg:flex-row">

        <div className="categories-container lg:w-[60%]">
            <div className='flex justify-between items-center mb-4'>
                <SectionHeaders title='Categories' description='Budget your income, savings and expenses categories here'/>
                <div className='hidden lg:block'>
                    {canCreate
                    ? <CategoryForm /> 
                    : <MyButton>
                        <Link href="/subscription">
                            <p className="">Upgrade to Add Categories</p>
                        </Link>
                    </MyButton> 
                    }
                </div>
            </div>
            <Suspense fallback={<CategoryLoadingSkeleton />}>
                <CategoryList
                    userId={userId}
                    categoriesCount={categoriesCount} 
                    maxNumberOfCategories={maxNumberOfCategories} 
                />
            </Suspense>
        </div>

        <div className="cards-and-accounts-container lg:w-[40%] lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] flex flex-col gap-6">
            
            <div className="cards-container h-full flex flex-col">
                <div className='flex justify-between items-center mb-4'>
                    <SectionHeaders title="Cards" description="Manage all your cards" />
                </div>
                <HasPermission
                    permission={canAccessCardsPage}
                    renderFallback
                    fallbackActionText='manage your cards'
                >
                    <Suspense fallback={<CardLoadingSkeleton />}>
                        <CardList userId={userId} />
                    </Suspense>
                </HasPermission>
            </div>

            <div className="accounts-container h-full flex flex-col">
                <div className='flex justify-between items-center mb-4'>
                    <SectionHeaders title="Accounts" description="Manage all your accounts" />
                </div>
                <HasPermission
                    permission={canAccesssAccountsPage}
                    renderFallback
                    fallbackActionText='manage your accounts'
                >
                    <Suspense fallback={<p>Loading...</p>}>
                        <AccountList userId={userId} />
                    </Suspense>
                </HasPermission>
            </div>

        </div>

    </div>
  )
}
