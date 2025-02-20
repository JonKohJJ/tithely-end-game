import { HasPermission } from '@/components/HasPermission'
import { canAccessCardsPage, canCreateCard } from '@/server/permissions'
import PageHeader from '../_components/PageHeader'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import MyButton from '@/components/MyButton'
import CardForm from './_components/CardForm'
import { Suspense } from 'react'
import InsightCardSkeleton from '@/components/InsightCardSkeleton'
import CategoryListSkeleton from '../categories/_components/CategoryListSkeleton'
import CardList from './_components/CardList'

export default async function CardsPage() {

    const { userId, redirectToSignIn } = await auth()
    if (userId == null) return redirectToSignIn()
    const { canCreate } = await canCreateCard(userId)

    return (
        <div className='cards-page flex flex-col gap-8 h-full'>
            
            <PageHeader title='Your Cards' description='Manage all your cards'>
                <div className='hidden md:block'>
                    {canCreate
                    ? <CardForm />
                    : <MyButton>
                        <Link href="/subscription">
                            <p>Upgrade to Add Cards</p>
                        </Link>
                    </MyButton> 
                    }
                </div>
            </PageHeader>

            <HasPermission
                permission={canAccessCardsPage}
                renderFallback
            >
                <Suspense fallback={
                    <>
                    <InsightCardSkeleton />
                    <CategoryListSkeleton />
                    </>
                }>
                    <CardList userId={userId} />
                </Suspense>

            </HasPermission>
        </div>
    )
}
