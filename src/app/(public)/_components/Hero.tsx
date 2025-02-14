import MyButton from '@/components/MyButton'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { ArrowRight, BarChart2, PieChart, Wallet } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function Hero() {
    return (
        <section className="mysection">
            <div className="mycontainer">
                <div className="flex flex-col items-center text-center space-y-8">

                    <div>
                        <p className="fs-h1">
                            Where financial management is not just a task — it&apos;s an empowering experience.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <MyButton additionalClasses='bg-color-bg text-color-text py-6'>
                            Explore Features
                        </MyButton>
                        <SignedIn>
                            <MyButton additionalClasses='py-6'>
                                <Link href="/dashboard" className='flex items-center gap-1'>
                                    Go to Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </MyButton>
                        </SignedIn>
                        <SignedOut>
                            <SignInButton>
                                <MyButton additionalClasses='py-6'>
                                    <p>Sign In</p>
                                </MyButton>
                            </SignInButton>
                        </SignedOut>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <div className="flex items-center">
                            <PieChart className="mr-1 h-4 w-4" />
                            Smart Analytics
                        </div>
                        <div className="flex items-center">
                            <Wallet className="mr-1 h-4 w-4" />
                            Secure Transactions
                        </div>
                        <div className="flex items-center">
                            <BarChart2 className="mr-1 h-4 w-4" />
                            Real-time Tracking
                        </div>
                    </div>

                    <div className="bg-color-muted-text h-[700px] w-full rounded-xl"></div>
                </div>
            </div>
        </section>
    )
}
