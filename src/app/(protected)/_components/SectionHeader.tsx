import { MonthYearFilter } from '@/components/MonthYearFilter'
import React from 'react'

export default function SectionHeader({
    title,
    description,
    showFilter = false,
} : {
    title: string
    description: string
    showFilter?: boolean
}) {
    return (
        <div className="section-header flex items-center justify-between w-full py-6 border-b border-color-muted-text">
            <div className='flex flex-col'>
                <p className='fs-h3'>{title}</p>
                <p>{description}</p>
            </div>
            {showFilter && <MonthYearFilter />}
        </div>
    )
}
