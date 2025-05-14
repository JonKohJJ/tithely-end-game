import { MonthYearFilter } from '@/components/MonthYearFilter'
import { ClaimablesToggle } from '@/components/ClaimablesToggle'
import React from 'react'

export default function SectionHeader({
    title,
    description,
    showFilter = false,
    showClaimablesToggle = false,
} : {
    title: string
    description: string
    showFilter?: boolean
    showClaimablesToggle?: boolean
}) {
    return (
        <div className="section-header
            py-8 flex flex-col gap-4 border-b border-color-muted-text
            lg:flex-row lg:items-center lg:justify-between
        ">
            <div className='flex flex-col'>
                <p className='fs-h3'>{title}</p>
                <p>{description}</p>
            </div>

            <div className="flex flex-col justify-between items-end gap-4">
                { showFilter && <MonthYearFilter /> }
                { showClaimablesToggle && <ClaimablesToggle /> }
            </div>
        </div>
    )
}