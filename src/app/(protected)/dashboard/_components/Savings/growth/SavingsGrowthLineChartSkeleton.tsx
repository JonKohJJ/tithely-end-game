import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export default function SavingsGrowthLineChartSkeleton() {
    return (
        <div className='SavingsGrowthLineChartSkeleton'>
            
            <Skeleton className='bg-color-muted-text w-full h-[500px] flex p-10 gap-12'>

                <div className="w-[40%] flex flex-col justify-around">

                    {Array.from({ length: 3 }, (_, index) => {
                        return (
                            <div key={index} className='w-full flex flex-col gap-2'>
                                <Skeleton className="bg-color-border w-[40%] h-[30px]" />
                                <Skeleton className="bg-color-border w-full h-[20px]" />
                            </div>
                        )
                    })}

                </div>  

                <Skeleton className="w-[60%] h-full bg-color-border rounded-xl" />

            </Skeleton>

        </div>
    )
}
