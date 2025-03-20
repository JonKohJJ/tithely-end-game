import { Skeleton } from './ui/skeleton'

export default function InsightCardSkeleton() {
    return (
        <div className='insight-cards-skeleton flex gap-4'>
            {Array.from({ length: 3 }).map((_, index) => (

                <Skeleton key={index} className="h-[170px] w-full bg-color-muted-text p-8 flex flex-col justify-between">
                    <div className='flex flex-col gap-2'>
                        <Skeleton className="bg-color-border w-[70%] h-[20px]" />
                        <Skeleton className="bg-color-border w-full h-[20px]" />
                    </div>

                    <Skeleton className="bg-color-border w-[70%] h-[30px]" />
                </Skeleton>

            ))}
        </div>
    )
}
