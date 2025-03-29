import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function ExpensesBudgetSkeleton() {
    return (
        <div className='ExpensesBudgetSkeleton'>
            <Skeleton className="bg-color-muted-text w-full h-[650px] p-12 flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                    <Skeleton className="bg-color-border w-[40%] h-[30px]" />
                    <Skeleton className="bg-color-border w-[70%] h-[20px]" />
                </div>
                <div className="h-full flex items-center justify-center">
                    <Skeleton className="bg-color-border w-[75%] h-3/4 rounded-full" />
                </div>
                
            </Skeleton>
        </div>
    )
}
