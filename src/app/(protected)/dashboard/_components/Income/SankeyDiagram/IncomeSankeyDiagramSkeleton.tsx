import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function IncomeSankeyDiagramSkeleton() {
    return (
        <Skeleton className="w-full h-[400px] bg-color-muted-text p-8 flex">
            
            {/* Column 1: 3 nodes */}
            <div className="flex flex-col gap-4 justify-center w-full items-center">
                {Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton key={idx} className="bg-color-border w-[30px] h-[40px]" />
                ))}
            </div>

            {/* Column 2: 1 node */}
            <div className="flex flex-col gap-4 justify-center w-full items-center">
                <Skeleton className="bg-color-border w-[30px] h-[200px]" />
            </div>

            {/* Column 3: 3 nodes */}
            <div className="flex flex-col gap-4 justify-center w-full items-center">
                {Array.from({ length: 3 }).map((_, idx) => (
                    <Skeleton key={idx} className="bg-color-border w-[30px] h-[90px]" />
                ))}
            </div>

            {/* Column 4: 10 nodes */}
            <div className="flex flex-col gap-2 justify-center w-full items-center">
                {Array.from({ length: 10 }).map((_, idx) => (
                    <Skeleton key={idx} className="bg-color-border w-[30px] h-[40px]" />
                ))}
            </div>

        </Skeleton>
    )
}
