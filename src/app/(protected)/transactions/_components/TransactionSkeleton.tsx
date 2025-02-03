"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { LOCAL_STORAGE_PAGESIZE_KEY } from "@/app/(protected)/transactions/_components/TransactionDataTable"
import { useEffect, useState } from "react";

export default function TransactionSkeleton() {

    const [pageSize, setPageSize] = useState<number | null>(null);

    useEffect(() => {
        const storedPageSize = localStorage.getItem(LOCAL_STORAGE_PAGESIZE_KEY);
        if (storedPageSize) {
            setPageSize(Number(storedPageSize))
        } else {
            setPageSize(10)
        }
    }, [])

    if (pageSize === null) {
        return null
    }

    return (
        <div className="transaction-skeleton flex flex-col gap-8">
            <div className="filter-skeleton flex justify-between gap-2">
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-[250px] bg-color-muted-text" />
                    <Skeleton className="h-8 w-[100px] bg-color-muted-text" />
                    <Skeleton className="h-8 w-[150px] bg-color-muted-text" />
                    <Skeleton className="h-8 w-[100px] bg-color-muted-text" />
                </div>
                <Skeleton className="h-8 w-[50px] bg-color-muted-text" />
            </div>

            <div className="table-skeleton flex flex-col gap-8">
                {Array.from({ length: pageSize }).map((_, index) => (
                    <div key={index} className="row-skeleton flex gap-4">
                        <Skeleton className="h-6 w-[50px] bg-color-muted-text" />
                        <Skeleton className="h-6 w-[150px] bg-color-muted-text" />
                        <Skeleton className="h-6 w-full bg-color-muted-text" />
                        <Skeleton className="h-6 w-[150px] bg-color-muted-text" />
                    </div>
                ))}
            </div>
        </div>
    );
}
