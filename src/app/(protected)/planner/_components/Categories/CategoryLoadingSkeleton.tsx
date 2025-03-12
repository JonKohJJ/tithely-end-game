import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function CategoryLoadingSkeleton() {
    return (
        <div className='category-loading-skeleton h-full flex flex-col gap-4'>

            <div className='categories-insight-cards-skeleton flex gap-4'>
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-[240px] w-full bg-color-muted-text" />
                ))}
            </div>

            <div className="category-list-skeleton flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-[250px] w-full bg-color-muted-text" />
                ))}
            </div>

        </div>
    )
}
