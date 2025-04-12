"use client"
import {
    Sprout
  } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { ThemeModeToggle } from "@/components/ThemeModeToggle"

export default function ProtectedHeader() {

    return (
        <section className='mysection border-b-[1px] border-color-muted-text sticky top-0 bg-color-bg z-[1]'>
            <div className='mycontainer flex items-center justify-between !max-w-[1500px] !px-0'>

                <div className="flex items-center gap-2">
                    <Link href="/" className='flex items-center'>
                        <Sprout className='w-8 h-8' strokeWidth={1.5} />
                        <p className="fs-h2">Tithely</p>
                    </Link>
                </div>

                <div className="flex gap-5 items-center">
                    <Link href="/subscription">My Subscription</Link>
                    <ThemeModeToggle onlyIcon={true} additionalClasses="!p-0" />
                    <UserButton />
                </div>

            </div>
        </section>
    )
}
