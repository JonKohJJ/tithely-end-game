import { HasPermission } from '@/components/HasPermission'
import { canAccesssAccountsPage } from '@/server/permissions'
import React from 'react'

export default function AccountsPage() {
    return (
        <div className='analytics-page flex flex-col gap-8 h-full'>
            <div className='flex flex-col gap-6 md:flex-row md:justify-between md:items-center'>
                <div className='flex flex-col gap-1'>
                    <p className='fs-h3 font-medium'>Your Accounts</p>
                    <p className='fs-base font-light'>Manage all your accounts</p>
                </div>
            </div>

            <HasPermission
                permission={canAccesssAccountsPage}
                renderFallback
            >
                <p>Accounts Content</p>
            </HasPermission>
        </div>
    )
}
