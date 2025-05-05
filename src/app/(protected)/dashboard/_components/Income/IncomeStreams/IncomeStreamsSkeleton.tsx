import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function IncomeStreamsSkeleton() {
    return (
        <Skeleton className={`bg-color-muted-text lg:w-[30%] h-[200px] p-6 flex items-center`}>

            <div className='w-full flex flex-col gap-4'>
                <Skeleton className="bg-color-border w-full h-[20px]" />
                <Skeleton className="bg-color-border w-full h-[20px]" />
                <Skeleton className="bg-color-border w-full h-[20px]" />
                <Skeleton className="bg-color-border w-full h-[20px]" />
            </div>

        </Skeleton>
    )
}