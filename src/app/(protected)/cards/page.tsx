import { HasPermission } from '@/components/HasPermission'
import { canAccessCardsPage } from '@/server/permissions'
import React from 'react'
import PageHeader from '../_components/PageHeader'

export default function CardsPage() {
    return (
        <div className='analytics-page flex flex-col gap-8 h-full'>
            
            <PageHeader title='Your Cards' description='Manage all your cards'>
            </PageHeader>

            <HasPermission
                permission={canAccessCardsPage}
                renderFallback
            >
                <p className='fs-h1'>Cards Page Content - developement in progress</p>
            </HasPermission>
        </div>
    )
}
