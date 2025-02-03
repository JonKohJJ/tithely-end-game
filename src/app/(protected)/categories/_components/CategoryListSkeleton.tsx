import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function CategoryListSkeleton() {
    return (
        <div className='category-list-skeleton flex gap-4 flex-1'>
            <Skeleton className="h-full w-full bg-color-muted-text" />
            <Skeleton className="h-full w-full bg-color-muted-text" />
            <Skeleton className="h-full w-full bg-color-muted-text" />
        </div>
    )
}
