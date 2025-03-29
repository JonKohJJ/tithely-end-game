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
import AccountList from './_components/Accounts/AccountList'
import CarouselLoadingSkeleton from './_components/CarouselLoadingSkeleton'

export default async function PlannerPage() {

  const { userId, redirectToSignIn } = await auth()
  if (userId == null) return redirectToSignIn()
  const { canCreate, maxNumberOfCategories, categoriesCount } = await canCreateCategory(userId)

  return (
    <div className="planner-page flex flex-col gap-6 lg:flex-row">

        <div className="categories-container lg:w-[60%] h-fit lg:sticky lg:bottom-6 lg:self-end">
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

        <div className="cards-and-accounts-container lg:w-[40%] flex flex-col gap-10 h-fit lg:sticky lg:top-6 lg:self-start">

            <div className="cards-container h-full">
                <div className='flex justify-between items-center mb-4'>
                    <SectionHeaders title="Cards" description="Manage all your cards" />
                </div>
                <HasPermission
                    permission={canAccessCardsPage}
                    renderFallback
                >
                    <Suspense fallback={<CarouselLoadingSkeleton />}>
                        <CardList userId={userId} />
                    </Suspense>
                </HasPermission>
            </div>

            <div className="accounts-container h-full">
                <div className='flex justify-between items-center mb-4'>
                    <SectionHeaders title="Accounts" description="Manage all your accounts" />
                </div>
                <HasPermission
                    permission={canAccesssAccountsPage}
                    renderFallback
                >
                    <Suspense fallback={<CarouselLoadingSkeleton />}>
                        <AccountList userId={userId} />
                    </Suspense>
                </HasPermission>
            </div>

        </div>

    </div>
  )
}
