import MyButton from '@/components/MyButton'
import { ThemeModeToggle } from '@/components/ThemeModeToggle'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { ArrowRight, Sprout } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function PublicNavBar() {
    return (
        <section className='mysection border-b-[1px] border-color-muted-text sticky top-0 bg-color-bg z-[1]'>
            <div className='mycontainer flex items-center justify-between'>

                <Link href="/" className='flex items-center'>
                    <Sprout className='w-8 h-8' strokeWidth={2} />
                    <p className='fs-h2'>Tithely</p>
                </Link>

                <div className='flex gap-2 items-center'>
                    <ThemeModeToggle onlyIcon={true} />
                    <SignedIn>
                        <MyButton>
                            <Link href="/dashboard" className='flex items-center gap-1'>
                                <p className='hidden md:block'>Go To Dashboard</p>
                                <ArrowRight />
                            </Link>
                        </MyButton>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton>
                            <MyButton>
                                <p>Sign In</p>
                            </MyButton>
                        </SignInButton>
                    </SignedOut>
                </div>

            </div>
        </section>
    )
}
