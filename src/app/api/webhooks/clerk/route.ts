import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { createUserSubscription, deleteUserSubscription } from "@/server/db/subscription"

export async function POST(req: Request) {
  
  const headerPayload = await headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET as string)
  let event: WebhookEvent

  try {
    event = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occurred", {
      status: 400,
    })
  }

  switch (event.type) {
    case "user.created": { 
      console.log("user creation")
      await createUserSubscription({
        clerkUserId: event.data.id,
        tier: "Free",
      }) 
      break
    }
    case "user.deleted": { 
      if (event.data.id != null) {
        console.log("user deletion")
        await deleteUserSubscription(event.data.id)
      }
      break
    }
  }

  return new Response("", { status: 200 })
}