import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'


export default function ExpensesActualSkeleton() {
    return (
        <div className='ExpensesActualSkeleton'>
            <Skeleton className="bg-color-muted-text w-full h-[650px] p-12 flex flex-col gap-12">

                <div className="flex items-center justify-between">
                    <div className='w-full flex flex-col gap-4'>
                        <Skeleton className="bg-color-border w-[40%] h-[30px]" />
                        <Skeleton className="bg-color-border w-full h-[20px]" />
                    </div>

                    <div className='w-full flex gap-2 justify-end'>
                        <Skeleton className="bg-color-border h-[40px] w-[30%]" />
                        <Skeleton className="bg-color-border h-[40px] w-[30%]" />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <Skeleton className="bg-color-border w-[15%] h-[50px]" />
                    <Skeleton className="bg-color-border w-[15%] h-[50px]" />
                </div>

                <div className="flex flex-col justify-between items-center flex-1">
                    {Array.from({ length: 7 }, (_, index) => (
                        <Skeleton key={index} className="bg-color-border w-full h-[30px]" />
                    ))}
                </div>

            </Skeleton>
        </div>
    )
}
