import { z } from "zod"

export const SavingSchema = z
    .object({
        savingName: z.string().min(1).max(20, "Max 20 Characters"),
        savingDescription: z.string().min(1).max(40, "Max 40 Characters"),
        savingMonthlyContribution: z.number().positive(),
        savingGoal: z.number().positive(),
    })

export type TInsertSaving = z.infer<typeof SavingSchema>


