import { HasPermission } from '@/components/HasPermission'
// import { MonthYearFilter } from '@/components/MonthYearFilter'
import { canAccessAnalyticsPage } from '@/server/permissions'
import React from 'react'
import PageHeader from '../_components/PageHeader'

export default function AnalyticsPage() {
    return (
        <div className='analytics-page flex flex-col gap-8 h-full'>

            <PageHeader title='Analytics' description='Get insights to your financials'>
                {/* <MonthYearFilter /> */}
            </PageHeader>

            <HasPermission
                permission={canAccessAnalyticsPage}
                renderFallback
            >
                {/* <Suspense 
                    fallback={<p>Loading analytics...</p>}
                    key={JSON.stringify(await searchParams)}
                >
                    <p>Analytics Content</p>
                </Suspense> */}
                <p className='fs-h1'>Analytics Page Content - developement in progress</p>
            </HasPermission>
            
        </div>
    )
}
