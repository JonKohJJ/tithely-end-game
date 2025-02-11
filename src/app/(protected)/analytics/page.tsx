import { HasPermission } from '@/components/HasPermission'
import { MonthYearFilter } from '@/components/MonthYearFilter'
import { canAccessAnalyticsPage } from '@/server/permissions'
import React from 'react'

export default function AnalyticsPage() {
    return (
        <div className='analytics-page flex flex-col gap-8 h-full'>
            <div className='flex flex-col gap-6 md:flex-row md:justify-between md:items-center'>
                <div className='flex flex-col gap-1'>
                <p className='fs-h3 font-medium'>Analytics</p>
                <p className='fs-base font-light'>Get Insights</p>
                </div>
                <MonthYearFilter />
            </div>

            <HasPermission
                permission={canAccessAnalyticsPage}
                renderFallback
            >
                <p>Analytics Content</p>
            </HasPermission>
        </div>
    )
}
