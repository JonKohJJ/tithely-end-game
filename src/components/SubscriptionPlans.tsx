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
        <div className='subscription-plans flex flex-col lg:flex-row gap-4'>
            {SubscriptionTiersInOrder.map(tier => {
                return (
                    <PricingCard key={tier.name} {...tier} currentPlanName={currentPlanName} />
                )
            })}
        </div>
    )
}

function PricingCard({

    // Tier Information
    currentPlanName,
    name,
    priceInCents,
    originalPriceInCents,
    isMonthlyPlan,
    isLifetimePlan,
    isPopular,

    // Dashboard Views - Income
    canViewIncome_Streams, 

    // Dashboard Views - Savings
    canViewSavings_Goals, 
    canViewSavings_Growth, 

    // Dashboard Views - Expenses
    canViewExpenses_Budget,
    canViewExpenses_Insights,
    canViewExpenses_Actual,
    canViewExpenses_Trend,

    // Dashboard Views - Cards & Accounts
    canViewCards,
    canViewAccounts,

    // Dashboard Views - Transactions
    canViewTransactions,

    // Max Number
    maxNumberOfIncome,
    maxNumberOfSavings,
    maxNumberOfExpenses,
    maxNumberOfCards,
    maxNumberOfAccounts,
    maxNumberOfTransactions,

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

            <div className="features flex flex-col gap-2 items-center lg:items-start">

                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canViewIncome_Streams}>Access Income Streams</Feature>
                
                <div className="my-2 w-full h-[1px] bg-color-muted-text"></div>

                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canViewSavings_Goals}>Access Savings Goals</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canViewSavings_Growth}>Access Savings Growth Trend</Feature>
                
                <div className="my-2 w-full h-[1px] bg-color-muted-text"></div>

                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canViewExpenses_Budget}>Access Budgeted Expenses</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canViewExpenses_Insights}>Access Expenses Insights</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canViewExpenses_Actual}>Access Actual Expenses</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canViewExpenses_Trend}>Access Expenses Trend</Feature>

                <div className="my-2 w-full h-[1px] bg-color-muted-text"></div>

                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canViewCards}>Access Cards Page</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canViewAccounts}>Access Accounts Page</Feature>

                <div className="my-2 w-full h-[1px] bg-color-muted-text"></div>

                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} canAccess={canViewTransactions}>Access Transactions Page</Feature>

                <div className="my-2 w-full h-[1px] bg-color-muted-text"></div>

                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} maxNumber={maxNumberOfIncome}>max income streams</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} maxNumber={maxNumberOfSavings}>max saving goals</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} maxNumber={maxNumberOfExpenses}>max expenses</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} maxNumber={maxNumberOfCards}>max cards</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} maxNumber={maxNumberOfAccounts}>max accounts</Feature>
                <Feature isMonthlyPlan={isMonthlyPlan} isLifetimePlan={isLifetimePlan} maxNumber={maxNumberOfTransactions}>max transactions</Feature>

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
                    :   <MyButton type="submit" additionalClasses="w-full py-6 mt-8" disabled={userLoggedIn && isCurrentPlan} onClickFunction={() => {setIsRedirecting(true)}}>
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
    maxNumber?: number | "Unlimited"
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
                                    ? <ArrowUpFromDot className="rotate-45" />
                                    : <Check />
                            )
                    )
                    : maxNumber === "Unlimited"
                        ? <ArrowUpFromDot className="rotate-45" />
                        : <X />
                )
            }
            <p className={(canAccess || (maxNumber && typeof maxNumber === "number") && maxNumber > 0)
                ? "" 
                : maxNumber === "Unlimited"
                    ? ""
                    : "text-color-border line-through"
            }>
                <strong>{maxNumber}</strong> {children}
            </p>
        </div>
    )
}