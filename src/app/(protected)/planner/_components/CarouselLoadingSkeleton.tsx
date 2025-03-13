import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function CarouselLoadingSkeleton() {
    return (
        <div className='carousel-loading-skeleton h-[350px] flex gap-4 items-center'>

            <div className="h-full flex-1 flex flex-col gap-1 items-center">
                <Skeleton className={`bg-color-muted-text h-[20px] w-[calc(100%-120px)] rounded-t-xl`} />
                <Skeleton className={` bg-color-muted-text h-[20px] w-[calc(100%-60px)] rounded-t-xl`} />
                <Skeleton className={`bg-color-muted-text flex-1 w-full rounded-xl`} />
                <Skeleton className={`bg-color-muted-text h-[20px] w-[calc(100%-60px)] rounded-b-xl`} />
                <Skeleton className={`bg-color-muted-text h-[20px] w-[calc(100%-120px)] rounded-b-xl`} />
            </div>

            <Skeleton className="arrow-indicator-skeleton bg-color-muted-text w-[2rem] h-[250px] rounded-lg" />
        </div>
    )
}
