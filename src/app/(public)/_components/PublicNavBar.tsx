import { ThemeModeToggle } from '@/components/ThemeModeToggle'
import { Button } from '@/components/ui/button'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { ArrowRight, Flame } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function PublicNavBar() {
    return (
        <section className='mysection border-b-[1px] border-color-border sticky top-0 bg-color-bg'>
            <div className='mycontainer flex items-center justify-between'>

                <Link href="/" className='flex items-center'>
                    <Flame className='size-6' />
                    <span className='hidden md:block fs-h2'>Tithely</span>
                </Link>

                <div className='flex gap-2 items-center'>
                    <ThemeModeToggle />
                    <SignedIn>
                        <Button>
                            <Link href="/dashboard" className='flex items-center gap-1'>
                                <p className='hidden md:block'>Go To Dashboard</p>
                                <ArrowRight />
                            </Link>
                        </Button>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton>
                            <Button className='rounded-md text-sm font-medium flex items-center'>
                                <p>Sign In</p>
                            </Button>
                        </SignInButton>
                    </SignedOut>
                </div>

            </div>
        </section>
    )
}
