import { env } from "@/data/env/server"
import { getTierByPriceId, SubscriptionTiers } from "@/data/subscriptionTiers"
import { UserSubscriptionTable } from "@/drizzle/schema"
import { updateUserSubscription } from "@/server/db/subscription"
import { eq } from "drizzle-orm"
import { NextRequest } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(env.STRIPE_SECRET_KEY)

export async function POST(request: NextRequest) {

  const event = stripe.webhooks.constructEvent(
    await request.text(),
    request.headers.get("stripe-signature") as string,
    env.STRIPE_WEBHOOK_SECRET
  )

  switch (event.type) {
    case "customer.subscription.created": {
      await handleCreateSubscription(event.data.object)
      break
    }
    case "customer.subscription.deleted": {
      await handleDeleteSubscription(event.data.object)
      break
    }
    case "payment_intent.succeeded": {
      await handleOneTimePurchase(event.data.object)
      break
    }
  }

  return new Response(null, { status: 200 })
}

async function handleCreateSubscription(subscription: Stripe.Subscription) {

    console.log("subscription creation - ", subscription)

    const tier = getTierByPriceId(subscription.items.data[0].price.id)
    if (tier == null) return new Response(null, { status: 500 })
    const clerkUserId = subscription.metadata.clerkUserId
    if (clerkUserId == null) return new Response(null, { status: 500 })

    const customer = subscription.customer
    const customerId = typeof customer === "string" ? customer : customer.id

    await updateUserSubscription(
        eq(UserSubscriptionTable.clerkUserId, clerkUserId),
        {
            stripeCustomerId: customerId,
            tier: tier.name,
            stripeSubscriptionId: subscription.id,
            stripeSubscriptionItemId: subscription.items.data[0].id,
        }
    )
}

async function handleDeleteSubscription(subscription: Stripe.Subscription) {

    console.log("subscription delete")

    const customer = subscription.customer
    const customerId = typeof customer === "string" ? customer : customer.id

    await updateUserSubscription(
        eq(UserSubscriptionTable.stripeCustomerId, customerId),
        { 
            tier: SubscriptionTiers.Free.name,
            stripeSubscriptionId: null,
            stripeSubscriptionItemId: null
            // We still can keep the stripe customer id because the user is associated with that 
        }
    )
    
}

async function handleOneTimePurchase(payment: Stripe.PaymentIntent) {

  console.log("handle one time purchase - ", payment)
  // Payments has no price id, hence cannot get tier
  // Work around - hard code the tier name first
  // TODO:
  // const tier = getTierByPriceId(payment.items.data[0].price.id)
  // if (tier == null) return new Response(null, { status: 500 })

  const clerkUserId = payment.metadata.clerkUserId
  if (clerkUserId == null) return new Response(null, { status: 500 })

  const paymentIntentId = payment.id
  if (paymentIntentId == null) return new Response(null, { status: 500 })

  await updateUserSubscription(
      eq(UserSubscriptionTable.clerkUserId, clerkUserId),
      {
          // Put the payment intent id into the stripe customer id, when the OTP plan is purchased
          stripeCustomerId: paymentIntentId,
          tier: "Pro Lifetime",
          stripeSubscriptionId: null,
          stripeSubscriptionItemId: null,
          // TODO: add another field just for OTP payment_intend id
      }
  )
}





