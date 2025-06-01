import MyButton from '@/components/MyButton'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { ArrowRight, LineChart, PiggyBank, Wallet2 } from 'lucide-react'
import Link from 'next/link'
import React from 'react'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel"
import Image from 'next/image'

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
                            <Link href="#features">
                                Explore Features
                            </Link>
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

                    <div className="flex flex-wrap justify-center gap-6">
                        <div className="flex items-center">
                            <LineChart className="mr-1 h-4 w-4" />
                            Smart Expense & Budget Tracking
                        </div>
                        <div className="flex items-center">
                            <PiggyBank className="mr-1 h-4 w-4" />
                            Savings & Financial Growth
                        </div>
                        <div className="flex items-center">
                            <Wallet2 className="mr-1 h-4 w-4" />
                            Seamless Money Management
                        </div>
                    </div>

                    <div className="carousel-container h-full w-full rounded-xl">
                        <Carousel className="h-full">
                            <CarouselContent className="h-full">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <CarouselItem key={index} className="h-full">
                                    <div className="relative h-full w-full p-4 bg-color-muted-text rounded-xl">
                                        <Image
                                            src={`/image/carousel${index + 1}.png`}
                                            alt={`carousel image ${index + 1}`}
                                            fill
                                            className="!relative rounded-xl"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>


                </div>
            </div>
        </section>
    )
}
