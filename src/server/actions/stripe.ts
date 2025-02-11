"use server"

import { PaidTierNames, SubscriptionTiers } from "@/data/subscriptionTiers";
import { currentUser, User } from "@clerk/nextjs/server";
import { getUserSubscription } from "../db/subscription";
import { redirect } from "next/navigation";
import { Stripe } from "stripe"
import { env as serverEnv } from "@/data/env/server"
import { env as clientEvn } from "@/data/env/client"

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY)

export async function createCancelSessionSubscription() {
    console.log("createCancelSession function")

    const user = await currentUser()
    if (user == null) return
    const subscription = await getUserSubscription(user.id)
    if (subscription == null) return

    // if you don't have a subscription, you can't cancel it
    if (
        subscription.stripeCustomerId == null ||
        subscription.stripeSubscriptionId == null || 
        subscription.stripeSubscriptionItemId == null
    ) return

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: subscription.stripeCustomerId,
        return_url: `${clientEvn.NEXT_PUBLIC_SERVER_URL}/subscription`,
        flow_data: {
          type: "subscription_cancel",
          subscription_cancel: {
            subscription: subscription.stripeSubscriptionId,
          },
        },
    })
    
    redirect(portalSession.url)
}

export async function createCheckoutSession(
    tier: PaidTierNames,
    isOneTimePurchase: boolean
) {

    const user = await currentUser()
    if (user == null) return
    const subscription = await getUserSubscription(user.id)
    if (subscription == null) return

    if (isOneTimePurchase) {
        // getCheckoutSession for One Time Purchase here
        const url = await getCheckoutSessionOneTimePayment(tier, user)
        if (url == null) return
        redirect(url)
    } else {
        // getCheckoutSession for subscription here
        const url = await getCheckoutSessionSubscription(tier, user)
        if (url == null) return
        redirect(url)
    }

}

async function getCheckoutSessionSubscription(
    tier: PaidTierNames, 
    user: User,
) {

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        customer_email: user.primaryEmailAddress?.emailAddress,
        subscription_data: {
            metadata: { clerkUserId: user.id },
        },
        line_items: [
          {
            price: SubscriptionTiers[tier].stripePriceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${clientEvn.NEXT_PUBLIC_SERVER_URL}/subscription`,
        cancel_url: `${clientEvn.NEXT_PUBLIC_SERVER_URL}/subscription`,
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)    
    return session.url
}

async function getCheckoutSessionOneTimePayment(
    tier: PaidTierNames, 
    user: User,
) {

    console.log("getCheckoutSessionOneTimePayment")

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        customer_email: user.primaryEmailAddress?.emailAddress,
        payment_intent_data: {
            metadata: { clerkUserId: user.id },
        },
        line_items: [
          {
            price: SubscriptionTiers[tier].stripePriceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${clientEvn.NEXT_PUBLIC_SERVER_URL}/subscription`,
        cancel_url: `${clientEvn.NEXT_PUBLIC_SERVER_URL}/subscription`,
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)    
    return session.url
}