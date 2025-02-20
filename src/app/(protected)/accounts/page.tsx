import { HasPermission } from '@/components/HasPermission'
import { canAccesssAccountsPage, canCreateAccount } from '@/server/permissions'
import React, { Suspense } from 'react'
import PageHeader from '../_components/PageHeader'
import InsightCardSkeleton from '@/components/InsightCardSkeleton'
import MyButton from '@/components/MyButton'
import { auth } from '@clerk/nextjs/server'
import CategoryListSkeleton from '../categories/_components/CategoryListSkeleton'
import AccountForm from './_components/AccountForm'
import AccountList from './_components/AccountList'
import Link from 'next/link'

export default async function AccountsPage() {

    const { userId, redirectToSignIn } = await auth()
    if (userId == null) return redirectToSignIn()
    const { canCreate } = await canCreateAccount(userId)

    return (
        <div className='accounts-page flex flex-col gap-8 h-full'>
            <PageHeader title='Your Accounts' description='Manage all your accounts'>
                <div className='hidden md:block'>
                    {canCreate
                    ? <AccountForm />
                    : <MyButton>
                        <Link href="/subscription">
                            <p className="">Upgrade to Add Account</p>
                        </Link>
                    </MyButton>
                    }
                </div>
            </PageHeader>

            <HasPermission
                permission={canAccesssAccountsPage}
                renderFallback
            >
                <Suspense fallback={
                    <>
                    <InsightCardSkeleton />
                    <CategoryListSkeleton />
                    </>
                }>
                    <AccountList userId={userId} />
                </Suspense>

            </HasPermission>
        </div>
    )
}
