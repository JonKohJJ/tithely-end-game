import { Skeleton } from './ui/skeleton'

export default function InsightCardSkeleton() {
    return (
        <div className='insight-cards-skeleton flex gap-4'>
            {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-[170px] w-full bg-color-muted-text" />
            ))}
        </div>
    )
}
