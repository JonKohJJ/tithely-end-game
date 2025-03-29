import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function SavingsGoalsSkeleton() {
    return (
        <div className='SavingsGoalsSkeleton'>

            <div className="flex gap-4">
                {Array.from({ length: 4 }, (_, index) => {
                    return (
                        <Skeleton key={index} className={`bg-color-muted-text w-full h-[500px] p-6`}>

                            <Skeleton className='w-full h-[200px] bg-color-border mb-8'/>

                            <div className='w-full flex flex-col gap-4'>
                                <Skeleton className="bg-color-border w-[40%] h-[30px]" />
                                <Skeleton className="bg-color-border w-full h-[20px]" />
                                <Skeleton className="bg-color-border w-full h-[20px]" />
                                <Skeleton className="bg-color-border w-full h-[20px]" />
                                <Skeleton className="bg-color-border w-full h-[20px]" />
                                <Skeleton className="bg-color-border w-full h-[20px]" />
                            </div>

                        </Skeleton>
                    )
                })}
            </div>

        </div>
    )
}
