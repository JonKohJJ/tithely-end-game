import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function AllAccountsSkeleton() {
    return (
        <div className="flex flex-col gap-4 AllAccountsSkeleton">
            {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton
                    key={index}
                    className="p-8 flex flex-col justify-between bg-color-muted-text h-[200px]"
                >

                    {/* Header section */}
                    <div className="flex justify-between items-start">
                        <Skeleton className="w-[50%] h-8 bg-color-border" />
                        <Skeleton className="w-8 h-8 rounded-full bg-color-border" />
                    </div>

                    {/* Account Information */}
                    <div className="flex flex-col gap-4">
                        <Skeleton className="w-[50%] h-4 bg-color-border" />
                        <Skeleton className="w-[70%] h-4 bg-color-border" />
                    </div>
                </Skeleton>
            ))}
        </div>
    )
}
