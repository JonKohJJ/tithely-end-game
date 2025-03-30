"use client"

import { SubscriptionTiersInOrder, TierNames, TSubscriptionTier } from "@/data/subscriptionTiers"
import MyButton from "./MyButton"
import { ReactNode, useState } from "react"
import { ArrowUp, ArrowUpFromDot, Check, X } from "lucide-react"
import Link from "next/link"
import { createCancelSessionSubscription, createCheckoutSession } from "@/server/actions/stripe"

type TPricingCardProps = TSubscriptionTier & {
    currentPlanName: TierNames | null
}

export default function SubscriptionPlans({
    currentPlanName
} : {
    currentPlanName: TierNames | null
}) {

    return (
        <div className='subscription-plans flex flex-col md:flex-row gap-4'>
            {SubscriptionTiersInOrder.map(tier => {
                return (
                    <PricingCard key={tier.name} {...tier} currentPlanName={currentPlanName} />
                )
            })}
        </div>
    )
}

function PricingCard({
    currentPlanName,
    name,
    priceInCents,
    originalPriceInCents,
    isMonthlyPlan,
    isLifetimePlan,
    isPopular,

    // Features
    canAccessCardsPage,
    canAccessAccountsPage,

    // Analytics Page
    canViewExpenses_Actual, 
    canViewExpenses_Budget, 
    canViewExpenses_Trend, 
    //
    canViewSavings_Goals, 
    canViewSavings_Growth, 

    maxNumberOfCategories,
    maxNumberOfTransactions,
    maxNumberOfCards,
    maxNumberOfAccounts,

} : TPricingCardProps) {

    const [isRedirecting, setIsRedirecting] = useState(false)

    // Confusing boolean conditions, but they are important
    const userLoggedIn = currentPlanName !== null
    const isCurrentPlan = currentPlanName === name
    const mostPopular = !currentPlanName && isPopular

    return (
        <div className={`
            pricing-card relative w-full border-[1px] border-color-border p-8 rounded-xl 
            ${mostPopular || isCurrentPlan ? "border-color-text" : ""}
        `}>
            
            {mostPopular && 
                <p className="absolute top-0 left-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-color-text text-color-bg px-4 rounded-xl">Most Popular</p>
            }

            <p className="text-center fs-h3">{name}</p>

            <div className="flex justify-center items-baseline my-8 gap-2">
                {originalPriceInCents && <p className="line-through text-color-text">${originalPriceInCents/100}</p>}
                <p className="fs-h2">${priceInCents/100}</p>
                {isMonthlyPlan && <p>/ monthly</p>}
                {isLifetimePlan && <p>lifetime</p>}
            </div>

            <div className="features flex flex-col gap-2">

                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} maxNumber={maxNumberOfCategories}>max categories</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} maxNumber={maxNumberOfTransactions}>max transactions</Feature>

                <div className="my-2 h-[1px] bg-color-muted-text"></div>

                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canViewExpenses_Actual}>Track Actual Expenses</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canViewExpenses_Budget}>View Budgeted Expenses</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canViewExpenses_Trend}>Track Expenses Trend</Feature>

                <div className="my-2 h-[1px] bg-color-muted-text"></div>

                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canViewSavings_Growth}>View Savings Growth</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canViewSavings_Goals}>View Savings Goals</Feature>

                <div className="my-2 h-[1px] bg-color-muted-text"></div>

                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canAccessCardsPage}>Access cards page</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canAccessAccountsPage}>Access accounts page</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} maxNumber={maxNumberOfCards}>max cards</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} maxNumber={maxNumberOfAccounts}>max accounts</Feature>
            </div>
            
            <form
                action={
                    name === "Free"
                    ? createCancelSessionSubscription
                    : createCheckoutSession.bind(null, name, (isLifetimePlan ? true : false))
                }
            >
                {currentPlanName?.includes("Lifetime") 
                    ?   <MyButton additionalClasses="w-full py-6 mt-8"  disabled={true}>You have full access!</MyButton>
                    :   <MyButton additionalClasses="w-full py-6 mt-8" disabled={userLoggedIn && isCurrentPlan} onClickFunction={() => {setIsRedirecting(true)}}>
                            {userLoggedIn
                                ? (
                                    isCurrentPlan
                                    ? <p>Current</p>
                                    : <p>{ isRedirecting ? "Redirecting..." : "Swap" }</p>
                                )
                                : <Link href="/subscription"><p>Get Started</p></Link>
                            }
                        </MyButton>
                }
            </form>
        </div>
    )
}

function Feature({
    children,
    canAccess,
    maxNumber,
    isMonthlyPlan,
    isLifetimePlan
} : {
    children: ReactNode
    canAccess?: boolean
    maxNumber?: number
    isMonthlyPlan?: boolean
    isLifetimePlan?: boolean
}) {
    return (
        <div className="feature flex gap-2 items-center">
            {canAccess
                ? <Check />
                : (((maxNumber && typeof maxNumber === "number") && maxNumber > 0)
                    ? (
                        isMonthlyPlan
                        ? <ArrowUp className="rotate-45" />
                        : (
                            isLifetimePlan
                            ?  <ArrowUpFromDot className="rotate-45" />
                            : <Check />
                        )
                    )
                    : <X />
                )
            }
            <p className={(canAccess || (maxNumber && typeof maxNumber === "number") && maxNumber > 0)
                ? "" 
                : "text-color-border line-through"
            }>
                <strong>{maxNumber}</strong> {children}
            </p>
        </div>
    )
}