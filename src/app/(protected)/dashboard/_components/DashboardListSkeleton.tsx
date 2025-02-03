import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardListSkeleton() {
    return (
        <div className='dashboard-list-skeleton border-color-border border-[1px] flex-1 flex flex-col gap-8'>
            <Skeleton className="h-full w-full bg-color-muted-text" />
            <Skeleton className="h-full w-full bg-color-muted-text" />
            <Skeleton className="h-full w-full bg-color-muted-text" />
        </div>
    )
}
