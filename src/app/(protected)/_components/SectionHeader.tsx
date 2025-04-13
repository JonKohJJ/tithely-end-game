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
        <div className="section-header
            py-8 flex flex-col gap-4 border-b border-color-muted-text
            lg:flex-row lg:items-end lg:justify-between
        ">
            <div className='flex flex-col'>
                <p className='fs-h3'>{title}</p>
                <p>{description}</p>
            </div>
            {showFilter && <MonthYearFilter />}
        </div>
    )
}