import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
    emptyStringAsUndefined: true, /* takes empty strings as undefined */
    server: {
        DATABASE_URL: z.string().url(),
        CLERK_SECRET_KEY: z.string(),
        CLERK_WEBHOOK_SECRET: z.string(),
        STRIPE_SECRET_KEY: z.string(),
        STRIPE_WEBHOOK_SECRET: z.string(),
        STRIPE_PRO_OTP_STRIPE_PRICE_ID: z.string(),
        STRIPE_PRO_MONTHLY_STRIPE_PRICE_ID: z.string(),
    },
    experimental__runtimeEnv: process.env
})