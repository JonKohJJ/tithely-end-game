import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function ExpensesTrendBarChartSkeleton() {
    return (
        <div className='ExpensesTrendBarChartSkeleton'>

            <Skeleton className="bg-color-muted-text h-[600px] p-12 flex flex-col gap-12">

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

                <Skeleton className='bg-color-border h-[40px]' />

                <div className="flex justify-between w-full h-full">
                    {Array.from({ length: 7 }, (_, index) => {
                        // const randomHeight = `${Math.floor(Math.random() * 60) + 40}%`; // Generates height between 40% and 100%
                        return (
                            <Skeleton key={index} className={`bg-color-border h-full w-[70px]`} />
                        )
                    })}
                </div>

            </Skeleton>

        </div>
    )
}
