import { z } from "zod"

export const CardSchema = z
    .object({
        cardName: z.string().min(1).max(20, "Max 20 Characters"),
        cardMinimumSpend: z.number().nonnegative(),
        cardMaximumBudget: z.number().nonnegative(),
    })

export type TInsertCard = z.infer<typeof CardSchema>


