import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function CardLoadingSkeleton() {
    return (
        <div className='card-loading-skeleton h-full flex gap-4 items-center'>
            <div className="cards-skeleton h-full flex-1 relative">
                <Skeleton className={`absolute top-[50%] translate-y-[-50%] bg-color-muted-text h-[250px] w-full`} />
            </div>
            <Skeleton className="arrow-indicator-skeleton bg-color-muted-text w-[2rem] h-[250px]" />
        </div>
    )
}
