"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { allPossiblePaths } from "@/data/NavigationData"
import { usePathname } from 'next/navigation'
import { UserButton } from "@clerk/nextjs"
import { Fragment } from "react"

export default function ProtectedHeader() {

    const pathname = usePathname()
    const crumbs = getBreadCrumbs(pathname)

    return (
        <header className="flex justify-between h-16 shrink-0 items-center gap-2 border-b-[1px] border-color-border px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb className="flex gap-2">
                    <BreadcrumbList className="flex !gap-2">
                        {crumbs.map((crumb, index) => (
                            <Fragment key={index}>
                                <BreadcrumbItem className="hidden md:block font-light last:font-medium">{crumb}</BreadcrumbItem>
                                { index !== crumbs.length-1 && <BreadcrumbSeparator className="hidden md:block" /> }
                            </Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div>
                <UserButton />
            </div>
        </header>
    )
}

function getBreadCrumbs(pathname: string) {
    // For navigation items
    for (const path of allPossiblePaths) {
        if (path.toLowerCase().includes(pathname)) {
            return path.split("/")
        }
    }

    // For everything else
    const formatted = pathname
        .split('/') /* Split by "/" */
        .filter(Boolean) /* Remove empty strings */
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) /* Capitalised first letter */
    return formatted
}
