"use client"

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function ClaimablesToggle() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [showClaimables, setShowClaimables] = useState<boolean>(false)

    useEffect(() => {
        const param = searchParams.get('showClaimables')
        if (param !== null) setShowClaimables(param === 'true')
    }, [searchParams])

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('showClaimables', String(showClaimables))
        router.push(`?${params.toString()}`)
    }, [showClaimables, router, searchParams])

    return (
        <div className="show-claimables-toggle flex items-center gap-2">
            <label htmlFor="show-claimables-toggle">
                Show Claimables
            </label>
            <input
                id="show-claimables-toggle"
                type="checkbox"
                checked={showClaimables}
                onChange={() => setShowClaimables(prev => !prev)}
                className="w-4 h-4"
            />
        </div>
    )
}