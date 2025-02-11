import { HasPermission } from '@/components/HasPermission'
import { canAccessCardsPage } from '@/server/permissions'
import React from 'react'

export default function CardsPage() {
    return (
        <div className='analytics-page flex flex-col gap-8 h-full'>
            <div className='flex flex-col gap-6 md:flex-row md:justify-between md:items-center'>
                <div className='flex flex-col gap-1'>
                    <p className='fs-h3 font-medium'>Your Cards</p>
                    <p className='fs-base font-light'>Manage all your cards</p>
                </div>
            </div>

            <HasPermission
                permission={canAccessCardsPage}
                renderFallback
            >
                <p>Cards Content</p>
            </HasPermission>
        </div>
    )
}
