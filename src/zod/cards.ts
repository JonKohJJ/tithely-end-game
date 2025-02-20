import { z } from "zod"

export const CardSchema = z
    .object({
        cardName: z.string().min(1, "Required"),
        cardMinimumSpend: z.number().positive(),
    })

export type TInsertCard = z.infer<typeof CardSchema>


