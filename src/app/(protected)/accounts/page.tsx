import { HasPermission } from '@/components/HasPermission'
import { canAccesssAccountsPage } from '@/server/permissions'
import React from 'react'
import PageHeader from '../_components/PageHeader'

export default function AccountsPage() {
    return (
        <div className='analytics-page flex flex-col gap-8 h-full'>
            <PageHeader title='Your Accounts' description='Manage all your accounts'>
            </PageHeader>

            <HasPermission
                permission={canAccesssAccountsPage}
                renderFallback
            >
                <p className='fs-h1'>Accounts Page Content - developement in progress</p>
            </HasPermission>
        </div>
    )
}
